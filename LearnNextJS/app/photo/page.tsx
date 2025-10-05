"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NasaAPODData } from "../lib/types";

export default function PhotoPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [data, setData] = useState<NasaAPODData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    setLoading(true);
    setError(null);

    fetch(`/api?date=${date}`)
      .then(res => res.json())
      .then((json: NasaAPODData) => {
        setData(json);
      })
      .catch((err: unknown) => {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dei dati.';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "20px" }}>
      
      {/* Calendario sempre visibile in alto */}
      <div style={{ alignSelf: "center", marginBottom: "20px" }}>
       <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="appearance-native p-2 text-base"
        max={today}
      />
      </div>

      {/* Contenuto centrato nello spazio rimanente */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px" }}>
        {loading && <h1>Loading...</h1>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {data && !loading && !error && (
          <>
            <h1>{data.title}</h1>

            {data.media_type === "image" ? (
              <div style={{ position: "relative", maxWidth: "80%", height: "auto" }}>
                <Image 
                  src={data.url} 
                  alt={data.title} 
                  width={800}
                  height={600}
                  style={{ borderRadius: "10px", width: "100%", height: "auto" }}
                  priority
                />
              </div>
            ) : data.media_type === "video" ? (
              <iframe 
                src={data.url} 
                title={data.title} 
                style={{ width: "80%", height: "450px", border: "none" }} 
                allowFullScreen
              />
            ) : (
              <p>Media non disponibile</p>
            )}

            {data.explanation && <p style={{ maxWidth: "600px", textAlign: "justify" }}>{data.explanation}</p>}
          </>
        )}
      </div>
    </div>
  );
}