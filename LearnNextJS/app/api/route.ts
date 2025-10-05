import { retrieveAPOD } from "../lib/APODData";
import { retrievAsteroid } from "../lib/allAsteroid";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const { searchParams, pathname } = url;
        
        console.log("Full URL:", req.url);
        console.log("Pathname:", pathname);
        console.log("SearchParams:", Object.fromEntries(searchParams));
        
        const asteroidId = searchParams.get("asteroid_id");
        if (asteroidId) {
            console.log("Recupero dettagli asteroide per ID:", asteroidId);
            
            interface NasaLink {
                href: string;
                rel: string;
                render: string;
                [key: string]: unknown;
            }
            
            interface NasaItemData {
                nasa_id: string;
                title: string;
                description: string;
                date_created: string;
                center: string;
                [key: string]: unknown;
            }
            
            interface NasaItem {
                data: NasaItemData[];
                links?: NasaLink[];
                [key: string]: unknown;
            }
            
            interface NasaDetailResponse {
                collection: {
                    items: NasaItem[];
                    [key: string]: unknown;
                };
                [key: string]: unknown;
            }
            
            try {
                const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${asteroidId}`);
                if (!response.ok) {
                    throw new Error(`Errore nella chiamata NASA: ${response.status}`);
                }
                
                const data: NasaDetailResponse = await response.json();
                
                if (!data?.collection?.items?.[0]) {
                    return NextResponse.json({ error: "Asteroide non trovato" }, { status: 404 });
                }
                
                const item = data.collection.items[0];
                const asteroidData = item.data[0];
                const imageLink = item.links?.find((link: NasaLink) => link.render === "image");
                
                const asteroidDetail = {
                    nasaId: asteroidData.nasa_id,
                    title: asteroidData.title || "Titolo non disponibile",
                    description: asteroidData.description || "Descrizione non disponibile",
                    imageUrl: imageLink?.href || "",
                    date_created: asteroidData.date_created || "",
                    center: asteroidData.center || "NASA"
                };
                
                return NextResponse.json(asteroidDetail);
            } catch (error) {
                console.error("Errore nel recupero dettagli asteroide:", error);
                return NextResponse.json({ error: "Errore nel recupero dettagli" }, { status: 500 });
            }
        }
        
        const asteroidsParam = searchParams.get("asteroids");
        console.log("Asteroids param:", asteroidsParam);
        
        if (asteroidsParam === "true") {
            console.log("Sono qui dentro - recupero asteroidi");
            
            const data = await retrievAsteroid();
            
            console.log("Dati asteroidi recuperati:", data.length, "asteroidi");
            return NextResponse.json(data);
        }
        
        const date = searchParams.get("date");
        if (!date) {
            return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
        }
        
        const data = await retrieveAPOD(date);
        return NextResponse.json(data);
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}