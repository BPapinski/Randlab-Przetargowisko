import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/indexStyles.css"; // Style CSS dla całej strony
// Import komponentu Header
import Header from "../components/Header";
import TenderList from "../components/TenderList"; // Import komponentu TenderList
import { AuthFetch } from "../utils/AuthFetch";


export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tendersPerPage, setTendersPerPage] = useState(10);
  

  const fetchTenders = async () => {
    const params = new URLSearchParams(location.search);
    params.set("page", currentPage);
    params.set("page_size", tendersPerPage);
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    let apiUrl = "/api/tenders/?" + params.toString();

    try {
      const res = await AuthFetch(apiUrl);
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Error fetching tenders");

      const data = await res.json();
      setTenders(data.results || []);
      setTotalPages(Math.ceil(data.count / tendersPerPage));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tenders");
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [currentPage, tendersPerPage, location.search, searchTerm]);

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
    setCurrentPage(1);
  };

  const handleTendersPerPageChange = (event) => {
    setTendersPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <div className="container">
        <h1 className="main-title">Lista Przetargów</h1>


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

        <TenderList tenders={tenders} error={error} />

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}