import React, { useState, useEffect } from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import '../pages/styles/TenderListStyles.css';

export default function TenderList({ tenders, error, onTenderUpdate, selectedCompany }) {
  const [localTenders, setLocalTenders] = useState(tenders);

  useEffect(() => {
    setLocalTenders(tenders); 
  }, [tenders]);

  const handleToggleActive = async (tenderId) => {
    const confirmed = window.confirm('Czy na pewno chcesz dezaktywować ten przetarg?');
    if (!confirmed) return;

    // Optymistyczna aktualizacja: oznacz przetarg jako nieaktywny lokalnie
    const updatedTenders = localTenders.map(tender =>
      tender.id === tenderId ? { ...tender, is_active: false } : tender
    );
    setLocalTenders(updatedTenders);

    try {
      const response = await AuthFetch(`/api/tender/${tenderId}/toggle-active/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.success) {
        // W przypadku błędu przywróć poprzedni stan
        setLocalTenders(localTenders);
        alert('Wystąpił błąd podczas zmiany statusu przetargu.');
      } else {
        // Wywołaj funkcję nadrzędnego komponentu, aby odświeżyć dane
        if (onTenderUpdate) {
          onTenderUpdate();
        }
      }
    } catch {
      // W przypadku błędu przywróć poprzedni stan
      setLocalTenders(localTenders);
      alert('Wystąpił błąd podczas zmiany statusu przetargu.');
    }
  };

  // Filtruj tylko aktywne przetargi
  const activeTenders = localTenders.filter(tender => tender.is_active);

  if (error) return <p className="error">{error}</p>;
  if (activeTenders.length === 0 && !error) return <p className="no-results">Brak przetargów do wyświetlenia.</p>;

  return (
    <>  
      {tenders.map((entry) => (
        <div
          key={entry.id}
          className=
            "tender-card"   
        >
          <div className="tender-header">
            <h2>{entry.name}</h2>
            <p className="dates">
              Utworzono: {new Date(entry.created_at).toLocaleString()} <br />
              Zaktualizowano: {new Date(entry.updated_at).toLocaleString()} <br />
              <span className="total-value">
                Wartość całkowita: {parseFloat(entry.total_tender_value).toFixed(2)} zł
              </span>
            </p>
            <div className="tender-actions">
              <button
                className="delete-tender-btn"
                onClick={() => handleToggleActive(entry.id)}
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
              entry.entries.map((subEntry) => (
                <div key={subEntry.id} className={"entry-card" + 
                  (selectedCompany && subEntry.company === selectedCompany ? " highlight-company" : "")}>
                  <div className=
                    "entry-info" >
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
      ))}
    </>
  );
}