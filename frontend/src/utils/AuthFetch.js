import { API_BASE_URL } from './config';

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        throw new Error("Brak tokenu odświeżania.");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Token odświeżania jest nieważny.");
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return null;
    }
};

// Centralna funkcja do wysyłania zapytań z obsługą autoryzacji
export const AuthFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token');

    if (accessToken) {
        console.log("Using access token:", accessToken);
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        };
    }
    else{
        console.warn("No access token found, proceeding without authorization.");
    }

    let response = await fetch(`${API_BASE_URL}${url}`, options);

    if (response.status === 401 && accessToken) {
        console.warn("Access token expired, attempting to refresh...");
        try {
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
                options.headers.Authorization = `Bearer ${newAccessToken}`;
                response = await fetch(`${API_BASE_URL}${url}`, options);
            }
        } catch (error) {
            return response;
        }
    }

    return response;
};