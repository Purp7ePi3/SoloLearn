import { NasaAPODData } from "./types";


export async function retrieveAPOD(date: string): Promise<NasaAPODData> {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
        throw new Error("NASA_API_KEY non impostata");
    }

    const res = await fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${apiKey}`);
    
    if (!res.ok) {
        throw new Error(`Errore nella chiamata NASA: ${res.status}`);
    }
    const data: NasaAPODData = await res.json();
    return data;
}
