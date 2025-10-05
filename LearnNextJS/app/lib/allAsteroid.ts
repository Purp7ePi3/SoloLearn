import { asteroid } from "./types";

// Interfacce per i dati NASA
interface NasaItemData {
    nasa_id: string;
    description: string;
    [key: string]: unknown;
}

interface NasaItem {
    href?: string;
    data: NasaItemData[];
    [key: string]: unknown;
}

interface NasaApiResponse {
    collection: {
        items: NasaItem[];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export async function retrievAsteroid(): Promise<asteroid[]> {
    
    const apiKey = process.env.NASA_API_KEY;
    if(!apiKey) {
        throw new Error("NASA_API_KEY non impostata");
    }

    const res = await fetch(`https://images-api.nasa.gov/search?q=asteroid&media_type=image`);
    
    if(!res.ok) {
        throw new Error(`Errore nella chiamata NASA: ${res.status}`);
    }

    const data: NasaApiResponse = await res.json();
    
    console.log("Dati ricevuti dalla NASA:", data);
    
    if (!data?.collection?.items) {
        return [];
    }
    
    const asteroids: asteroid[] = data.collection.items
        .filter((item: NasaItem) => item.data?.[0]?.nasa_id && item.data?.[0]?.description)
        .map((item: NasaItem): asteroid => ({
            nasaId: item.data[0].nasa_id,
            description: item.data[0].description,
            href: item.href || ""
        }));
    
    console.log(`Processati ${asteroids.length} asteroidi`);
    return asteroids;
}