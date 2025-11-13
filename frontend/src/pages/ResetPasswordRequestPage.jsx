import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import "./styles/indexStyles.css";
import styles from "./styles/ResetPasswordRequest.module.css";
import { useAuth } from "../utils/AuthContext";
import { INNOWISE_API_BASE_URL } from "../utils/config";

const requestPasswordReset = async (email) => {
    try {
        const formBody = new URLSearchParams({
            email: email, 
        }).toString();

        const response = await fetch(`${INNOWISE_API_BASE_URL}/reset/password-reset/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            let errorData = { detail: "Unknown reset password error." };
            
            try {
                errorData = await response.json();
            } catch (e) {
                console.error("Error: Server returned a non-JSON error body.", response.status);
            }
            
            throw new Error(errorData.detail || `Server Error: Status ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (err) {
        console.error("Error during reset password request:", err); 
        
        throw err; 
    }
};

export default function ResetPasswordRequestPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            await requestPasswordReset(email);
            setSuccessMessage(
                "Jeśli konto powiązane z tym adresem e-mail istnieje, instrukcje resetowania hasła zostały wysłane."
            );
            setEmail("");

        } catch (err) {
            setError("Wystąpił błąd podczas wysyłania prośby. Spróbuj ponownie później.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <h1 className={styles.mainTitle}>Resetowanie hasła</h1>
                    <p className={styles.subtitle}>
                        Podaj adres e-mail powiązany z Twoim kontem, a wyślemy Ci link do zresetowania hasła.
                    </p>

                    {!successMessage && (
                        <form onSubmit={handleSubmit} className={styles.requestForm}>
                            {error && <div className={styles.errorMessage}>{error}</div>}
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Adres e-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="jan.kowalski@example.com"
                                />
                            </div>

                            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                {isLoading ? "Wysyłanie..." : "Wyślij link"}
                            </button>
                        </form>
                    )}

                    {successMessage && (
                        <div className={styles.successMessage}>
                            {successMessage}
                        </div>
                    )}

                    <div className={styles.navigationLinkContainer}>
                        <Link to="/login" className={styles.navigationLink}>
                            Wróć do logowania
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}