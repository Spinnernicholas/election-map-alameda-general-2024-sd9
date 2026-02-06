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

function normalizeSd9Choices(contest) {
  if (!contest || !Array.isArray(contest.choices) || contest.choices.length !== 2) {
    return contest;
  }

  const cloned = JSON.parse(JSON.stringify(contest));
  const [first, second] = cloned.choices;

  const hasMarisolFirst = /marisol/i.test(first.label || '');
  const hasTimSecond = /tim/i.test(second.label || '');

  if (hasMarisolFirst && hasTimSecond) {
    return cloned;
  }

  const marisolChoice = cloned.choices.find((choice) => /marisol/i.test(choice.label || ''));
  const timChoice = cloned.choices.find((choice) => /tim/i.test(choice.label || ''));

  if (!marisolChoice || !timChoice) {
    return cloned;
  }

  cloned.choices = [marisolChoice, timChoice].map((choice, index) => ({
    ...choice,
    index
  }));

  return cloned;
}

function flipTwoChoicePrecinctResults(contest) {
  if (!contest || !contest.precincts) {
    return contest;
  }

  const cloned = JSON.parse(JSON.stringify(contest));
  const updatedPrecincts = {};

  for (const [precinctId, precinctData] of Object.entries(cloned.precincts)) {
    const nextData = { ...precinctData };

    if (Array.isArray(nextData.results) && nextData.results.length === 2) {
      nextData.results = [nextData.results[1], nextData.results[0]];
    }

    if (Array.isArray(nextData.percentage) && nextData.percentage.length === 2) {
      nextData.percentage = [nextData.percentage[1], nextData.percentage[0]];
    }

    if (nextData.winner === 0) {
      nextData.winner = 1;
    } else if (nextData.winner === 1) {
      nextData.winner = 0;
    }

    updatedPrecincts[precinctId] = nextData;
  }

  cloned.precincts = updatedPrecincts;

  return cloned;
}

function collectSd9Contests(data, prefix, options = {}) {
  const contests = data && data.contests ? data.contests : [];
  const sd9Pattern = /senate\s+district\s+9/i;
  const { normalizeChoices = false, flipPrecinctResults = false } = options;

  return contests
    .filter((contest) => sd9Pattern.test(contest.label || ''))
    .map((contest) => {
      let nextContest = contest;

      if (normalizeChoices) {
        nextContest = normalizeSd9Choices(nextContest);
      }

      if (flipPrecinctResults) {
        nextContest = flipTwoChoicePrecinctResults(nextContest);
      }

      return prefixContestPrecincts(nextContest, prefix);
    });
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

function setContestLabel(contest, label) {
  if (!contest || !label) {
    return contest;
  }

  const cloned = JSON.parse(JSON.stringify(contest));

  cloned.label = label;

  return cloned;
}

// Read both data files
const alamedaData = readJsonFile(path.join(dataDir, 'alemeda-data.json'));
const contraCostaData = readJsonFile(path.join(dataDir, 'contracosta-data.json'));

const alamedaPrefix = 'alameda';
const contraCostaPrefix = 'contracosta';

const alamedaSd9Contests = collectSd9Contests(alamedaData, alamedaPrefix).map((contest) =>
  setContestLabel(contest, 'State Senate District 9 (Alameda)')
);

const contraCostaSd9Contests = collectSd9Contests(contraCostaData, contraCostaPrefix).map(
  (contest) => setContestLabel(contest, 'State Senate District 9 (Contra Costa)')
);

const combinedSd9Contests = [
  ...collectSd9Contests(alamedaData, alamedaPrefix, { normalizeChoices: true }),
  ...collectSd9Contests(contraCostaData, contraCostaPrefix, {
    normalizeChoices: true,
    flipPrecinctResults: true
  })
];

const mergedSd9Contest = mergeSd9Contests(combinedSd9Contests);
mergedSd9Contest.label = 'State Senate District 9';

const combinedData = {
  contests: [mergedSd9Contest, ...alamedaSd9Contests, ...contraCostaSd9Contests]
};

// Write to new file
fs.writeFileSync(path.join(dataDir, 'data.json'), JSON.stringify(combinedData, null, 2));

console.log('Successfully combined SD9 data into data.json');
