class HexMap {
    constructor() {
        this.hexSize = 30;
        this.hexes = new Map();
        this.svg = document.getElementById('hex-grid');
        this.modal = document.getElementById('hex-modal');
        this.currentHex = null;
        
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
        text.setAttribute('y', y + 5);
        text.setAttribute('class', 'hex-text');
        text.textContent = hexKey;
        
        hexGroup.appendChild(hexagon);
        hexGroup.appendChild(text);
        
        hexagon.addEventListener('click', () => this.openHexModal(hexKey));
        
        this.svg.appendChild(hexGroup);
        
        if (!this.hexes.has(hexKey)) {
            this.hexes.set(hexKey, {
                biome: 'Unexplored',
                feature: '',
                notes: ''
            });
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

    openHexModal(hexKey) {
        this.currentHex = hexKey;
        const hexData = this.hexes.get(hexKey) || { biome: 'Unexplored', feature: '', notes: '' };
        
        document.getElementById('hex-biome').textContent = hexData.biome;
        document.getElementById('hex-feature').textContent = hexData.feature || 'None';
        document.getElementById('hex-notes').value = hexData.notes || '';
        
        this.generateNeighborInsights(hexKey);
        
        this.modal.style.display = 'block';
    }

    generateNeighborInsights(hexKey) {
        const [col, row] = hexKey.split(',').map(Number);
        const neighbors = this.getNeighbors(col, row);
        const neighborsDiv = document.getElementById('hex-neighbors');
        
        let insights = [];
        const directions = ['north', 'northeast', 'southeast', 'south', 'southwest', 'northwest'];
        
        neighbors.forEach((neighborKey, index) => {
            if (neighborKey && this.hexes.has(neighborKey)) {
                const neighborData = this.hexes.get(neighborKey);
                if (neighborData.biome !== 'Unexplored') {
                    const direction = directions[index];
                    let insight = `To the ${direction}, `;
                    
                    if (neighborData.biome && neighborData.feature) {
                        insight += `you see ${neighborData.biome.toLowerCase()} with ${neighborData.feature.toLowerCase()}.`;
                    } else if (neighborData.biome) {
                        insight += `you see ${neighborData.biome.toLowerCase()}.`;
                    }
                    
                    insights.push(insight);
                }
            }
        });
        
        neighborsDiv.textContent = insights.length > 0 
            ? insights.join(' ') 
            : 'The surrounding areas remain unexplored...';
    }

    getNeighbors(col, row) {
        const isEvenCol = col % 2 === 0;
        const neighbors = [];
        
        if (isEvenCol) {
            neighbors.push(`${col},${row - 1}`);     // north
            neighbors.push(`${col + 1},${row - 1}`); // northeast
            neighbors.push(`${col + 1},${row}`);     // southeast
            neighbors.push(`${col},${row + 1}`);     // south
            neighbors.push(`${col - 1},${row}`);     // southwest
            neighbors.push(`${col - 1},${row - 1}`); // northwest
        } else {
            neighbors.push(`${col},${row - 1}`);     // north
            neighbors.push(`${col + 1},${row}`);     // northeast
            neighbors.push(`${col + 1},${row + 1}`); // southeast
            neighbors.push(`${col},${row + 1}`);     // south
            neighbors.push(`${col - 1},${row + 1}`); // southwest
            neighbors.push(`${col - 1},${row}`);     // northwest
        }
        
        return neighbors;
    }

    saveHexData() {
        if (!this.currentHex) return;
        
        const notes = document.getElementById('hex-notes').value;
        const hexData = this.hexes.get(this.currentHex);
        
        hexData.notes = notes;
        this.hexes.set(this.currentHex, hexData);
        
        this.saveToLocalStorage();
        this.closeModal();
    }

    setupEventListeners() {
        const closeBtn = document.querySelector('.close');
        const saveBtn = document.getElementById('save-hex');
        const cancelBtn = document.getElementById('cancel-hex');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        saveBtn.addEventListener('click', () => this.saveHexData());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.currentHex = null;
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
                }
            } catch (e) {
                console.warn('Failed to load saved map data:', e);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HexMap();
});