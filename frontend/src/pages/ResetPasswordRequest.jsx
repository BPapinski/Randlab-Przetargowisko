import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import "./styles/indexStyles.css";
import styles from "./styles/ResetPasswordRequest.module.css";
import { useAuth } from "../utils/AuthContext";

const simulateApiRequest = (email) => {
    console.log(`Sending reset request for: ${email}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
};

export default function ResetPasswordRequest() {
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
            await simulateApiRequest(email);
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