# CocoaCountyMap
This is an interactive election map with the goal of providing a template that can be used to quickly and easily create interactive election maps for any election.

Try it out by deploying the `public/` directory to GitHub Pages for your repository.

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
The app reads election data from an external election repository index URL.

Current default index URL:
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
Add your relevant county election department links here for your deployment.
