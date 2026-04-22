import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/auth';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.access_token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userEmail', email);
        }
    }
    return response.data;
};

export const signup = async (email, password) => {
    return await axios.post(`${API_URL}/signup`, { email, password });
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '/chat'; 
    }
};

export const authHeader = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
};

// Export the base API URL for use in other components
export const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
