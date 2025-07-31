import React, { useState } from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import styles from '../pages/styles/FormStyles.module.css'; // opcjonalne style

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
                        {/* Nowy kontener dla pól formularza */}
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

                <button type="button" onClick={addEntry} className={styles.addBtn}>
                    Dodaj pozycję
                </button>

                <button type="submit" className={styles.submitBtn}>
                    Zapisz przetarg
                </button>

                {message && <div className={styles.message}>{message}</div>}
            </form>
        </div>
    );
}

export default TenderForm;
