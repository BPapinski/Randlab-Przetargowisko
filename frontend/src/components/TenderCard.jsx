import React, { useState, useEffect } from "react";
import TenderCardEntry from "./TenderCardEntry";
import styles from "./styles/TenderEntryForm.module.css";

export default function TenderCard({ entry, selectedCompany, onToggleActive, onUpdateEntry, companies }) {
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
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  
  useEffect(() => {
    const sum = localEntry.entries.reduce(
      (acc, e) => acc + parseFloat(e.total_price || 0),
      0
    );
    setTotalValue(sum.toFixed(2));
  }, [localEntry.entries]);

  const handleUpdateEntry = (updatedSubEntry) => {
    if (updatedSubEntry.deleted) {
      // delete
      const updatedEntries = localEntry.entries.filter((e) => e.id !== updatedSubEntry.id);
      setLocalEntry({
        ...localEntry,
        entries: updatedEntries,
        updated_at: new Date().toISOString(),
      });
    } else {
      //  update
      const updatedEntries = localEntry.entries.map((e) =>
        e.id === updatedSubEntry.id ? updatedSubEntry : e
      );
      const updatedLocalEntry = { ...localEntry, entries: updatedEntries, updated_at: updatedSubEntry.updated_at };
      setLocalEntry(updatedLocalEntry);
    }

    if (onUpdateEntry && !updatedSubEntry.deleted) {
      onUpdateEntry(updatedSubEntry, localEntry.id);
    }
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

    if (name === "company") {
      if (!value.trim()) {
        setCompanySuggestions(companies.filter(company => typeof company === 'string')); 
        setIsSuggestionsVisible(true);
      } else {
        const filtered = companies.filter((company) =>
          typeof company === 'string' && company.toLowerCase().includes(value.toLowerCase().trim())
        );
        setCompanySuggestions(filtered);
        setIsSuggestionsVisible(true);
      }
    }
  };

  const handleCompanySelect = (company) => {
    setFormData((prev) => ({ ...prev, company }));
    setCompanySuggestions([]);
    setIsSuggestionsVisible(false);
  };

  const handleInputFocus = () => {
    setCompanySuggestions(companies.filter(company => typeof company === 'string')); // Show all valid companies
    setIsSuggestionsVisible(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsSuggestionsVisible(false), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tender/${localEntry.id}/entries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position: formData.position,
          company: formData.company,
          developer_price: parseFloat(formData.developer_price),
          margin: parseFloat(formData.margin),
          description: formData.description,
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setLocalEntry({
          ...localEntry,
          entries: [...localEntry.entries, newEntry],
          updated_at: new Date().toISOString(),
        });
        setFormData({
          position: "",
          company: "",
          developer_price: "",
          margin: "",
          description: ""
        });
        setCompanySuggestions([]);
        setIsSuggestionsVisible(false);
        setShowForm(false);
      } else {
        console.error("Failed to add new entry:", response.statusText);
        alert("Błąd podczas dodawania developera: " + response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Wystąpił błąd podczas wysyłania żądania: " + error.message);
    }
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
            className="delete-tender-btn action-btn"
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

      <div className={styles.addEntryButtonContainer}>
        <button
          className={styles.addEntryBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Anuluj" : "Dodaj nowego developera"}
        </button>
      </div>
      {showForm && (
        <div className={styles.addEntrySection}>
          <form onSubmit={handleSubmit} className={styles.addEntryForm}>
            <div className={styles.formGroup}>
              <label>Pozycja:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Firma:</label>
              <div className={styles.companyInputWrapper}>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
                {isSuggestionsVisible && (
                  <ul className={styles.suggestionsList}>
                    {companySuggestions.length > 0 ? (
                      companySuggestions.map((company) => (
                        <li
                          key={company}
                          className={styles.suggestionItem}
                          onClick={() => handleCompanySelect(company)}
                        >
                          {company}
                        </li>
                      ))
                    ) : (
                      <li className={styles.suggestionItem}>Brak pasujących firm</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
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
            <div className={styles.formGroup}>
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
            <div className={styles.formGroup}>
              <label>Opis:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className={styles.submitEntryBtn}>
              Dodaj developera
            </button>
          </form>
        </div>
      )}
    </div>
  );
}