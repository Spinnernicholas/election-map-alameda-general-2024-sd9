const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');

const sources = [
  { county: 'alameda', file: 'alameda-precincts.gis.json' }
];

const nameKeys = ['PrecinctNM', 'precinctName', 'precinct_nm', 'name', 'NAME', 'label'];
const idKeys = ['PrecinctID', 'precinctId', 'precinct_id', 'PRECINCTID'];

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

function pickFirst(properties, keys) {
  if (!properties) {
    return '';
  }

  for (const key of keys) {
    if (properties[key] !== undefined && properties[key] !== null && properties[key] !== '') {
      return String(properties[key]);
    }
  }

  return '';
}

function escapeCsv(value) {
  const text = String(value ?? '');

  if (/[\",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

const rows = [];
rows.push(['name', 'id', 'county']);

for (const source of sources) {
  const geojson = readJsonFile(path.join(dataDir, source.file));

  if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error(`Expected FeatureCollection in ${source.file}.`);
  }

  for (const feature of geojson.features) {
    const properties = feature.properties || {};
    const name = pickFirst(properties, nameKeys);
    const idFromProps = pickFirst(properties, idKeys);
    const id = idFromProps || (feature.id !== undefined && feature.id !== null ? String(feature.id) : '');

    rows.push([name, id, source.county]);
  }
}

const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
fs.writeFileSync(path.join(dataDir, 'precincts.csv'), csv);

console.log('Wrote precincts.csv');
