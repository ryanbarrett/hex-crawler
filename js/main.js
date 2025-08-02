class HexMap {
    constructor() {
        this.hexSize = 30;
        this.hexes = new Map();
        this.svg = document.getElementById('hex-grid');
        this.currentHex = null;
        this.selectedHexElement = null;
        
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
    }

    initializeMap() {
        this.generateHexGrid();
    }

    generateHexGrid() {
        const cols = 12;
        const rows = 8;
        const hexHeight = this.hexSize * Math.sqrt(3);
        const hexWidth = this.hexSize * 2;
        
        this.svg.innerHTML = '';
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (hexWidth * 0.75) + 60;
                const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0) + 60;
                
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
                notes: ''
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
            icon.setAttribute('x', x - 26);
            icon.setAttribute('y', y - 26);
            icon.setAttribute('width', 52);
            icon.setAttribute('height', 52);
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
        const hexData = this.hexes.get(hexKey) || { biome: 'Unexplored', feature: '', notes: '' };
        
        // Show hex details
        document.getElementById('selected-hex-info').style.display = 'none';
        document.getElementById('hex-details').style.display = 'block';
        
        // Update form fields
        document.getElementById('hex-coords').textContent = hexKey;
        document.getElementById('hex-biome').value = hexData.biome;
        document.getElementById('hex-feature').value = hexData.feature || '';
        document.getElementById('hex-notes').value = hexData.notes || '';
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
            } else {
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
        
        // Return in order: ['NW', 'N', 'NE', 'SW', 'S', 'SE']
        
        // NW (Northwest)
        if (isEvenCol) {
            neighbors.push(`${col - 1},${row - 1}`);
        } else {
            neighbors.push(`${col - 1},${row}`);
        }
        
        // N (North)
        neighbors.push(`${col},${row - 1}`);
        
        // NE (Northeast)
        if (isEvenCol) {
            neighbors.push(`${col + 1},${row - 1}`);
        } else {
            neighbors.push(`${col + 1},${row}`);
        }
        
        // SW (Southwest)
        if (isEvenCol) {
            neighbors.push(`${col - 1},${row}`);
        } else {
            neighbors.push(`${col - 1},${row + 1}`);
        }
        
        // S (South)
        neighbors.push(`${col},${row + 1}`);
        
        // SE (Southeast)
        if (isEvenCol) {
            neighbors.push(`${col + 1},${row}`);
        } else {
            neighbors.push(`${col + 1},${row + 1}`);
        }
        
        return neighbors;
    }

    saveHexData() {
        if (!this.currentHex) return;
        
        const biome = document.getElementById('hex-biome').value;
        const feature = document.getElementById('hex-feature').value;
        const notes = document.getElementById('hex-notes').value;
        
        const hexData = {
            biome: biome,
            feature: feature,
            notes: notes
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
            const x = col * (hexWidth * 0.75) + 60;
            const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0) + 60;
            
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
            activeMap: 'Default Map'
        };
        
        localStorage.setItem('hexMapData', JSON.stringify(mapData));
    }

    loadMapData() {
        const saved = localStorage.getItem('hexMapData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const activeMap = data.maps[data.activeMap];
                if (activeMap && activeMap.hexes) {
                    this.hexes = new Map(Object.entries(activeMap.hexes));
                    // Refresh all hex displays to show loaded icons
                    this.refreshAllHexDisplays();
                }
            } catch (e) {
                console.warn('Failed to load saved map data:', e);
            }
        }
    }
    
    refreshAllHexDisplays() {
        // Update all hexes to show their biome icons
        this.hexes.forEach((hexData, hexKey) => {
            if (hexData.biome && hexData.biome !== 'Unexplored') {
                this.refreshHexDisplay(hexKey);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HexMap();
});