"use client";

import { useEffect, useState } from "react";

interface Asteroid {
  nasaId: string;
  description: string;
  href: string;
}

export default function ClosePage() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chiama l'API corretta con il parametro asteroids
    fetch('/api?asteroids=true')
      .then(res => res.json())
      .then((data) => {
        console.log("Dati ricevuti dal frontend:", data);
        console.log("Tipo di data:", typeof data);
        console.log("È un array?", Array.isArray(data));
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        if (Array.isArray(data)) {
          // Prendi solo i primi 10 asteroidi
          setAsteroids(data.slice(0, 10));
        } else {
          console.error("I dati non sono un array:", data);
          setError("Formato dati non valido ricevuto dall'API");
        }
      })
      .catch((err: unknown) => {
        console.error("Errore nella fetch:", err);
        const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento degli asteroidi.';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Caricamento asteroidi...</div>;
  if (error) return <div>Errore: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        {asteroids.map((asteroid, index) => (
          <div 
            key={asteroid.nasaId} 
            onClick={() => window.location.href = `/asteroid/${asteroid.nasaId}`}
            style={{ 
              border: "1px solid #ccc", 
              padding: "15px", 
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9e9e9";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9f9f9";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <h3>#{index + 1} - NASA ID: {asteroid.nasaId}</h3>
            <p style={{ 
              fontSize: "14px", 
              lineHeight: "1.4",
              maxHeight: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {asteroid.description.length > 200 
                ? asteroid.description.substring(0, 200) + "..." 
                : asteroid.description
              }
            </p>
            <p style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginTop: "10px",
              fontStyle: "italic"
            }}>
              Clicca per vedere la foto e i dettagli completi →
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}