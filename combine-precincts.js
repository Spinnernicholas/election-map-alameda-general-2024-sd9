const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

function ensureFeatureCollection(geojson, sourceName) {
  if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error(`Expected FeatureCollection in ${sourceName}.`);
  }
}

function prefixFeature(feature, prefix) {
  const cloned = JSON.parse(JSON.stringify(feature));

  if (cloned.id !== undefined && cloned.id !== null) {
    cloned.id = `${prefix}-${cloned.id}`;
  }

  if (cloned.properties) {
    const properties = cloned.properties;
    const idKeys = ['PrecinctID', 'precinctId', 'PRECINCTID', 'precinct_id', 'Precinct_ID'];
    const nameKeys = ['PrecinctNM', 'precinctName', 'PRECINCTNM', 'precinct_nm', 'label', 'name', 'NAME'];

    let idValue = null;
    let nameValue = null;

    // Find and extract ID value
    for (const key of idKeys) {
      if (properties[key] !== undefined && properties[key] !== null) {
        idValue = `${prefix}-${properties[key]}`;
        break;
      }
    }

    // Find and extract name value
    for (const key of nameKeys) {
      if (properties[key] !== undefined && properties[key] !== null) {
        nameValue = `${prefix}-${properties[key]}`;
        break;
      }
    }

    // Normalize field names to Precinct_ID and PrecinctNM
    for (const key of idKeys) {
      delete properties[key];
    }
    for (const key of nameKeys) {
      delete properties[key];
    }

    if (idValue) {
      properties['Precinct_ID'] = idValue;
    }
    if (nameValue) {
      properties['PrecinctNM'] = nameValue;
    }
  }

  return cloned;
}

const alamedaPath = path.join(dataDir, 'alameda-precincts.gis.json');
const contraCostaPath = path.join(dataDir, 'contracosta-precincts.gis.json');

const alamedaGeo = readJsonFile(alamedaPath);
const contraCostaGeo = readJsonFile(contraCostaPath);

ensureFeatureCollection(alamedaGeo, 'alameda-precincts.gis.json');
ensureFeatureCollection(contraCostaGeo, 'contracosta-precincts.gis.json');

const alamedaPrefix = 'alameda';
const contraCostaPrefix = 'contracosta';

const mergedGeo = {
  type: 'FeatureCollection',
  features: [
    ...alamedaGeo.features.map((feature) => prefixFeature(feature, alamedaPrefix)),
    ...contraCostaGeo.features.map((feature) => prefixFeature(feature, contraCostaPrefix))
  ]
};

if (alamedaGeo.crs) {
  mergedGeo.crs = alamedaGeo.crs;
}

fs.writeFileSync(
  path.join(dataDir, 'precincts.gis.json'),
  JSON.stringify(mergedGeo, null, 2)
);

console.log('Successfully combined precinct GeoJSON into precincts.gis.json');
