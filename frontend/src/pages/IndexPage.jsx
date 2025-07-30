import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css";
import RandlabLogo from '../icons/randlab-logo.png';

// Import ikon z Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faGavel, faFileAlt, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tendersPerPage, setTendersPerPage] = useState(10); // Nowy stan dla liczby przetargów na stronę

  const fetchTenders = async () => {
    const params = new URLSearchParams(location.search);
    params.set("page", currentPage);
    params.set("page_size", tendersPerPage); // Dodaj parametr page_size
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    let apiUrl = "http://127.0.0.1:8000/api/tenders/?" + params.toString();

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Error fetching tenders");

      const data = await res.json();
      setTenders(data.results || []);
      // Oblicz totalPages na podstawie data.count i tendersPerPage
      setTotalPages(Math.ceil(data.count / tendersPerPage));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tenders");
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [currentPage, tendersPerPage, location.search, searchTerm]); // Dodaj tendersPerPage do zależności

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    params.set("page_size", tendersPerPage);
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    navigate({ search: params.toString() });
    setCurrentPage(page);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetuj stronę przy nowym wyszukiwaniu
  };

  const handleTendersPerPageChange = (event) => {
    setTendersPerPage(Number(event.target.value));
    setCurrentPage(1); // Resetuj stronę do 1 po zmianie liczby elementów na stronę
  };

  return (
    <>
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
              onChange={handleSearchChange}
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

      <div className="container">
        <h1 className="main-title">Lista Przetargów</h1>

        {error && <p className="error">{error}</p>}

        {/* Sekcja wyboru liczby przetargów na stronę */}
        <div className="pagination-controls">
          <label htmlFor="tenders-per-page">Pokaż:</label>
          <select
            id="tenders-per-page"
            value={tendersPerPage}
            onChange={handleTendersPerPageChange}
            className="tenders-per-page-select"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>przetargów na stronę</span>
        </div>

        {tenders.length === 0 && !error && (
          <p className="no-results">Brak przetargów do wyświetlenia.</p>
        )}

        {tenders.map((tender) => (
          <div key={tender.id} className="tender-card">
            <div className="tender-header">
              <h2>{tender.name}</h2>
              <p className="dates">
                Utworzono: {new Date(tender.created_at).toLocaleString()} <br />
                Zaktualizowano: {new Date(tender.updated_at).toLocaleString()}{" "}
                <br />
                <span className="total-value">
                  Wartość całkowita:{" "}
                  {parseFloat(tender.total_tender_value).toFixed(2)} zł
                </span>
              </p>
            </div>

            <h3 className="entries-title">Zgłoszenia:</h3>
            <div className="entries">
              {tender.entries.length === 0 && (
                <p className="no-entries">Brak zgłoszeń dla tego przetargu.</p>
              )}
              {tender.entries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-info">
                    <p>
                      <strong>Stanowisko:</strong> {entry.position}
                    </p>
                    <p>
                      <strong>Firma:</strong> {entry.company}
                    </p>
                    <p>
                      <strong>Cena developera:</strong> {entry.developer_price}{" "}
                      zł
                    </p>
                    <p>
                      <strong>Marża:</strong> {entry.margin}%
                    </p>
                    <p>
                      <strong>Cena końcowa:</strong> {entry.total_price} zł
                    </p>
                  </div>
                  <div className="entry-actions">
                    <button className="edit-btn">Edytuj</button>
                    <button className="delete-btn">Usuń</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1}
              className={currentPage === i + 1 ? 'active' : ''} // Dodaj klasę 'active'
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}