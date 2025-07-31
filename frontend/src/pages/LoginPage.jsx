import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Header from "../components/Header";
import "./styles/indexStyles.css";
import styles from "./styles/LoginPage.module.css";
import { API_BASE_URL } from '../utils/config';
import { useAuth } from "../utils/AuthContext";


export default function LoginPage() {
    const navigate = useNavigate();
    const { performLogin } = useAuth(); 

    const [email, setEmail] = useState("admin@email.com");
    const [password, setPassword] = useState("admin");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
                            <label htmlFor="email">Adres email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
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
                            />
                        </div>

                        <button type="submit" className={styles.loginButton}>
                            Zaloguj się
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}