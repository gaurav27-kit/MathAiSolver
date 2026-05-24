(function() {
    const originalFetch = window.fetch;
    const delay = ms => new Promise(res => setTimeout(res, ms));

    window.fetch = async(url, options = {}) => {
        // Intercept only /api/ network requests
        if (!url.startsWith('/api/')) {
            return originalFetch(url, options);
        }

        // Simulate network latency
        await delay(300);

        const method = options.method || 'GET';
        let body = {};
        if (options.body) {
            try {
                body = JSON.parse(options.body);
            } catch (e) {}
        }

        const getUsers = () => JSON.parse(localStorage.getItem('mathai_users') || '[]');
        const saveUsers = (users) => localStorage.setItem('mathai_users', JSON.stringify(users));
        const getCurrentUser = () => JSON.parse(localStorage.getItem('mathai_currentUser') || 'null');
        const setCurrentUser = (user) => {
            if (user) localStorage.setItem('mathai_currentUser', JSON.stringify(user));
            else localStorage.removeItem('mathai_currentUser');
        };

        const createResponse = (data, status = 200) => {
            return new Response(JSON.stringify(data), {
                status,
                headers: { 'Content-Type': 'application/json' }
            });
        };

        // --- AUTH ROUTES ---
        if (url === '/api/auth/register' && method === 'POST') {
            const users = getUsers();
            if (users.find(u => u.email === body.email)) {
                return createResponse({ message: 'Email is already taken.' }, 400);
            }
            const newUser = { id: Date.now(), fullName: body.fullName, email: body.email, password: body.password };
            users.push(newUser);
            saveUsers(users);

            const userWithoutPassword = { fullName: newUser.fullName, email: newUser.email };
            setCurrentUser({ user: userWithoutPassword });

            return createResponse({ message: 'Account created successfully.', user: userWithoutPassword });
        }

        if (url === '/api/auth/login' && method === 'POST') {
            const users = getUsers();
            const user = users.find(u => u.email === body.email && u.password === body.password);
            if (!user) {
                return createResponse({ message: 'Invalid email or password.' }, 401);
            }

            const userWithoutPassword = { fullName: user.fullName, email: user.email };
            setCurrentUser({ user: userWithoutPassword });

            return createResponse({ message: 'Login successful.', user: userWithoutPassword });
        }

        if (url === '/api/auth/logout' && method === 'POST') {
            setCurrentUser(null);
            return createResponse({ message: 'Logged out successfully.' });
        }

        if (url === '/api/auth/me' && method === 'GET') {
            const authCheck = getCurrentUser();
            if (!authCheck) return createResponse({ message: 'Not authenticated' }, 401);
            return createResponse(authCheck);
        }

        // --- PROTECTED ROUTES ---
        const authCheck = getCurrentUser();
        if (!authCheck) {
            return createResponse({ message: 'Not authenticated' }, 401);
        }
        const userId = authCheck.user.email; // simple identifier

        const getHistory = () => JSON.parse(localStorage.getItem('mathai_history_' + userId) || '[]');
        const saveHistory = (h) => localStorage.setItem('mathai_history_' + userId, JSON.stringify(h));

        if (url === '/api/history' && method === 'GET') {
            return createResponse({ history: getHistory() });
        }

        if (url === '/api/history' && method === 'POST') {
            const history = getHistory();
            history.unshift({
                id: Date.now(),
                section: body.section,
                question: body.question,
                answer: body.answer,
                createdAt: new Date().toISOString()
            });
            // Keep up to 50 items
            if (history.length > 50) history.pop();
            saveHistory(history);
            return createResponse({ message: 'History saved successfully.' });
        }

        const getProgress = () => JSON.parse(localStorage.getItem('mathai_progress_' + userId) || 'null');
        const saveProgress = (p) => localStorage.setItem('mathai_progress_' + userId, JSON.stringify(p));

        if (url === '/api/progress' && method === 'GET') {
            return createResponse({ progress: getProgress() });
        }

        if (url === '/api/progress' && method === 'POST') {
            saveProgress({
                currentSection: body.currentSection,
                lastQuestion: body.lastQuestion
            });
            return createResponse({ message: 'Progress saved successfully.' });
        }

        // --- GAMIFICATION ROUTES ---
        const getGamification = () => JSON.parse(localStorage.getItem('mathai_gamification_' + userId) || 'null');
        const saveGamification = (g) => localStorage.setItem('mathai_gamification_' + userId, JSON.stringify(g));

        const defaultGamification = () => ({
            points: 0,
            streak: 0,
            lastStreakDate: null,
            todaySolves: 0,
            lastSolveDate: null
        });

        if (url === '/api/gamification' && method === 'GET') {
            return createResponse({ gamification: getGamification() || defaultGamification() });
        }

        if (url === '/api/gamification/solve' && method === 'POST') {
            const stats = getGamification() || defaultGamification();
            const today = new Date().toDateString();
            const prevBadge = getBadgeTier(stats.points);

            // Award points
            stats.points += 10;

            // Update daily solve count
            if (stats.lastSolveDate === today) {
                stats.todaySolves += 1;
            } else {
                stats.todaySolves = 1;
                stats.lastSolveDate = today;
            }

            // Update streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (stats.lastStreakDate === today) {
                // Already counted today, no change
            } else if (stats.lastStreakDate === yesterdayStr) {
                stats.streak += 1;
                stats.lastStreakDate = today;
            } else {
                // Streak broken or first solve
                stats.streak = 1;
                stats.lastStreakDate = today;
            }

            const newBadge = getBadgeTier(stats.points);
            const leveledUp = newBadge !== prevBadge;

            saveGamification(stats);
            return createResponse({ gamification: stats, leveledUp, newBadge });
        }

        function getBadgeTier(points) {
            if (points >= 200) return 'Master';
            if (points >= 50) return 'Intermediate';
            return 'Beginner';
        }

        return createResponse({ message: 'Route not found' }, 404);
    };
})();