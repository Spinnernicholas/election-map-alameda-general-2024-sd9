# CocoaCountyMap
This is an interactive election map with the goal of providing a template that can be used to quickly and easily create interactive election maps for any election.

Try it out [Here](https://spinnernicholas.github.io/election-map-alameda-general-2024-sd9/public/)

If you would like more informatino or a demo, please reach out to me on [LinkedIn](https://www.linkedin.com/in/spinnernicholas/).

# Features
- Interactive precinct-level election results visualization
- Multiple view options: Winner by Precinct, Contest Turnout, and individual candidate vote percentages
- Support for multiple contests and counties
- Adjustable map opacity for geographic context
- Customizable candidate colors
- Responsive design with mobile support
- Guided tour for first-time users
- Precinct-level voting statistics and turnout information

# Data Specification
File Specification can be found [HERE](dataSpecification.md)

# External Election Data
The app now reads election data from the Cocoa County election data repository index by default:
- `https://raw.githubusercontent.com/Cocoa-County/ElectionOpenDataRepository/main/elections.index.json`

Selection behavior:
- `defaultElectionId` when present, or
- the first item in the `elections` array as fallback.

Index path behavior:
- `dataUrl` and `precinctsUrl` can be relative paths for files in the same repository.
- `dataUrl` and `precinctsUrl` can be full URLs for files hosted outside this repository.
- No specific repository folder naming convention is required for compatibility.

For a full GitHub-hosted data repository design, see `election-data-repository-design.md`.

# Cedits
Built with [Leafletjs](https://leafletjs.com/)

BaseMap provided by [OpenStreetMap](https://www.openstreetmap.org/)

## County Elections Departments
[Alameda County Elections](https://www.acvote.org/)

[Contra Costa County Elections](https://www.cocovote.us/)

[Marin County Elections](https://www.marincounty.org/depts/rv)
