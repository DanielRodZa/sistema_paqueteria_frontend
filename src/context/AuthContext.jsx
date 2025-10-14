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
    const [user, setUser] = useState(() =>
        localStorage.getItem('authTokens')
            ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
            : null
    );

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/token/', { username, password });
            const data = response.data;
            setTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            // Return true or the user data on success
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            // Clear any stale data on failure
            logout();
            // Propagate the error or return false so the UI can react
            throw error;
        }
    };

    const logout = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
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