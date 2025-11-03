import { API_BASE_URL, INNOWISE_API_BASE_URL } from './config';

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        throw new Error("Brak tokenu odświeżania.");
    }

    try {
        const bodyPayload = { 
            refresh_token: refreshToken, 
        };
        
        const response = await fetch(`${INNOWISE_API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                // POPRAWKA: Ten endpoint oczekuje JSON
                'Content-Type': 'application/json',
            },
            // POPRAWKA: Wyślij JSON
            body: JSON.stringify(bodyPayload),
        });

        if (!response.ok) {
            throw new Error("Token odświeżania jest nieważny.");
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data.access_token;
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return null;
    }
};

// function used to make authorized fetch requests
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