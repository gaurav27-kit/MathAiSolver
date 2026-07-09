/**
 * src/services/google-auth.js
 * Google OAuth session management.
 * Uses window.BACKEND_API set by api-base.js.
 */

async function getGoogleUser() {
    const API = window.BACKEND_API || 'http://localhost:5000';
    try {
        const res = await fetch(`${API}/auth/user`, { credentials: 'include' });
        const ct  = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return { loggedIn: false, user: null };
        const text = await res.text();
        return text ? JSON.parse(text) : { loggedIn: false, user: null };
    } catch (err) {
        console.warn('[google-auth] Backend not reachable:', err.message);
        return { loggedIn: false, user: null };
    }
}

function loginWithGoogle() {
    const API = window.BACKEND_API || 'http://localhost:5000';
    window.location.href = `${API}/auth/google`;
}

function logoutGoogle() {
    const API = window.BACKEND_API || 'http://localhost:5000';
    window.location.href = `${API}/auth/logout`;
}

window.GoogleAuth = { getGoogleUser, loginWithGoogle, logoutGoogle };
