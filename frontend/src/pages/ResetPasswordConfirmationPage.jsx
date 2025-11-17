import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Header from "../components/Header";
import styles from "./styles/ResetPasswordConfirmation.module.css";
import { INNOWISE_API_BASE_URL } from "../utils/config";

export default function ResetPasswordConfirmationPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const user_id = params.get("user_id");
    const token = params.get("token");

    const [validKey, setValidKey] = useState(null);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const validateResetKey = async () => {
        if (!user_id || !token) return false;

        try {
            const response = await fetch(
                `${INNOWISE_API_BASE_URL}/reset/password-reset/validate?user_id=${user_id}&token=${token}`
            );
            if (!response.ok) return false;
            await response.json();
            return true;
        } catch (err) {
            console.error("Token validation error:", err);
            return false;
        }
    };

    const confirmPasswordReset = async (key, password) => {
        const response = await fetch(
            `${INNOWISE_API_BASE_URL}/reset/password-reset/password-reset-confirm/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, new_password: password }),
            }
        );

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch {}
            throw new Error(errorData.detail || "Błąd podczas zmiany hasła.");
        }
    };

    useEffect(() => {
        const verifyKey = async () => {
            setLoading(true);
            const isValid = await validateResetKey();
            setValidKey(isValid);
            setLoading(false);
        };
        verifyKey();
    }, [user_id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== password2) {
            setError("Hasła nie są takie same.");
            return;
        }

        try {
            setLoading(true);
            await confirmPasswordReset(token, password);
            setSuccess("Hasło zmienione pomyślnie. Możesz się zalogować.");
            setPassword("");
            setPassword2("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <h1 className={styles.mainTitle}>Ustaw nowe hasło</h1>

                    {loading && <p>Ładowanie...</p>}

                    {validKey === false || !user_id || !token ? (
                        <div className={styles.errorMessage}>
                            Klucz resetu jest nieprawidłowy lub wygasł.
                        </div>
                    ) : null}

                    {validKey && !success && (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label>Nowe hasło</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Powtórz hasło</label>
                                <input
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    required
                                />
                            </div>

                            <button disabled={loading} className={styles.submitButton}>
                                {loading ? "Przetwarzanie..." : "Zmień hasło"}
                            </button>
                        </form>
                    )}

                    {success && (
                        <div className={styles.successMessage}>{success}</div>
                    )}

                    <div className={styles.navigationLinkContainer}>
                        <Link className={styles.navigationLink} to="/login">
                            Wróć do logowania
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
