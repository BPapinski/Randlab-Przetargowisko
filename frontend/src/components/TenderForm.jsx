import React, { useState, useRef } from 'react'; // Dodajemy useRef
import { AuthFetch } from '../utils/AuthFetch';
import styles from '../pages/styles/FormStyles.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';


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
    const [status, setStatus] = useState('unresolved'); // domyślny status
    const [client, setClient] = useState('');
    const [implementationLink, setImplementationLink] = useState('');
    const [name, setName] = useState('');
    const [companies, setCompanies] = useState([]);
    const [clients, setClients] = useState([]);
    const [entries, setEntries] = useState([
        { position: '', company: '', developer_price: '', margin: '', description: '' }, // Dodajemy 'description'
    ]);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const [company, setCompany] = useState(null); // Nowy stan dla firmy

    // Refy dla textarea, aby móc dynamicznie zmieniać ich wysokość
    const textareaRefs = useRef([]);


    const clientOptions = [
    { value: null, label: 'Wszyscy klienci' },
    ...clients.map(client => ({
        value: client,
        label: client,
    }))
    ];

    const companyOptions = [
    ...companies.map(company => ({
        value: company,
        label: company,
    }))
    ];

    useEffect(() => {
        const fetchData = async () => {
          try {
            const [companiesRes, clientsRes] = await Promise.all([
              AuthFetch("/api/companies/"),
              AuthFetch("/api/clients/"),
            ]);
            const companiesData = await companiesRes.json();
            const clientsData = await clientsRes.json();
            setCompanies(companiesData);
            setClients(clientsData);
    
          } catch (error) {
            console.error("Failed to fetch data:", error);
            setCompanies([]);
            setClients([]);
          }
        };
        fetchData();
    }, []);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.log('No token found, redirecting to /login');
                    navigate('/login');
                    return;
                }

                const response = await AuthFetch('/api/token/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (response.status === 401 || response.status === 400) {
                    console.log('Invalid or missing token, redirecting to /login');
                    navigate('/login');
                    // return; // Niepotrzebne, navigate już przekierowuje
                }
            } catch (error) {
                console.error('Auth check error:', error);
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);
    const adjustTextareaHeight = (textarea) => {
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    const handleEntryChange = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
        if (field === 'description') {
            adjustTextareaHeight(textareaRefs.current[index]);
        }
    };

    const handleCompanyChange = (selectedOption) => {
        if (selectedOption) {
            setCompany(selectedOption.value);
        } else {
            setCompany(null);
        }
    };

    const addEntry = () => {
        setEntries([
            ...entries,
            { position: '', company: '', developer_price: '', margin: '', description: '' }, 
        ]);
        setTimeout(() => {
            const lastTextarea = textareaRefs.current[textareaRefs.current.length - 1];
            if (lastTextarea) {
                lastTextarea.focus();
                adjustTextareaHeight(lastTextarea); 
            }
        }, 0);
    };

    const removeEntry = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
        textareaRefs.current.splice(index, 1);
    };

    const handleClientChange = (selectedOption) => {
        if (selectedOption) {
        setClient(selectedOption.value);
        } else {
        setClient(null);
        }
    };

    const handleImportFromExcel = () => {
        alert("Funkcjonalność importu z Excela zostanie dodana wkrótce!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                status,
                client,
                implementation_link: implementationLink,
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
                setClient('');
                setImplementationLink(''); 
                setStatus('unresolved');
                setEntries([{ position: '', company: '', developer_price: '', margin: '', description: '' }]);
                textareaRefs.current = [];
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
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Klient:</label>
                    <CreatableSelect
                        options={clientOptions}
                        placeholder="Wybierz lub wpisz klienta..."
                        isClearable
                        onChange={handleClientChange}
                        value={client ? { value: client, label: client } : null}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={styles.input}
                        required
                    >
                        <option value="unresolved">Nierozstrzygnięty</option>
                        <option value="won">Wygrany</option>
                        <option value="lost">Przegrany</option>
                    </select>
                </div>

            
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Link do implementacji (opcjonalny):</label>
                    <input
                        type="url"
                        value={implementationLink}
                        onChange={(e) => setImplementationLink(e.target.value)}
                        className={styles.input}
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
                                
                                <CreatableSelect
                                    options={companyOptions}
                                    placeholder="Wybierz/wpisz firme..."
                                    isClearable
                                    onChange={handleCompanyChange}
                                    value={entry.company ? { value: entry.company, label: entry.company } : null}
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
                            <div className={`${styles.fieldGroup} ${styles.descriptionField}`}> 
                                <label className={styles.label}>Opis stanowiska:</label>
                                <textarea
                                    ref={el => (textareaRefs.current[index] = el)} 
                                    value={entry.description} 
                                    onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                                    className={styles.textareaAutosize} 
                                    rows="1" 
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