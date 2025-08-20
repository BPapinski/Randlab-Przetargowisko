import React, { useState, useEffect } from "react";
import TenderCardEntry from "./TenderCardEntry";

export default function TenderCard({ entry, selectedCompany, onToggleActive, onUpdateEntry }) {
  const [localEntry, setLocalEntry] = useState(entry);
  const [totalValue, setTotalValue] = useState(entry.price);

  // Oblicz wartość całkowitą przy każdej zmianie wpisów
  useEffect(() => {
    const sum = localEntry.entries.reduce(
      (acc, e) => acc + parseFloat(e.total_price || 0),
      0
    );
    setTotalValue(sum.toFixed(2));
  }, [localEntry.entries]);

  const handleUpdateEntry = (updatedSubEntry) => {
    const updatedEntries = localEntry.entries.map((e) =>
      e.id === updatedSubEntry.id ? updatedSubEntry : e
    );
    const updatedLocalEntry = { ...localEntry, entries: updatedEntries, updated_at: updatedSubEntry.updated_at, };
    setLocalEntry(updatedLocalEntry);

    if (onUpdateEntry) onUpdateEntry(updatedSubEntry, localEntry.id);
  };

  return (
    <div key={localEntry.id} className="tender-card">
      <div className="tender-header">
        <h2>{localEntry.name}</h2>
        <p className="dates">
          Utworzono: {new Date(localEntry.created_at).toLocaleString()} <br />
          Zaktualizowano: {new Date(localEntry.updated_at).toLocaleString()} <br />
          <span className="total-value">
            Wartość całkowita: {totalValue} zł
          </span>
        </p>
        <div className="tender-actions">
          <button
            className="delete-tender-btn"
            onClick={() => onToggleActive(localEntry.id)}
          >
            Usuń przetarg
          </button>
        </div>
      </div>

      <h3 className="entries-title">Developerzy:</h3>
      <div className="entries">
        {localEntry.entries.length === 0 ? (
          <p className="no-entries">Brak zgłoszeń dla tego przetargu.</p>
        ) : (
          [...localEntry.entries]
            .sort((a, b) => {
              if (!selectedCompany) return 0;
              if (a.company === selectedCompany && b.company !== selectedCompany) return -1;
              if (a.company !== selectedCompany && b.company === selectedCompany) return 1;
              return 0;
            })
            .map((subEntry) => (
              <TenderCardEntry
                key={subEntry.id}
                subEntry={subEntry}
                selectedCompany={selectedCompany}
                onUpdate={handleUpdateEntry}
              />
            ))
        )}
      </div>
    </div>
  );
}
