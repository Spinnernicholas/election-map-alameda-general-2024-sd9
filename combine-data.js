const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function prefixContestPrecincts(contest, prefix) {
  if (!contest) {
    return contest;
  }

  const cloned = JSON.parse(JSON.stringify(contest));

  if (!cloned.precincts) {
    return cloned;
  }

  const prefixedPrecincts = {};

  for (const [precinctId, precinctData] of Object.entries(cloned.precincts)) {
    const nextId = `${prefix}-${precinctId}`;
    const nextData = { ...precinctData };

    if (nextData.label) {
      nextData.label = `${prefix}-${nextData.label}`;
    }

    if (nextData.id !== undefined && nextData.id !== null) {
      nextData.id = `${prefix}-${nextData.id}`;
    }

    prefixedPrecincts[nextId] = nextData;
  }

  cloned.precincts = prefixedPrecincts;

  return cloned;
}

function collectSd9Contests(data, prefix) {
  const contests = data && data.contests ? data.contests : [];
  const sd9Pattern = /senate\s+district\s+9/i;

  return contests
    .filter((contest) => sd9Pattern.test(contest.label || ''))
    .map((contest) => prefixContestPrecincts(contest, prefix));
}

function mergeSd9Contests(contests) {
  if (contests.length === 0) {
    throw new Error('No Senate District 9 contest found in either file.');
  }

  const baseContest = JSON.parse(JSON.stringify(contests[0]));
  baseContest.precincts = {};

  for (const contest of contests) {
    if ((!baseContest.choices || baseContest.choices.length === 0) && contest.choices) {
      baseContest.choices = contest.choices;
    }

    if (!baseContest.label && contest.label) {
      baseContest.label = contest.label;
    }

    if (baseContest.id === undefined && contest.id !== undefined) {
      baseContest.id = contest.id;
    }

    if (baseContest.index === undefined && contest.index !== undefined) {
      baseContest.index = contest.index;
    }

    const precincts = contest.precincts || {};
    for (const [precinctId, precinctData] of Object.entries(precincts)) {
      if (baseContest.precincts[precinctId]) {
        throw new Error(`Precinct overlap detected for ${precinctId}.`);
      }

      baseContest.precincts[precinctId] = precinctData;
    }
  }

  return baseContest;
}

// Read both data files
const alamedaData = readJsonFile(path.join(dataDir, 'alemeda-data.json'));
const contraCostaData = readJsonFile(path.join(dataDir, 'contracosta-data.json'));

const alamedaPrefix = 'alameda';
const contraCostaPrefix = 'contracosta';

const sd9Contests = [
  ...collectSd9Contests(alamedaData, alamedaPrefix),
  ...collectSd9Contests(contraCostaData, contraCostaPrefix)
];

const mergedSd9Contest = mergeSd9Contests(sd9Contests);

const combinedData = {
  contests: [mergedSd9Contest]
};

// Write to new file
fs.writeFileSync(path.join(dataDir, 'data.json'), JSON.stringify(combinedData, null, 2));

console.log('Successfully combined SD9 data into data.json');
