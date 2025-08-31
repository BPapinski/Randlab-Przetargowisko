"use client";
import { useEffect, useState } from "react";
import { BarChart3, Trophy, XCircle, HelpCircle, DollarSign, Users, Building2 } from "lucide-react";
import './styles/TenderStatsSidebar.css';

export default function TenderStatsSidebar() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/stats/tender-stats/")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania statystyk:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <aside className="tender-stats-sidebar">
        <p>Ładowanie statystyk...</p>
      </aside>
    );
  }

  if (!stats) {
    return (
      <aside className="tender-stats-sidebar">
        <p>Nie udało się pobrać statystyk.</p>
      </aside>
    );
  }

  const items = [
    { label: "Przetargi ogółem", value: stats.total_tenders, icon: <BarChart3 size={18} className="icon blue" /> },
    { label: "Wygrane przetargi", value: stats.won_tenders, icon: <Trophy size={18} className="icon green" /> },
    { label: "Przegrane przetargi", value: stats.lost_tenders, icon: <XCircle size={18} className="icon red" /> },
    { label: "Nierozstrzygnięte", value: stats.unresolved_tenders, icon: <HelpCircle size={18} className="icon gray" /> },
    { label: "Średnia wartość", value: `${stats.avg_tender_value} zł`, icon: <DollarSign size={18} className="icon yellow" /> },
    { label: "Unikalni developerzy", value: stats.unique_developers, icon: <Users size={18} className="icon purple" /> },
    { label: "Klienci", value: stats.unique_clients, icon: <Building2 size={18} className="icon indigo" /> },
     { label: "Zewnętrzne firmy", value: stats.unique_developer_companies, icon: <Building2 size={18} className="icon orange" /> },

  ];

  return (
    <aside className="tender-stats-sidebar">
      <h2>📊 Statystyki przetargów</h2>
      <ul>
        {items.map((item, idx) => (
          <li key={idx} className="stat-item">
            <div className="left">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span className="value">{item.value}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
