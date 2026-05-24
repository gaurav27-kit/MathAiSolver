(function () {
    const explicitBase = window.localStorage.getItem('mathai_api_base');
    const isLocalFile = window.location.protocol === 'file:';
    const isLiveServer = window.location.port === '5173' || window.location.port === '5500';
    const isBackendOrigin = !isLocalFile && !isLiveServer;

    const fallbackBase = 'http://localhost:8080';
    const baseUrl = explicitBase || (isLocalFile || isLiveServer ? fallbackBase : '');
    const appBase = explicitBase || (isLiveServer ? fallbackBase : '');

    window.API_BASE = baseUrl;
    window.APP_BASE = appBase;
    window.IS_BACKEND_ORIGIN = isBackendOrigin;
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
