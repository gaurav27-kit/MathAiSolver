document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tool-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionDescription = document.getElementById('sectionDescription');
    const authStatus = document.getElementById('authStatus');

    const solveBtn = document.getElementById('solveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsArea = document.getElementById('resultsArea');
    const stepsContent = document.getElementById('stepsContent');
    const finalAnswer = document.getElementById('finalAnswer');

    const pAInput = document.getElementById('pA');
    const pBAInput = document.getElementById('pBA');
    const pBInput = document.getElementById('pB');
    const algebraEqInput = document.getElementById('algebraEq');
    const calcExprInput = document.getElementById('calcExpr');
    const calcOpSelect = document.getElementById('calcOp');
    const calcVariableInput = document.getElementById('calcVariable');
    const calcOrderInput = document.getElementById('calcOrder');
    const calcLowerInput = document.getElementById('calcLower');
    const calcUpperInput = document.getElementById('calcUpper');
    const calcOrderGroup = document.getElementById('calcOrderGroup');
    const calcLowerGroup = document.getElementById('calcLowerGroup');
    const calcUpperGroup = document.getElementById('calcUpperGroup');

    const logoutBtn = document.getElementById('logoutBtn');
    const authPageLinks = document.getElementById('authPageLinks');
    const accountSummary = document.getElementById('accountSummary');
    const accountTitle = document.getElementById('accountTitle');
    const accountCopy = document.getElementById('accountCopy');
    const accountName = document.getElementById('accountName');
    const accountEmail = document.getElementById('accountEmail');
    const progressStatus = document.getElementById('progressStatus');
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');

    const API = {
        authRegister: window.buildApiUrl('/api/auth/register'),
        authLogin: window.buildApiUrl('/api/auth/login'),
        authLogout: window.buildApiUrl('/api/auth/logout'),
        authMe: window.buildApiUrl('/api/auth/me'),
        history: window.buildApiUrl('/api/history'),
        progress: window.buildApiUrl('/api/progress'),
        gamification: window.buildApiUrl('/api/gamification'),
        gamificationSolve: window.buildApiUrl('/api/gamification/solve')
    };

    const FUNCTION_NAMES = ['asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'abs', 'exp'];
    const RESERVED_SYMBOLS = ['pi', 'e'];
    const sectionMeta = {
        probability: {
            title: 'Probability Solver',
            description: "Use Bayes' theorem to compute a posterior probability from prior, likelihood, and marginal probability."
        },
        algebra: {
            title: 'Algebra Solver',
            description: 'Solve equations with automatic cleanup for implicit multiplication, common polynomial forms, and variable detection.'
        },
        calculus: {
            title: 'Calculus Solver',
            description: 'Compute derivatives, higher-order derivatives, indefinite integrals, and definite integrals with symbolic steps.'
        }
    };

    const appState = {
        currentSection: 'probability',
        authMode: 'login',
        user: null,
        history: [],
        gamification: null
    };

    // Only wire up nav items that have a data-section attribute
    const sectionNavItems = Array.from(navItems).filter(el => el.getAttribute('data-section'));

    sectionNavItems.forEach((item) => {
        item.addEventListener('click', async() => {
            sectionNavItems.forEach((nav) => nav.classList.remove('active'));
            item.classList.add('active');
            appState.currentSection = item.getAttribute('data-section');
            sections.forEach((section) => section.classList.remove('active'));
            document.getElementById(`${appState.currentSection}-section`).classList.add('active');
            if (sectionTitle) sectionTitle.textContent = sectionMeta[appState.currentSection].title;
            if (sectionDescription) sectionDescription.textContent = sectionMeta[appState.currentSection].description;
            resetUI();
            await saveProgress();
        });
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    calcOpSelect.addEventListener('change', syncCalculusControls);
    clearBtn.addEventListener('click', handleClear);
    solveBtn.addEventListener('click', handleSolve);

    // Sidebar "Start New Problem" button also triggers solve
    const newProblemBtn = document.getElementById('newProblemBtn');
    if (newProblemBtn) newProblemBtn.addEventListener('click', handleClear);
    logoutBtn.addEventListener('click', handleLogout);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            const tagName = event.target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'select') {
                handleSolve();
            }
        }
    });

    syncCalculusControls();
    initializeTheme();
    initialize();

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                setTheme(currentTheme);
            });
        }
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (moonIcon) moonIcon.classList.add('is-hidden');
            if (sunIcon) sunIcon.classList.remove('is-hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (moonIcon) moonIcon.classList.remove('is-hidden');
            if (sunIcon) sunIcon.classList.add('is-hidden');
            localStorage.setItem('theme', 'light');
        }
    }

    async function initialize() {
        initRippleEffect();
        await fetchCurrentUser();   // renders auth state + gamification when done
        await loadHistory();
        await loadProgress();
        await loadGamification();
    }

    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    async function handleSolve() {
        resetUI();

        let result;
        let questionText = '';

        try {
            loadingIndicator.style.display = 'block';
            resultsArea.classList.remove('show');
            resultsArea.style.display = 'none';

            if (appState.currentSection === 'probability') {
                const pA = parseFloat(pAInput.value);
                const pBA = parseFloat(pBAInput.value);
                const pB = parseFloat(pBInput.value);

                if ([pA, pBA, pB].some(Number.isNaN)) {
                    showError('Please enter valid numbers for all probability fields.');
                    return;
                }

                if (![pA, pBA, pB].every(isValidProbability)) {
                    showError('Probability values must stay between 0 and 1.');
                    return;
                }

                if (pB === 0) {
                    showError('P(B) cannot be zero.');
                    return;
                }

                questionText = `P(A)=${pA}, P(B|A)=${pBA}, P(B)=${pB}`;
                result = solveProbability({ pA, pBA, pB });
            } else if (appState.currentSection === 'algebra') {
                const equation = algebraEqInput.value.trim();
                if (!equation) {
                    showError('Please enter an equation to solve.');
                    return;
                }
                if (!hasBalancedGrouping(equation)) {
                    showError('Please check parentheses or brackets in the algebra equation.');
                    return;
                }

                questionText = equation;
                result = solveAlgebra({ equation });
            } else {
                const expression = calcExprInput.value.trim();
                const operation = calcOpSelect.value;
                const variable = sanitizeVariable(calcVariableInput.value) || detectVariable(expression) || 'x';
                const order = parseInt(calcOrderInput.value, 10) || 1;
                const lowerBound = calcLowerInput.value.trim();
                const upperBound = calcUpperInput.value.trim();

                if (!expression) {
                    showError('Please enter a mathematical expression.');
                    return;
                }

                if (!hasBalancedGrouping(expression)) {
                    showError('Please check parentheses or brackets in the calculus expression.');
                    return;
                }

                if (operation === 'nth-derivative' && order < 1) {
                    showError('Derivative order must be at least 1.');
                    return;
                }

                if (operation === 'definite-integral') {
                    if (!lowerBound || !upperBound) {
                        showError('Please provide both lower and upper bounds for the definite integral.');
                        return;
                    }
                    if (!isParsableMath(lowerBound) || !isParsableMath(upperBound)) {
                        showError('Bounds must be valid mathematical values.');
                        return;
                    }
                }

                questionText = buildCalculusQuestion(expression, operation, variable, order, lowerBound, upperBound);
                result = solveCalculus({ expression, operation, variable, order, lowerBound, upperBound });
            }

            displayResults(result);
            await saveProgress(questionText);
            await saveHistoryEntry(questionText, result.answer);
            await recordGamificationSolve();
        } catch (error) {
            console.error('Error solving:', error);
            showError('Something went wrong while solving this problem.');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function handleClear() {
        pAInput.value = '';
        pBAInput.value = '';
        pBInput.value = '';
        algebraEqInput.value = '';
        calcExprInput.value = '';
        calcVariableInput.value = '';
        calcOrderInput.value = '2';
        calcLowerInput.value = '';
        calcUpperInput.value = '';
        calcOpSelect.value = 'derivative';
        syncCalculusControls();
        resetUI();
    }

    function syncCalculusControls() {
        const operation = calcOpSelect.value;
        calcOrderGroup.classList.toggle('is-hidden', operation !== 'nth-derivative');
        calcLowerGroup.classList.toggle('is-hidden', operation !== 'definite-integral');
        calcUpperGroup.classList.toggle('is-hidden', operation !== 'definite-integral');
    }

    function resetUI() {
        errorMessage.textContent = '';
        resultsArea.classList.remove('show');
        finalAnswer.classList.remove('show');
        setTimeout(() => {
            if (!resultsArea.classList.contains('show')) {
                resultsArea.style.display = 'none';
            }
        }, 250);
    }

    function showError(message) {
        errorMessage.textContent = message;
    }

    function solveProbability(payload) {
        const numerator = payload.pBA * payload.pA;
        const answer = numerator / payload.pB;

        if (numerator > payload.pB + 1e-10) {
            return {
                answer: 'Inconsistent probability inputs',
                steps: [
                    'These values do not form a valid Bayes theorem setup.',
                    `P(B|A) * P(A) = ${formatNumber(numerator)} but P(B) = ${formatNumber(payload.pB)}.`,
                    'Since the numerator is larger than the marginal probability, the posterior would be greater than 1.',
                    'Please adjust the inputs so the probabilities are consistent.'
                ]
            };
        }

        return {
            answer: `P(A|B) = ${formatNumber(answer)}`,
            steps: [
                "Use Bayes' theorem: P(A|B) = (P(B|A) * P(A)) / P(B).",
                `Substitute the values: (${payload.pBA} * ${payload.pA}) / ${payload.pB}.`,
                `Compute the numerator: ${formatNumber(numerator)}.`,
                `Divide by the marginal probability to get ${formatNumber(answer)}.`
            ]
        };
    }

    function solveAlgebra(payload) {
        try {
            const normalizedEquation = normalizeMathInput(payload.equation);
            const equalityCount = (normalizedEquation.match(/=/g) || []).length;

            if (equalityCount > 1) {
                throw new Error('Too many equality signs.');
            }

            const variable = detectVariable(normalizedEquation) || 'x';
            const preparedEquation = normalizedEquation.includes('=') ? normalizedEquation : `${normalizedEquation}=0`;
            const [leftSide, rightSide] = preparedEquation.split('=');

            assertValidMathInput(leftSide);
            assertValidMathInput(rightSide);

            const standardForm = nerdamer(`${leftSide}-(${rightSide})`).toString();
            const simplifiedStandardForm = simplifyExpression(standardForm);
            const variableCount = countDistinctVariables(preparedEquation);

            if (!containsVariable(preparedEquation, variable)) {
                const numericResult = simplifyExpression(simplifiedStandardForm);
                const truthValue = numericResult === '0';

                return {
                    answer: truthValue ? 'Identity is true' : 'No variable to solve',
                    steps: [
                        `Normalize the input to ${formatInline(preparedEquation)}.`,
                        `Move both sides into one expression: ${formatInline(simplifiedStandardForm)} = 0.`,
                        truthValue ? 'Both sides are equal, so the statement is true for all values.' : `The statement simplifies to ${formatInline(numericResult)} = 0, which is false.`
                    ]
                };
            }

            const solutions = normalizeSolutions(solveEquation(preparedEquation, simplifiedStandardForm, variable), variable);

            if (!solutions.length) {
                throw new Error('No algebraic solution returned.');
            }

            const formattedSolutions = solutions.map(formatExpression).join(', ');
            const steps = [
                `Normalize the input so terms like ${formatInline('2x')} and ${formatInline('3(x+1)')} become symbolic form: ${formatInline(normalizedEquation)}.`,
                `Detect the main variable as ${formatInline(variable)} and rewrite the problem as ${formatInline(preparedEquation)}.`,
                `Move all terms into one expression: ${formatInline(simplifiedStandardForm)} = 0.`,
                `Solve the equation symbolically to obtain ${formattedSolutions}.`
            ];

            if (variableCount > 1) {
                steps.splice(2, 0, `Multiple variables were detected, so the solver treated ${formatInline(variable)} as the main variable and the others as constants where possible.`);
            }

            const approximationNote = buildApproximationNote(solutions);
            if (approximationNote) {
                steps.push(approximationNote);
            }

            return {
                answer: `${variable} = ${formattedSolutions}`,
                steps
            };
        } catch (error) {
            return {
                answer: 'Unable to solve the equation',
                steps: [
                    `The equation ${formatInline(payload.equation)} could not be solved safely with the current algebra rules.`,
                    "Try standard forms like '2x + 5 = 15', 'x^2 - 9 = 0', '3(x+1)=12', or rewrite very large expressions with clear parentheses.",
                    'If the problem contains several variables, enter one main-variable equation at a time.'
                ]
            };
        }
    }

    function solveCalculus(payload) {
        try {
            const normalizedExpression = normalizeMathInput(payload.expression);
            const variable = sanitizeVariable(payload.variable) || detectVariable(normalizedExpression) || 'x';
            assertValidMathInput(normalizedExpression);
            const structure = classifyExpression(normalizedExpression);
            const constantExpression = !containsVariable(normalizedExpression, variable);

            if (payload.operation === 'derivative') {
                const derivative = constantExpression ? '0' : simplifyExpression(nerdamer(`diff(${normalizedExpression},${variable})`).toString());
                return {
                    answer: formatExpression(derivative),
                    steps: filterSteps([
                        `Normalize the expression to ${formatInline(normalizedExpression)} and differentiate with respect to ${formatInline(variable)}.`,
                        `Detected expression types: ${structure.join(', ')}.`,
                        'Apply the derivative rules term by term and simplify the result.',
                        `Final derivative: ${formatExpression(derivative)}.`,
                        buildSingleApproximationNote(derivative)
                    ])
                };
            }

            if (payload.operation === 'nth-derivative') {
                let result = normalizedExpression;

                if (constantExpression) {
                    result = '0';
                } else {
                    for (let index = 0; index < payload.order; index += 1) {
                        result = nerdamer(`diff(${result},${variable})`).toString();
                    }
                }

                result = simplifyExpression(result);
                return {
                    answer: formatExpression(result),
                    steps: filterSteps([
                        `Normalize the expression to ${formatInline(normalizedExpression)} and choose variable ${formatInline(variable)}.`,
                        `Compute the derivative repeatedly until reaching order ${payload.order}.`,
                        `Detected expression types: ${structure.join(', ')}.`,
                        `${ordinal(payload.order)} derivative: ${formatExpression(result)}.`,
                        buildSingleApproximationNote(result)
                    ])
                };
            }

            if (payload.operation === 'integral') {
                const antiderivative = constantExpression ?
                    simplifyExpression(`(${normalizedExpression})*${variable}`) :
                    integrateExpressionSymbolically(normalizedExpression, variable);
                const specialFunctionNote = buildSpecialFunctionNote(antiderivative);

                return {
                    answer: `${formatExpression(antiderivative)} + C`,
                    steps: filterSteps([
                        `Normalize the expression to ${formatInline(normalizedExpression)} and integrate with respect to ${formatInline(variable)}.`,
                        `Detected expression types: ${structure.join(', ')}.`,
                        'Apply symbolic integration rules to each term and combine the result.',
                        `General antiderivative: ${formatExpression(antiderivative)} + C.`,
                        specialFunctionNote,
                        buildSingleApproximationNote(antiderivative)
                    ])
                };
            }

            const lowerBound = normalizeMathInput(payload.lowerBound);
            const upperBound = normalizeMathInput(payload.upperBound);
            assertValidMathInput(lowerBound);
            assertValidMathInput(upperBound);

            if (hasInternalDivergence(normalizedExpression, variable, lowerBound, upperBound)) {
                throw new Error('Integral crosses a vertical asymptote or undefined region (internal divergence).');
            }

            const antiderivative = constantExpression ?
                simplifyExpression(`(${normalizedExpression})*${variable}`) :
                integrateExpressionSymbolically(normalizedExpression, variable);
            const upperValue = nerdamer(antiderivative).evaluate({
                [variable]: `(${upperBound})`
            }).toString();
            const lowerValue = nerdamer(antiderivative).evaluate({
                [variable]: `(${lowerBound})`
            }).toString();
            const definiteValue = simplifyExpression(nerdamer(`(${upperValue})-(${lowerValue})`).expand().toString());

            if (String(definiteValue).includes('Infinity') || String(definiteValue).includes('NaN')) {
                throw new Error('Integral evaluates to Infinity or NaN.');
            }

            return {
                answer: formatExpression(definiteValue),
                steps: filterSteps([
                    `Normalize the integrand to ${formatInline(normalizedExpression)} and integrate with respect to ${formatInline(variable)}.`,
                    `Find an antiderivative: ${formatExpression(antiderivative)}.`,
                    `Evaluate at the bounds: F(${formatExpression(upperBound)}) - F(${formatExpression(lowerBound)}).`,
                    `Definite integral value: ${formatExpression(definiteValue)}.`,
                    buildSingleApproximationNote(definiteValue)
                ])
            };
        } catch (error) {
            const errStr = (error.message || '').toLowerCase();
            if (payload.operation === 'integral' && (errStr.includes('elementary antiderivative') || errStr.includes('trigonometric square-root integral'))) {
                return {
                    answer: 'No simple elementary antiderivative',
                    steps: [
                        `The integral of ${formatInline(payload.expression)} is not usually expressible with basic elementary functions.`,
                        'Trigonometric square-root forms such as sqrt(sin(x)) or (sin(x))^(1/2) often require special functions such as elliptic integrals.',
                        'The solver is stopping here to avoid showing an incorrect elementary answer.'
                    ]
                };
            }
            if (payload.operation === 'definite-integral' && (errStr.includes('zero') || errStr.includes('undefined') || errStr.includes('infinity') || errStr.includes('nan'))) {
                return {
                    answer: 'Invalid Result: Diverges',
                    steps: [
                        `The definite integral of ${formatInline(payload.expression)} from ${formatInline(payload.lowerBound)} to ${formatInline(payload.upperBound)} diverges or is undefined.`,
                        `Computation failed: ${error.message}`
                    ]
                };
            }
            return {
                answer: 'Unable to process the calculus expression',
                steps: [
                    `The expression ${formatInline(payload.expression)} could not be parsed for this operation.`,
                    "Try inputs like 'x^3 + 2x', 'sin(x)', 'e^x', or '(x^2+1)/(x+1)'."
                ]
            };
        }
    }

    async function handleLogout() {
        try {
            await fetch(API.authLogout, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            appState.user = null;
            appState.history = [];
            appState.gamification = null;
            historyList.innerHTML = '';
            renderAuthState();
            renderHistory();
            renderGamification();
        }
    }

    async function fetchCurrentUser() {
        try {
            const response = await fetch(API.authMe, { credentials: 'include' });
            if (!response.ok) {
                renderAuthState();
                renderGamification();
                return;
            }
            const data = await window.safeJsonParse(response);
            appState.user = data.user || null;
        } catch (error) {
            appState.user = null;
        }
        renderAuthState();
        renderGamification();
    }

    async function loadHistory() {
        if (!appState.user) {
            appState.history = [];
            renderHistory();
            return;
        }

        try {
            const response = await fetch(API.history, { credentials: 'include' });
            const data = await window.safeJsonParse(response);
            appState.history = Array.isArray(data.history) ? data.history : [];
        } catch (error) {
            appState.history = [];
        }

        renderHistory();
    }

    async function saveHistoryEntry(question, answer) {
        if (!appState.user || !question || !answer) {
            return;
        }

        try {
            const response = await fetch(API.history, buildJsonRequest({
                section: appState.currentSection,
                question,
                answer
            }));

            // Silently reload history on success; on failure log but don't
            // interrupt the user — the solve result is already displayed.
            if (response.ok) {
                await loadHistory();
            } else {
                const data = await window.safeJsonParse(response);
                console.warn('History save rejected:', data.message || response.status);
            }
        } catch (error) {
            console.error('History save failed:', error);
        }
    }

    async function loadProgress() {
        if (!appState.user) {
            progressStatus.textContent = 'No saved progress yet';
            return;
        }

        try {
            const response = await fetch(API.progress, { credentials: 'include' });
            const data = await window.safeJsonParse(response);

            if (!response.ok || !data.progress) {
                progressStatus.textContent = 'No saved progress yet';
                return;
            }

            progressStatus.textContent = `${capitalize(data.progress.currentSection)} - ${data.progress.lastQuestion || 'No recent question'}`;
        } catch (error) {
            progressStatus.textContent = 'Unable to load saved progress';
        }
    }

    // Only save progress when we have a real question (after solving).
    // Nav-tab switches call saveProgress() with no argument — we skip the
    // write in that case so we don't overwrite the last real question.
    async function saveProgress(lastQuestion = '') {
        if (!appState.user) {
            return;
        }

        try {
            const body = { currentSection: appState.currentSection };
            // Only include lastQuestion when it's a real value
            if (lastQuestion) {
                body.lastQuestion = lastQuestion;
            }

            const response = await fetch(API.progress, buildJsonRequest(body));
            if (response.ok) {
                await loadProgress();
            } else {
                console.warn('Progress save rejected:', response.status);
            }
        } catch (error) {
            console.error('Progress save failed:', error);
        }
    }

    function renderAuthState() {
        const loggedIn = Boolean(appState.user);
        const isGoogle = loggedIn && appState.user.isGoogle;

        if (authStatus) authStatus.textContent = loggedIn ? `Signed in: ${appState.user.fullName}` : 'Guest Mode';
        if (authPageLinks) authPageLinks.classList.toggle('is-hidden', loggedIn);
        if (accountSummary) accountSummary.classList.toggle('is-hidden', !loggedIn || isGoogle);
        if (logoutBtn) logoutBtn.classList.toggle('is-hidden', !loggedIn);

        // Google user card toggle
        const googleUserCard = document.getElementById('googleUserCard');
        if (googleUserCard) {
            if (loggedIn && isGoogle) {
                const nameEl  = document.getElementById('googleUserName');
                const emailEl = document.getElementById('googleUserEmail');
                if (nameEl)  nameEl.textContent  = appState.user.fullName;
                if (emailEl) emailEl.textContent = appState.user.email;
                googleUserCard.style.display = 'block';
            } else {
                googleUserCard.style.display = 'none';
            }
        }

        if (loggedIn) {
            if (accountTitle) accountTitle.textContent = 'Solver History';
            if (accountCopy) accountCopy.textContent = 'Your questions, answers, and progress are now securely stored on your account.';
            if (accountName) accountName.textContent = appState.user.fullName;
            if (accountEmail) accountEmail.textContent = appState.user.email;
        } else {
            if (accountTitle) accountTitle.textContent = 'Solver History';
            if (accountCopy) accountCopy.innerHTML = '<a href="login.html" style="color: var(--primary-color); font-weight: 500;">Sign in</a> or <a href="register.html" style="color: var(--primary-color); font-weight: 500;">create an account</a> to save your history and track your progress.';
            if (progressStatus) progressStatus.textContent = 'No saved progress yet';
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';

        if (!appState.user) {
            historyEmpty.textContent = 'Log in to save your history and track your progress.';
            historyEmpty.style.display = 'block';
            return;
        }

        if (!appState.history.length) {
            historyEmpty.textContent = 'No history yet. Solve a problem to get started!';
            historyEmpty.style.display = 'block';
            return;
        }

        historyEmpty.style.display = 'none';
        appState.history.forEach((entry) => {
            const item = document.createElement('article');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-type">${escapeHtml(entry.section)}</div>
                <div class="history-question"><strong>Question:</strong> ${escapeHtml(entry.question)}</div>
                <div class="history-answer"><strong>Answer:</strong> ${escapeHtml(entry.answer)}</div>
                <div class="history-meta">${formatDateTime(entry.createdAt)}</div>
            `;
            historyList.appendChild(item);
        });
    }

    let finalAnswerTimeoutId = null;

    function displayResults(data) {
        stepsContent.innerHTML = '';
        if (finalAnswerTimeoutId) {
            clearTimeout(finalAnswerTimeoutId);
        }

        const stepDelaySeconds = 0.6;

        if (Array.isArray(data.steps)) {
            const validSteps = data.steps.filter(Boolean);
            validSteps.forEach((step, index) => {
                const item = document.createElement('div');
                item.className = 'step-item';
                item.textContent = step;
                item.style.animationDelay = `${index * stepDelaySeconds}s`;
                stepsContent.appendChild(item);
            });
        }

        finalAnswer.textContent = `Solution: ${data.answer}`;
        finalAnswer.classList.remove('show');
        resultsArea.style.display = 'block';
        requestAnimationFrame(() => {
            resultsArea.classList.add('show');

            let delayMs = 200;
            if (Array.isArray(data.steps)) {
                const validSteps = data.steps.filter(Boolean);
                delayMs = validSteps.length * (stepDelaySeconds * 1000) + 200;
            }

            finalAnswerTimeoutId = setTimeout(() => {
                finalAnswer.classList.add('show');
            }, delayMs);
        });
    }

    // ─── GAMIFICATION ────────────────────────────────────────────────────────────

    async function loadGamification() {
        if (!appState.user) { renderGamification(); return; }
        try {
            const response = await fetch(API.gamification, { credentials: 'include' });
            const data = await window.safeJsonParse(response);
            appState.gamification = data.gamification || null;
        } catch (e) {
            appState.gamification = null;
        }
        renderGamification();
    }

    async function recordGamificationSolve() {
        if (!appState.user) return;
        try {
            const response = await fetch(API.gamificationSolve, buildJsonRequest({}));
            const data = await window.safeJsonParse(response);
            const prevSolves = appState.gamification ? appState.gamification.todaySolves : 0;
            const prevStreak = appState.gamification ? appState.gamification.streak : 0;
            appState.gamification = data.gamification;
            renderGamification();

            // Solve button ring flash
            const btn = document.getElementById('solveBtn');
            if (btn) {
                btn.classList.remove('solve-celebrate');
                void btn.offsetWidth;
                btn.classList.add('solve-celebrate');
                setTimeout(() => btn.classList.remove('solve-celebrate'), 800);
            }

            // Level-up popup
            if (data.leveledUp && data.newBadge) {
                showLevelUpPopup(data.newBadge);
            }

            // Daily goal toast
            if (prevSolves < 5 && data.gamification.todaySolves >= 5) {
                showGoalToast();
            }

            // Streak toast (when streak increments above 1, and no level-up this solve)
            if (!data.leveledUp && data.gamification.streak > prevStreak && data.gamification.streak > 1) {
                showStreakToast(data.gamification.streak);
            }

        } catch (e) {
            console.error('Gamification solve failed:', e);
        }
    }

    function getBadgeTier(points) {
        if (points >= 800) return 'Legend';
        if (points >= 500) return 'Master';
        if (points >= 300) return 'Expert';
        if (points >= 150) return 'Advanced';
        if (points >= 50) return 'Intermediate';
        return 'Beginner';
    }

    const BADGE_META = {
        'Beginner': { rankClass: 'rank-beginner', tierClass: 'beginner', nextLabel: 'Intermediate', xpMin: 0, xpMax: 50 },
        'Intermediate': { rankClass: 'rank-intermediate', tierClass: 'intermediate', nextLabel: 'Advanced', xpMin: 50, xpMax: 150 },
        'Advanced': { rankClass: 'rank-advanced', tierClass: 'advanced', nextLabel: 'Expert', xpMin: 150, xpMax: 300 },
        'Expert': { rankClass: 'rank-expert', tierClass: 'expert', nextLabel: 'Master', xpMin: 300, xpMax: 500 },
        'Master': { rankClass: 'rank-master', tierClass: 'master', nextLabel: 'Legend', xpMin: 500, xpMax: 800 },
        'Legend': { rankClass: 'rank-legend', tierClass: 'legend', nextLabel: null, xpMin: 800, xpMax: 800 }
    };

    function renderGamification() {
        const guestEl = document.getElementById('gamificationGuest');
        const statsEl = document.getElementById('gamificationStats');
        const chipEl = document.getElementById('gamiRankChip');

        // Not logged in — show sign-in prompt
        if (!appState.user) {
            if (guestEl) guestEl.style.display = 'block';
            if (statsEl) statsEl.style.display = 'none';
            if (chipEl) chipEl.className = 'gami-rank-chip';
            return;
        }

        // Logged in but stats not loaded yet — hide both panels (no flash)
        if (!appState.gamification) {
            if (guestEl) guestEl.style.display = 'none';
            if (statsEl) statsEl.style.display = 'none';
            return;
        }

        if (guestEl) guestEl.style.display = 'none';
        if (statsEl) statsEl.style.display = 'block';

        const g = appState.gamification;
        const badge = getBadgeTier(g.points);
        const meta = BADGE_META[badge];
        const DAILY_GOAL = 5;
        const solvesPct = Math.min((g.todaySolves / DAILY_GOAL) * 100, 100);
        const goalDone = g.todaySolves >= DAILY_GOAL;

        // Rank chip
        if (chipEl) chipEl.className = `gami-rank-chip ${meta.rankClass}`;
        const badgeLabelEl = document.getElementById('badgeLabel');
        if (badgeLabelEl) badgeLabelEl.textContent = badge;

        // XP — bump when value changes
        const xpEl = document.getElementById('gamiPoints');
        if (xpEl) {
            const prev = xpEl.textContent;
            xpEl.textContent = g.points;
            if (prev !== String(g.points) && prev !== '0') {
                xpEl.classList.remove('ticked', 'bump');
                void xpEl.offsetWidth;
                xpEl.classList.add('ticked', 'bump');
            }
        }

        // Streak + flame
        const streakEl = document.getElementById('gamiStreak');
        const flameEl = document.getElementById('gamiFlame');
        if (streakEl) {
            const prevVal = streakEl.textContent;
            streakEl.textContent = g.streak;
            streakEl.className = `gami-stat-val gami-streak-value${g.streak > 0 ? ' active' : ''}`;
            if (prevVal !== String(g.streak) && g.streak > 0) {
                streakEl.classList.add('bump');
                setTimeout(() => streakEl.classList.remove('bump'), 500);
            }
        }
        if (flameEl) flameEl.classList.toggle('active', g.streak > 0);

        // Today
        const todayEl = document.getElementById('gamiTodaySolves');
        if (todayEl) {
            const prevVal = todayEl.textContent;
            todayEl.textContent = g.todaySolves;
            todayEl.className = `gami-stat-val gami-today-value${g.todaySolves > 0 ? ' active' : ''}`;
            if (prevVal !== String(g.todaySolves)) {
                todayEl.classList.add('bump');
                setTimeout(() => todayEl.classList.remove('bump'), 500);
            }
        }

        // Goal text + bar + pips
        const goalCountEl = document.getElementById('gamiGoalText');
        if (goalCountEl) goalCountEl.textContent = `${Math.min(g.todaySolves, DAILY_GOAL)} / ${DAILY_GOAL}`;

        const fillEl = document.getElementById('gamiProgressBar');
        if (fillEl) {
            fillEl.style.width = `${solvesPct}%`;
            fillEl.classList.toggle('complete', goalDone);
        }

        document.querySelectorAll('.gami-pip').forEach((pip, i) => {
            const filled = g.todaySolves > i;
            pip.classList.toggle('filled', filled && !goalDone);
            pip.classList.toggle('complete', filled && goalDone);
        });

        // Rank progression
        const rankFill = document.getElementById('gamiRankFill');
        const rankCurrent = document.getElementById('gamiRankCurrent');
        const rankNext = document.getElementById('gamiNextBadge');

        if (rankCurrent) rankCurrent.textContent = badge;

        if (badge === 'Legend') {
            if (rankFill) rankFill.style.width = '100%';
            if (rankNext) rankNext.textContent = 'Max rank reached';
        } else {
            const pct = Math.max(((g.points - meta.xpMin) / (meta.xpMax - meta.xpMin)) * 100, 0);
            if (rankFill) rankFill.style.width = `${pct}%`;
            if (rankNext) rankNext.textContent = `${meta.xpMax - g.points} XP → ${meta.nextLabel}`;
        }
    }

    function showLevelUpPopup(badgeName) {
        const meta = BADGE_META[badgeName] || BADGE_META['Intermediate'];
        const tc = meta.tierClass;
        const g = appState.gamification || {};

        const icons = {
            intermediate: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
            advanced: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
            expert: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            master: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
            legend: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`
        };

        const overlay = document.createElement('div');
        overlay.className = 'levelup-overlay';
        overlay.innerHTML = `
            <div class="levelup-modal" id="levelupModal">
                <div class="levelup-hero ${tc}">
                    <div class="levelup-badge-icon ${tc}">${icons[tc] || icons.intermediate}</div>
                    <div class="levelup-rank-tag ${tc}">Rank Unlocked</div>
                    <div class="levelup-hero-title">${badgeName}</div>
                    <div class="levelup-hero-sub">Your consistency paid off — keep the momentum going.</div>
                </div>
                <div class="levelup-body">
                    <div class="levelup-stat-row">
                        <div class="levelup-stat">
                            <div class="levelup-stat-val">${g.points || 0}</div>
                            <div class="levelup-stat-lbl">Total XP</div>
                        </div>
                        <div class="levelup-stat">
                            <div class="levelup-stat-val">${g.streak || 0}</div>
                            <div class="levelup-stat-lbl">Day Streak</div>
                        </div>
                        <div class="levelup-stat">
                            <div class="levelup-stat-val">${g.todaySolves || 0}</div>
                            <div class="levelup-stat-lbl">Today</div>
                        </div>
                    </div>
                    <button class="levelup-cta ${tc}" id="levelupDismiss">Continue Solving</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        spawnConfetti(tc);

        const dismiss = () => {
            overlay.classList.add('closing');
            const modal = document.getElementById('levelupModal');
            if (modal) modal.classList.add('closing');
            setTimeout(() => overlay.remove(), 320);
        };

        document.getElementById('levelupDismiss').addEventListener('click', dismiss);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
        setTimeout(dismiss, 9000);
    }

    function showGoalToast() {
        const existing = document.querySelector('.goal-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'goal-toast';
        toast.innerHTML = `
            <div class="goal-toast-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <div>
                <div class="goal-toast-title">Daily goal complete!</div>
                <div class="goal-toast-sub">5 problems solved today</div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function showStreakToast(streak) {
        setTimeout(() => {
            const existing = document.querySelector('.streak-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'streak-toast';
            toast.innerHTML = `
                <div class="streak-toast-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C10 6 8 8 8 11a4 4 0 0 0 8 0c0-2.5-1.5-4.5-2.5-6C13 7 15 9.5 15 12a3 3 0 0 1-6 0c0-2 1.5-4 3-5z"/>
                    </svg>
                </div>
                <div>
                    <div class="streak-toast-title">${streak}-day streak!</div>
                    <div class="streak-toast-sub">Come back tomorrow to keep it going</div>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }, 600);
    }

    function spawnConfetti(tier) {
        const palettes = {
            intermediate: ['#d96c2d', '#f59e0b', '#fbbf24', '#ea8d47', '#fff7ed'],
            advanced: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#ecfdf5'],
            expert: ['#e11d48', '#f43f5e', '#fb7185', '#be123c', '#fff1f2'],
            master: ['#6366f1', '#8b5cf6', '#a5b4fc', '#c4b5fd', '#ede9fe'],
            legend: ['#fbbf24', '#f59e0b', '#fde047', '#fef08a', '#ffedd5']
        };
        const colors = palettes[tier] || palettes.intermediate;

        for (let i = 0; i < 55; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                const size = 5 + Math.random() * 7;
                const left = 25 + Math.random() * 50;
                const dur = 1.6 + Math.random() * 1.6;
                const isCircle = Math.random() > 0.45;
                el.style.cssText = `
                    position:fixed;pointer-events:none;z-index:10000;
                    left:${left}vw;top:-10px;
                    width:${size}px;height:${isCircle ? size : size * 0.45}px;
                    border-radius:${isCircle ? '50%' : '2px'};
                    background:${colors[Math.floor(Math.random() * colors.length)]};
                    opacity:0.9;
                    animation:confettiFall ${dur}s linear ${Math.random() * 0.5}s forwards;
                `;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), (dur + 0.6) * 1000);
            }, i * 22);
        }
    }

    // ─── UTILITIES ───────────────────────────────────────────────────────────────

    function buildJsonRequest(body) {
        return {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };
    }

    function buildCalculusQuestion(expression, operation, variable, order, lowerBound, upperBound) {
        if (operation === 'nth-derivative') {
            return `${ordinal(order)} derivative of ${expression} with respect to ${variable}`;
        }
        if (operation === 'integral') {
            return `Integral of ${expression} with respect to ${variable}`;
        }
        if (operation === 'definite-integral') {
            return `Integral of ${expression} from ${lowerBound} to ${upperBound} with respect to ${variable}`;
        }
        return `Derivative of ${expression} with respect to ${variable}`;
    }

    function normalizeMathInput(expression) {
        if (!expression) { return ''; }

        let normalized = expression.replace(/\s+/g, '');
        normalized = normalized.replace(/\u2212/g, '-');
        normalized = normalized.replace(/\u00F7/g, '/');
        normalized = normalized.replace(/\u00D7/g, '*');
        normalized = normalized.replace(/\u03C0/g, 'pi');
        normalized = normalized.replace(/pie/ig, 'pi');
        normalized = normalized.replace(/\u221A/g, 'sqrt');
        normalized = normalized.replace(/\^0?\.5(?!\d)/g, '^(1/2)');
        normalized = normalized.replace(/\[/g, '(').replace(/\]/g, ')');
        normalized = normalized.replace(/\{/g, '(').replace(/\}/g, ')');
        normalized = normalized.replace(/(asin|acos|atan|sinh|cosh|tanh|sqrt|sin|cos|tan|sec|csc|cot|log|ln|abs|exp)\^([0-9]+(?:\.[0-9]+)?|\([^)]+\))([a-zA-Z]|\([^)]+\))/g, '($1($3))^$2');
        normalized = expandFunctionShorthand(normalized);
        normalized = normalized.replace(/(\d)([A-Za-z(])/g, '$1*$2');
        normalized = normalized.replace(/(\))(\d|[A-Za-z(])/g, '$1*$2');
        normalized = normalized.replace(/([A-Za-z])(\()/g, (match, left, right, offset, source) => {
            const fragment = source.slice(Math.max(0, offset - 4), offset + 1);
            const isFunction = FUNCTION_NAMES.some((name) => fragment.endsWith(name));
            return isFunction ? `${left}${right}` : `${left}*${right}`;
        });
        return normalized;
    }

    function expandFunctionShorthand(expression) {
        let expanded = expression;
        FUNCTION_NAMES.forEach((fnName) => { expanded = replaceFunctionAtoms(expanded, fnName); });
        return expanded;
    }

    function replaceFunctionAtoms(expression, fnName) {
        let output = '';
        let index = 0;

        while (index < expression.length) {
            if (expression.startsWith(fnName, index) && expression[index + fnName.length] !== '(') {
                const atomStart = index + fnName.length;
                const atomEnd = findFunctionArgumentEnd(expression, atomStart);

                if (atomEnd > atomStart) {
                    output += `${fnName}(${expression.slice(atomStart, atomEnd)})`;
                    index = atomEnd;
                    continue;
                }
            }
            output += expression[index];
            index += 1;
        }
        return output;
    }

    function findFunctionArgumentEnd(expression, startIndex) {
        if (startIndex >= expression.length) { return startIndex; }

        if (expression[startIndex] === '(') {
            let depth = 0;
            for (let index = startIndex; index < expression.length; index += 1) {
                if (expression[index] === '(') depth += 1;
                else if (expression[index] === ')') {
                    depth -= 1;
                    if (depth === 0) return index + 1;
                }
            }
            return expression.length;
        }

        let index = startIndex;
        if (expression[index] === '+' || expression[index] === '-') index += 1;
        while (index < expression.length && !'+-*/,)='.includes(expression[index])) index += 1;
        return index;
    }

    function detectVariable(expression) {
        if (!expression) { return ''; }
        let cleaned = expression;
        FUNCTION_NAMES.forEach((name) => { cleaned = cleaned.replace(new RegExp(name, 'g'), ''); });
        RESERVED_SYMBOLS.forEach((symbol) => { cleaned = cleaned.replace(new RegExp(symbol, 'g'), ''); });
        const match = cleaned.match(/[a-zA-Z]/);
        return match ? match[0] : '';
    }

    function sanitizeVariable(value) {
        const cleaned = (value || '').trim().toLowerCase();
        return /^[a-z]$/.test(cleaned) ? cleaned : '';
    }

    function containsVariable(expression, variable) {
        if (!variable) { return false; }
        return new RegExp(variable, 'i').test(stripFunctions(expression));
    }

    function stripFunctions(expression) {
        let cleaned = expression;
        FUNCTION_NAMES.forEach((name) => { cleaned = cleaned.replace(new RegExp(name, 'g'), ''); });
        RESERVED_SYMBOLS.forEach((symbol) => { cleaned = cleaned.replace(new RegExp(symbol, 'g'), ''); });
        return cleaned;
    }

    function normalizeSolutions(rawSolutions, variable) {
        const collected = [];

        const visit = (value) => {
            if (value === null || value === undefined) { return; }

            if (Array.isArray(value)) {
                if (value.length === 2 && value[0] && value[0].toString() === variable) {
                    collected.push(value[1].toString());
                    return;
                }
                value.forEach(visit);
                return;
            }

            const text = value.toString().trim();
            if (!text) { return; }

            if (text.startsWith('[') && text.endsWith(']')) {
                splitTopLevel(text.slice(1, -1)).forEach(visit);
                return;
            }

            if (text.includes('=')) {
                const [leftSide, ...rest] = text.split('=');
                if (leftSide.trim() === variable && rest.length) {
                    collected.push(rest.join('=').trim());
                    return;
                }
            }

            collected.push(text);
        };

        visit(rawSolutions);

        return [...new Set(collected
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => simplifyExpression(item)))];
    }

    function solveEquation(equation, standardForm, variable) {
        const attempts = [
            () => nerdamer.solveEquations(equation, variable),
            () => nerdamer(`solve(${standardForm},${variable})`).toString(),
            () => nerdamer(`roots(${standardForm},${variable})`).toString(),
            () => {
                const factored = nerdamer(`factor(${standardForm})`).toString();
                return nerdamer(`solve(${factored},${variable})`).toString();
            }
        ];

        let lastError;
        for (const attempt of attempts) {
            try {
                const normalized = normalizeSolutions(attempt(), variable);
                if (normalized.length) { return normalized; }
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Unable to solve equation.');
    }

    function integrateExpressionSymbolically(expression, variable) {
        const specialIntegral = getSpecialTrigRootIntegral(expression, variable);
        if (specialIntegral) {
            return specialIntegral;
        }

        if (isNonElementaryTrigRootIntegral(expression)) {
            throw new Error('This trigonometric square-root integral usually does not have a simple elementary antiderivative.');
        }

        const attempts = [
            () => simplifyExpression(nerdamer(`integrate(${expression},${variable})`).toString()),
            () => {
                const rewritten = rewriteSqrtAsPowers(expression);
                return simplifyExpression(nerdamer(`integrate(${rewritten},${variable})`).toString());
            },
            () => {
                const rewritten = rewriteSqrtAsPowers(expression);
                const expanded = nerdamer(`expand(${rewritten})`).toString();
                return simplifyExpression(nerdamer(`integrate(${expanded},${variable})`).toString());
            }
        ];

        let lastError;

        for (const attempt of attempts) {
            try {
                const result = attempt();
                if (result && !String(result).toLowerCase().includes('integrate(')) {
                    return result;
                }
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Unable to integrate expression.');
    }

    function classifyExpression(expression) {
        const labels = [];
        if (/[a-z]\^\d+/i.test(expression)) labels.push('polynomial');
        if (/(sin|cos|tan|sec|csc|cot)/i.test(expression)) labels.push('trigonometric');
        if (/(log|ln)/i.test(expression)) labels.push('logarithmic');
        if (/e\^|exp/i.test(expression)) labels.push('exponential');
        if (expression.includes('/')) labels.push('rational');
        return labels.length ? labels : ['symbolic'];
    }

    function simplifyExpression(expression) {
        const strExp = String(expression);
        if (strExp.includes('NaN') || strExp.includes('Infinity')) {
            throw new Error('Expression evaluated to NaN or Infinity.');
        }
        return nerdamer(expression).toString();
    }

    function rewriteSqrtAsPowers(expression) {
        let rewritten = expression;

        for (let guard = 0; guard < 10 && rewritten.includes('sqrt('); guard += 1) {
            const next = rewritten.replace(/sqrt\(([^()]+)\)/g, '(($1)^(1/2))');
            if (next === rewritten) {
                break;
            }
            rewritten = next;
        }

        return rewritten;
    }

    function getSpecialTrigRootIntegral(expression, variable) {
        const targets = [{
                forms: [`sqrt(cos(${variable}))`, `(cos(${variable}))^(1/2)`],
                result: `2*EllipticE(${variable}/2 | 2)`
            },
            {
                forms: [`sqrt(sin(${variable}))`, `(sin(${variable}))^(1/2)`],
                result: `-2*EllipticE(pi/4-${variable}/2 | 2)`
            }
        ];

        for (const target of targets) {
            for (const form of target.forms) {
                if (expression === form) {
                    return target.result;
                }

                if (expression.endsWith(`*${form}`)) {
                    const coefficient = expression.slice(0, -(`*${form}`).length);
                    if (coefficient && !containsVariable(coefficient, variable) && isParsableMath(coefficient)) {
                        return `(${coefficient})*(${target.result})`;
                    }
                }

                if (expression.startsWith(`${form}*`)) {
                    const coefficient = expression.slice((`${form}*`).length);
                    if (coefficient && !containsVariable(coefficient, variable) && isParsableMath(coefficient)) {
                        return `(${coefficient})*(${target.result})`;
                    }
                }
            }
        }

        return '';
    }

    function isNonElementaryTrigRootIntegral(expression) {
        const compact = expression.replace(/\s+/g, '').toLowerCase();
        return /sqrt\((sin|cos|tan|sec|csc|cot)\([^)]+\)\)/.test(compact) ||
            /\(((sin|cos|tan|sec|csc|cot)\([^)]+\))\)\^\(1\/2\)/.test(compact) ||
            /\(((sin|cos|tan|sec|csc|cot)\([^)]+\))\)\^0?\.5/.test(compact);
    }

    function buildSpecialFunctionNote(expression) {
        if (!String(expression).includes('EllipticE(')) {
            return '';
        }

        return 'This antiderivative is written using the elliptic integral E because the result is not elementary.';
    }

    function splitTopLevel(value) {
        const parts = [];
        let current = '';
        let depth = 0;

        for (let index = 0; index < value.length; index += 1) {
            const char = value[index];
            if ('([{'.includes(char)) depth += 1;
            if (')]}'.includes(char)) depth -= 1;
            if (char === ',' && depth === 0) {
                if (current.trim()) parts.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) parts.push(current.trim());
        return parts;
    }

    function hasBalancedGrouping(expression) {
        const pairs = { ')': '(', ']': '[', '}': '{' };
        const openings = Object.values(pairs);
        const stack = [];

        for (const char of expression) {
            if (openings.includes(char)) stack.push(char);
            else if (pairs[char]) {
                if (stack.pop() !== pairs[char]) return false;
            }
        }
        return stack.length === 0;
    }

    function assertValidMathInput(expression) {
        if (!expression || !hasBalancedGrouping(expression)) {
            throw new Error('Invalid grouping in expression.');
        }
        const cleaned = expression.replace(/[0-9a-zA-Z+\-*/^=().,[\]{} ]/g, '');
        if (cleaned.length > 0) {
            throw new Error('Unsupported characters found in expression.');
        }
    }

    function countDistinctVariables(expression) {
        const cleaned = stripFunctions(expression);
        const matches = cleaned.match(/[a-zA-Z]/g) || [];
        return new Set(matches.map((char) => char.toLowerCase())).size;
    }

    function isParsableMath(expression) {
        try { simplifyExpression(normalizeMathInput(expression)); return true; } catch (e) { return false; }
    }

    function isValidProbability(value) {
        return value >= 0 && value <= 1;
    }

    function hasInternalDivergence(expression, variable, lowerBound, upperBound) {
        try {
            const l = Number(nerdamer(lowerBound).evaluate().toString());
            const u = Number(nerdamer(upperBound).evaluate().toString());
            if (Number.isNaN(l) || Number.isNaN(u)) return false;

            const STEPS = 1000;
            const dx = (u - l) / STEPS;
            const f = nerdamer(expression).buildFunction([variable]);

            let hasLargeValue = false;
            let lastSign = null;
            let flippedSignLarge = false;

            for (let i = 0; i <= STEPS; i += 1) {
                const x = l + i * dx;
                const val = f(x);
                if (Number.isNaN(val) || !Number.isFinite(val)) {
                    return true;
                }
                if (Math.abs(val) > 1000) {
                    hasLargeValue = true;
                    const currentSign = Math.sign(val);
                    if (lastSign !== null && currentSign !== lastSign && Math.abs(val - f(x - dx)) > 1000) {
                        flippedSignLarge = true;
                    }
                    lastSign = currentSign;
                } else {
                    lastSign = Math.sign(val);
                }
            }
            return hasLargeValue && (flippedSignLarge || Math.max(Math.abs(f(l)), Math.abs(f(u))) < 100);
        } catch (e) {
            return false;
        }
    }

    function toApproximation(expression) {
        try {
            const approximated = nerdamer(`decimal(${expression})`).toString();
            return approximated && approximated !== expression ? approximated : '';
        } catch (e) { return ''; }
    }

    function buildApproximationNote(solutions) {
        const approximations = solutions.map(toApproximation).filter(Boolean);
        return approximations.length ? `Approximate numeric values: ${approximations.join(', ')}.` : '';
    }

    function buildSingleApproximationNote(expression) {
        const approximation = toApproximation(expression);
        return approximation ? `Approximate decimal form: ${approximation}.` : '';
    }

    function filterSteps(steps) { return steps.filter(Boolean); }

    function formatNumber(value) {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) return value.toString();
        return parseFloat(numeric.toFixed(6)).toString();
    }

    function formatExpression(expression) { return expression.toString(); }

    function formatInline(value) { return `"${formatExpression(value)}"`; }

    function ordinal(number) {
        const mod10 = number % 10;
        const mod100 = number % 100;
        if (mod10 === 1 && mod100 !== 11) return `${number}st`;
        if (mod10 === 2 && mod100 !== 12) return `${number}nd`;
        if (mod10 === 3 && mod100 !== 13) return `${number}rd`;
        return `${number}th`;
    }

    function formatDateTime(value) {
        if (!value) return 'Saved recently';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    }

    function capitalize(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
});
