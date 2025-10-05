"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";

interface AsteroidDetail {
  nasaId: string;
  title: string;
  description: string;
  imageUrl: string;
  date_created: string;
  center: string;
}

export default function AsteroidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [asteroid, setAsteroid] = useState<AsteroidDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api?asteroid_id=${resolvedParams.id}`)
      .then(res => res.json())
      .then((data) => {
        console.log("Dettagli asteroide ricevuti:", data);
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        setAsteroid(data);
      })
      .catch((err: unknown) => {
        console.error("Errore nel caricamento dettagli asteroide:", err);
        const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento.';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) return <div style={{ padding: "20px" }}>Caricamento dettagli asteroide...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>Errore: {error}</div>;
  if (!asteroid) return <div style={{ padding: "20px" }}>Asteroide non trovato</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Bottone torna indietro */}
      <button 
        onClick={() => window.history.back()}
        style={{ 
          marginBottom: "20px", 
          padding: "10px 15px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        ← Torna alla lista
      </button>

      <h1>{asteroid.title}</h1>
      
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
        <p><strong>NASA ID:</strong> {asteroid.nasaId}</p>
        <p><strong>Centro:</strong> {asteroid.center}</p>
        <p><strong>Data creazione:</strong> {new Date(asteroid.date_created).toLocaleDateString()}</p>
      </div>

      {/* Immagine dell'asteroide */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <Image
          src={asteroid.imageUrl}
          alt={asteroid.title}
          width={600}
          height={400}
          style={{ 
            borderRadius: "10px", 
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            maxWidth: "100%",
            height: "auto"
          }}
          priority
        />
      </div>

      {/* Descrizione completa */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "20px", 
        borderRadius: "8px",
        lineHeight: "1.6"
      }}>
        <p>{asteroid.description}</p>
      </div>
    </div>
  );
}