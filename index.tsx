import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- SVG Icons ---
const PowerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const EuroIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M4 14h12M19 6a7.7 7.7 0 00-5.2-2A7.9 7.9 0 006 12c0 4.4 3.5 8 7.8 8 2.2 0 4.2-1 5.5-2.5"></path></svg>
);

const App = () => {
  const [power, setPower] = useState(100); // Watts
  const [usage, setUsage] = useState(8); // Toujours en heures
  const [cost, setCost] = useState(0.25); // cost per kWh
  const [usageUnit, setUsageUnit] = useState('hours'); // 'hours' or 'minutes'
  
  const results = useMemo(() => {
    const usageInHours = usage;

    if (power <= 0 || cost <= 0) {
      return { hour: 0, day: 0, week: 0, month: 0, year: 0, dailySummary: 0 };
    }
    
    const powerInKw = power / 1000;
    const costPerHour = powerInKw * cost;
    
    // Calcul pour la carte de résumé, basé sur l'usage réel de l'utilisateur.
    const costPerDaySummary = costPerHour * usageInHours;
    
    // Calculs pour la grille de détails, basés sur une utilisation continue (24h/jour).
    const costPerDayDetails = costPerHour * 24;
    const costPerWeekDetails = costPerDayDetails * 7;
    const costPerMonthDetails = costPerDayDetails * 30.44; // Jours moyens dans un mois
    const costPerYearDetails = costPerDayDetails * 365.25; // Prend en compte les années bissextiles
    
    return {
      hour: costPerHour,
      dailySummary: costPerDaySummary,
      day: costPerDayDetails,
      week: costPerWeekDetails,
      month: costPerMonthDetails,
      year: costPerYearDetails,
    };
  }, [power, usage, cost]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);
  
  return (
    <>
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .app-header {
          text-align: center;
        }
        .app-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-color);
        }
        .app-header p {
          color: var(--text-secondary-color);
          margin-top: 0.5rem;
        }
        .card {
          background-color: var(--surface-color);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .input-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .input-group .icon {
          color: var(--primary-color);
          flex-shrink: 0;
        }
        .input-group .control {
          flex-grow: 1;
        }
        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary-color);
          margin-bottom: 0.5rem;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }
        .input-wrapper:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
        }
        .input-group input {
          flex-grow: 1;
          min-width: 0;
          background: transparent;
          border: none;
          color: var(--text-color);
          font-size: 1.1rem;
          padding: 0.75rem;
          outline: none;
        }
        .unit-switcher {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0 4px;
            flex-shrink: 0;
        }
        .unit-switcher button {
            background-color: transparent;
            border: none;
            color: var(--text-secondary-color);
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s, color 0.2s;
            border-radius: 6px;
            white-space: nowrap;
        }
        .unit-switcher button:hover:not(.active) {
            background-color: rgba(255, 255, 255, 0.05);
        }
        .unit-switcher button.active {
            background-color: var(--primary-color);
            color: var(--background-color);
            font-weight: 500;
        }
        .summary-card {
            text-align: center;
            padding: 2rem 1.5rem;
        }
        .summary-card h2 {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-secondary-color);
            margin-bottom: 0.5rem;
        }
        .summary-card .value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            line-height: 1.2;
        }
        .results-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
        }
        .result-card {
          background-color: var(--background-color);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          text-align: center;
        }
        .result-card h3 {
          color: var(--text-secondary-color);
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .result-card .value {
          color: var(--primary-color);
          font-size: 1.75rem;
          font-weight: 700;
        }
      `}</style>

      <div className="app-container">
        <header className="app-header">
          <h1>Calculateur Électrique</h1>
          <p>Estimez les coûts de consommation de vos appareils.</p>
        </header>
        
        <main>
          <section className="card input-section">
            <div className="input-group">
              <div className="icon"><PowerIcon /></div>
              <div className="control">
                <label htmlFor="power">Puissance de l'appareil</label>
                <div className="input-wrapper">
                  <input id="power" type="number" value={power} onChange={(e) => setPower(Math.max(0, Number(e.target.value)))} min="0" />
                  <span className="input-unit" style={{ paddingRight: '0.75rem', color: 'var(--text-secondary-color)' }}>Watts</span>
                </div>
              </div>
            </div>
            
            <div className="input-group">
              <div className="icon"><ClockIcon /></div>
              <div className="control">
                <label htmlFor="usage">Temps d'utilisation par jour</label>
                <div className="input-wrapper">
                  <input
                    id="usage"
                    type="number"
                    value={usageUnit === 'hours' ? usage : Number((usage * 60).toFixed(2))}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      if (usageUnit === 'hours') {
                        setUsage(Math.min(24, value));
                      } else {
                        setUsage(Math.min(1440, value) / 60);
                      }
                    }}
                    min="0"
                  />
                  <div className="unit-switcher">
                    <button className={usageUnit === 'hours' ? 'active' : ''} onClick={() => setUsageUnit('hours')}>Heures</button>
                    <button className={usageUnit === 'minutes' ? 'active' : ''} onClick={() => setUsageUnit('minutes')}>Minutes</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="input-group">
              <div className="icon"><EuroIcon /></div>
              <div className="control">
                <label htmlFor="cost">Coût du kWh</label>
                <div className="input-wrapper">
                  <input id="cost" type="number" value={cost} onChange={(e) => setCost(Math.max(0, Number(e.target.value)))} min="0" step="0.01" />
                   <span className="input-unit" style={{ paddingRight: '0.75rem', color: 'var(--text-secondary-color)' }}>€</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card summary-card">
            <h2>Coût journalier pour votre utilisation</h2>
            <p className="value">{formatCurrency(results.dailySummary)}</p>
          </section>

          <section className="results-section">
            <h2>Projections (utilisation 24/7)</h2>
            <div className="results-grid">
               <div className="result-card">
                <h3>Par Heure</h3>
                <p className="value">{formatCurrency(results.hour)}</p>
              </div>
              <div className="result-card">
                <h3>Par Jour</h3>
                <p className="value">{formatCurrency(results.day)}</p>
              </div>
              <div className="result-card">
                <h3>Par Semaine</h3>
                <p className="value">{formatCurrency(results.week)}</p>
              </div>
              <div className="result-card">
                <h3>Par Mois</h3>
                <p className="value">{formatCurrency(results.month)}</p>
              </div>
              <div className="result-card">
                <h3>Par An</h3>
                <p className="value">{formatCurrency(results.year)}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}