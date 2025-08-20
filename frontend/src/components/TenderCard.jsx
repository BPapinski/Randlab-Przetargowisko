import React from "react";

export default function TenderCard({ entry, selectedCompany, onToggleActive }) {
  return (
    <div key={entry.id} className="tender-card">
      <div className="t ender-header">
        <h2>{entry.name}</h2>
        <p className="dates">
          Utworzono: {new Date(entry.created_at).toLocaleString()} <br />
          Zaktualizowano: {new Date(entry.updated_at).toLocaleString()} <br />
          <span className="total-value">
            Wartość całkowita: {parseFloat(entry.price).toFixed(2)} zł
          </span>
        </p>
        <div className="tender-actions">
          <button
            className="delete-tender-btn"
            onClick={() => onToggleActive(entry.id)}
          >
            Usuń przetarg
          </button>
        </div>
      </div>

      <h3 className="entries-title">Developerzy:</h3>
      <div className="entries">
        {entry.entries.length === 0 ? (
          <p className="no-entries">Brak zgłoszeń dla tego przetargu.</p>
        ) : (
          [...entry.entries]
            .sort((a, b) => {
              if (!selectedCompany) return 0;
              if (a.company === selectedCompany && b.company !== selectedCompany) return -1;
              if (a.company !== selectedCompany && b.company === selectedCompany) return 1;
              return 0;
            })
            .map((subEntry) => (
              <div
                key={subEntry.id}
                className={
                  "entry-card" +
                  (selectedCompany && subEntry.company === selectedCompany
                    ? " highlight-company"
                    : "")
                }
              >
                <div className="entry-info">
                  <p><strong>Stanowisko:</strong> {subEntry.position}</p>
                  <p><strong>Firma:</strong> {subEntry.company}</p>
                  <p><strong>Cena developera:</strong> {subEntry.developer_price} zł</p>
                  <p><strong>Marża:</strong> {subEntry.margin}%</p>
                  <p><strong>Cena końcowa:</strong> {subEntry.total_price} zł</p>
                </div>
                <div className="entry-actions">
                  <button className="edit-btn">Edytuj</button>
                  <button className="delete-btn">Usuń</button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
