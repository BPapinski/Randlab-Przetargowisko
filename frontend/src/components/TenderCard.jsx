// src/components/TenderCard.jsx
import React, { useState, useEffect } from "react";
import TenderCardEntry from "./TenderCardEntry";
import styles from "./styles/TenderEntryForm.module.css";
import headerStyles from "./styles/TenderCardStyles/TenderCardHeader.module.css"
import { AuthFetch } from '../utils/AuthFetch';

export default function TenderCard({ entry, selectedCompany, onToggleActive, companies, onUpdateTender }) {
    const [localTender, setlocalTender] = useState(entry);
    const [totalValue, setTotalValue] = useState(entry.price);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        position: "",
        company: "",
        developer_price: "",
        margin: "",
        description: ""
    });
    const [companySuggestions, setCompanySuggestions] = useState([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

    const localTotalValue = localTender.entries
  .reduce((acc, e) => acc + parseFloat(e.total_price || 0), 0)
  .toFixed(2);


    const onEditClick = (id) => {
        setIsEditing(true);
        const entryToEdit = localTender.entries.find((e) => e.id === id);
        if (entryToEdit) {
            setFormData({
                position: entryToEdit.position,
                company: entryToEdit.company,
                developer_price: entryToEdit.developer_price,
                margin: entryToEdit.margin,
                description: entryToEdit.description
            });
        }
    };

    const onCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            position: "",
            company: "",
            developer_price: "",
            margin: "",
            description: ""
        });
    };



    useEffect(() => {
        const sum = localTender.entries.reduce(
            (acc, e) => acc + parseFloat(e.total_price || 0),
            0
        );
        setTotalValue(sum.toFixed(2));
    }, [localTender.entries]);

    
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
            const response = await fetch(`http://127.0.0.1:8000/api/tender/${localTender.id}/entries/`, {
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
                setlocalTender({
                    ...localTender,
                    entries: [...localTender.entries, newEntry],
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

    const onSave = async (localTender) => {
        try {
            const res = await AuthFetch(`/api/tenders/${localTender.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localTender),
            });

            if (!res.ok) {
                throw new Error("Wystąpił błąd podczas zapisywania przetargu.");
            }

            const updatedTenderData = await res.json();

            if (onUpdateTender) {
                onUpdateTender(updatedTenderData);
            }

            //alert("Przetarg został zaktualizowany!");
            setIsEditing(false);

        } catch (err) {
            console.error("Błąd zapisu:", err);
            alert(err.message);
        }
    };

    const handleEntryUpdate = (updatedEntry) => {
  setlocalTender((prev) => {
    let newEntries;

    if (updatedEntry.deleted) {
      newEntries = prev.entries.filter(e => e.id !== updatedEntry.id);
    } else {
      newEntries = prev.entries.map(e =>
        e.id === updatedEntry.id ? updatedEntry : e
      );
    }

    const updatedTender = {
      ...prev,
      entries: newEntries,
      updated_at: new Date().toISOString(),
    };

    // 🔔 wywołaj callback do rodzica
    if (onUpdateTender) {
      onUpdateTender(updatedTender);
    }

    return updatedTender;
  });
};


    return (
        <div key={localTender.id} className="tender-card">
            <div className={headerStyles['tender-header']}>
                {isEditing ? (
                    <div className={headerStyles['edit-tender-form']}>
                        <p>
                            <span className="info-label">Nazwa przetargu:</span>
                            <input
                                type="text"
                                value={localTender.name}
                                onChange={e =>
                                    setlocalTender({ ...localTender, name: e.target.value })
                                }
                                className={headerStyles['edit-input']}
                            />
                        </p>

                        <p>
                            <span className="info-label">Klient:</span>
                            <input
                                type="text"
                                value={localTender.client}
                                onChange={e =>
                                    setlocalTender({ ...localTender, client: e.target.value })
                                }
                                className={headerStyles['edit-input']}
                            />
                        </p>

                        <p>
                            <span className="info-label">Status:</span>
                            <select
                                value={localTender.status}
                                onChange={e =>
                                    setlocalTender({ ...localTender, status: e.target.value })
                                }
                                className={headerStyles['edit-input']}
                            >
                                <option value="won">Wygrany</option>
                                <option value="lost">Przegrany</option>
                                <option value="unresolved">Nierozstrzygnięty</option>
                            </select>
                        </p>

                        {localTender.implementation_link && (
                            <p>
                                <span className="info-label">Link do realizacji:</span>
                                <input
                                    type="text"
                                    value={localTender.implementation_link || ""}
                                    onChange={e =>
                                        setlocalTender({
                                            ...localTender,
                                            implementation_link: e.target.value
                                        })
                                    }
                                    className={headerStyles['edit-input']}
                                />
                            </p>
                        )}

                        <p className={headerStyles.dates}>
                            Utworzono: {new Date(localTender.created_at).toLocaleString()} <br />
                            Zaktualizowano: {new Date(localTender.updated_at).toLocaleString()} <br />
                            <span className={headerStyles['total-value']}>Wartość całkowita: {localTotalValue} zł</span>
                        </p>

                        <div className={headerStyles['tender-actions']}>
                            <button
                                type="button"
                                className={`${headerStyles['action-btn']} ${headerStyles['action-btn--save']}`}
                                onClick={() => onSave(localTender)}
                            >
                                Zapisz
                            </button>
                            <button
                                type="button"
                                className={headerStyles['canceledit-btn']}
                                onClick={onCancelEdit}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2>{localTender.name}</h2>
                        <p><span className="info-label">Klient:</span> {localTender.client}</p>
                        <p><span className="info-label">Status: </span>
                            <span className={`status-label ${getStatusClass(localTender.status)}`}>
                                {localTender.status === "won" ? "Wygrany" : localTender.status === "lost" ? "Przegrany" : "Nierozstrzygnięty"}
                            </span>
                        </p>
                        {localTender.implementation_link && (
                            <p><span className="info-label">Link do realizacji: </span>
                                <a href={localTender.implementation_link} target="_blank" rel="noopener noreferrer">Link</a>
                            </p>
                        )}
                        <p className={headerStyles.dates}>
                            Utworzono: {new Date(localTender.created_at).toLocaleString()}<br />
                            Zaktualizowano: {new Date(localTender.updated_at).toLocaleString()}<br />
                            <span className={headerStyles['total-value']}>Wartość całkowita: {totalValue} zł</span>
                        </p>
                        
                        <div className={headerStyles['tender-actions']}>
                            <button className={headerStyles['delete-tender-btn']} onClick={() => onToggleActive(localTender.id)}>Usuń przetarg</button>
                            <button className={headerStyles['edit-tender-btn']} onClick={() => onEditClick(localTender.id)}>Edytuj przetarg</button>
                        </div>
                    </div>
                )}
            </div>



            <h3 className="entries-title">Developerzy:</h3>
            <div className="entries">
                {localTender.entries.length === 0 ? (
                    <p className="no-entries">Brak zgłoszeń dla tego przetargu.</p>
                ) : (
                    [...localTender.entries]
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
                                onUpdate={handleEntryUpdate} // Przekaż onUpdateTender do podrzędnego komponentu
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
