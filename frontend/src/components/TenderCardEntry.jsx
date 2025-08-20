import React, { useState, useEffect } from "react";
import { AuthFetch } from "../utils/AuthFetch";

export default function TenderCardEntry({ subEntry, selectedCompany, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    position: subEntry.position,
    company: subEntry.company,
    developer_price: subEntry.developer_price,
    margin: subEntry.margin,
  });
  const [totalPrice, setTotalPrice] = useState(subEntry.total_price);

  // Oblicz cenę końcową przy każdej zmianie developer_price lub margin
  useEffect(() => {
    const devPrice = parseFloat(formData.developer_price) || 0;
    const margin = parseFloat(formData.margin) || 0;
    setTotalPrice((devPrice * (1 + margin / 100)).toFixed(2));
  }, [formData.developer_price, formData.margin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  try {
    const updatedEntry = {
      ...subEntry,
      ...formData,
      total_price: totalPrice,
    };

    // usuń updated_at z obiektu
    delete updatedEntry.updated_at;

    const res = await AuthFetch(`/api/tender-entries/${subEntry.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEntry),
    });

    if (!res.ok) throw new Error("Błąd podczas zapisywania zmian");

    setIsEditing(false);
    if (onUpdate) onUpdate({ ...updatedEntry, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div
      className={
        "entry-card" +
        (selectedCompany && subEntry.company === selectedCompany
          ? " highlight-company"
          : "")
      }
    >
      <div className="entry-info">
        {isEditing ? (
          <>
            <p>
              <strong>Stanowisko:</strong>{" "}
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </p>
            <p>
              <strong>Firma:</strong>{" "}
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </p>
            <p>
              <strong>Cena developera:</strong>{" "}
              <input
                type="number"
                name="developer_price"
                value={formData.developer_price}
                onChange={handleChange}
              />
            </p>
            <p>
              <strong>Marża:</strong>{" "}
              <input
                type="number"
                name="margin"
                value={formData.margin}
                onChange={handleChange}
              />
            </p>
            <p>
              <strong>Cena końcowa:</strong> {totalPrice} zł
            </p>
          </>
        ) : (
          <>
            <p><strong>Stanowisko:</strong> {subEntry.position}</p>
            <p><strong>Firma:</strong> {subEntry.company}</p>
            <p><strong>Cena developera:</strong> {subEntry.developer_price} zł</p>
            <p><strong>Marża:</strong> {subEntry.margin}%</p>
            <p><strong>Cena końcowa:</strong> {subEntry.total_price} zł</p>
          </>
        )}
      </div>

      <div className="entry-actions">
        {isEditing ? (
          <button
            className="action-btn action-btn--save"
            onClick={handleSave}
          >
            Zapisz
          </button>
        ) : (
          <button className="action-btn action-btn--edit" onClick={() => setIsEditing(true)}>
            Edytuj
          </button>
        )}
        <button className="delete-btn">Usuń</button>
      </div>
    </div>
  );
}