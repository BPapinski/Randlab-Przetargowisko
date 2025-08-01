import React, { useEffect, useState } from "react";
import { AuthFetch } from "../utils/AuthFetch";
import Header from "../components/Header";
import styles from "../pages/styles/AliasFilterPage.module.css"; // Adjust the path as necessary


export default function AliasFilterPage() {
    const [aliasGroups, setAliasGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [tenderEntries, setTenderEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available alias groups
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

    // Fetch matching entries when group is selected
    useEffect(() => {
        const fetchEntries = async () => {
            if (!selectedGroup) return;
            setLoading(true);
            try {
                const res = await AuthFetch(`/api/aliases/tender-entries/?position=${encodeURIComponent(selectedGroup)}`);
                if (!res.ok) throw new Error("Failed to fetch tender entries");
                const data = await res.json();
                setTenderEntries(data);
                setError(null);
            } catch (err) {
                setError("Błąd przy pobieraniu przetargów.");
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [selectedGroup]);

    return (
        <>
            <Header />
            <div className="container">
                <h1 className="main-title">Filtruj przetargi według stanowiska</h1>

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
                    </select>
                </div>

                {loading && <p>Ładowanie wyników...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

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
