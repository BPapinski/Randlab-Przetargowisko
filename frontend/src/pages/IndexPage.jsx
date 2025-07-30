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
    const [pageSize, setPageSize] = useState(10);

    const fetchTenders = async () => {
        const params = new URLSearchParams(location.search);
        params.set("page", currentPage);
        params.set("page_size", pageSize);
        if (searchTerm) {
            params.set("search", searchTerm);
        }

        let apiUrl = "http://127.0.0.1:8000/api/tenders/?" + params.toString();

        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Error fetching tenders");

            const data = await res.json();
            setTenders(data.results || []);
            setTotalPages(Math.ceil(data.count / pageSize));
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch tenders");
        }
    };

    useEffect(() => {
        fetchTenders();
    }, [currentPage, location.search, searchTerm, pageSize]);

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

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value));
        setCurrentPage(1);
    };

    const calculateAveragePrices = (tenders) => {
        const positionPrices = {};
        tenders.forEach((tender) => {
            tender.entries.forEach((entry) => {
                if (!positionPrices[entry.position]) {
                    positionPrices[entry.position] = { total: 0, count: 0 };
                }
                positionPrices[entry.position].total += parseFloat(entry.total_price);
                positionPrices[entry.position].count += 1;
            });
        });

        return Object.keys(positionPrices).map((position) => ({
            position,
            averagePrice: (positionPrices[position].total / positionPrices[position].count).toFixed(2),
        }));
    };

    useEffect(() => {
        fetchTenders();
    }, [currentPage, location.search, searchTerm, pageSize]);

    const averagePrices = calculateAveragePrices(tenders);

    return (
        <>
            {/* Header - teraz poza głównym kontenerem */}
            <header className="main-header">
                <div className="header-left">
                    <div className="logo-placeholder">Twoje Logo</div>
                </div>
                <nav className="header-nav">
                    <button onClick={() => navigate("/tenders")} className="nav-btn">Przetargi</button>
                    <button onClick={() => navigate("/aliases")} className="nav-btn">Słownik aliasów</button>
                    <button onClick={() => navigate("/comparator")} className="nav-btn">Porównywarka</button>
                </nav>
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
                <div className="summary">
                    <h2>Podsumowanie średnich cen</h2>
                    {averagePrices.length > 0 ? (
                        <ul className="summary-list">
                            {averagePrices.map((item) => (
                                <li key={item.position}>
                                    {item.position}: {item.averagePrice} zł
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Brak danych do wyświetlenia podsumowania.</p>
                    )}
                </div>
                <h1 className="main-title">Lista Przetargów</h1>
                <div className="page-size-selector">
                    <label htmlFor="page-size">Przetargów na stronę: </label>
                    <select
                        id="page-size"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>


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