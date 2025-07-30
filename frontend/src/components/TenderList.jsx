// src/components/TenderList.js

import React from 'react';
import '../pages/styles/TenderListStyles.css'; // Import stylów dla listy przetargów

/**
 * Komponent TenderList wyświetla listę przetargów.
 * Każdy przetarg zawiera listę zgłoszeń.
 *
 * @param {object} props - Właściwości komponentu.
 * @param {Array<object>} props.tenders - Tablica obiektów przetargów do wyświetlenia.
 * @param {string|null} props.error - Komunikat o błędzie, jeśli wystąpił problem z pobieraniem danych.
 */
export default function TenderList({ tenders, error }) {
  if (error) {
    return <p className="error">{error}</p>;
  }

  if (tenders.length === 0 && !error) {
    return <p className="no-results">Brak przetargów do wyświetlenia.</p>;
  }

  return (
    <>
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
    </>
  );
}