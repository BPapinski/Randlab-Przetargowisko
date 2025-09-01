import React, { useState, useRef } from 'react';
import { AuthFetch } from '../utils/AuthFetch';
import styles from '../pages/styles/FormStyles.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.excelIcon}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <path d="M10 12h4" />
        <path d="M10 16h4" />
        <path d="M12 20h2" />
    </svg>
);

const FileXIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="16" x2="8" y2="8" />
        <line x1="8" y1="16" x2="16" y2="8" />
    </svg>
);

const fieldNames = {
    name: 'Nazwa przetargu',
    client: 'Klient',
    implementation_link: 'Link do implementacji',
    position: 'Pozycja',
    company: 'Firma',
    developer_price: 'Cena dewelopera',
    margin: 'Marża',
    description: 'Opis stanowiska',
};

const translateError = (message) => {
    const translations = {
        'This field may not be blank.': 'To pole nie może być puste.',
        'This field is required.': 'To pole jest wymagane.',
        'Enter a valid URL.': 'Wprowadź poprawny adres URL.',
        'A tender with this name already exists.': 'Przetarg o tej nazwie już istnieje.',
        'Ensure that there are no more than 4 digits before the decimal point.': 'Wartość musi mieć maksymalnie 4 cyfry przed przecinkiem.',
        'Ensure this value is greater than or equal to 0.': 'Wartość musi być większa lub równa 0.',
        'Ensure that there are no more than 12 digits in total.': 'Wartość może mieć maksymalnie 12 cyfr.',
        'Ensure that there are no more than 6 digits in total.': 'Wartość może mieć maksymalnie 6 cyfr.',
    };
    return translations[message] || message;
};

const formatErrors = (errorObject, prefix = '') => {
    let formattedErrors = [];
    if (typeof errorObject === 'string') {
        formattedErrors.push(prefix ? `${prefix}: ${translateError(errorObject)}` : translateError(errorObject));
    } else if (Array.isArray(errorObject)) {
        errorObject.forEach((item, index) => {
            formattedErrors = formattedErrors.concat(formatErrors(item, prefix || `Pozycja ${index + 1}`));
        });
    } else if (typeof errorObject === 'object') {
        Object.keys(errorObject).forEach(key => {
            const fieldName = fieldNames[key] || key;
            if (key === 'non_field_errors') {
                formattedErrors = formattedErrors.concat(formatErrors(errorObject[key], 'Błąd ogólny'));
            } else if (key === 'entries') {
                formattedErrors = formattedErrors.concat(formatErrors(errorObject[key], `Pozycja`));
            } else {
                const newPrefix = prefix ? `${prefix}: ${fieldName}` : fieldName;
                formattedErrors = formattedErrors.concat(formatErrors(errorObject[key], newPrefix));
            }
        });
    }
    return formattedErrors;
};

function TenderForm() {
    const [status, setStatus] = useState('unresolved');
    const [client, setClient] = useState('');
    const [implementationLink, setImplementationLink] = useState('');
    const [name, setName] = useState('');
    const [companies, setCompanies] = useState([]);
    const [clients, setClients] = useState([]);
    const [entries, setEntries] = useState([
        { position: '', company: '', developer_price: '', margin: '', description: '' },
    ]);
    const [errors, setErrors] = useState([]);
    const [files, setFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const navigate = useNavigate();
    const textareaRefs = useRef([]);
    const fileInputRef = useRef(null);

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
                    navigate('/login');
                    return;
                }

                const response = await AuthFetch('/api/token/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (response.status === 401 || response.status === 400) {
                    navigate('/login');
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
        if (field === 'company') {
            updated[index][field] = value ? value.value : '';
        } else {
            updated[index][field] = value;
        }
        setEntries(updated);
        if (field === 'description') {
            adjustTextareaHeight(textareaRefs.current[index]);
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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
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

    function validateURL(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        // Próba walidacji oryginalnego URL
        try {
            const validUrl = new URL(url);
            return validUrl.href;
        } catch (e) {
            // Jeśli walidacja się nie powiodła, spróbuj dodać protokół
            try {
                const tempUrl = `https://${url}`;
                const validUrl = new URL(tempUrl);
                return validUrl.href;
            } catch (e) {
                // Jeśli obie próby się nie powiodły, zwróc null
                return null;
            }
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const formattedImplementationLink = validateURL(implementationLink);

        if (implementationLink && formattedImplementationLink === false) {
            setErrors(['Link do implementacji: Wprowadź poprawny adres URL, np. www.google.com lub https://google.com']);
            return; // Przerwij wysyłanie formularza
        }


        try {
            const payload = {
                name,
                status,
                client,
                implementation_link: formattedImplementationLink,
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

            if (!response.ok) {
                const data = await response.json();
                const formattedErrors = formatErrors(data);
                setErrors(formattedErrors);
                return;
            }

            const tenderData = await response.json();
            const tenderId = tenderData.id;

            if (files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    await AuthFetch(`/api/tenders/${tenderId}/upload-file/`, {
                        method: 'POST',
                        body: formData
                    });
                }
            }

            if (response.ok) {
                setErrors(['Przetarg został utworzony!']);
                setName('');
                setClient('');
                setFiles([]);
                setImplementationLink('');
                setStatus('unresolved');
                setEntries([{ position: '', company: '', developer_price: '', margin: '', description: '' }]);
                textareaRefs.current = [];
            }
        } catch (error) {
            console.error(error);
            setErrors(['Wystąpił błąd sieci.']);
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
                    {/* Ukryte pole input dla walidacji przeglądarki */}
                    <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ opacity: 0, height: 0, padding: 0, border: 'none' }}
                        value={client || ''}
                        required
                        readOnly
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
                        type="text"
                        value={implementationLink}
                        onChange={(e) => setImplementationLink(e.target.value)}
                        onInvalid={(e) => e.target.setCustomValidity('Wprowadź poprawny adres URL, np. www.google.com lub https://google.com')}
                        onInput={(e) => e.target.setCustomValidity('')}
                        pattern="(https?:\/\/.+)|(www\..+)|(.+\..+)"
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
                                    onChange={(selectedOption) => handleEntryChange(index, 'company', selectedOption)}
                                    value={entry.company ? { value: entry.company, label: entry.company } : null}
                                />
                                <input
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, padding: 0, border: 'none' }}
                                    value={entry.company || ''}
                                    required
                                    readOnly
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

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Dodaj pliki (opcjonalnie):</label>
                    <div
                        className={`${styles.fileDropArea} ${isDragOver ? styles.fileDropAreaActive : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                        Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>
                    {files.length > 0 && (
                        <ul className={styles.fileList}>
                            {files.map((file, idx) => (
                                <li key={idx}>
                                    {file.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile(file);
                                        }}
                                        className={styles.removeFileBtn}
                                    >
                                        <FileXIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
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

                {errors.length > 0 && (
                    <ul className={styles.errorList}>
                        {errors.map((error, index) => (
                            <li key={index} className={styles.errorMessage}>
                                {error}
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
}

export default TenderForm;