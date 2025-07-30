// src/components/Header.js (lub src/Header.js)

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faGavel, faFileAlt, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import RandlabLogo from '../icons/randlab-logo.png'; // Upewnij się, że ścieżka do logo jest poprawna względem Header.js
import HeaderStyles from '../pages/styles/HeaderStyles.css'; // Import stylów dla nagłówka

/**
 * Komponent Header wyświetlający nagłówek strony z logo, paskiem wyszukiwania i przyciskami nawigacyjnymi.
 *
 * @param {object} props - Właściwości komponentu.
 * @param {string} props.searchTerm - Bieżąca wartość terminu wyszukiwania.
 * @param {function} props.onSearchChange - Funkcja do obsługi zmian w polu wyszukiwania.
 */
export default function Header({ searchTerm, onSearchChange }) {
  return (
    <header className="main-header">
      <div className="header-left">
        <img src={RandlabLogo} alt="Randlab Logo" className="logo" />
      </div>

      <div className="header-center">
        <div className="search-bar-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Szukaj przetargów..."
            className="search-input"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-nav-button">
          <FontAwesomeIcon icon={faGavel} />
          <span>Przetargi</span>
        </button>
        <button className="header-nav-button">
          <FontAwesomeIcon icon={faFileAlt} />
          <span>Moje zgłoszenia</span>
        </button>
        <button className="header-nav-button">
          <FontAwesomeIcon icon={faCog} />
          <span>Ustawienia</span>
        </button>
        <button className="header-nav-button logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Wyloguj</span>
        </button>
      </div>
    </header>
  );
}