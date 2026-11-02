import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import area from '@turf/area';
import simplify from '@turf/simplify';
import countries from 'world-countries';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'data');
const GENERATED = new Date().toISOString().slice(0, 10);

const worldTopo = require('world-atlas/countries-110m.json');
const statesTopo = require('us-atlas/states-10m.json');
const countiesTopo = require('us-atlas/counties-10m.json');

function log(message) {
  process.stdout.write(`• ${message}\n`);
}

async function writeJSON(relativePath, data, pretty = false) {
  const file = path.join(OUT, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
  const size = (await fs.stat(file)).size;
  log(`${relativePath} (${(size / 1024).toFixed(0)} KB)`);
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'mapbox-data-atlas/1.0 (data preparation)' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw new Error(`Request failed: ${url} (${lastError?.message ?? 'unknown'})`);
}

async function fetchJSON(url) {
  const response = await fetchWithRetry(url);
  return response.json();
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  return response.text();
}

function round(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Number(Number(value).toFixed(digits));
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function haversineKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

async function prepareWorld() {
  await writeJSON('world/countries.topo.json', worldTopo);

  log('World Bank country metadata');
  const metaPayload = await fetchJSON(
    'https://api.worldbank.org/v2/country?format=json&per_page=400',
  );
  const countryMeta = new Map();
  for (const row of metaPayload[1] ?? []) {
    if (!row.id || row.region?.value === 'Aggregates') continue;
    countryMeta.set(row.id, {
      name: row.name,
      region: row.region?.value ?? 'Other',
      income: row.incomeLevel?.value ?? 'Not classified',
    });
  }

  const indicators = {
    population: 'SP.POP.TOTL',
    gdpPerCapita: 'NY.GDP.PCAP.CD',
    lifeExpectancy: 'SP.DYN.LE00.IN',
    landAreaKm2: 'AG.LND.TOTL.K2',
  };

  const latest = new Map();
  for (const [key, code] of Object.entries(indicators)) {
    log(`World Bank ${key} (${code})`);
    const payload = await fetchJSON(
      `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&per_page=20000&date=2015:2024`,
    );
    latest.set(key, new Map());
    for (const row of payload[1] ?? []) {
      if (row.value == null || !row.countryiso3code) continue;
      const year = Number(row.date);
      const entry = latest.get(key).get(row.countryiso3code);
      if (!entry || year > entry.year) {
        latest.get(key).set(row.countryiso3code, { value: Number(row.value), year });
      }
    }
  }

  const numericToIso = new Map(countries.map((country) => [country.ccn3, country.cca3]));
  const result = {};
  for (const geometry of worldTopo.objects.countries.geometries) {
    const id = String(geometry.id);
    const iso3 = numericToIso.get(id);
    const meta = iso3 ? countryMeta.get(iso3) : undefined;
    const values = {};
    let latestYear = 0;
    for (const key of Object.keys(indicators)) {
      const entry = iso3 ? latest.get(key)?.get(iso3) : undefined;
      values[key] = entry?.value == null ? null : round(entry.value, key === 'landAreaKm2' ? 0 : 2);
      if (entry?.year) latestYear = Math.max(latestYear, entry.year);
    }
    result[id] = {
      iso3: iso3 ?? null,
      name: meta?.name ?? geometry.properties?.name ?? 'Unknown',
      region: meta?.region ?? 'Other',
      income: meta?.income ?? 'Not classified',
      ...values,
      density:
        values.population && values.landAreaKm2
          ? round(values.population / values.landAreaKm2, 2)
          : null,
      year: latestYear || null,
    };
  }

  await writeJSON(
    'world/indicators.json',
    {
      generated: GENERATED,
      source: 'World Bank World Development Indicators',
      indicators: {
        population: 'Total population',
        gdpPerCapita: 'GDP per capita (current US$)',
        lifeExpectancy: 'Life expectancy at birth (years)',
        landAreaKm2: 'Land area (sq. km)',
        density: 'Population density (people per sq. km)',
      },
      countries: result,
    },
    true,
  );
}

async function prepareUnitedStates() {
  await writeJSON('us/states.topo.json', statesTopo);
  await writeJSON('us/counties.topo.json', countiesTopo);

  const stateFeatures = feature(statesTopo, statesTopo.objects.states).features;
  const countyFeatures = feature(countiesTopo, countiesTopo.objects.counties).features;
  const stateArea = new Map(
    stateFeatures.map((item) => [String(item.id), round(area(item) / 1e6, 1)]),
  );
  const countyArea = new Map(
    countyFeatures.map((item) => [String(item.id), round(area(item) / 1e6, 2)]),
  );

  log('County Health Rankings state and county indicators');
  const rankingText = await fetchText(
    'https://www.countyhealthrankings.org/sites/default/files/media/document/analytic_data2025.csv',
  );
  const rankingLines = rankingText.split(/\r?\n/);
  const rankingHeaders = parseCsvLine(rankingLines[1] ?? '');
  const column = (name) => rankingHeaders.indexOf(name);
  const columns = {
    fips: column('fipscode'),
    stateAbbr: column('state'),
    county: column('county'),
    countyCode: column('countycode'),
    population: column('v051_rawvalue'),
    medianIncome: column('v063_rawvalue'),
    unemployment: column('v023_rawvalue'),
  };

  const parseRows = (text) => {
    const lines = text.split(/\r?\n/);
    const headers = parseCsvLine(lines[1] ?? '');
    return lines.slice(2).map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    });
  };

  const numberOrNull = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  };

  const rows = parseRows(rankingText);
  const stateNames = new Map();

  const states = {};
  for (const row of rows) {
    if (row.countycode !== '000') continue;
    const fips = String(row.fipscode).padStart(2, '0').slice(0, 2);
    if (fips === '00') continue;
    const population = numberOrNull(row.v051_rawvalue);
    const landAreaKm2 = stateArea.get(fips) ?? null;
    stateNames.set(row.state, row.county);
    states[fips] = {
      name: row.county,
      population,
      medianIncome: numberOrNull(row.v063_rawvalue),
      unemploymentRate:
        row.v023_rawvalue == null ? null : round(Number(row.v023_rawvalue) * 100, 1),
      landAreaKm2,
      density: population && landAreaKm2 ? round(population / landAreaKm2, 1) : null,
    };
  }

  const counties = {};
  for (const row of rows) {
    if (row.countycode === '000') continue;
    const fips = String(row.fipscode).padStart(5, '0');
    const population = numberOrNull(row.v051_rawvalue);
    const landAreaKm2 = countyArea.get(fips) ?? null;
    counties[fips] = {
      name: row.county,
      state: stateNames.get(row.state) ?? row.state,
      population,
      medianIncome: numberOrNull(row.v063_rawvalue),
      unemploymentRate:
        row.v023_rawvalue == null ? null : round(Number(row.v023_rawvalue) * 100, 1),
      landAreaKm2,
      density: population && landAreaKm2 ? round(population / landAreaKm2, 2) : null,
    };
  }

  await writeJSON(
    'us/indicators.json',
    {
      generated: GENERATED,
      vintage: '2025 County Health Rankings',
      source:
        'County Health Rankings & Roadmaps, University of Wisconsin Population Health Institute (compiled from ACS and BLS)',
      license: 'Free to use with attribution',
      states,
      counties,
    },
    true,
  );
}

async function prepareCities() {
  log('Natural Earth populated places');
  const payload = await fetchJSON(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places.geojson',
  );
  const cities = [];
  for (const item of payload.features) {
    const properties = item.properties ?? {};
    const coordinates = item.geometry?.coordinates ?? [];
    const population = Number(properties.POP_MAX);
    if (!Number.isFinite(population) || population <= 0) continue;
    if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) continue;
    cities.push({
      name: properties.NAME ?? properties.NAMEPAR ?? 'Unknown',
      country: properties.ADM0NAME ?? '',
      iso2: properties.ISO_A2 ?? '',
      pop: Math.round(population),
      lon: round(coordinates[0], 4),
      lat: round(coordinates[1], 4),
      rank: Number(properties.SCALERANK) || null,
      capital: String(properties.CAPITAL ?? '').includes('Admin-0 capital'),
    });
  }
  cities.sort((a, b) => b.pop - a.pop);
  await writeJSON(
    'cities.json',
    {
      generated: GENERATED,
      source: 'Natural Earth 1:50m populated places',
      cities,
    },
  );
  log(`${cities.length} cities`);
}

function normalizeQuake(item, includeYear = false) {
  const properties = item.properties ?? {};
  const coordinates = item.geometry?.coordinates ?? [];
  const time = Number(properties.time);
  const feature = {
    type: 'Feature',
    id: item.id ?? properties.ids ?? undefined,
    properties: {
      mag: properties.mag == null ? null : round(properties.mag, 1),
      place: properties.place ?? 'Unknown location',
      time,
      depth: coordinates[2] == null ? null : round(coordinates[2], 1),
      url: properties.url ?? '',
    },
    geometry: {
      type: 'Point',
      coordinates: [round(coordinates[0], 4), round(coordinates[1], 4)],
    },
  };
  if (includeYear) {
    feature.properties.year = Number.isFinite(time) ? new Date(time).getUTCFullYear() : null;
  }
  return feature;
}

async function prepareQuakes() {
  log('USGS recent earthquakes');
  const recent = await fetchJSON(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson',
  );
  await writeJSON('quakes/recent.geojson', {
    type: 'FeatureCollection',
    generated: GENERATED,
    features: recent.features.map((item) => normalizeQuake(item)),
  });

  log('USGS earthquake history (M6+, 2000–2026)');
  const history = await fetchJSON(
    'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2000-01-01&endtime=2026-11-01&minmagnitude=6&orderby=time&limit=20000',
  );
  await writeJSON('quakes/history.geojson', {
    type: 'FeatureCollection',
    generated: GENERATED,
    source: 'USGS Earthquake Hazards Program, ANSS Comprehensive Catalog',
    features: history.features.map((item) => normalizeQuake(item, true)),
  });
  log(`${history.features.length} historical earthquakes`);
}

async function prepareFlights() {
  log('OpenFlights airports and routes');
  const [airportsText, routesText] = await Promise.all([
    fetchText('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat'),
    fetchText('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat'),
  ]);

  const airports = new Map();
  for (const line of airportsText.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const id = fields[0];
    const lat = Number(fields[6]);
    const lon = Number(fields[7]);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    airports.set(id, {
      id,
      name: fields[1] || 'Unknown airport',
      city: fields[2] || '',
      country: fields[3] || '',
      iata: fields[4] && fields[4] !== '\\N' ? fields[4] : '',
      lon: round(lon, 4),
      lat: round(lat, 4),
    });
  }

  const counts = new Map();
  for (const line of routesText.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const sourceId = fields[3];
    const destinationId = fields[5];
    if (!sourceId || !destinationId || sourceId === destinationId) continue;
    if (fields[7] && fields[7] !== '0') continue;
    if (!airports.has(sourceId) || !airports.has(destinationId)) continue;
    const key = `${sourceId}|${destinationId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const routes = [...counts.entries()]
    .map(([key, count]) => {
      const [sourceId, destinationId] = key.split('|');
      const from = airports.get(sourceId);
      const to = airports.get(destinationId);
      const fromPoint = [from.lon, from.lat];
      const toPoint = [to.lon, to.lat];
      return {
        from: fromPoint,
        to: toPoint,
        fromIata: from.iata || from.city,
        toIata: to.iata || to.city,
        fromName: from.city || from.name,
        toName: to.city || to.name,
        fromCountry: from.country,
        toCountry: to.country,
        count,
        distanceKm: Math.round(haversineKm(fromPoint, toPoint)),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 320);

  const usedAirportIds = new Set();
  for (const route of routes) {
    for (const airport of airports.values()) {
      if (
        (airport.lon === route.from[0] && airport.lat === route.from[1]) ||
        (airport.lon === route.to[0] && airport.lat === route.to[1])
      ) {
        usedAirportIds.add(airport.id);
      }
    }
  }

  await writeJSON(
    'flights/routes.json',
    {
      generated: GENERATED,
      source: 'OpenFlights airports and routes',
      note: 'Route counts are the number of airline route records, not passenger volume.',
      routes,
      airports: [...usedAirportIds].map((id) => airports.get(id)),
    },
    false,
  );
  log(`${routes.length} routes, ${usedAirportIds.size} airports`);
}

async function readToken() {
  try {
    const env = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^\s*MAPBOX_API\s*=\s*(.+?)\s*$/);
      if (match) return match[1].replace(/^["']|["']$/g, '');
    }
  } catch {
    return null;
  }
  return null;
}

async function prepareRoute() {
  log('Mapbox Directions route (US West Coast)');
  const token = await readToken();
  const waypoints = [
    [-122.3321, 47.6062],
    [-122.6765, 45.5231],
    [-122.4194, 37.7749],
    [-118.2437, 34.0522],
    [-117.1611, 32.7157],
  ];
  let geometry = { type: 'LineString', coordinates: waypoints };
  let distanceM = null;
  let durationS = null;
  let fallback = true;

  if (token) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints
        .map((point) => point.join(','))
        .join(';')}?geometries=geojson&overview=full&steps=false&access_token=${token}`;
      const payload = await fetchJSON(url);
      const route = payload.routes?.[0];
      if (route?.geometry?.coordinates?.length) {
        const simplified = simplify(
          { type: 'Feature', properties: {}, geometry: route.geometry },
          { tolerance: 0.01, highQuality: true },
        );
        geometry = simplified.geometry;
        distanceM = route.distance;
        durationS = route.duration;
        fallback = false;
      }
    } catch (error) {
      log(`Directions API failed, writing waypoint fallback: ${error.message}`);
    }
  }

  await writeJSON(
    'routes/west-coast.json',
    {
      type: 'Feature',
      generated: GENERATED,
      source: 'Mapbox Directions API',
      fallback,
      properties: {
        name: 'Pacific Coast route',
        distanceKm: distanceM == null ? null : round(distanceM / 1000, 0),
        durationHours: durationS == null ? null : round(durationS / 3600, 1),
      },
      geometry,
    },
    false,
  );
  log(`${geometry.coordinates.length} route coordinates`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  log(`Writing data to ${OUT}`);
  const only = new Set(
    process.argv
      .filter((argument) => argument.startsWith('--only='))
      .flatMap((argument) => argument.slice('--only='.length).split(','))
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const tasks = [
    ['world', prepareWorld],
    ['us', prepareUnitedStates],
    ['cities', prepareCities],
    ['quakes', prepareQuakes],
    ['flights', prepareFlights],
    ['route', prepareRoute],
  ];
  for (const [name, task] of tasks) {
    if (only.size && !only.has(name)) continue;
    await task();
  }
  log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
