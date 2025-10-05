export interface NasaAPODData {
  date: string;
  explanation: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
  copyright?: string;
}

export interface asteroid {
  nasaId: string;
  description: string;
  href: string;
}