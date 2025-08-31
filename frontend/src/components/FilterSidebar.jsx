import React from 'react';
import Select from 'react-select';

export default function FilterSidebar({ sortOrder, handleSortChange, tempPriceFrom, setTempPriceFrom, tempPriceTo, setTempPriceTo, clientOptions, selectedClient, handleClientChange, companyOptions, selectedCompany, handleCompanyChange, statusFilter, handleStatusChange }) {
  return (
    <aside className="sidebar left-sidebar">
      <h3>Sortuj według</h3>
      <select value={sortOrder} onChange={handleSortChange}>
        <option value="">Domyślnie</option>
        <option value="date_asc">Data utworzenia rosnąco</option>
        <option value="date_desc">Data utworzenia malejąco</option>
        <option value="updated_asc">Data aktualizacji rosnąco</option>
        <option value="updated_desc">Data aktualizacji malejąco</option>
        <option value="price_asc">Cena rosnąco</option>
        <option value="price_desc">Cena malejąco</option>
      </select>
      <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #ddd" }} />
      <h4>Zakres cenowy</h4>
      <div className="range-inputs">
        <input
          type="number"
          placeholder="Cena od"
          value={tempPriceFrom}
          onChange={e => setTempPriceFrom(e.target.value)}
        />
        <input
          type="number"
          placeholder="Cena do"
          value={tempPriceTo}
          onChange={e => setTempPriceTo(e.target.value)}
        />
      </div>
      <h4>Klient</h4>
      <Select
        options={clientOptions}
        placeholder="Wybierz klienta..."
        isClearable
        value={clientOptions.find(option => option.value === selectedClient) || null}
        onChange={handleClientChange}
      />
      <h4>Firma uczestnicząca</h4>
      <Select
        options={companyOptions}
        onChange={handleCompanyChange}
        placeholder="Wybierz firmę..."
        value={companyOptions.find(option => option.value === selectedCompany) || null}
        isClearable
      />
      <h4>Status</h4>
      <select value={statusFilter} onChange={handleStatusChange}>
        <option value="">Wszystkie</option>
        <option value="won">Wygrane</option>
        <option value="lost">Przegrane</option>
        <option value="unresolved">Nierozstrzygnięte</option>
      </select>
    </aside>
  );
}