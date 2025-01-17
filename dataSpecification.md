# Data Specification

## data.json

#### Chat GPT-4 File Description
The file serves as a structured representation of election data, containing detailed information about contests, choices, and precinct-level voting results. The top-level object includes an array of Contest objects, each of which represents a specific contest with its identifier, label, and related choices. The Choice objects contain information such as their index, identifier, label, and, optionally, the associated political party, and the total number of votes received. Furthermore, each Contest object holds an object containing precincts, which consists of Precinct ID-Object pairs providing detailed voting statistics, such as total votes, winning choice index, vote counts per choice, vote percentages per choice, the number of registered voters, and the number of voters who voted in the precinct.

This file format aims to organize and store election data in a structured and easily accessible manner, facilitating the analysis, visualization, and interpretation of election results.

#### Chat GPT-4 Specification
| Element             | Description                      | Type                 |
|---------------------|----------------------------------|----------------------|
| **Top Level Object**|                                  |                      |
| ├─ contests         | Array of Contest Objects         | Array                |
| **Contest Object**  |                                  |                      |
| ├─ index            | Index of the contest             | Integer              |
| ├─ id               | Unique identifier for the contest| String               |
| ├─ label            | Label/name of the contest        | String               |
| ├─ choices          | Array of Choice Objects          | Array                |
| └─ precincts        | Precinct ID-Object pairs         | Object               |
| **Choice Object**   |                                  |                      |
| ├─ index            | Index of the choice              | Integer              |
| ├─ id               | Unique identifier for the choice | Integer              |
| ├─ label            | Label/name of the choice         | String               |
| ├─ party (optional) | Political party of the choice    | String               |
| └─ votes            | Total votes for the choice       | Integer              |
| **Precinct Object** |                                  |                      |
| ├─ label            | Label/name of the precinct       | String               |
| ├─ total (optional) | Total votes in the precinct      | Integer              |
| ├─ winner (optional)| Index of the winning choice      | Integer              |
| ├─ results (optional)| Votes per choice                | Array of Integers    |
| ├─ percentage (optional)| Vote percentage per choice   | Array of Floats      |
| ├─ registeredVoters | Registered voters in the precinct| Integer              |
| └─ totalVoters      | Voters who voted in the precinct | Integer              |


#### Chat GPT-4 Specification Example
```javascript
{
  "contests": [
    {
      "index": 0,                     // Index of the contest in the array
      "id": "C1",                     // Unique identifier for the contest
      "label": "Governor",            // Label/name of the contest
      "choices": [
        {
          "index": 0,                 // Index of the choice in the array
          "id": 100,                  // Unique identifier for the choice
          "label": "John Doe",        // Label/name of the choice
          "party": "Democrat",        // Optional: Political party of the choice
          "votes": 1500               // Total votes for the choice
        },
        {
          "index": 1,                 // Index of the choice in the array
          "id": 101,                  // Unique identifier for the choice
          "label": "Jane Smith",      // Label/name of the choice
          "votes": 1000               // Total votes for the choice
        }
      ],
      "precincts": {
        "P1": {
          "label": "Precinct 1",      // Label/name of the precinct
          "total": 200,               // Total votes in the precinct for a contest
          "winner": 0,                // Optional: Index of the winning choice for the contest in the precinct
          "results": [120, 80],       // Optional: Number of votes per choice in the precinct for the contest
          "percentage": [0.6, 0.4],   // Optional: Vote percentage per choice in the precinct for the contest
          "registeredVoters": 300,    // Total number of registered voters in the precinct
          "totalVoters": 200          // Total number of voters who voted in the precinct
        },
        "P2": {
          "label": "Precinct 2",      // Label/name of the precinct
          "registeredVoters": 200,    // Total number of registered voters in the precinct
          "totalVoters": 100          // Total number of voters who voted in the precinct
        }
      }
    }
  ]
}
```

## add.gis.json

#### Chat GPT-4 File Description
This file serves as a data source for enhancing GIS map features representing voting precincts. It contains a key-value pair structure, where the key represents the GIS feature property used for selecting the appropriate map feature, and the value consists of an object containing multiple SupplementalData objects. Each SupplementalData object is associated with an ID and contains one or more arbitrary properties relevant to voting precincts, such as precinct name, registered voters count, polling location, and early voting availability. The purpose of this file is to provide additional information about voting precincts that can be easily integrated into existing map features for better visualization and analysis.

#### Chat GPT-4 Specification
| Element                     | Description                                                    | Type                 |
|-----------------------------|----------------------------------------------------------------|----------------------|
| **Top Level Object**        |                                                                |                      |
| ├─ key                      | GIS feature property used for selecting the feature            | String               |
| └─ data                     | Object containing ID-SupplementalData Object pairs            | Object               |
| **SupplementalData Object** |                                                                |                      |
| └─ Arbitrary Property       | One or more properties to be added to the selected map feature | Various (dynamic)    |

#### Chat GPT-4 Specification Example
```javascript
{
  "key": "SubPrecinct",
  "data": {
    "10903A": {
      "VotingPrecinct": "10901",
      "PrecinctName": "Downtown District"
    },
    "10931B": {
      "VotingPrecinct": "10901",
      "PrecinctName": "Uptown District",
      "PollingLocation": "Uptown Community Center"
    },
    "10939A": {
      "VotingPrecinct": "10901",
      "PrecinctName": "Old Town District",
      "PollingLocation": "Old Town Library",
      "EarlyVotingAvailable": true
    }
  }
}

```

## Credit
Some content on this page was generated using [OpenAI](https://openai.com/)'s [Chat GPT-4](https://chat.openai.com/).