import React, { useState } from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import styles from '../pages/styles/FormStyles.module.css';

// Komponent z ikoną Excela w formacie SVG
const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.excelIcon}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <path d="M10 12h4" />
        <path d="M10 16h4" />
        <path d="M12 20h2" />
    </svg>
);

function TenderForm() {
    const [name, setName] = useState('');
    const [entries, setEntries] = useState([
        { position: '', company: '', developer_price: '', margin: '' },
    ]);
    const [message, setMessage] = useState(null);

    const handleEntryChange = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
    };

    const addEntry = () => {
        setEntries([
            ...entries,
            { position: '', company: '', developer_price: '', margin: '' },
        ]);
    };

    const removeEntry = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
    };

    const handleImportFromExcel = () => {
        alert("Funkcjonalność importu z Excela zostanie dodana wkrótce!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                entries: entries.map((entry) => ({
                    ...entry,
                    developer_price: parseFloat(entry.developer_price),
                    margin: parseFloat(entry.margin),
                })),
            };

            const response = await AuthFetch('/api/tenders/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage('Przetarg został utworzony!');
                setName('');
                setEntries([{ position: '', company: '', developer_price: '', margin: '' }]);
            } else {
                const data = await response.json();
                setMessage(`Błąd: ${data.detail || 'Nie udało się zapisać przetargu.'}`);
            }
        } catch (error) {
            console.error(error);
            setMessage('Wystąpił błąd sieci.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.title}>Nowy przetarg</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Nazwa przetargu:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                {entries.map((entry, index) => (
                    <div key={index} className={styles.entryBox}>
                        <div className={styles.entryFields}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Pozycja:</label>
                                <input
                                    type="text"
                                    value={entry.position}
                                    onChange={(e) => handleEntryChange(index, 'position', e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Firma:</label>
                                <input
                                    type="text"
                                    value={entry.company}
                                    onChange={(e) => handleEntryChange(index, 'company', e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Cena dewelopera:</label>
                                <input
                                    type="number"
                                    value={entry.developer_price}
                                    onChange={(e) => handleEntryChange(index, 'developer_price', e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Marża (%):</label>
                                <input
                                    type="number"
                                    value={entry.margin}
                                    onChange={(e) => handleEntryChange(index, 'margin', e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeEntry(index)}
                            className={styles.removeBtn}
                        >
                            Usuń pozycję
                        </button>
                    </div>
                ))}
                
                <div className={styles.formActions}>
                    <button type="button" onClick={addEntry} className={styles.addBtn}>
                        Dodaj pozycję
                    </button>
                </div>
                
                <div className={styles.submitActions}>
                    <button type="submit" className={styles.submitBtn}>
                        Zapisz przetarg
                    </button>
                    <button type="button" onClick={handleImportFromExcel} className={styles.importBtn}>
                         <ExcelIcon />
                        Importuj z Excela
                    </button>
                </div>

                {message && <div className={styles.message}>{message}</div>}
            </form>
        </div>
    );
}

export default TenderForm;