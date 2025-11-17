import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from './config';
import { INNOWISE_API_BASE_URL } from './config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error("Nie udało się sprawdzić tokenu", e);
        }
        setIsLoading(false);
    }, []);



    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setIsLoggedIn(true);
    };

    const performLogin = async (email, password) => {
        try {
            const formBody = new URLSearchParams({
                username: email, 
                password: password,
            }).toString();

            const response = await fetch(`${INNOWISE_API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
            });

            if (!response.ok) {
                let errorData = { detail: "Unknown login error." };
                
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error("Error: Server returned a non-JSON error body.", response.status);
                }
                
                throw new Error(errorData.detail || `Server Error: Status ${response.status}`);
            }

            const data = await response.json();
            login(data.access_token, data.refresh_token);

        } catch (err) {
            console.error("Error during login:", err); 
            
            throw err; 
        }
    };


    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
            try {
                await fetch(`${API_BASE_URL}/api/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
            } catch (error) {
                console.error('Logout failed on the server:', error);
            }
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoading, performLogin}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};