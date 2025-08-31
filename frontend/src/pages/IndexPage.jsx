import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";

import "./styles/indexStyles.css";
import Header from "../components/Header";
import TenderList from "../components/TenderList";
import FilterSidebar from "../components/FilterSidebar";
import TenderStatsSidebar from "../components/TenderStatsSidebar";

import { AuthFetch } from "../utils/AuthFetch";
import { useDebounce } from "../hooks/useDebounce";

export default function IndexPage() {
  // --- Routing & URL params ---
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const currentPage = parseInt(params.get("page"), 10) || 1;
  const tendersPerPage = parseInt(params.get("page_size"), 10) || 10;
  const urlSearchTerm = params.get("search") || "";
  const ordering = params.get("ordering") || "-date";

  // --- Global state ---
  const [tenders, setTenders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // --- Filters state ---
  const [searchInput, setSearchInput] = useState(urlSearchTerm);
  const debouncedSearch = useDebounce(searchInput, 500);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  const [tempPriceFrom, setTempPriceFrom] = useState("");
  const [tempPriceTo, setTempPriceTo] = useState("");
  const debouncedPriceFrom = useDebounce(tempPriceFrom, 500);
  const debouncedPriceTo = useDebounce(tempPriceTo, 500);

  const [statusFilter, setStatusFilter] = useState("");

  const [sortOrder, setSortOrder] = useState(() => {
    const reverseSortMap = {
      created_at: "date_asc",
      "-created_at": "date_desc",
      updated_at: "updated_asc",
      "-updated_at": "updated_desc",
      price: "price_asc",
      "-price": "price_desc",
    };
    return reverseSortMap[ordering] || "";
  });

  // --- Options for selects ---
  const companyOptions = [
    { value: null, label: "Wszystkie firmy" },
    ...companies.map((company) => ({ value: company, label: company })),
  ];

  const clientOptions = [
    { value: null, label: "Wszyscy klienci" },
    ...clients.map((client) => ({ value: client, label: client })),
  ];

  // --- URL sync ---
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

  // --- Effects: sync filters from URL ---
  useEffect(() => {
    setSelectedCompany(params.get("company") || "");
    setSelectedClient(params.get("client") || "");
    setTempPriceFrom(params.get("price_from") || "");
    setTempPriceTo(params.get("price_to") || "");
    setStatusFilter(params.get("status") || "");
  }, [location.search]);

  // --- Effects: debounce search ---
  useEffect(() => {
    if (debouncedSearch !== urlSearchTerm) {
      updateUrl({ search: debouncedSearch, page: 1, page_size: tendersPerPage });
    }
  }, [debouncedSearch, urlSearchTerm, tendersPerPage]);

  // --- Effects: debounce prices ---
  useEffect(() => {
    updateUrl({
      price_from: debouncedPriceFrom,
      price_to: debouncedPriceTo,
      page: 1,
    });
  }, [debouncedPriceFrom, debouncedPriceTo]);

  // --- Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, clientsRes] = await Promise.all([
          AuthFetch("/api/companies/"),
          AuthFetch("/api/clients/"),
        ]);

        const companiesData = await companiesRes.json();
        const clientsData = await clientsRes.json();

        // 🔽 Sortowanie alfabetyczne
        const sortedCompanies = companiesData.sort((a, b) => {
          const nameA = (typeof a === "string" ? a : a.name)?.toLowerCase();
          const nameB = (typeof b === "string" ? b : b.name)?.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        const sortedClients = clientsData.sort((a, b) => {
          const nameA = (typeof a === "string" ? a : a.name)?.toLowerCase();
          const nameB = (typeof b === "string" ? b : b.name)?.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setCompanies(sortedCompanies);
        setClients(sortedClients);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCompanies([]);
        setClients([]);
      }
    };
    fetchData();
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsRes = await AuthFetch("/api/stats/tender-stats/");
      if (!statsRes.ok) throw new Error("Błąd podczas pobierania statystyk.");
      setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams(location.search);
    try {
      const tendersRes = await AuthFetch(`/api/tenders/?${params.toString()}`);
      if (tendersRes.status === 401) return navigate("/login");
      if (!tendersRes.ok) throw new Error("Błąd podczas pobierania przetargów.");
      const data = await tendersRes.json();
      setTenders(data.results || []);
      setTotalPages(Math.ceil(data.count / tendersPerPage));
    } catch (err) {
      setError("Nie udało się pobrać danych.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [location.search, navigate, tendersPerPage]);

  const fetchAllData = useCallback(() => {
    fetchTenders();
    fetchStats();
  }, [fetchTenders, fetchStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Handlers ---
  const handleUpdateTender = useCallback(
    (updatedTender) => {
      setTenders((prev) =>
        prev.map((t) => (t.id === updatedTender.id ? updatedTender : t))
      );
      fetchStats();
    },
    [fetchStats]
  );

  const handleLogoClick = () => {
    resetFilters();
    navigate("/");
  };

  const resetFilters = () => {
    setSortOrder("");
    setStatusFilter("");
    setTempPriceFrom("");
    setTempPriceTo("");
    setSelectedClient(null);
    setSelectedCompany(null);
    updateUrl({
      page: 1,
      search: "",
      company: null,
      client: null,
      price_from: "",
      price_to: "",
      status: "",
      ordering: "",
    });
  };

  const handlePageChange = (page) => updateUrl({ page, page_size: tendersPerPage });
  const handleSearchChange = (e) => setSearchInput(e.target.value);
  const handleTendersPerPageChange = (e) =>
    updateUrl({ page: 1, page_size: Number(e.target.value) });

  const handleSortChange = (e) => {
    const sortMap = {
      date_asc: "created_at",
      date_desc: "-created_at",
      updated_asc: "updated_at",
      updated_desc: "-updated_at",
      price_asc: "price",
      price_desc: "-price",
    };
    setSortOrder(e.target.value);
    updateUrl({ ordering: sortMap[e.target.value], page: 1 });
  };

  const handleCompanyChange = (opt) => {
    setSelectedCompany(opt ? opt.value : null);
    updateUrl({ company: opt ? opt.value : null, page: 1 });
  };

  const handleClientChange = (opt) => {
    setSelectedClient(opt ? opt.value : null);
    updateUrl({ client: opt ? opt.value : null, page: 1 });
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    updateUrl({ status: e.target.value, page: 1 });
  };

  // --- Render ---
  return (
    <>
      <Header
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        onLogoClick={handleLogoClick}
      />
      <div className="container">
        <div className="content-wrapper">
          <FilterSidebar
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
            tempPriceFrom={tempPriceFrom}
            setTempPriceFrom={setTempPriceFrom}
            tempPriceTo={tempPriceTo}
            setTempPriceTo={setTempPriceTo}
            clientOptions={clientOptions}
            selectedClient={selectedClient}
            handleClientChange={handleClientChange}
            companyOptions={companyOptions}
            selectedCompany={selectedCompany}
            handleCompanyChange={handleCompanyChange}
            statusFilter={statusFilter}
            handleStatusChange={handleStatusChange}
          />
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
                companies={companies}
                onUpdateTender={handleUpdateTender}
                onToggleActive={fetchAllData}
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
                  sx={{ marginTop: "1rem" }}
                />
              </div>
            )}
          </main>

          <TenderStatsSidebar stats={stats} loading={statsLoading} />
        </div>
      </div>
    </>
  );
}
