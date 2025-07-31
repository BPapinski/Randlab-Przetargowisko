import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/'); 
    }

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
                <button className={styles['header-nav-button']}>
                    <FontAwesomeIcon icon={faGavel} />
                    <span>Przetargi</span>
                </button>
                <button className={styles['header-nav-button']}>
                    <FontAwesomeIcon icon={faFileAlt} />
                    <span>Moje zgłoszenia</span>
                </button>
                <button className={styles['header-nav-button']}>
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