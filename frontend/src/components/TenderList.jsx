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

    const updatedTenders = localTenders.map(tender =>
      tender.id === tenderId ? { ...tender, is_active: false } : tender
    );
    setLocalTenders(updatedTenders);

    try {
      const response = await AuthFetch(`/api/tender/${tenderId}/toggle-active/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!data.success) {
        setLocalTenders(localTenders);
        alert('Wystąpił błąd podczas zmiany statusu przetargu.');
      } else {
        if (onTenderUpdate) onTenderUpdate();
      }
    } catch {
      setLocalTenders(localTenders);
      alert('Wystąpił błąd podczas zmiany statusu przetargu.');
    }
  };

  // nowa funkcja do aktualizacji wpisu w lokalnym stanie
  const handleUpdateEntry = (updatedEntry, tenderId) => {
    setLocalTenders((prevTenders) =>
      prevTenders.map((tender) => {
        if (tender.id !== tenderId) return tender;
        return {
          ...tender,
          entries: tender.entries.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          ),
        };
      })
    );
  };

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
          onUpdateEntry={handleUpdateEntry} // <- przekazujemy callback
        />
      ))}
    </>
  );
}
