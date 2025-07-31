import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./styles/indexStyles.css"; // bazowe style
import styles from "./styles/LoginPage.module.css"; // style specyficzne dla strony logowania


export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Nieprawidłowy email lub hasło");

            const data = await response.json();
            console.log("Zalogowano:", data);

            navigate("/");
        } catch (err) {
            setError(err.message);
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