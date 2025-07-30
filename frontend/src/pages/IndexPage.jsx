import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css";

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTenders = async () => {
    const params = new URLSearchParams(location.search);
    params.set("page", currentPage);
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    let apiUrl = "http://127.0.0.1:8000/api/tenders/?" + params.toString();

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Error fetching tenders");

      const data = await res.json();
      setTenders(data.results || []);
      setTotalPages(Math.ceil(data.count / 10));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tenders");
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [currentPage, location.search, searchTerm]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    navigate({ search: params.toString() });
    setCurrentPage(page);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Header - teraz poza głównym kontenerem */}
      <header className="main-header">
        <div className="header-left">
          <div className="logo-placeholder">Twoje Logo</div>
        </div>
        <div className="header-center">
          <input
            type="text"
            placeholder="Szukaj przetargów..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="header-right">
          {/* Ikony placeholderów - możesz je zastąpić np. Font Awesome */}
          <div className="icon-placeholder">
            <span role="img" aria-label="user">👤</span>
          </div>
          <div className="icon-placeholder">
            <span role="img" aria-label="settings">⚙️</span>
          </div>
          <div className="icon-placeholder">
            <span role="img" aria-label="bell">🔔</span>
          </div>
        </div>
      </header>
      {/* Koniec Header */}

      <div className="container">
        <h1 className="main-title">Lista Przetargów</h1>

        {error && <p className="error">{error}</p>}

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
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}