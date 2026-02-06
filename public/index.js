const pageTitle = 'Contra Costa County 2024 Presidential Election Results';
const precinctIDField = 'Precinct_ID';
const precinctLabelField = 'Precinct_ID';
const grouped = false;
const additionalGISData = false;

// Intro overlay handler
const introOverlay = document.getElementById('intro-overlay');
const closeIntroBtn = document.getElementById('close-intro');
const startTourBtn = document.getElementById('start-tour');

if (closeIntroBtn) {
    closeIntroBtn.addEventListener('click', () => {
        introOverlay.classList.add('hidden');
    });
}

if (startTourBtn) {
    startTourBtn.addEventListener('click', () => {
        introOverlay.classList.add('hidden');
        startTour();
    });
}

// Tour functionality
const tourSteps = [
    {
        title: 'Welcome to the Interactive Map',
        description: 'Click on any precinct to see detailed voting results, turnout information, and registered voter counts.',
        target: null,
        position: 'center'
    },
    {
        title: 'Control Panel',
        description: 'Hover over or click this panel to access map controls. It will expand to show all available options.',
        target: '.election-selector',
        position: 'right'
    },
    {
        title: 'Select a Contest',
        description: 'Use this dropdown to switch between different views: combined results, Alameda only, or Contra Costa only.',
        target: '.election-selector-select:first-of-type',
        position: 'right'
    },
    {
        title: 'Choose a View',
        description: 'Select how to display results: Winner by Precinct, Contest Turnout, or individual candidate vote percentages.',
        target: '.election-selector-select:last-of-type',
        position: 'right'
    },
    {
        title: 'Adjust Opacity',
        description: 'Use this slider to adjust the map overlay transparency, making it easier to see underlying geographic features.',
        target: '.election-selector-slider',
        position: 'right'
    }
];

let currentTourStep = 0;
const tourOverlay = document.getElementById('tour-overlay');
const tourSpotlight = document.getElementById('tour-spotlight');
const tourContent = document.getElementById('tour-content');
const tourTitle = document.getElementById('tour-title');
const tourDescription = document.getElementById('tour-description');
const tourProgress = document.getElementById('tour-progress');
const tourPrevBtn = document.getElementById('tour-prev');
const tourNextBtn = document.getElementById('tour-next');
const tourSkipBtn = document.getElementById('tour-skip');

function startTour() {
    currentTourStep = 0;
    window.tourActive = true;
    tourOverlay.classList.remove('hidden');
    showTourStep(currentTourStep);
}

function endTour() {
    window.tourActive = false;
    tourOverlay.classList.add('hidden');
    currentTourStep = 0;
    
    // Close the control panel
    if (window.selector) {
        window.selector._close();
    }
}

function showTourStep(stepIndex) {
    const step = tourSteps[stepIndex];
    tourTitle.textContent = step.title;
    tourDescription.textContent = step.description;
    tourProgress.textContent = `${stepIndex + 1} / ${tourSteps.length}`;
    
    tourPrevBtn.disabled = stepIndex === 0;
    tourNextBtn.textContent = stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next';
    
    if (step.target) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            // Expand the control panel if targeting its children
            const controlPanel = document.querySelector('.election-selector');
            if (controlPanel && controlPanel.classList.contains('closed')) {
                controlPanel.classList.remove('closed');
            }
            
            const rect = targetElement.getBoundingClientRect();
            tourSpotlight.style.top = `${rect.top - 5}px`;
            tourSpotlight.style.left = `${rect.left - 5}px`;
            tourSpotlight.style.width = `${rect.width + 10}px`;
            tourSpotlight.style.height = `${rect.height + 10}px`;
            tourSpotlight.style.display = 'block';
            
            // Position tour content
            if (step.position === 'right') {
                tourContent.style.left = `${rect.right + 20}px`;
                tourContent.style.top = `${rect.top}px`;
                tourContent.style.right = 'auto';
                tourContent.style.bottom = 'auto';
            }
        }
    } else {
        tourSpotlight.style.display = 'none';
        tourContent.style.left = '50%';
        tourContent.style.top = '50%';
        tourContent.style.transform = 'translate(-50%, -50%)';
        tourContent.style.right = 'auto';
        tourContent.style.bottom = 'auto';
    }
}

if (tourPrevBtn) {
    tourPrevBtn.addEventListener('click', () => {
        if (currentTourStep > 0) {
            // Close control panel if we're on step 2 and going back to step 1
            if (currentTourStep === 1 && window.selector) {
                window.selector._container.classList.add("closed");
                window.selector._closed = true;
            }
            currentTourStep--;
            showTourStep(currentTourStep);
        }
    });
}

if (tourNextBtn) {
    tourNextBtn.addEventListener('click', () => {
        if (currentTourStep < tourSteps.length - 1) {
            currentTourStep++;
            showTourStep(currentTourStep);
        } else {
            endTour();
        }
    });
}

if (tourSkipBtn) {
    tourSkipBtn.addEventListener('click', () => {
        endTour();
    });
}

const map = L.map('map', {preferCanvas: false});

let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let data, precinctsLayer;

(async () => {
    let addData;

    data = await loadJson("data/data.json");
    if(additionalGISData) addData = await loadJson("data/add.gis.json");
    let precincts = await loadJson("data/precincts.gis.json");

    precinctsLayer = L.geoJSON(precincts, {
        style: feature => {
            return {
                fillOpacity: 1,
                weight: 1,
                color: "#AAAAAA"
            }
        },
        onEachFeature: (feature, layer) => {
            if(addData){
                let addProps = addData.data[feature.properties[addData.key]];
                if(addProps) Object.assign(feature.properties, addProps);
            }
            layer.on({
                click: e => {
                    let contest = data.contests[window.selector.selection.contest];
                    let choice = contest.choices[window.selector.selection.choice];
                    let precinct = contest.precincts[e.target.feature.properties[precinctIDField]];

                    if(grouped) precinctsLayer.eachLayer(feature => {
                        if(feature.feature.properties[precinctIDField] == e.target.feature.properties[precinctIDField]) feature.setStyle({
                            weight: 2,
                            color: getBorderColor(e.target.options.fillColor)
                        }).bringToFront();
                    });

                    e.target.setStyle({
                        weight: 2,
                        color: getBorderColor(e.target.options.fillColor)
                    }).bringToFront();

                    let content = "";

                    if(grouped) content += `<p class=\"popup-title\">${e.target.feature.properties[precinctIDField]} → ${e.target.feature.properties[precinctLabelField]}<br/></p>`
                    else content += `<p class=\"popup-title\">${e.target.feature.properties[precinctLabelField]}<br/></p>`

                    if(!precinct) content += `No Election Results`;
                    else {
                        if(precinct.registeredVoters == 0 && (precinct.total === undefined || precinct.total == 0)) content += "No Registered Voters<br/>";
                        else {
                            if(precinct.total === undefined) {
                                content += "No Contest Results<br/>";
                            } else if(precinct.total == 0) {
                                content += "No Votes<br/>";
                            } else if(window.selector.selection.choice === 't') {
                                content += `Total Votes: ${precinct.total}<br/>`;
                            } else if(!precinct.results) {
                                content += `Hidden for Privacy<br/>Total Votes: ${precinct.total}<br/>`;
                            } else if(window.selector.selection.choice === 'w') {
                                content += `
                                <p class="popup-subtitle">${contest.choices[precinct.winner].label}</p>
                                Votes: ${precinct.results[precinct.winner]}/${precinct.total} (${precinct.percentage ? (100 * precinct.percentage[precinct.winner]).toFixed(0) : 0}%)<br/>
                                `;
                            } else {
                                content += `
                                <p class="popup-subtitle">${choice.label}</p>
                                Votes: ${precinct.results[window.selector.selection.choice]}/${precinct.total} (${precinct.percentage ? (100 * precinct.percentage[window.selector.selection.choice]).toFixed(0) : 0}%)<br/>
                                `;
                            }

                            content += `Registered Voters: ${precinct.registeredVoters || 0}<br/>`;

                            if(precinct.total !== undefined && precinct.total == precinct.totalVoters && precinct.registeredVoters > 0) {
                                content += `Turnout: ${(100 * precinct.total / precinct.registeredVoters).toFixed(0)}%<br/>`;
                            } else {
                                if(precinct.total !== undefined && precinct.registeredVoters > 0) {
                                    if(contest.voteFor > 1) {
                                        content += `Contest Type: Vote For ${contest.voteFor}<br/>`;
                                        content += `Contest Turnout: ${precinct.total}/${precinct.registeredVoters * contest.voteFor} (${(100 * precinct.total / precinct.registeredVoters / contest.voteFor).toFixed(0)}%)<br/>`;
                                    } else {
                                        content += `Contest Turnout: ${precinct.total}/${precinct.registeredVoters} (${(100 * precinct.total / precinct.registeredVoters).toFixed(0)}%)<br/>`;
                                    }
                                }
                                if(precinct.totalVoters !== undefined && precinct.registeredVoters > 0) {
                                    content += `Ballot Turnout: ${precinct.totalVoters}/${precinct.registeredVoters} (${(100 * precinct.totalVoters / precinct.registeredVoters).toFixed(0)}%)<br/>`;
                                }
                            }
                        }
                    }

                    L.popup()
                    .setLatLng(e.latlng)
                    .setContent(content)
                    .on({remove: () => {
                        e.target.setStyle({
                            weight: 1,
                            color: "#AAAAAA"
                        });
                        
                        if(grouped) precinctsLayer.eachLayer(feature => {
                            if(feature.feature.properties[precinctIDField] == e.target.feature.properties[precinctIDField]) feature.setStyle({
                                weight: 1,
                                color: "#AAAAAA"
                            }).bringToFront();
                        });
                    }}).openOn(map);
                }
            });
        }
    }).addTo(map);
    
    window.selector = L.control.ElectionSelector(pageTitle, precinctsLayer, data.contests, precinctIDField).addTo(map);

    map.fitBounds(precinctsLayer.getBounds());
})();

async function loadJson(file) {
    let response = await fetch(file);
    return await response.json();
}

function getBorderColor(input){
    if(!input) return 'white';

    if(chroma(input).get('hsl.l') < 0.8) return 'white';
    else return 'black';
}