/**
 * API Configuration
 * ใช้สำหรับเก็บ API base URL และ configuration อื่นๆ
 */

// ตรวจสอบว่าเป็น production หรือ development
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.startsWith('192.168.');

// API Base URL
const API_BASE_URL = isProduction 
    ? 'https://63-back-production.up.railway.app'  // Production (Railway)
    : 'http://localhost:3002';  // Development (Local)

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        SIGNIN: `${API_BASE_URL}/api/auth/signin`,
        SIGNUP: `${API_BASE_URL}/api/auth/signup`,
        PROFILE: `${API_BASE_URL}/api/auth/profile`,
        ME: `${API_BASE_URL}/api/auth/me`,
        USER: `${API_BASE_URL}/api/auth/user`
    },
    // Users
    USERS: {
        PROFILE: `${API_BASE_URL}/api/users/profile`
    },
    // Data
    DATA: {
        BMI_RECORDS: `${API_BASE_URL}/api/data/bmi_records`,
        CALORIE_LOGS: `${API_BASE_URL}/api/data/calorie_logs`,
        DAILY_LOGS: `${API_BASE_URL}/api/data/daily_logs`
    },
    // Cart
    CART: {
        SAVE: `${API_BASE_URL}/api/cart/save`,
        HISTORY: `${API_BASE_URL}/api/cart/history`,
        DELETE: (id) => `${API_BASE_URL}/api/cart/${id}`
    },
    // Recipes (Backend Proxy)
    RECIPES: {
        SEARCH: `${API_BASE_URL}/api/recipes/search`,
        NUTRITION: (id) => `${API_BASE_URL}/api/recipes/${id}/nutrition`,
        INFORMATION: (id) => `${API_BASE_URL}/api/recipes/${id}/information`
    },
    // OpenFoodFacts (Backend Proxy)
    OPENFOODFACTS: {
        SEARCH: `${API_BASE_URL}/api/openfoodfacts/search`,
        PRODUCT: (barcode) => `${API_BASE_URL}/api/openfoodfacts/product/${barcode}`
    },
    // Barcode (Backend Proxy)
    BARCODE: {
        SCAN: `${API_BASE_URL}/api/barcode/scan`
    }
};

// Export สำหรับใช้ในไฟล์อื่น
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL, API_ENDPOINTS, isProduction };
}

