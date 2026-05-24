/**
 * Safely parse JSON from a fetch response
 * Handles empty responses and non-JSON content types
 */
async function safeJsonParse(response) {
    const contentType = response.headers.get('content-type');
    
    // Check if response has JSON content type
    if (!contentType || !contentType.includes('application/json')) {
        return {};
    }
    
    // Get response text first
    const text = await response.text();
    
    // If empty, return empty object
    if (!text || text.trim() === '') {
        return {};
    }
    
    // Try to parse JSON
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('JSON parse error:', error);
        return {};
    }
}

/**
 * Make a fetch request with safe JSON parsing
 */
async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options
    });
    
    const data = await safeJsonParse(response);
    
    return { response, data };
}

/**
 * Build a JSON POST request configuration
 */
function buildJsonRequest(body, method = 'POST') {
    return {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}

// Export for use in other files
window.safeJsonParse = safeJsonParse;
window.fetchJson = fetchJson;
window.buildJsonRequest = buildJsonRequest;
