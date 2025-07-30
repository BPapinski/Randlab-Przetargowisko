import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route } from "react-router-dom";


// Importuj strony
import IndexPage from "./pages/IndexPage";

const root = ReactDOM.createRoot(document.getElementById("root"));


root.render(
  <React.StrictMode>
    <Routes>
      <Route path="/" element={<IndexPage />} />
    </Routes>
  </React.StrictMode>
);
