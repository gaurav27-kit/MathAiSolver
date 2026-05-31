document.addEventListener('DOMContentLoaded', () => {
    const API = window.API_BASE || 'https://mathaisolver-backend-1.onrender.com';

    let authMode = 'login';

    const showLoginBtn   = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const authSubmitBtn  = document.getElementById('authSubmitBtn');
    const authNameInput  = document.getElementById('authName');
    const nameGroup      = document.getElementById('nameGroup');
    const authEmailInput = document.getElementById('authEmail');
    const authPasswordInput = document.getElementById('authPassword');
    const authMessage    = document.getElementById('authMessage');
    const accountTitle   = document.getElementById('accountTitle');

    showLoginBtn.addEventListener('click', () => setAuthMode('login'));
    showRegisterBtn.addEventListener('click', () => setAuthMode('register'));
    authSubmitBtn.addEventListener('click', handleAuthSubmit);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) handleAuthSubmit();
    });

    setAuthMode('login');

    function setAuthMode(mode) {
        authMode = mode;
        const isLogin = mode === 'login';
        showLoginBtn.classList.toggle('active', isLogin);
        showRegisterBtn.classList.toggle('active', !isLogin);
        authSubmitBtn.textContent = isLogin ? 'Login' : 'Create Account';
        if (accountTitle) accountTitle.textContent = isLogin ? 'Sign in to save progress' : 'Create an account';
        nameGroup.classList.toggle('is-hidden', isLogin);
        authMessage.textContent = '';
        authMessage.style.color = '';
    }

    async function handleAuthSubmit() {
        authMessage.textContent = '';
        authMessage.style.color = '';

        const payload = {
            fullName: authNameInput.value.trim(),
            email:    authEmailInput.value.trim(),
            password: authPasswordInput.value.trim()
        };

        if (authMode === 'register' && !payload.fullName) {
            authMessage.textContent = 'Please enter your full name.';
            return;
        }
        if (!payload.email || !payload.password) {
            authMessage.textContent = 'Please enter your email and password.';
            return;
        }

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.style.opacity = '0.7';

            const url = authMode === 'login'
                ? `${API}/api/auth/login`
                : `${API}/api/auth/register`;

            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data = {};
            const ct = response.headers.get('content-type');
            if (ct && ct.includes('application/json')) {
                const text = await response.text();
                if (text) data = JSON.parse(text);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed.');
            }

            authMessage.style.color = '#156753';
            authMessage.textContent = authMode === 'login'
                ? 'Login successful. Redirecting...'
                : 'Account created successfully. Redirecting...';

            setTimeout(() => {
                window.location.href = 'solver.html';
            }, 800);

        } catch (error) {
            authMessage.style.color = 'var(--error-color)';
            const msg = String(error?.message || '');
            authMessage.textContent = msg === 'Failed to fetch'
                ? `Cannot reach backend at ${API}. Make sure it is running.`
                : msg || 'Authentication failed.';
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.style.opacity = '1';
        }
    }
});
