import "./styles/style.css";
import "./styles/reset.css";

import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";


export default function IndexPage() {
  const location = useLocation();
  


  const fetchProducts = async () => {
    const params = new URLSearchParams(location.search);
    let apiUrl = "http://127.0.0.1:8000/api/store/";
    params.append("page", currentPage);

    if ([...params].length > 0) {
      apiUrl += "?" + params.toString();
    }

    try {
      const res = await authFetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Błąd podczas pobierania produktów");

      const data = await res.json();
      setProducts(data.results || data);
      const pages = Math.ceil(data.count / 10);
      setTotalPages(pages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać produktów.");

      if (currentPage > 1) {
        const params = new URLSearchParams(location.search);
        if (params.get("page") !== "1") {
          params.set("page", 1);
          navigate({ search: params.toString() });
        }
      }
    }
  };





  
  return (
    <div className="container">
      asd
    </div>
  );
}
