import React, { useEffect, useState } from "react";
import { AuthFetch } from "../utils/AuthFetch";
import Header from "../components/Header";
import styles from "../pages/styles/AliasFilterPage.module.css"; // Adjust the path as necessary



export default function AliasFilterPage() {
    const [aliasGroups, setAliasGroups] = useState([]);
    const [aliases, setAliases] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [tenderEntries, setTenderEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [unknownPositionsCount, setUnknownPositionsCount] = useState(0);

    const [aliasInput, setAliasInput] = useState({});

    const handleAliasInputChange = (entryId, value) => {
        setAliasInput(prev => ({
            ...prev,
            [entryId]: value
        }));
    };

    const handleAliasSubmit = async (e, entryId, entryPosition) => {
        e.preventDefault();
        const aliasGroupName = aliasInput[entryId];
        if (!aliasGroupName) {
            setError('Nazwa aliasu nie może być pusta!');
            return;
        }
        try {
            const response = await AuthFetch('/api/aliases/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alias_group_name: aliasGroupName,
                    entry_position: entryPosition
                })
            });

            const data = await response.json();

            if (response.ok) {
                setTenderEntries(prevEntries =>
                    prevEntries.filter(entry => entry.position !== entryPosition)
                );

                setUnknownPositionsCount(prevCount =>
                    Math.max(prevCount - tenderEntries.filter(entry => entry.position === entryPosition).length, 0)
                );

                setAliasGroups(prevGroups => {
                    if (!prevGroups.includes(aliasGroupName)) {
                        return [...prevGroups, aliasGroupName];
                    }
                    return prevGroups;
                });

                setAliasInput(prevInput => {
                    const newInput = { ...prevInput };
                    for (const entry of tenderEntries) {
                        if (entry.position === entryPosition) {
                            delete newInput[entry.id];
                        }
                    }
                    return newInput;
                });

            } else {
                setError(`Błąd: ${data.error}`);
            }
        } catch (error) {
            setError('Wystąpił błąd podczas komunikacji z serwerem.');
            console.error('API Error:', error);
        }
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await AuthFetch("/api/aliases/groups/");
                if (!res.ok) throw new Error("Failed to fetch alias groups");
                const data = await res.json();
                setAliasGroups(data);
            } catch (err) {
                setError("Błąd przy pobieraniu grup aliasów.");
            }
        };
        fetchGroups();
    }, []);


    useEffect(() => {
        const fetchAliases = async () => {
            try {
                const res = await AuthFetch("/api/aliases/getaliases/");
                if (!res.ok) throw new Error("Failed to fetch aliases");
                const data = await res.json();
                setAliases(data);
            } catch (err) {
                setError("Błąd przy pobieraniu grup aliasów.");
            }
        };
        fetchAliases();
    }, []);

    useEffect(() => {
        const fetchEntries = async () => {
            if (!selectedGroup) return;

            setLoading(true);
            setError(null);

            const positionParam = selectedGroup === "Nieznane" ? "None" : encodeURIComponent(selectedGroup);
            const url = `/api/aliases/tender-entries/?position=${positionParam}`;

            try {
                const res = await AuthFetch(url);
                if (!res.ok) throw new Error("Failed to fetch tender entries");
                const data = await res.json();
                setTenderEntries(data);
            } catch (err) {
                setError("Błąd przy pobieraniu przetargów.");
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [selectedGroup]);

    useEffect(() => {
        const fetchUnknownPositions = async () => {
            try {
                const res = await AuthFetch("/api/aliases/tender-entries/?position=None");
                if (!res.ok) throw new Error("Failed to fetch unknown positions");
                const data = await res.json();
                setUnknownPositionsCount(data.length);
            } catch (err) {
                console.error("Błąd przy pobieraniu nieznanych stanowisk:", err);
                setUnknownPositionsCount(0);
            }
        };

        fetchUnknownPositions();
    }, []);

    useEffect(() => {
        if (error) {
            window.scrollTo({ top: 0, behavior: "smooth" });

            const timer = setTimeout(() => {
                setError(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [error]);
    
    return (
        <>
            <Header />
            <div className="container">
                <h1 className="main-title">Filtruj przetargi według stanowiska</h1>

                {unknownPositionsCount > 0 && (
                    <p style={{ color: "#b65c00", marginTop: "0.5rem" }}>
                        Uwaga: <strong>{unknownPositionsCount}</strong> pozycji nie pasuje do żadnego filtra — znajdziesz je, wybierając stanowisko <em>"Nieznane"</em>.
                    </p>
                )}

                <div className="pagination-controls">
                    <label htmlFor="alias-group-select">Wybierz stanowisko:</label>
                    <select
                        id="alias-group-select"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="tenders-per-page-select"
                    >
                        <option value="">-- Wybierz --</option>
                        {aliasGroups.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                        <option key={"Nieznane"} value={"Nieznane"}>
                            {"Nieznane"}
                        </option>
                    </select>
                </div>

                {loading && <p>Ładowanie wyników...</p>}
                {error && <div className={styles.errorBox}>{error}</div>}

                {!loading && selectedGroup && (
                    <div>
                        <h2 style={{ marginTop: "2rem" }}>
                            Przetargi dla: <em>{selectedGroup}</em>
                        </h2>
                        {tenderEntries.length === 0 ? (
                            <p>Brak wyników.</p>
                        ) : (
                            <div className={styles.cardGrid}>
                                {tenderEntries.map((entry) => (
                                    <div key={entry.id} className={styles.card}>
                                        <h3 className={styles.cardTitle}>{entry.position}</h3>
                                        <p><strong>Firma:</strong> {entry.company}</p>
                                        <p><strong>Cena deweloperska:</strong> {entry.developer_price} zł</p>
                                        <p><strong>Marża:</strong> {entry.margin}%</p>
                                        <p><strong>Cena całkowita:</strong> {entry.total_price} zł</p>
                                        <p className={styles.timestamp}>
                                            Dodano: {new Date(entry.created_at).toLocaleString()}
                                        </p>
                                        {selectedGroup === "Nieznane" ? (
                                            <div className={styles.unknownSection}>
                                                <p>
                                                    Ta pozycja jest oznaczona jako "Nieznana". Przypisz ją do aliasu:
                                                </p>
                                                <form onSubmit={(e) => handleAliasSubmit(e, entry.id, entry.position)} className={styles.aliasForm}>
                                                    <input
                                                        type="text"
                                                        value={aliasInput[entry.id] || ''}
                                                        onChange={(e) => handleAliasInputChange(entry.id, e.target.value)}
                                                        placeholder="Wpisz lub wybierz nazwę aliasu"
                                                        list={`alias-options-${entry.id}`}
                                                        className={styles.aliasInput}
                                                    />
                                                    <datalist id={`alias-options-${entry.id}`}>
                                                        {aliasGroups.map(alias => (
                                                            <option key={alias} value={alias} />
                                                        ))}
                                                    </datalist>
                                                    <button type="submit" className={styles.aliasButton}>Zapisz</button>
                                                </form>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}