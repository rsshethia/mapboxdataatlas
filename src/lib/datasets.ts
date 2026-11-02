import type { Feature, FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import { loadJSON } from './data';
import { topologyFeatures } from './topo';

export interface CountryRecord {
  iso3: string | null;
  name: string;
  region: string;
  income: string;
  population: number | null;
  gdpPerCapita: number | null;
  lifeExpectancy: number | null;
  landAreaKm2: number | null;
  density: number | null;
  year: number | null;
}

export interface WorldIndicators {
  generated: string;
  source: string;
  indicators: Record<string, string>;
  countries: Record<string, CountryRecord>;
}

export interface UsRecord {
  name: string;
  state?: string;
  population: number | null;
  medianIncome: number | null;
  unemploymentRate: number | null;
  landAreaKm2: number | null;
  density: number | null;
}

export interface UsIndicators {
  generated: string;
  vintage: string;
  source: string;
  license: string;
  states: Record<string, UsRecord>;
  counties: Record<string, UsRecord>;
}

export interface CityRecord {
  name: string;
  country: string;
  iso2: string;
  pop: number;
  lon: number;
  lat: number;
  rank: number | null;
  capital: boolean;
}

export interface CityDataset {
  generated: string;
  source: string;
  cities: CityRecord[];
}

export interface QuakeProperties {
  mag: number | null;
  place: string;
  time: number;
  depth: number | null;
  url: string;
  year?: number | null;
}

export type QuakeCollection = FeatureCollection<GeoJSON.Point, QuakeProperties> & {
  generated?: string;
  source?: string;
};

export interface FlightRoute {
  from: [number, number];
  to: [number, number];
  fromIata: string;
  toIata: string;
  fromName: string;
  toName: string;
  fromCountry: string;
  toCountry: string;
  count: number;
  distanceKm: number;
}

export interface FlightAirport {
  id: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  lon: number;
  lat: number;
}

export interface FlightDataset {
  generated: string;
  source: string;
  note: string;
  routes: FlightRoute[];
  airports: FlightAirport[];
}

export interface RouteProperties {
  name: string;
  distanceKm: number | null;
  durationHours: number | null;
}

export type RouteDataset = Feature<GeoJSON.LineString, RouteProperties> & {
  generated?: string;
  source?: string;
  fallback?: boolean;
};

export function loadWorldIndicators(): Promise<WorldIndicators> {
  return loadJSON<WorldIndicators>('world/indicators.json');
}

export function loadUsIndicators(): Promise<UsIndicators> {
  return loadJSON<UsIndicators>('us/indicators.json');
}

export function loadCities(): Promise<CityDataset> {
  return loadJSON<CityDataset>('cities.json');
}

export function loadQuakes(which: 'recent' | 'history'): Promise<QuakeCollection> {
  return loadJSON<QuakeCollection>(`quakes/${which}.geojson`);
}

export function loadFlights(): Promise<FlightDataset> {
  return loadJSON<FlightDataset>('flights/routes.json');
}

export function loadRoute(): Promise<RouteDataset> {
  return loadJSON<RouteDataset>('routes/west-coast.json');
}

/** Join country indicator records onto the Natural Earth world topology. */
export function countryFeatures(
  topology: Topology,
  countries: Record<string, CountryRecord>,
): FeatureCollection {
  const collection = topologyFeatures(topology, 'countries');
  for (const item of collection.features) {
    const record = countries[String(item.id ?? '')];
    if (record) item.properties = { ...record };
  }
  return collection;
}
