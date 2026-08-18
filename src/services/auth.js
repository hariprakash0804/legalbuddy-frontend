import axios from 'axios';

// Sanitize and resolve base API URL
export const getApiUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return raw.replace(/\/+$/, '');
};

const getAuthUrl = () => `${getApiUrl()}/auth`;

/**
 * Checks whether a given JWT token is structurally valid and not expired.
 */
export const isTokenExpired = (token) => {
    if (!token || typeof token !== 'string') return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false; // Not a standard JWT; assume server will validate
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload && payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        }
        return false;
    } catch {
        return false;
    }
};

/**
 * Safely retrieve valid token from storage.
 */
export const getStoredToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        if (isTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            return null;
        }
        return token;
    } catch {
        return null;
    }
};

export const login = async (email, password) => {
    const sanitizedEmail = String(email || '').trim().toLowerCase();
    const response = await axios.post(`${getAuthUrl()}/login`, { 
        email: sanitizedEmail, 
        password 
    });
    
    if (response.data?.access_token) {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('userEmail', sanitizedEmail);
            } catch (e) {
                console.warn('Unable to persist session to localStorage', e);
            }
        }
    }
    return response.data;
};

export const signup = async (email, password) => {
    const sanitizedEmail = String(email || '').trim().toLowerCase();
    return await axios.post(`${getAuthUrl()}/signup`, { 
        email: sanitizedEmail, 
        password 
    });
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
        } catch { }
        window.location.href = '/chat';
    }
};

export const authHeader = () => {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

