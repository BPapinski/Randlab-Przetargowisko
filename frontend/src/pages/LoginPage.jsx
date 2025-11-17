import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import "./styles/indexStyles.css";
import styles from "./styles/LoginPage.module.css";
import { useAuth } from "../utils/AuthContext";



export default function LoginPage() {
    const navigate = useNavigate();
    const { performLogin, isLoggedIn } = useAuth();

    const [email, setEmail] = useState("admin");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/"); // lub inna strona główna aplikacji
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await performLogin(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.loginFormCard}>
                    <h1 className={styles.mainTitle}>Logowanie</h1>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <div className={styles.formGroup}>
                            <label>Nazwa użytkownika, numer telefonu lub email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Wpisz nazwę użytkownika, numer telefonu lub email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Hasło</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Wpisz hasło"
                            />
                        </div>

                        <button type="submit" className={styles.loginButton}>
                            Zaloguj się
                        </button>
                    </form>
                    <div className={styles.resetLinkContainer}>
                        <Link to="/reset-password-request" className={styles.resetPasswordLink}>
                            Nie pamiętasz hasła?
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}