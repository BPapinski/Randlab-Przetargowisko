import React, { useState, useEffect } from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import '../pages/styles/TenderListStyles.css';
import TenderCard from './TenderCard';

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
      {activeTenders.map((entry) => (
        <TenderCard
          key={entry.id}
          entry={entry}
          selectedCompany={selectedCompany}
          onToggleActive={handleToggleActive}
        />
      ))}
    </>
  );
}