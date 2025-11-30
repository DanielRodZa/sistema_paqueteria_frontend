import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "../services/api.js";
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage to stay logged in on refresh
    const [tokens, setTokens] = useState(() =>
        localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null
    );

    // Initialize user from userData (preferred) or fallback to decoding token
    const [user, setUser] = useState(() => {
        if (localStorage.getItem('userData')) {
            return JSON.parse(localStorage.getItem('userData'));
        }
        if (localStorage.getItem('authTokens')) {
            try {
                return jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access);
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/token/', { username, password });
            const data = response.data;
            console.log("LOGIN RESPONSE DATA:", data); // DEBUG LOG
            setTokens(data);

            // Construct user object from response data + decoded token
            // This ensures we have the role even if decoding fails or token is weird
            let decoded = {};
            try {
                decoded = jwtDecode(data.access);
            } catch (e) {
                console.error("Token decode failed", e);
            }

            const userData = {
                ...decoded,
                username: data.username, // Explicitly from response
                role: data.role          // Explicitly from response
            };

            setUser(userData);
            localStorage.setItem('authTokens', JSON.stringify(data));
            localStorage.setItem('userData', JSON.stringify(userData));

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            logout();
            throw error;
        }
    };

    const logout = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
    };

    const contextData = {
        user,
        tokens,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);