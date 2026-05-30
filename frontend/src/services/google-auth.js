/**
 * src/services/google-auth.js
 * Handles Google OAuth session state on the frontend.
 * Checks /auth/user on every page load to see if the user is logged in.
 */

const BACKEND = window.API_BASE || 'https://math-ai-solver.onrender.com';

/**
 * Fetch the currently logged-in Google user from the backend.
 * Returns { loggedIn, user } or { loggedIn: false, user: null }
 */
async function getGoogleUser() {
    try {
        const res = await fetch(`${BACKEND}/auth/user`, {
            credentials: 'include',
        });
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return { loggedIn: false, user: null };
        const text = await res.text();
        return text ? JSON.parse(text) : { loggedIn: false, user: null };
    } catch (err) {
        console.error('[google-auth] Could not reach backend:', err.message);
        return { loggedIn: false, user: null };
    }
}

/**
 * Redirect the browser to the Google OAuth flow.
 */
function loginWithGoogle() {
    window.location.href = `${BACKEND}/auth/google`;
}

/**
 * Log out by hitting the backend logout route.
 * Backend destroys the session and redirects to login.html
 */
function logoutGoogle() {
    window.location.href = `${BACKEND}/auth/logout`;
}

window.GoogleAuth = { getGoogleUser, loginWithGoogle, logoutGoogle, BACKEND };
