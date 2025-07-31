import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from './config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            setIsLoggedIn(true);
        }
    }, []);


        
    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setIsLoggedIn(true);
    };

    const performLogin = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Nieprawidłowy email lub hasło.");
            }

            const data = await response.json();
            login(data.access, data.refresh);
        } catch (err) {
            throw err; 
        }
    };


    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
            try {
                // Wysłanie tokenu do serwera w celu unieważnienia
                await fetch(`${API_BASE_URL}/api/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
            } catch (error) {
                // Nawet jeśli serwer zwróci błąd, nadal chcemy wylogować użytkownika
                console.error('Logout failed on the server:', error);
            }
        }

        // Czyszczenie tokenów po stronie klienta
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, performLogin, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};