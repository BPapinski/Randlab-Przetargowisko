import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_BASE_URL } from '../utils/config';
import {
    faSearch,
    faGavel,
    faFileAlt,
    faCog,
    faSignOutAlt,
    faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import RandlabLogo from '../icons/randlab-logo.png';
import { useNavigate } from 'react-router-dom';
import styles from '../pages/styles/Header.module.css';
import { useAuth } from '../utils/AuthContext';


export default function Header({ searchTerm, onSearchChange }) {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();



    const handleLogin = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
    }

    const goToTenders = () => {
        navigate('/');
    };

    const goToTendersForm = () => {
        navigate('/tenders/new');
    };

    const handleSettingsClick = () => {
        window.location.href = `${API_BASE_URL}/admin/`;
    };

    return (
        <header className={styles['main-header']}>
            <div className={styles['header-left']} onClick={handleLogoClick}>
                <img src={RandlabLogo} alt="Randlab Logo" className={styles.logo} />
            </div>

            <div className={styles['header-center']}>
                <div className={styles['search-bar-wrapper']}>
                    <FontAwesomeIcon icon={faSearch} className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Szukaj przetargów..."
                        className={styles['search-input']}
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
            </div>

            <div className={styles['header-right']}>
                <button
                    className={styles['header-nav-button']}
                    onClick={goToTenders}
                >
                    <FontAwesomeIcon icon={faGavel} />
                    <span>Przetargi</span>
                </button>
                <button
                    className={styles['header-nav-button']}
                    onClick={goToTendersForm}
                >
                    <FontAwesomeIcon icon={faFileAlt} />
                    <span>Dodaj przetarg</span>
                </button>
                <button className={styles['header-nav-button']}
                    onClick={handleSettingsClick}>
                    <FontAwesomeIcon icon={faCog} />
                    <span>Ustawienia</span>
                </button>

                {isLoggedIn ? (
                    <button
                        className={`${styles['header-nav-button']} ${styles['auth-button']} ${styles['logout-button']}`}
                        onClick={handleLogout}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Wyloguj</span>
                    </button>
                ) : (
                    <button
                        className={`${styles['header-nav-button']} ${styles['auth-button']} ${styles['login-button']}`}
                        onClick={handleLogin}
                    >
                        <FontAwesomeIcon icon={faSignInAlt} />
                        <span>Zaloguj</span>
                    </button>
                )}
            </div>
        </header>
    );
}