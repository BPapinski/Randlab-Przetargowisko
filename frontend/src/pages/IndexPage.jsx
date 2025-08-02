import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css";
import Header from "../components/Header";
import TenderList from "../components/TenderList";
import { AuthFetch } from "../utils/AuthFetch";

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 🔁 Brak stanu currentPage, searchTerm itd.
  // Wszystko czytane dynamicznie z URL

  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams(location.search);

    const currentPage = parseInt(params.get("page"), 10) || 1;
    const tendersPerPage = parseInt(params.get("page_size"), 10) || 10;
    const searchTerm = params.get("search") || "";
    let ordering = params.get("ordering") || "-date"; // ✅ domyślne sortowanie

    const apiUrl = `/api/tenders/?${params.toString()}`;

    try {
      const res = await AuthFetch(apiUrl);
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Błąd podczas pobierania przetargów.");
      }

      const data = await res.json();
      setTenders(data.results || []);
      setTotalPages(Math.ceil(data.count / tendersPerPage));
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać przetargów.");
    } finally {
      setIsLoading(false);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  // 🔁 Mapping z parametrów do stanu tylko do prezentacji (nie do logiki fetchowania)
  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get("page"), 10) || 1;
  const tendersPerPage = parseInt(params.get("page_size"), 10) || 10;
  const searchTerm = params.get("search") || "";
  const ordering = params.get("ordering") || "-date";

  const reverseSortMap = {
    created_at: "date_asc",
    "-created_at": "date_desc",
    updated_at: "updated_asc",
    "-updated_at": "updated_desc",
    price: "price_asc",
    "-price": "price_desc",
  };
  const sortOrder = reverseSortMap[ordering] || "";

  const updateUrl = (newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate({ search: params.toString() });
  };

  const handlePageChange = (page) => {
    updateUrl({ page, page_size: tendersPerPage });
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    updateUrl({ search: newSearchTerm, page: 1, page_size: tendersPerPage });
  };

  const handleTendersPerPageChange = (event) => {
    const newPageSize = Number(event.target.value);
    updateUrl({ page: 1, page_size: newPageSize });
  };

  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    const sortMap = {
      date_asc: "created_at",
      date_desc: "-created_at",
      updated_asc: "updated_at",
      updated_desc: "-updated_at",
      price_asc: "price",        // jeśli masz takie pole
      price_desc: "-price",
    };
    updateUrl({ ordering: sortMap[newSortOrder], page: 1 });
  };

  return (
    <>
      <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <div className="container">
        <div className="content-wrapper">
          <aside className="sidebar left-sidebar">
            <h3>Sortuj według</h3>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="">Domyślnie</option>
              <option value="date_asc">Data utworzenia rosnąco</option>
              <option value="date_desc">Data utworzenia malejąco</option>
              <option value="updated_asc">Data aktualizacji rosnąco</option>     {/* NOWE */}
              <option value="updated_desc">Data aktualizacji malejąco</option>   {/* NOWE */}
              <option value="price_asc">Cena rosnąco</option>
              <option value="price_desc">Cena malejąco</option>
            </select>
            <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #ddd" }} />
            <h4>Zakres cenowy</h4>
            <div className="range-inputs">
              <input type="number" placeholder="Cena od" />
              <input type="number" placeholder="Cena do" />
            </div>
            <h4>Zakres marży</h4>
            <div className="range-inputs">
              <input type="number" placeholder="Marża od %" />
              <input type="number" placeholder="Marża do %" />
            </div>
            <h4>Firma</h4>
            <select>
              <option value="">Wybierz firmę</option>
              <option value="placeholder1">Firma 1</option>
              <option value="placeholder2">Firma 2</option>
              <option value="placeholder3">Firma 3</option>
            </select>
          </aside>

          <main className="tender-content">
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

            {isLoading && <p>Ładowanie przetargów...</p>}
            {!isLoading && <TenderList tenders={tenders} error={error} />}

            {!isLoading && totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    disabled={currentPage === i + 1}
                    className={currentPage === i + 1 ? "active" : ""}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>

          <aside className="sidebar right-sidebar">
            <p style={{ margin: 0 }}>Panel boczny</p>
          </aside>
        </div>
      </div>
    </>
  );
}
