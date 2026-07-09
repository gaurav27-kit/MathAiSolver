(function () {
    // ── Backend URL ───────────────────────────────────────────────────────────
    // Local dev → http://localhost:5000
    // Production (Vercel) → your Render backend URL
    const RENDER_URL = 'https://mathaisolver-backend-1.onrender.com';
    const LOCAL_URL  = 'http://localhost:5000';

    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    const baseUrl = isLocal ? LOCAL_URL : RENDER_URL;

    // Expose for all scripts
    window.API_BASE     = baseUrl;
    window.APP_BASE     = '';          // same-origin for app pages (relative links)
    window.BACKEND_API  = baseUrl;     // used by login/register/auth/google-auth
    window.BACKEND_LABEL = baseUrl;

    window.buildApiUrl = (path) => `${baseUrl}${path}`;
    window.buildAppUrl = (path) => path; // relative — works on both Vercel and local

    // No longer needed but kept to avoid errors in any old code that calls it
    window.ensureBackendPage = () => false;

    window.IS_BACKEND_ORIGIN = false;
    window.getBackendLabel   = () => baseUrl;
})();
