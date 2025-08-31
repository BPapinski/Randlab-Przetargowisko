import React from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import '../pages/styles/TenderListStyles.css';
import TenderCard from './TenderCard';

export default function TenderList({ tenders, error, selectedCompany, companies, onUpdateTender, onToggleActive }) {

    
  const handleToggleActive = async (tenderId) => {
    const confirmed = window.confirm('Czy na pewno chcesz dezaktywować ten przetarg?');
    if (!confirmed) return;

    try {
      const response = await AuthFetch(`/api/tender/${tenderId}/toggle-active/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!data.success) {
        alert('Wystąpił błąd podczas zmiany statusu przetargu.');
      } else {
        // Ta linia powoduje odświeżenie strony i jest poprawna.
        // onToggleActive to prop, który jest przekazywany z IndexPage.
        if (onToggleActive) onToggleActive(); 
      }
    } catch {
      alert('Wystąpił błąd podczas zmiany statusu przetargu.');
    }
  };

  

  const activeTenders = tenders.filter(tender => tender.is_active);

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
          onUpdateTender={onUpdateTender} // Prop, który przekazuje funkcję do aktualizacji stanu
          companies={companies}
        />
      ))}
    </>
  );
}
