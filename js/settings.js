class MapSettings {
    constructor() {
        this.mapData = this.loadMapData();
        this.setupEventListeners();
        this.updateMapSelect();
    }

    loadMapData() {
        const saved = localStorage.getItem('hexMapData');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load map data:', e);
            }
        }
        
        return {
            version: '1.0',
            maps: {
                'Default Map': {
                    seed: 'Default Map',
                    hexes: {}
                }
            },
            activeMap: 'Default Map'
        };
    }

    saveMapData() {
        localStorage.setItem('hexMapData', JSON.stringify(this.mapData));
    }

    updateMapSelect() {
        const select = document.getElementById('map-select');
        select.innerHTML = '<option value="">Select a map...</option>';
        
        Object.keys(this.mapData.maps).forEach(mapName => {
            const option = document.createElement('option');
            option.value = mapName;
            option.textContent = mapName;
            if (mapName === this.mapData.activeMap) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    createMap() {
        const nameInput = document.getElementById('new-map-name');
        const mapName = nameInput.value.trim();
        
        if (!mapName) {
            alert('Please enter a map name.');
            return;
        }
        
        if (this.mapData.maps[mapName]) {
            alert('A map with this name already exists.');
            return;
        }
        
        this.mapData.maps[mapName] = {
            seed: mapName,
            hexes: {}
        };
        
        this.mapData.activeMap = mapName;
        this.saveMapData();
        this.updateMapSelect();
        
        nameInput.value = '';
        alert(`Map "${mapName}" created and set as active.`);
    }

    switchMap() {
        const select = document.getElementById('map-select');
        const selectedMap = select.value;
        
        if (!selectedMap || !this.mapData.maps[selectedMap]) {
            return;
        }
        
        this.mapData.activeMap = selectedMap;
        this.saveMapData();
        
        alert(`Switched to map: ${selectedMap}`);
    }

    renameMap() {
        const select = document.getElementById('map-select');
        const currentMap = select.value;
        
        if (!currentMap) {
            alert('Please select a map to rename.');
            return;
        }
        
        const newName = prompt('Enter new name for the map:', currentMap);
        if (!newName || newName.trim() === '') {
            return;
        }
        
        const trimmedName = newName.trim();
        if (this.mapData.maps[trimmedName]) {
            alert('A map with this name already exists.');
            return;
        }
        
        this.mapData.maps[trimmedName] = this.mapData.maps[currentMap];
        delete this.mapData.maps[currentMap];
        
        if (this.mapData.activeMap === currentMap) {
            this.mapData.activeMap = trimmedName;
        }
        
        this.saveMapData();
        this.updateMapSelect();
        
        alert(`Map renamed from "${currentMap}" to "${trimmedName}".`);
    }

    deleteMap() {
        const select = document.getElementById('map-select');
        const currentMap = select.value;
        
        if (!currentMap) {
            alert('Please select a map to delete.');
            return;
        }
        
        if (Object.keys(this.mapData.maps).length === 1) {
            alert('Cannot delete the last remaining map.');
            return;
        }
        
        const confirmed = confirm(`Are you sure you want to delete "${currentMap}"? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }
        
        delete this.mapData.maps[currentMap];
        
        if (this.mapData.activeMap === currentMap) {
            this.mapData.activeMap = Object.keys(this.mapData.maps)[0];
        }
        
        this.saveMapData();
        this.updateMapSelect();
        
        alert(`Map "${currentMap}" has been deleted.`);
    }

    exportMaps() {
        const dataStr = JSON.stringify(this.mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `hexmaps-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Maps exported successfully!');
    }

    importMaps() {
        const fileInput = document.getElementById('import-file');
        fileInput.click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!this.validateMapData(importedData)) {
                    alert('Invalid map file format.');
                    return;
                }
                
                const mergeChoice = confirm(
                    'Do you want to merge with existing maps?\n\n' +
                    'OK = Merge (keep existing maps)\n' +
                    'Cancel = Replace (delete existing maps)'
                );
                
                if (mergeChoice) {
                    Object.assign(this.mapData.maps, importedData.maps);
                } else {
                    this.mapData = importedData;
                }
                
                this.saveMapData();
                this.updateMapSelect();
                
                alert('Maps imported successfully!');
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }

    validateMapData(data) {
        return data && 
               data.version && 
               data.maps && 
               typeof data.maps === 'object' &&
               data.activeMap;
    }

    setupEventListeners() {
        document.getElementById('create-map').addEventListener('click', () => this.createMap());
        document.getElementById('map-select').addEventListener('change', () => this.switchMap());
        document.getElementById('rename-map').addEventListener('click', () => this.renameMap());
        document.getElementById('delete-map').addEventListener('click', () => this.deleteMap());
        document.getElementById('export-maps').addEventListener('click', () => this.exportMaps());
        document.getElementById('import-maps').addEventListener('click', () => this.importMaps());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MapSettings();
});