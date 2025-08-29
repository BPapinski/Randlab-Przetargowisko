import React, { useState, useEffect } from "react";
import TenderCardEntry from "./TenderCardEntry";

export default function TenderCard({ entry, selectedCompany, onToggleActive, onUpdateEntry }) {
  const [localEntry, setLocalEntry] = useState(entry);
  const [totalValue, setTotalValue] = useState(entry.price);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    developer_price: "",
    margin: "",
    description: ""
  });


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
    const updatedLocalEntry = { ...localEntry, entries: updatedEntries, updated_at: updatedSubEntry.updated_at };
    setLocalEntry(updatedLocalEntry);

    if (onUpdateEntry) onUpdateEntry(updatedSubEntry, localEntry.id);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "won":
        return "status-won";
      case "lost":
        return "status-lost";
      case "unresolved":
        return "status-unresolved";
      default:
        return "";
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {
      position: formData.position,
      company: formData.company,
      developer_price: parseFloat(formData.developer_price),
      margin: parseFloat(formData.margin),
      description: formData.description,
    };
    alert(`Symulacja wysyłania requestu do http://127.0.0.1:8000/api/tender/${localEntry.id}/entries/\nDane: ${JSON.stringify(requestData, null, 2)}`);
  };

  return (
    <div key={localEntry.id} className="tender-card">
      <div className="tender-header">
        <h2>{localEntry.name}</h2>
        <p>
          <span className="info-label">Klient:</span> {localEntry.client}
        </p>
        <p>
          <span className="info-label">Status: </span>
          <span className={`status-label ${getStatusClass(localEntry.status)}`}>
            {localEntry.status === "won" ? "Wygrany" : localEntry.status === "lost" ? "Przegrany" : "Nierozstrzygnięty"}
          </span>
        </p>
        {localEntry.implementation_link && (
          <p>
            <span className="info-label">Link do realizacji: </span>
            <a href={localEntry.implementation_link} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          </p>
        )}
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

      <div className="add-entry-section">
        <button
          className="add-entry-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Anuluj" : "Dodaj nowy wpis"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="add-entry-form">
            <div className="form-group">
              <label>Pozycja:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Firma:</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Cena developera:</label>
              <input
                type="number"
                name="developer_price"
                value={formData.developer_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Marża (%):</label>
              <input
                type="number"
                name="margin"
                value={formData.margin}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Opis:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="submit-entry-btn">
              Dodaj wpis
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
