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

    const [unknownPositionsCount, setUnknownPositionsCount] = useState(0);

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
                setUnknownPositionsCount(data.length);  // 👈 tutaj ustawiasz długość
            } catch (err) {
                console.error("Błąd przy pobieraniu nieznanych stanowisk:", err);
                setUnknownPositionsCount(0); // lub zostaw poprzednią wartość
            }
        };

        fetchUnknownPositions();
    }, []);

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
