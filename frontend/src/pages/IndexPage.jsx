import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css";
import Header from "../components/Header";
import TenderList from "../components/TenderList";
import { AuthFetch } from "../utils/AuthFetch";
import {useDebounce} from "../hooks/useDebounce";
import Pagination from '@mui/material/Pagination';  

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Nowe stany dla filtrów
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");


  const [tempPriceFrom, setTempPriceFrom] = useState("");
  const [tempPriceTo, setTempPriceTo] = useState("");


  




  // Parametry z URL
  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get("page"), 10) || 1;
  const tendersPerPage = parseInt(params.get("page_size"), 10) || 10;
  const urlSearchTerm = params.get("search") || "";
  const ordering = params.get("ordering") || "-date";

  const [searchInput, setSearchInput] = useState(urlSearchTerm);
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch !== urlSearchTerm) {
      updateUrl({ search: debouncedSearch, page: 1, page_size: tendersPerPage });
    }
  }, [debouncedSearch, urlSearchTerm,   ]);

  // Synchronizacja stanu filtrów z URL (przy wejściu na stronę lub zmianie URL)
  useEffect(() => {
    setSelectedCompany(params.get("company") || "");
    setPriceFrom(params.get("price_from") || "");
    setPriceTo(params.get("price_to") || "");

  }, [location.search]);

  // Pobieranie firm do selecta
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await AuthFetch("/api/companies/");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCompanies(data);
      } catch {
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

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
    setSearchInput(event.target.value);
  };
  const handleTendersPerPageChange = (event) => {
    updateUrl({ page: 1, page_size: Number(event.target.value) });
  };

  const handleSortChange = (event) => {
    const sortMap = {
      date_asc: "created_at",
      date_desc: "-created_at",
      updated_asc: "updated_at",
      updated_desc: "-updated_at",
      price_asc: "price",
      price_desc: "-price",
    };
    updateUrl({ ordering: sortMap[event.target.value], page: 1 });
  };

  // Obsługa zmiany filtrów
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    updateUrl({ company: e.target.value, page: 1 });
  };
  const handlePriceFromChange = (e) => {
    setPriceFrom(e.target.value);
    updateUrl({ price_from: e.target.value, page: 1 });
  };
  const handlePriceToChange = (e) => {
    setPriceTo(e.target.value);
    updateUrl({ price_to: e.target.value, page: 1 });
  };


  // Synchronizacja temp z URL
  useEffect(() => {
    setTempPriceFrom(priceFrom);
    setTempPriceTo(priceTo);

  }, [priceFrom, priceTo]);

  const handleSearchFilters = () => {
    updateUrl({
      price_from: tempPriceFrom,
      price_to: tempPriceTo,
      page: 1,
    });
  };

  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams(location.search);
    const currentPage = parseInt(params.get("page"), 10) || 1;
    const tendersPerPage = parseInt(params.get("page_size"), 10) || 10;

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
      setError("Nie udało się pobrać przetargów.");
    } finally {
      setIsLoading(false);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  return (
    <>

      <Header searchTerm={searchInput} onSearchChange={handleSearchChange} />


      <div className="container">
        <div className="content-wrapper">
          <aside className="sidebar left-sidebar">
            <h3>Sortuj według</h3>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="">Domyślnie</option>
              <option value="date_asc">Data utworzenia rosnąco</option>
              <option value="date_desc">Data utworzenia malejąco</option>
              <option value="updated_asc">Data aktualizacji rosnąco</option>
              <option value="updated_desc">Data aktualizacji malejąco</option>
              <option value="price_asc">Cena rosnąco</option>
              <option value="price_desc">Cena malejąco</option>
            </select>
            <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #ddd" }} />
            <h4>Zakres cenowy</h4>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Cena od"
                value={tempPriceFrom}
                onChange={e => setTempPriceFrom(e.target.value)}
              />
              <input
                type="number"
                placeholder="Cena do"
                value={tempPriceTo}
                onChange={e => setTempPriceTo(e.target.value)}
              />
            </div>
            
            <h4>Firma</h4>
            <select value={selectedCompany} onChange={handleCompanyChange}>
              <option value="">Wybierz firmę</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <button className="filters-submit-btn" onClick={handleSearchFilters} style={{ marginTop: "0.5rem" }}>
              Szukaj
            </button>

            note - nie ma sensu szukac po margin bo to jest rozne dla kazdego tenderEntry - mozna to zrobic w filtruj stanowiska
            tak samo cena developera - bez sensu co jak np dam max 1000zl - kazdy developer ma miec cene ponizej 1000 czy jeden

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
            {!isLoading && (
              <TenderList
                tenders={tenders}
                error={error}
                selectedCompany={selectedCompany}
              />
            )}

            {!isLoading && totalPages > 1 && (
            <div className="pagination">
              <Pagination
            count={Number(totalPages)}
            page={Number(currentPage)}
            onChange={(e, page) => handlePageChange(page)}
            showFirstButton
            showLastButton
            color="primary"
            variant="outlined"
            size="medium"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            sx={{ marginTop: '1rem' }}
          />
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
