import React, { useState, useEffect } from "react";
import { AuthFetch } from "../utils/AuthFetch";
import styles from './styles/TenderCardEntry.module.css';

export default function TenderCardEntry({ subEntry, selectedCompany, onUpdate }) {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    position: subEntry.position,
    company: subEntry.company,
    developer_price: subEntry.developer_price,
    margin: subEntry.margin,
    client: subEntry.client,
    status: subEntry.status,
    implementation_link: subEntry.implementation_link,
    description: subEntry.description,
  });
  const [totalPrice, setTotalPrice] = useState(subEntry.total_price);

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

  const handleEntryDelete = async (entryId) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten wpis?")) {
      try {
        const res = await AuthFetch(`/api/tender-entries/${entryId}/`, {
          method: "DELETE",
        });

        // 💡 Sprawdzaj, czy odpowiedź jest poprawna (status 204 No Content lub 200 OK), a następnie wywołaj onUpdate
        if (res.ok) {
          if (onUpdate) {
            onUpdate({ id: entryId, deleted: true });
          }
        } else {
          throw new Error("Błąd podczas usuwania wpisu");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      position: subEntry.position,
      company: subEntry.company,
      developer_price: subEntry.developer_price,
      margin: subEntry.margin,
      client: subEntry.client,
      status: subEntry.status,
      implementation_link: subEntry.implementation_link,
      description: subEntry.description,
    });
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
              <strong>Opis:</strong>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                style={{ width: "100%", resize: "vertical" }}
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
            {expandedDescription ? (
              <>
                <strong>
                  <span
                    className={styles.linkButton}
                    onClick={() => setExpandedDescription(false)}
                  >
                    Zwiń ▲
                  </span>
                </strong>
                <p>{subEntry.description || "Brak dodatkowego opisu."}</p>
              </>
            ) : (
              <>
                <strong>
                  <span
                    className={styles.linkButton}
                    onClick={() => setExpandedDescription(true)}
                  >
                    Opis stanowiska ▼
                  </span>
                </strong>
                <p style={{ minHeight: "1em" }}></p>
              </>
            )}
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
        {isEditing ? (
          <button className="canceledit-btn action-btn " onClick={handleCancel}>
            Anuluj
          </button>
        ) : (
          <button className="delete-btn action-btn" onClick={() => handleEntryDelete(subEntry.id)}>
            Usuń
          </button>
        )}
      </div>
    </div>
  );
}