(function() {
    // 1. Enter your Render backend URL here once you deploy it:
    const RENDER_BACKEND_URL = 'https://math-ai-solver.onrender.com';

    const baseUrl = RENDER_BACKEND_URL;
    const appBase = RENDER_BACKEND_URL;

    window.API_BASE = baseUrl;
    window.APP_BASE = appBase;
    window.IS_BACKEND_ORIGIN = false; // We are hosting frontend and backend separately now
    window.BACKEND_LABEL = window.API_BASE || window.location.origin;
    window.buildApiUrl = function buildApiUrl(path) {
        return `${window.API_BASE}${path}`;
    };
    window.buildAppUrl = function buildAppUrl(path) {
        return `${window.APP_BASE}${path}`;
    };
    window.ensureBackendPage = function ensureBackendPage(path) {
        if (window.IS_BACKEND_ORIGIN) {
            return false;
        }

        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const target = window.buildAppUrl(normalizedPath);

        if (window.location.href !== target) {
            window.location.replace(target);
            return true;
        }

        return false;
    };
    window.getBackendLabel = function getBackendLabel() {
        return window.BACKEND_LABEL;
    };
})();