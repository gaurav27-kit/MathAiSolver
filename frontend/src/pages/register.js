document.addEventListener('DOMContentLoaded', () => {
    const API = window.API_BASE || 'https://math-ai-solver.onrender.com';

    const registerForm = document.getElementById('registerForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authNameInput = document.getElementById('authName');
    const authEmailInput = document.getElementById('authEmail');
    const authPasswordInput = document.getElementById('authPassword');
    const authMessage = document.getElementById('authMessage');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        authMessage.textContent = '';
        authMessage.style.color = '';

        const payload = {
            fullName: authNameInput.value.trim(),
            email:    authEmailInput.value.trim(),
            password: authPasswordInput.value.trim()
        };

        if (!payload.fullName || !payload.email || !payload.password) {
            authMessage.textContent = 'Please fill out all fields.';
            return;
        }
        if (payload.fullName.length < 2) {
            authMessage.textContent = 'Full name must be at least 2 characters.';
            authMessage.style.color = 'var(--error-color, #ef4444)';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
            authMessage.textContent = 'Please enter a valid email address.';
            authMessage.style.color = 'var(--error-color, #ef4444)';
            return;
        }
        if (payload.password.length < 6) {
            authMessage.textContent = 'Password must be at least 6 characters.';
            authMessage.style.color = 'var(--error-color, #ef4444)';
            return;
        }

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.style.opacity = '0.7';

            const response = await fetch(`${API}/api/auth/register`, {
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
                throw new Error(data.message || `Registration failed (${response.status})`);
            }

            authMessage.style.color = '#10b981';
            authMessage.textContent = 'Account created successfully. Redirecting...';

            setTimeout(() => {
                window.location.href = 'solver.html';
            }, 800);

        } catch (error) {
            authMessage.style.color = 'var(--error-color, #ef4444)';
            const msg = String(error?.message || '');
            authMessage.textContent = msg === 'Failed to fetch'
                ? `Cannot reach backend at ${API}. Make sure it is running.`
                : msg || 'Registration failed.';
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.style.opacity = '1';
        }
    });
});
