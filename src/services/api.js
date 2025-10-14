import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const authTokens = localStorage.getItem('authTokens');
    if (authTokens) {
        const token = JSON.parse(authTokens).access;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error=> {
    return Promise.reject(error);
});

export default apiClient;