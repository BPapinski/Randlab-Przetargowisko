import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css";
import Header from "../components/Header";
import TenderList from "../components/TenderList";
import FilterSidebar from "../components/FilterSidebar";
import { AuthFetch } from "../utils/AuthFetch";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from '@mui/material/Pagination';
import Select from 'react-select';
import TenderStatsSidebar from "../components/TenderStatsSidebar";

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");
  const [clients, setClients] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [tempPriceFrom, setTempPriceFrom] = useState("");
  const [tempPriceTo, setTempPriceTo] = useState("");
  const debouncedClient = useDebounce(client, 500);
  const debouncedPriceFrom = useDebounce(tempPriceFrom, 500);
  const debouncedPriceTo = useDebounce(tempPriceTo, 500);

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
  }, [debouncedSearch, urlSearchTerm, tendersPerPage]);

  const companyOptions = [
    { value: null, label: 'Wszystkie firmy' },
    ...companies.map(company => ({
      value: company,
      label: company,
    }))
  ];

  const clientOptions = [
    { value: null, label: 'Wszyscy klienci' },
    ...clients.map(client => ({
      value: client,
      label: client,
    }))
  ];

  useEffect(() => {
    setSelectedCompany(params.get("company") || "");
    setPriceFrom(params.get("price_from") || "");
    setPriceTo(params.get("price_to") || "");
    setStatus(params.get("status") || "");
    setClient(params.get("client") || "");
  }, [location.search]);

  const resetFilters = () => {
    setSortOrder('');
    setStatusFilter('');
    setTempPriceFrom('');
    setTempPriceTo('');
    setSelectedClient(null);
    setSelectedCompany(null);
    setPriceFrom('');
    setPriceTo('');
    setStatus('');
    setClient('');
    updateUrl({
      page: 1,
      search: '',
      company: null,
      client: null,
      price_from: '',
      price_to: '',
      status: '',
      ordering: '',
    });
  };

  const handleLogoClick = () => {
    resetFilters();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, clientsRes] = await Promise.all([
          AuthFetch("/api/companies/"),
          AuthFetch("/api/clients/"),
        ]);
        const companiesData = await companiesRes.json();
        const clientsData = await clientsRes.json();
        setCompanies(companiesData);
        setClients(clientsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCompanies([]);
        setClients([]);
      }
    };
    fetchData();
  }, []);

  const [sortOrder, setSortOrder] = useState(() => {
    const ordering = params.get("ordering") || "-created_at";
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
    const selectedSort = event.target.value;
    setSortOrder(selectedSort);
    updateUrl({ ordering: sortMap[selectedSort], page: 1 });
  };

  const handleCompanyChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedCompany(null);
      updateUrl({ company: null, page: 1 });
    } else {
      updateUrl({ company: selectedOption.value, page: 1 });
      setSelectedCompany(selectedOption ? selectedOption.value : null);
    }
  };

  const handleClientChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedClient(null);
      updateUrl({ client: null, page: 1 });
    } else {
      updateUrl({ client: selectedOption.value, page: 1 });
      setSelectedClient(selectedOption ? selectedOption.value : null);
    }
  };

  useEffect(() => {
    updateUrl({
      price_from: debouncedPriceFrom,
      price_to: debouncedPriceTo,
      page: 1,
    });
  }, [debouncedPriceFrom, debouncedPriceTo]);

  useEffect(() => {
    setTempPriceFrom(priceFrom);
    setTempPriceTo(priceTo);
  }, [priceFrom, priceTo]);

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    updateUrl({
      status: event.target.value,
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
      <Header searchTerm={searchInput} onSearchChange={handleSearchChange} onLogoClick={handleLogoClick} />
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
          <div className="flex">
            <TenderStatsSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
