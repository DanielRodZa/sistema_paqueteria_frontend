import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const apiClient = axios.create({
    baseURL: API_URL,
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
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const authTokensString = localStorage.getItem('authTokens');

        if (authTokensString) {
            const authTokens = JSON.parse(authTokensString);
            if (authTokens.refresh) {
                try {
                    const response = await axios.post(`${API_URL}token/refresh/`, {
                        refresh: authTokens.refresh
                    });

                    if (response.status === 200) {
                        // Update tokens in localStorage
                        authTokens.access = response.data.access;
                        localStorage.setItem('authTokens', JSON.stringify(authTokens));

                        // Update header for the original request
                        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // Logout user if refresh fails
                    localStorage.removeItem('authTokens');
                    localStorage.removeItem('userData');
                    window.location.href = '/'; // Redirect to login
                }
            }
        }

        // No refresh token available or refresh failed
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
        window.location.href = '/';
    }
    return Promise.reject(error);
});

export default apiClient;