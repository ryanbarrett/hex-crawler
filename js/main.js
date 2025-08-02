class HexExplorer {
    constructor(seed) {
        this.seed = seed || 'exploration';
        this.random = this.createSeededRandom(this.seed);
        
        this.biomes = [
            'Forest', 'Plains', 'Mountains', 'Hills', 'Swamp', 
            'Desert', 'Ocean', 'River'
        ];
        
        this.features = {
            "Forest": [
                'Ancient Grove', 'Logging Camp', 'Druid Circle', 'Hidden Shrine', 'Bandit Camp', 'Hunter\'s Lodge',
                'Ent Burial Site', 'Forgotten Ranger Post', 'Mushroom Ring', 'Wild Orchard', 'Fairy Circle',
                'Abandoned Cabin', 'Elf Encampment', 'Forest Beacon', 'Thorn Thicket', 'Animal Den', 'Overgrown Path'
            ],
            "Plains": [
                'Village', 'Trading Post', 'Windmill', 'Stone Circle', 'Battlefield', 'Crossroads Inn',
                'Grain Silo', 'Horse Ranch', 'Ranger\'s Camp', 'Ruined Watchpost', 'Fallow Field',
                'Wandering Caravan', 'Hilltop Altar', 'Nomad Stones', 'Weathered Statue', 'Open-Air Market'
            ],
            "Mountains": [
                'Mine', 'Dwarven Outpost', 'Cave System', 'Observatory', 'Dragon Lair', 'Ancient Fortress',
                'Avalanche Path', 'Goat Trail', 'Glacier Crack', 'Monastery in the Peaks', 'Collapsed Tunnel',
                'Meteor Crater', 'Hermit\'s Peak', 'Frozen Waterfall', 'Crystal Cavern', 'Abandoned Lift'
            ],
            "Hills": [
                'Watchtower', 'Shepherd\'s Hut', 'Burial Mound', 'Old Ruins', 'Hillside Village', 'Stone Quarry',
                'Smuggler\'s Tunnel', 'Rolling Cairns', 'Wind-Cut Pass', 'Hilltop Shrine', 'Scout Post',
                'Overgrown Barrows', 'Thistle Patch', 'Crumbling Mill', 'Stone Circles', 'Bandit Lookout'
            ],
            "Swamp": [
                'Witch\'s Hut', 'Alchemist Garden', 'Sunken Temple', 'Will O\' Wisp Grove', 'Bog Iron Mine',
                'Floating Dock', 'Leech Pond', 'Sunken Library', 'Ghoul Tree', 'Fungal Bog',
                'Croaking Circle', 'Rotting Cabin', 'Reed Maze', 'Alligator Nest', 'Fog Totem'
            ],
            "Desert": [
                'Oasis', 'Nomad Camp', 'Buried Ruins', 'Salt Mine', 'Mirage Pool', 'Sandstone Cliffs',
                'Camel Graveyard', 'Wind-Cut Canyon', 'Scorpion Nest', 'Crumbling Watchtower',
                'Sand Trap Dunes', 'Starfall Crater', 'Glass Field', 'Ancient Aquifer', 'Whispering Monolith'
            ],
            "Ocean": [
                'Shipwreck', 'Coral Reef', 'Sea Cave', 'Lighthouse', 'Fishing Village', 'Hidden Cove',
                'Kelp Forest', 'Siren Rocks', 'Whale Bones', 'Sunken Observatory', 'Smuggler\'s Shipwreck',
                'Pearl Diver\'s Dock', 'Tide Pool Maze', 'Shimmering Whirlpool', 'Crab Shell Isles'
            ],
            "River": [
                'Bridge', 'Ferry Crossing', 'Watermill', 'Fishing Spot', 'River Port', 'Sacred Spring',
                'Log Raft Camp', 'Flooded Shrine', 'Rapids Watch', 'Eel Trap Weir', 'River Troll Nest',
                'Old Dam Ruins', 'Mist Dock', 'Whispering Brook', 'Floating Market', 'Fishbone Weir'
            ]
        };
    }
    
    createSeededRandom(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return () => {
            hash = ((hash * 1103515245) + 12345) & 0x7fffffff;
            return hash / 0x7fffffff;
        };
    }
    
    generateHex(hexKey, neighboringBiomes = [], featureDensity = 'normal') {
        // Bias toward neighboring biomes for clustering
        let biome;
        if (neighboringBiomes.length > 0 && this.random() < 0.6) {
            biome = neighboringBiomes[Math.floor(this.random() * neighboringBiomes.length)];
        } else {
            biome = this.biomes[Math.floor(this.random() * this.biomes.length)];
        }
        
        // Generate features based on density
        let features = [];
        const featureChance = featureDensity === 'sparse' ? 0.25 : 
                            featureDensity === 'normal' ? 0.5 : 0.75;
        
        if (this.random() < featureChance) {
            const biomeFeatures = this.features[biome];
            if (biomeFeatures && biomeFeatures.length > 0) {
                features.push(biomeFeatures[Math.floor(this.random() * biomeFeatures.length)]);
                
                // 25% chance for a second feature if dense
                if (featureDensity === 'dense' && this.random() < 0.25) {
                    features.push(biomeFeatures[Math.floor(this.random() * biomeFeatures.length)]);
                }
            }
        }
        
        return {
            biome: biome,
            feature: features.join(', '),
            notes: '',
            explored: false
        };
    }
}

class HexMap {
    constructor() {
        this.hexSize = 37;
        this.hexes = new Map();
        this.svg = document.getElementById('hex-grid');
        this.currentHex = null;
        this.selectedHexElement = null;
        this.explorer = new HexExplorer('exploration-seed');
        this.explorationMode = false;
        
        // Biome icon mapping
        this.biomeIcons = {
            'Forest': 'assets/icons/forest.png',
            'Plains': 'assets/icons/plains.png',
            'Mountains': 'assets/icons/mountains.png',
            'Hills': 'assets/icons/hills.png',
            'Swamp': 'assets/icons/swamp.png',
            'Desert': 'assets/icons/desert.png',
            'Ocean': 'assets/icons/ocean.png',
            'River': 'assets/icons/river.png'
        };
        
        this.initializeMap();
        this.setupEventListeners();
        this.loadMapData();
        this.setupMessageListener();
    }

    initializeMap() {
        this.generateHexGrid();
    }

    generateHexGrid() {
        const cols = 12;
        const rows = 12;
        const hexHeight = this.hexSize * Math.sqrt(3);
        const hexWidth = this.hexSize * 2;
        
        this.svg.innerHTML = '';
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (hexWidth * 0.75) + 50;
                const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0) + 30;
                
                const hexKey = `${col},${row}`;
                this.createHex(x, y, hexKey);
            }
        }
    }

    createHex(x, y, hexKey) {
        const hexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const hexagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = this.getHexPoints(x, y);
        
        hexagon.setAttribute('points', points);
        hexagon.setAttribute('class', 'hex');
        hexagon.setAttribute('data-hex', hexKey);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 25);
        text.setAttribute('class', 'hex-text');
        text.textContent = hexKey;
        
        hexGroup.appendChild(hexagon);
        hexGroup.appendChild(text);
        
        hexagon.addEventListener('click', () => this.selectHex(hexKey, hexagon));
        
        this.svg.appendChild(hexGroup);
        
        if (!this.hexes.has(hexKey)) {
            this.hexes.set(hexKey, {
                biome: 'Unexplored',
                feature: '',
                notes: '',
                explored: false
            });
        }
        
        // Update hex display with biome icon if available
        this.updateHexDisplay(hexGroup, hexKey, x, y);
    }
    
    updateHexDisplay(hexGroup, hexKey, x, y) {
        const hexData = this.hexes.get(hexKey);
        if (!hexData || hexData.biome === 'Unexplored') return;
        
        const iconPath = this.biomeIcons[hexData.biome];
        if (iconPath) {
            // Remove existing icon if any
            const existingIcon = hexGroup.querySelector('.hex-icon');
            if (existingIcon) {
                hexGroup.removeChild(existingIcon);
            }
            
            // Add biome icon
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            icon.setAttribute('x', x - 38);
            icon.setAttribute('y', y - 38);
            icon.setAttribute('width', 76);
            icon.setAttribute('height', 76);
            icon.setAttribute('href', iconPath);
            icon.setAttribute('class', 'hex-icon');
            icon.style.pointerEvents = 'none';
            
            hexGroup.appendChild(icon);
        }
    }

    getHexPoints(x, y) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + this.hexSize * Math.cos(angle);
            const py = y + this.hexSize * Math.sin(angle);
            points.push(`${px},${py}`);
        }
        return points.join(' ');
    }

    selectHex(hexKey, hexElement) {
        // Remove previous selection
        if (this.selectedHexElement) {
            this.selectedHexElement.classList.remove('selected');
        }
        
        // Set new selection
        this.currentHex = hexKey;
        this.selectedHexElement = hexElement;
        hexElement.classList.add('selected');
        
        // Update info panel
        this.updateInfoPanel(hexKey);
        this.updateNeighborsDisplay(hexKey);
    }
    
    updateInfoPanel(hexKey) {
        const hexData = this.hexes.get(hexKey) || { biome: 'Unexplored', feature: '', notes: '', explored: false };
        
        // Show hex details
        document.getElementById('selected-hex-info').style.display = 'none';
        document.getElementById('hex-details').style.display = 'block';
        
        // Update form fields
        document.getElementById('hex-coords').textContent = hexKey;
        document.getElementById('hex-biome').value = hexData.biome;
        document.getElementById('hex-feature').value = hexData.feature || '';
        document.getElementById('hex-notes').value = hexData.notes || '';
        
        // Update explore button state
        const exploreButton = document.getElementById('explore-hex');
        const explorationStatus = document.getElementById('exploration-status');
        
        if (hexData.explored) {
            exploreButton.textContent = 'Explored';
            exploreButton.disabled = true;
            exploreButton.classList.add('disabled');
            explorationStatus.textContent = 'This hex has been explored';
        } else {
            exploreButton.textContent = 'Explore!';
            exploreButton.disabled = false;
            exploreButton.classList.remove('disabled');
            explorationStatus.textContent = 'Click to explore this hex and reveal its neighbors';
        }
    }

    updateNeighborsDisplay(hexKey) {
        const [col, row] = hexKey.split(',').map(Number);
        const neighbors = this.getNeighbors(col, row);
        const neighborsGrid = document.getElementById('neighbors-grid');
        const directions = ['NW', 'N', 'NE', 'SW', 'S', 'SE'];
        
        neighborsGrid.innerHTML = '';
        
        // Create 6 neighbor hexes + 1 center hex (7 total)
        for (let i = 0; i < 6; i++) {
            const neighborDiv = document.createElement('div');
            neighborDiv.className = 'neighbor-hex';
            neighborDiv.id = `neighbor-${directions[i]}`; // Add unique ID
            
            const neighborKey = neighbors[i];
            const direction = directions[i];
            
            if (neighborKey && this.hexes.has(neighborKey)) {
                const neighborData = this.hexes.get(neighborKey);
                
                neighborDiv.innerHTML = `
                    <div class="neighbor-direction">${direction}</div>
                    <div class="neighbor-biome">${neighborData.biome}</div>
                    ${neighborData.feature ? `<div class="neighbor-feature">${neighborData.feature}</div>` : ''}
                `;
                
                neighborDiv.addEventListener('click', () => {
                    const neighborElement = document.querySelector(`[data-hex="${neighborKey}"]`);
                    if (neighborElement) {
                        this.selectHex(neighborKey, neighborElement);
                    }
                });
            } else if (neighborKey === null) {
                // Out of bounds neighbor
                neighborDiv.className = 'neighbor-hex empty';
                neighborDiv.innerHTML = `
                    <div class="neighbor-direction">${direction}</div>
                    <div class="neighbor-biome">Edge</div>
                `;
            } else {
                // Valid hex but unexplored
                neighborDiv.className = 'neighbor-hex empty';
                neighborDiv.innerHTML = `
                    <div class="neighbor-direction">${direction}</div>
                    <div class="neighbor-biome">---</div>
                `;
            }
            
            neighborsGrid.appendChild(neighborDiv);
        }
        
        // Add center hex showing current coordinates
        const centerDiv = document.createElement('div');
        centerDiv.className = 'neighbor-hex current';
        centerDiv.id = 'neighbor-CENTER'; // Add unique ID for center
        centerDiv.innerHTML = `
            <div class="neighbor-direction">HERE</div>
            <div class="neighbor-biome">${hexKey}</div>
        `;
        
        neighborsGrid.appendChild(centerDiv);
    }

    getNeighbors(col, row) {
        const isEvenCol = col % 2 === 0;
        const neighbors = [];
        const GRID_COLS = 12;
        const GRID_ROWS = 12;
        
        // Return in order: ['NW', 'N', 'NE', 'SW', 'S', 'SE']
        
        // NW (Northwest)
        let nwCol, nwRow;
        if (isEvenCol) {
            nwCol = col - 1;
            nwRow = row - 1;
        } else {
            nwCol = col - 1;
            nwRow = row;
        }
        if (nwCol >= 0 && nwCol < GRID_COLS && nwRow >= 0 && nwRow < GRID_ROWS) {
            neighbors.push(`${nwCol},${nwRow}`);
        } else {
            neighbors.push(null);
        }
        
        // N (North)
        if (row - 1 >= 0) {
            neighbors.push(`${col},${row - 1}`);
        } else {
            neighbors.push(null);
        }
        
        // NE (Northeast)
        let neCol, neRow;
        if (isEvenCol) {
            neCol = col + 1;
            neRow = row - 1;
        } else {
            neCol = col + 1;
            neRow = row;
        }
        if (neCol >= 0 && neCol < GRID_COLS && neRow >= 0 && neRow < GRID_ROWS) {
            neighbors.push(`${neCol},${neRow}`);
        } else {
            neighbors.push(null);
        }
        
        // SW (Southwest)
        let swCol, swRow;
        if (isEvenCol) {
            swCol = col - 1;
            swRow = row;
        } else {
            swCol = col - 1;
            swRow = row + 1;
        }
        if (swCol >= 0 && swCol < GRID_COLS && swRow >= 0 && swRow < GRID_ROWS) {
            neighbors.push(`${swCol},${swRow}`);
        } else {
            neighbors.push(null);
        }
        
        // S (South)
        if (row + 1 < GRID_ROWS) {
            neighbors.push(`${col},${row + 1}`);
        } else {
            neighbors.push(null);
        }
        
        // SE (Southeast)
        let seCol, seRow;
        if (isEvenCol) {
            seCol = col + 1;
            seRow = row;
        } else {
            seCol = col + 1;
            seRow = row + 1;
        }
        if (seCol >= 0 && seCol < GRID_COLS && seRow >= 0 && seRow < GRID_ROWS) {
            neighbors.push(`${seCol},${seRow}`);
        } else {
            neighbors.push(null);
        }
        
        return neighbors;
    }

    expandNeighbors(hexKey) {
        const [col, row] = hexKey.split(',').map(Number);
        const neighbors = this.getNeighbors(col, row);
        const currentHexData = this.hexes.get(hexKey);
        
        // Filter out null neighbors (out of bounds) and get neighboring biomes for clustering
        const validNeighbors = neighbors.filter(nKey => nKey !== null);
        const neighboringBiomes = validNeighbors
            .filter(nKey => this.hexes.has(nKey))
            .map(nKey => this.hexes.get(nKey).biome)
            .filter(biome => biome !== 'Unexplored');
        
        // Get feature density from settings (default to normal)
        const featureDensity = 'normal'; // TODO: Get from user settings
        
        let newHexesGenerated = false;
        
        validNeighbors.forEach(neighborKey => {
            // Only generate if hex doesn't exist or is unexplored
            if (!this.hexes.has(neighborKey) || this.hexes.get(neighborKey).biome === 'Unexplored') {
                const newHexData = this.explorer.generateHex(neighborKey, neighboringBiomes, featureDensity);
                this.hexes.set(neighborKey, newHexData);
                newHexesGenerated = true;
                
                // Update display for newly generated hex
                this.refreshHexDisplay(neighborKey);
            }
        });
        
        if (newHexesGenerated) {
            this.saveToLocalStorage();
            this.updateNeighborsDisplay(hexKey);
        }
    }

    exploreHex() {
        if (!this.currentHex) return;
        
        const currentData = this.hexes.get(this.currentHex);
        if (currentData && currentData.explored) return; // Already explored
        
        // Mark hex as explored
        const biome = document.getElementById('hex-biome').value;
        const feature = document.getElementById('hex-feature').value;
        const notes = document.getElementById('hex-notes').value;
        
        const hexData = {
            biome: biome,
            feature: feature,
            notes: notes,
            explored: true
        };
        
        this.hexes.set(this.currentHex, hexData);
        this.saveToLocalStorage();
        
        // Expand neighbors since hex was just explored
        this.expandNeighbors(this.currentHex);
        
        // Update the explore button state
        this.updateInfoPanel(this.currentHex);
        
        // Update the main hex display with new biome icon
        this.refreshHexDisplay(this.currentHex);
        
        // Update neighbors display to reflect changes
        this.updateNeighborsDisplay(this.currentHex);
        
        // Update any neighbor displays that might show this hex
        this.refreshNeighborDisplays();
        
        // Update hex visibility if exploration mode is enabled
        if (this.explorationMode) {
            this.updateHexVisibility();
        }
        
        // Check starting point prompt
        this.checkForStartingPointPrompt();
    }

    saveHexData() {
        if (!this.currentHex) return;
        
        const biome = document.getElementById('hex-biome').value;
        const feature = document.getElementById('hex-feature').value;
        const notes = document.getElementById('hex-notes').value;
        
        // Preserve exploration status
        const currentData = this.hexes.get(this.currentHex);
        const explored = currentData ? currentData.explored : false;
        
        const hexData = {
            biome: biome,
            feature: feature,
            notes: notes,
            explored: explored
        };
        
        this.hexes.set(this.currentHex, hexData);
        this.saveToLocalStorage();
        
        // Update the main hex display with new biome icon
        this.refreshHexDisplay(this.currentHex);
        
        // Update neighbors display to reflect changes
        this.updateNeighborsDisplay(this.currentHex);
        
        // Update any neighbor displays that might show this hex
        this.refreshNeighborDisplays();
    }
    
    refreshHexDisplay(hexKey) {
        const hexElement = document.querySelector(`[data-hex="${hexKey}"]`);
        if (hexElement) {
            const hexGroup = hexElement.parentNode;
            const rect = hexElement.getBoundingClientRect();
            const svgRect = this.svg.getBoundingClientRect();
            
            // Get hex position from the hex group transform or calculate from grid
            const [col, row] = hexKey.split(',').map(Number);
            const hexHeight = this.hexSize * Math.sqrt(3);
            const hexWidth = this.hexSize * 2;
            const x = col * (hexWidth * 0.75) + 50;
            const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0) + 30;
            
            this.updateHexDisplay(hexGroup, hexKey, x, y);
        }
    }
    
    refreshNeighborDisplays() {
        // If we have a selected hex, refresh its neighbor display
        if (this.currentHex) {
            this.updateNeighborsDisplay(this.currentHex);
        }
    }

    setupEventListeners() {
        const saveBtn = document.getElementById('save-hex');
        saveBtn.addEventListener('click', () => this.saveHexData());
        
        const exploreBtn = document.getElementById('explore-hex');
        exploreBtn.addEventListener('click', () => this.exploreHex());
        
        const fogToggleBtn = document.getElementById('fog-of-war-toggle');
        fogToggleBtn.addEventListener('click', () => this.toggleFogOfWar());
        
        // Auto-save on field changes
        const biomeSelect = document.getElementById('hex-biome');
        const featureInput = document.getElementById('hex-feature');
        const notesTextarea = document.getElementById('hex-notes');
        
        biomeSelect.addEventListener('change', () => this.saveHexData());
        featureInput.addEventListener('blur', () => this.saveHexData());
        notesTextarea.addEventListener('blur', () => this.saveHexData());
    }

    clearSelection() {
        if (this.selectedHexElement) {
            this.selectedHexElement.classList.remove('selected');
            this.selectedHexElement = null;
        }
        
        this.currentHex = null;
        
        // Hide hex details and show default message
        document.getElementById('hex-details').style.display = 'none';
        document.getElementById('selected-hex-info').style.display = 'block';
        document.getElementById('neighbors-grid').innerHTML = '';
    }

    saveToLocalStorage() {
        const mapData = {
            version: '1.0',
            maps: {
                'Default Map': {
                    seed: 'Default Map',
                    hexes: Object.fromEntries(this.hexes)
                }
            },
            activeMap: 'Default Map',
            explorationMode: this.explorationMode
        };
        
        localStorage.setItem('hexMapData', JSON.stringify(mapData));
    }

    loadMapData() {
        const saved = localStorage.getItem('hexMapData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Load exploration mode setting
                this.explorationMode = data.explorationMode || false;
                
                const activeMap = data.maps[data.activeMap];
                if (activeMap && activeMap.hexes) {
                    // Load hexes and ensure backwards compatibility
                    const hexEntries = Object.entries(activeMap.hexes).map(([key, value]) => {
                        // Add explored field if missing (backwards compatibility)
                        if (value.explored === undefined) {
                            value.explored = false;
                        }
                        return [key, value];
                    });
                    this.hexes = new Map(hexEntries);
                    // Refresh all hex displays to show loaded icons
                    this.refreshAllHexDisplays();
                }
            } catch (e) {
                console.warn('Failed to load saved map data:', e);
            }
        }
    }
    
    toggleFogOfWar() {
        this.explorationMode = !this.explorationMode;
        this.updateFogToggleButton();
        this.updateHexVisibility();
        this.saveToLocalStorage();
    }

    updateFogToggleButton() {
        const fogToggleBtn = document.getElementById('fog-of-war-toggle');
        if (this.explorationMode) {
            fogToggleBtn.textContent = 'Fog of War: On';
            fogToggleBtn.classList.add('active');
        } else {
            fogToggleBtn.textContent = 'Fog of War: Off';
            fogToggleBtn.classList.remove('active');
        }
    }

    checkForStartingPointPrompt() {
        // Check if all hexes are unexplored (no explored hexes exist)
        const hasExploredHexes = Array.from(this.hexes.values()).some(hex => hex.explored);
        const promptDiv = document.getElementById('starting-point-prompt');
        
        if (!hasExploredHexes) {
            promptDiv.style.display = 'block';
        } else {
            promptDiv.style.display = 'none';
        }
    }

    refreshAllHexDisplays() {
        // Update all hexes to show their biome icons
        this.hexes.forEach((hexData, hexKey) => {
            if (hexData.biome && hexData.biome !== 'Unexplored') {
                this.refreshHexDisplay(hexKey);
            }
        });
        
        // Update fog toggle button state
        this.updateFogToggleButton();
        
        // Update visibility if exploration mode is enabled
        if (this.explorationMode) {
            this.updateHexVisibility();
        }
        
        // Check if we should show starting point prompt
        this.checkForStartingPointPrompt();
    }
    
    setupMessageListener() {
        // Listen for messages from settings window about exploration mode changes
        window.addEventListener('message', (event) => {
            if (event.data.type === 'explorationModeChanged') {
                this.explorationMode = event.data.explorationMode;
                this.updateHexVisibility();
            } else if (event.data.type === 'startingPointSet') {
                this.handleStartingPointSet(event.data);
            }
        });
    }

    handleStartingPointSet(data) {
        const hexKey = data.hexKey;
        
        // Update the hex data with the generated biome and mark as explored
        this.hexes.set(hexKey, data.hexData);
        
        // Add neighboring hexes data
        if (data.neighborHexes) {
            Object.keys(data.neighborHexes).forEach(nKey => {
                if (!this.hexes.has(nKey)) {
                    this.hexes.set(nKey, data.neighborHexes[nKey]);
                }
            });
        }
        
        // Save the updated data
        this.saveToLocalStorage();
        
        // Refresh displays for all generated hexes
        this.refreshHexDisplay(hexKey);
        if (data.neighborHexes) {
            Object.keys(data.neighborHexes).forEach(nKey => {
                this.refreshHexDisplay(nKey);
            });
        }
        
        // Select the starting hex and center view on it
        const hexElement = document.querySelector(`[data-hex="${hexKey}"]`);
        if (hexElement) {
            this.selectHex(hexKey, hexElement);
            
            // Scroll the hex into view (center it if possible)
            hexElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center', 
                inline: 'center' 
            });
        }
        
        // Update visibility if exploration mode is enabled
        if (this.explorationMode) {
            this.updateHexVisibility();
        }
        
        // Check starting point prompt
        this.checkForStartingPointPrompt();
    }
    
    getVisibleHexes() {
        if (!this.explorationMode) {
            // If exploration mode is off, all hexes are visible
            return new Set(Array.from(this.hexes.keys()));
        }
        
        const visibleHexes = new Set();
        
        // Add all explored hexes and their neighbors
        this.hexes.forEach((hexData, hexKey) => {
            if (hexData.explored) {
                visibleHexes.add(hexKey);
                
                // Add all neighbors of explored hexes
                const [col, row] = hexKey.split(',').map(Number);
                const neighbors = this.getNeighbors(col, row);
                neighbors.forEach(neighborKey => {
                    if (neighborKey !== null) {
                        visibleHexes.add(neighborKey);
                    }
                });
            }
        });
        
        return visibleHexes;
    }
    
    updateHexVisibility() {
        const visibleHexes = this.getVisibleHexes();
        
        // Update all hex elements' visibility
        const hexElements = document.querySelectorAll('[data-hex]');
        hexElements.forEach(hexElement => {
            const hexKey = hexElement.getAttribute('data-hex');
            const hexGroup = hexElement.parentNode;
            
            if (visibleHexes.has(hexKey)) {
                hexGroup.style.display = '';
                hexGroup.style.opacity = '1';
            } else {
                hexGroup.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HexMap();
});