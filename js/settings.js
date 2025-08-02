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

    generateRandomSeed() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let seed = '';
        for (let i = 0; i < 8; i++) {
            seed += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('map-seed').value = seed;
    }

    generateRandomMap() {
        const activeMapName = this.mapData.activeMap;
        if (!activeMapName || !this.mapData.maps[activeMapName]) {
            alert('Please select an active map first.');
            return;
        }

        const confirmed = confirm(
            `This will replace all hexes in "${activeMapName}" with a randomly generated map. ` +
            'This action cannot be undone. Continue?'
        );
        
        if (!confirmed) return;

        const seed = document.getElementById('map-seed').value || Date.now().toString();
        const terrainDensity = document.getElementById('terrain-density').value;
        const featureDensity = document.getElementById('feature-density').value;
        const waterAmount = document.getElementById('water-amount').value;

        const generator = new MapGenerator(seed);
        const generatedHexes = generator.generateMap({
            cols: 12,
            rows: 12,
            terrainDensity,
            featureDensity,
            waterAmount
        });

        this.mapData.maps[activeMapName].hexes = generatedHexes;
        this.mapData.maps[activeMapName].seed = seed;
        this.saveMapData();

        alert(`Random map generated successfully with seed: ${seed}`);
    }

    deleteAllData() {
        // Triple confirmation with detailed warnings
        const firstConfirm = confirm(
            '⚠️ DELETE ALL DATA WARNING ⚠️\n\n' +
            'This will permanently delete:\n' +
            '• All your maps\n' +
            '• All hex data\n' +
            '• All settings\n\n' +
            'A backup will be downloaded first.\n\n' +
            'Are you absolutely sure you want to continue?'
        );
        
        if (!firstConfirm) return;

        const secondConfirm = confirm(
            '⚠️ FINAL WARNING ⚠️\n\n' +
            'This action CANNOT be undone!\n\n' +
            'Type "DELETE" in the next prompt to confirm deletion.\n\n' +
            'Continue?'
        );
        
        if (!secondConfirm) return;

        const finalConfirmation = prompt(
            'Type "DELETE" (all caps) to confirm permanent deletion of all data:'
        );
        
        if (finalConfirmation !== 'DELETE') {
            alert('Deletion cancelled. Data is safe.');
            return;
        }

        try {
            // Step 1: Create and download backup
            this.downloadBackupBeforeDeletion();
            
            // Step 2: Wait a moment for download to start
            setTimeout(() => {
                // Step 3: Clear all localStorage data
                localStorage.removeItem('hexMapData');
                
                // Step 4: Reset to default state
                this.mapData = {
                    version: '1.0',
                    maps: {
                        'Default Map': {
                            seed: 'Default Map',
                            hexes: {}
                        }
                    },
                    activeMap: 'Default Map'
                };
                
                // Step 5: Save default state
                this.saveMapData();
                
                // Step 6: Update UI
                this.updateMapSelect();
                
                alert(
                    '✅ All data has been deleted successfully.\n\n' +
                    'A backup was downloaded to your computer.\n' +
                    'A new "Default Map" has been created.'
                );
                
            }, 1000); // 1 second delay to ensure backup download starts
            
        } catch (error) {
            alert('Error during deletion process: ' + error.message);
            console.error('Deletion error:', error);
        }
    }

    downloadBackupBeforeDeletion() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                         new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        
        const backupData = {
            ...this.mapData,
            backup: {
                created: new Date().toISOString(),
                reason: 'Pre-deletion backup',
                totalMaps: Object.keys(this.mapData.maps).length
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `hexmaps-backup-before-deletion-${timestamp}.json`;
        
        // Force download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Backup downloaded before deletion');
    }

    setupEventListeners() {
        document.getElementById('create-map').addEventListener('click', () => this.createMap());
        document.getElementById('map-select').addEventListener('change', () => this.switchMap());
        document.getElementById('rename-map').addEventListener('click', () => this.renameMap());
        document.getElementById('delete-map').addEventListener('click', () => this.deleteMap());
        document.getElementById('export-maps').addEventListener('click', () => this.exportMaps());
        document.getElementById('import-maps').addEventListener('click', () => this.importMaps());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));
        
        // Map generator event listeners
        document.getElementById('random-seed').addEventListener('click', () => this.generateRandomSeed());
        document.getElementById('generate-map').addEventListener('click', () => this.generateRandomMap());
        
        // Danger zone event listeners
        document.getElementById('delete-all-data').addEventListener('click', () => this.deleteAllData());
    }
}

class MapGenerator {
    constructor(seed) {
        this.seed = seed;
        this.random = this.createSeededRandom(seed);
        
        this.biomes = [
            'Forest', 'Plains', 'Mountains', 'Hills', 'Swamp', 
            'Desert', 'Ocean', 'River'
        ];
        
        this.features = {
            "Forest": [
                'Ancient Grove', 'Logging Camp', 'Druid Circle', 'Hidden Shrine', 'Bandit Camp', 'Hunter\'s Lodge',
                'Ent Burial Site', 'Forgotten Ranger Post', 'Mushroom Ring', 'Wild Orchard', 'Fairy Circle',
                'Abandoned Cabin', 'Elf Encampment', 'Forest Beacon', 'Thorn Thicket', 'Animal Den', 'Overgrown Path',
                'Singing Stones', 'Moonlit Glade', 'Treefolk Settlement', 'Witch Circle', 'Squirrelfolk Village',
                'Canopy Watchpost', 'Hollow Tree Refuge', 'Ranger\'s Trapline', 'Spirit Grove', 'Misty Clearing',
                'Hidden Pool', 'Woodland Grave', 'Treehouse Lookout', 'Dryad’s Hollow', 'Forest Maze', 'Secret Garden',
                'Camouflaged Tent', 'Root-Cursed Ring', 'Crashed Skycraft', 'Beast Pit', 'Elven Waystone',
                'Hanging Moss Bridge', 'Bloodthistle Patch', 'Druidic Arch', 'Logging Rails', 'Night Bloom Hollow',
                'Chittering Hollow', 'Briar Gate', 'Vine-Strangled Statue', 'Ancient War Camp', 'Woodland Sanctuary',
                'Direwolf Den', 'Fungus Grotto'
            ],
            "Plains": [
                'Village', 'Trading Post', 'Windmill', 'Stone Circle', 'Battlefield', 'Crossroads Inn',
                'Grain Silo', 'Horse Ranch', 'Ranger’s Camp', 'Ruined Watchpost', 'Fallow Field',
                'Wandering Caravan', 'Hilltop Altar', 'Nomad Stones', 'Weathered Statue', 'Open-Air Market',
                'Sunken Barrow', 'Traveling Circus', 'Abandoned Tent', 'Militia Training Grounds',
                'Field of Bones', 'Plains Stonehenge', 'Hay Bale Maze', 'Plague Marker', 'Giant Badger Burrow',
                'Messenger’s Crossroads', 'Comet Impact Crater', 'Shepherd Encampment', 'Rolling Boulders',
                'Lone Oak Tree', 'Tilled Patch', 'Sacrificial Stones', 'Bannered Hill', 'Trampled Battleground',
                'Fey Circle', 'Weather Station', 'Scarecrow Sentinel', 'Buffalo Wallows', 'Hilltop Cairn',
                'Dust Devil Path', 'Corn Effigy', 'Migrant Nest', 'Wagoneer’s Stop', 'Wind Shrine',
                'Buried Time Capsule', 'Flower Field', 'Shimmering Mirage', 'Old Farmstead', 'Ghost Herd Tracks'
            ],
            "Mountains": [
                'Mine', 'Dwarven Outpost', 'Cave System', 'Observatory', 'Dragon Lair', 'Ancient Fortress',
                'Avalanche Path', 'Goat Trail', 'Glacier Crack', 'Monastery in the Peaks', 'Collapsed Tunnel',
                'Meteor Crater', 'Hermit’s Peak', 'Frozen Waterfall', 'Crystal Cavern', 'Abandoned Lift',
                'Mountain Shrine', 'Troll Bridge', 'Sacred Spire', 'Thundering Pass', 'Eagle’s Eyrie',
                'Smuggler Hideout', 'Snow Leopard Ledge', 'Highlander Camp', 'Lava Vent', 'Seismic Altar',
                'Frost Giant Camp', 'Ridge Camp', 'Scree Field', 'Runestone Slab', 'Haunted Pass',
                'Storm Watch Tower', 'Permafrost Crypt', 'Stalactite Forest', 'Lonely Cabin', 'Miners’ Graveyard',
                'Orc Warcamp', 'Fog Chasm', 'Magma Chamber', 'Glinting Cliffside', 'Collapsed Rope Bridge',
                'Beacon Tower', 'Goat Bones Pile', 'Abandoned Siege Engine', 'Falling Rock Zone',
                'Thunderbird Nest', 'Deep Echo Cavern', 'Hidden Dwarf Vault', 'Ice Spider Lair'
            ],
            "Hills": [
                'Watchtower', 'Shepherd\'s Hut', 'Burial Mound', 'Old Ruins', 'Hillside Village', 'Stone Quarry',
                'Smuggler\'s Tunnel', 'Rolling Cairns', 'Wind-Cut Pass', 'Hilltop Shrine', 'Scout Post',
                'Overgrown Barrows', 'Thistle Patch', 'Crumbling Mill', 'Stone Circles', 'Bandit Lookout',
                'Wild Horse Herd', 'Traveler\'s Shrine', 'Witch\'s Circle', 'Mossy Caves', 'Singing Ridge',
                'Lichen Gully', 'Cave of Whispers', 'Rockslide Path', 'Lone Pine Peak', 'Hermit\'s Nook',
                'Goatherd Camp', 'Hidden Spring', 'Storm-Touched Hill', 'Old Battlefield Rise',
                'Lightning-Struck Tree', 'Eroded Crossroads', 'Griffon Roost', 'Scout Firepit',
                'Ruin-Filled Ravine', 'Buried Stones', 'Wind Chime Ridge', 'Slumbering Titan Face',
                'Windswept Tumulus', 'Forgotten Farmhouse', 'Hidden Den', 'Runed Stones', 'Wildflower Crest',
                'Ash-Covered Hill', 'Old Signpost', 'Giant Molehill', 'Thief’s Shortcut', 'Goblin Lookout',
                'Moonrise Perch'
            ],
            "Swamp": [
                'Witch\'s Hut', 'Alchemist Garden', 'Sunken Temple', 'Will O\' Wisp Grove', 'Bog Iron Mine',
                'Floating Dock', 'Leech Pond', 'Sunken Library', 'Ghoul Tree', 'Fungal Bog',
                'Croaking Circle', 'Rotting Cabin', 'Reed Maze', 'Alligator Nest', 'Fog Totem',
                'Moss-Covered Altar', 'Sinking Statue', 'Vine-Choked Tomb', 'Poison Lily Grove',
                'Toadfolk Village', 'Brine Bubble Pool', 'Ghost Light Crossing', 'Witchweed Clearing',
                'Mud-Stained Alchemy Cart', 'Ooze Pool', 'Spore-Storm Zone', 'Snapping Turtle Mound',
                'Bog Cauldron', 'Whimpering Marsh', 'Decay Shrine', 'Spirit Lantern Grove',
                'Fungus Tower', 'Mire Sentinel', 'Dragonfly Swarm Nest', 'Hag’s Larder',
                'Sorrow Roots', 'Gasping Fen', 'Swallowed Bridge', 'Crabfolk Trapline',
                'Pestilent Spring', 'Wading Stone', 'Sedgefield Grave', 'Smothered Path',
                'Ghost Croft', 'Cursed Hammock', 'Quagmire Bones', 'Mosquito Mote',
                'Bloodvine Patch', 'Swampfire Circle'
            ],
            "Desert": [
                'Oasis', 'Nomad Camp', 'Buried Ruins', 'Salt Mine', 'Mirage Pool', 'Sandstone Cliffs',
                'Camel Graveyard', 'Wind-Cut Canyon', 'Scorpion Nest', 'Crumbling Watchtower',
                'Sand Trap Dunes', 'Starfall Crater', 'Glass Field', 'Ancient Aquifer',
                'Whispering Monolith', 'Sun-Bleached Shrine', 'Abandoned Caravansary',
                'Silt Basin', 'Burned Caravan', 'Sandstorm Altar', 'Snake Pit',
                'Dune Sea Totem', 'Sunken Vault', 'Trader/s Crossroads', 'Sandwyrm Tunnel',
                'Ghost Caravan Route', 'Wandering Bones', 'Salt Flat Encampment',
                'Cactus Grove', 'Beetle Shell Pit', 'Sun Idol', 'Cave of Echoes',
                'Deserted Bazaar', 'Dry River Gully', 'Golden Dunes', 'Hissing Vents',
                'Lost Camel Bell', 'Trickster Shrine', 'Dust Maw', 'Razor Ridge',
                'Nomad Oracle Tent', 'Heat Mirage Idol', 'Crumbling Stone Arch',
                'Buried Time Temple', 'Windmill Blades', 'Forgotten Route Signpost',
                'Ritual Pit', 'Desert Glass Tower', 'Wanderer’s Bones'
            ],
            "Ocean": [
                'Shipwreck', 'Coral Reef', 'Sea Cave', 'Lighthouse', 'Fishing Village', 'Hidden Cove',
                'Kelp Forest', 'Siren Rocks', 'Whale Bones', 'Sunken Observatory', 'Smuggler’s Shipwreck',
                'Pearl Diver’s Dock', 'Tide Pool Maze', 'Shimmering Whirlpool', 'Crab Shell Isles',
                'Singing Coral Pillar', 'Lost Sail Shrine', 'Drowned Library', 'Seashell Totem',
                'Sunken Galleon', 'Giant Clam Nest', 'Saltwater Spring', 'Barnacle Arch',
                'Leviathan Bones', 'Drifting Cargo', 'Eel Trench', 'Merfolk Ruins',
                'Bioluminescent Shelf', 'Coral Throne', 'Shark Breeding Grounds',
                'Abandoned Buoy Post', 'Sea Witch Altar', 'Foam-Covered Cross',
                'Deep Current Gateway', 'Dolphin Nesting Ground', 'Jellyfish Bloom',
                'Floating Algae Patch', 'Crashing Tide Column', 'Ghost Sailor Camp',
                'Squid Nesting Grounds', 'Hidden Harpoon Cache', 'Driftwood Isle',
                'Sunken Bell Tower', 'Coral Tunnel', 'Mariner’s Grave', 'Ocean Vent',
                'Sail Fragment Ring', 'Stormwreck Archipelago', 'Gull-Ridden Rocks'
            ],
            "River": [
                'Bridge', 'Ferry Crossing', 'Watermill', 'Fishing Spot', 'River Port', 'Sacred Spring',
                'Log Raft Camp', 'Flooded Shrine', 'Rapids Watch', 'Eel Trap Weir', 'River Troll Nest',
                'Old Dam Ruins', 'Mist Dock', 'Whispering Brook', 'Floating Market',
                'Fishbone Weir', 'Dry Season Crossing', 'Drifted Totem', 'Water Sprite Hollow',
                'Floodplain Graveyard', 'Silt Nest', 'Wade Point', 'Crystal Ford',
                'Torrent Cliffs', 'Water Lantern Spot', 'Otter Holt', 'Smuggler/’s Barge',
                'Reed Boat Dock', 'Drowned Altar', 'River Witch Raft', 'Crocodile Bend',
                'Singing Falls', 'Fisherfolk Camp', 'Logjam Shelter', 'Sunken Bridge Piles',
                'Boathouse Ruins', 'Riverside Monolith', 'Damaged Canal Gate',
                'Flood Marker Obelisk', 'Leaning Pier', 'Mudflat Trail', 'Catfish Pond',
                'Drifting Effigies', 'Rope Ferry', 'Tide-Touched Root',
                'Waterside Offering Basket', 'Stone Skip Hollow', 'Spring Maw', 'Torrent Shrine'
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

    generateMap(options) {
        const { cols, rows, terrainDensity, featureDensity, waterAmount } = options;
        const hexes = {};
        
        // Step 1: Generate base terrain
        this.generateTerrain(hexes, cols, rows, terrainDensity, waterAmount);
        
        // Step 2: Generate rivers
        this.generateRivers(hexes, cols, rows);
        
        // Step 3: Add creeks near rivers
        this.addCreeks(hexes, cols, rows);
        
        // Step 4: Generate features
        this.generateFeatures(hexes, cols, rows, featureDensity);
        
        return hexes;
    }

    generateTerrain(hexes, cols, rows, density, waterAmount) {
        const clusterSize = density === 'low' ? 8 : density === 'medium' ? 5 : 3;
        const oceanChance = waterAmount === 'minimal' ? 0.05 : 
                          waterAmount === 'low' ? 0.1 : 
                          waterAmount === 'medium' ? 0.15 : 0.25;
        
        // First pass: place ocean hexes
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const hexKey = `${col},${row}`;
                if (this.random() < oceanChance) {
                    hexes[hexKey] = { biome: 'Ocean', feature: '', notes: '' };
                }
            }
        }
        
        // Second pass: generate land biomes with clustering
        const landBiomes = this.biomes.filter(b => b !== 'Ocean' && b !== 'River');
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const hexKey = `${col},${row}`;
                if (hexes[hexKey]) continue; // Already has ocean
                
                // Check neighbors for clustering
                const neighbors = this.getNeighbors(col, row, cols, rows);
                const neighborBiomes = neighbors
                    .filter(nKey => hexes[nKey])
                    .map(nKey => hexes[nKey].biome)
                    .filter(biome => biome !== 'Ocean' && biome !== 'River');
                
                let biome;
                if (neighborBiomes.length > 0 && this.random() < 0.7) {
                    // Cluster with existing biome
                    biome = neighborBiomes[Math.floor(this.random() * neighborBiomes.length)];
                } else {
                    // Random new biome
                    biome = landBiomes[Math.floor(this.random() * landBiomes.length)];
                }
                
                hexes[hexKey] = { biome, feature: '', notes: '' };
            }
        }
    }

    generateRivers(hexes, cols, rows) {
        const mountainHexes = Object.keys(hexes)
            .filter(key => hexes[key].biome === 'Mountains');
        
        const oceanHexes = Object.keys(hexes)
            .filter(key => hexes[key].biome === 'Ocean');
        
        if (mountainHexes.length === 0 || oceanHexes.length === 0) return;
        
        // Generate 1-3 rivers
        const numRivers = Math.floor(this.random() * 3) + 1;
        
        for (let i = 0; i < numRivers; i++) {
            const startHex = mountainHexes[Math.floor(this.random() * mountainHexes.length)];
            const targetOcean = oceanHexes[Math.floor(this.random() * oceanHexes.length)];
            
            this.generateRiverPath(hexes, startHex, targetOcean, cols, rows);
        }
    }

    generateRiverPath(hexes, start, target, cols, rows) {
        const [startCol, startRow] = start.split(',').map(Number);
        const [targetCol, targetRow] = target.split(',').map(Number);
        
        let currentCol = startCol;
        let currentRow = startRow;
        const visited = new Set();
        
        while (visited.size < 20) { // Prevent infinite loops
            const currentKey = `${currentCol},${currentRow}`;
            if (visited.has(currentKey)) break;
            visited.add(currentKey);
            
            // Don't overwrite ocean or existing rivers
            if (hexes[currentKey] && hexes[currentKey].biome !== 'Ocean' && hexes[currentKey].biome !== 'River') {
                hexes[currentKey].biome = 'River';
                hexes[currentKey].feature = '';
            }
            
            // Check if we've reached an ocean
            const neighbors = this.getNeighbors(currentCol, currentRow, cols, rows);
            const oceanNeighbor = neighbors.find(nKey => hexes[nKey] && hexes[nKey].biome === 'Ocean');
            if (oceanNeighbor) break;
            
            // Move toward target with some randomness
            const deltaCol = targetCol - currentCol;
            const deltaRow = targetRow - currentRow;
            
            const possibleMoves = [];
            const neighborCoords = this.getNeighborCoords(currentCol, currentRow);
            
            neighborCoords.forEach(([nCol, nRow]) => {
                if (nCol >= 0 && nCol < cols && nRow >= 0 && nRow < rows) {
                    const weight = 1 + 
                        (Math.sign(deltaCol) === Math.sign(nCol - currentCol) ? 2 : 0) +
                        (Math.sign(deltaRow) === Math.sign(nRow - currentRow) ? 2 : 0);
                    
                    for (let w = 0; w < weight; w++) {
                        possibleMoves.push([nCol, nRow]);
                    }
                }
            });
            
            if (possibleMoves.length === 0) break;
            
            const [nextCol, nextRow] = possibleMoves[Math.floor(this.random() * possibleMoves.length)];
            currentCol = nextCol;
            currentRow = nextRow;
        }
    }

    addCreeks(hexes, cols, rows) {
        const riverHexes = Object.keys(hexes)
            .filter(key => hexes[key].biome === 'River');
        
        riverHexes.forEach(riverKey => {
            const [col, row] = riverKey.split(',').map(Number);
            const neighbors = this.getNeighbors(col, row, cols, rows);
            
            neighbors.forEach(neighborKey => {
                if (hexes[neighborKey] && 
                    hexes[neighborKey].biome !== 'River' && 
                    hexes[neighborKey].biome !== 'Ocean' &&
                    !hexes[neighborKey].feature &&
                    this.random() < 0.3) {
                    hexes[neighborKey].feature = 'Creek';
                }
            });
        });
    }

    generateFeatures(hexes, cols, rows, density) {
        const featureChance = density === 'sparse' ? 0.15 : 
                            density === 'normal' ? 0.25 : 0.4;
        
        Object.keys(hexes).forEach(hexKey => {
            const hex = hexes[hexKey];
            if (hex.feature || this.random() > featureChance) return;
            
            const biomeFeatures = this.features[hex.biome];
            if (biomeFeatures && biomeFeatures.length > 0) {
                hex.feature = biomeFeatures[Math.floor(this.random() * biomeFeatures.length)];
            }
        });
    }

    getNeighbors(col, row, cols, rows) {
        return this.getNeighborCoords(col, row)
            .filter(([nCol, nRow]) => nCol >= 0 && nCol < cols && nRow >= 0 && nRow < rows)
            .map(([nCol, nRow]) => `${nCol},${nRow}`);
    }

    getNeighborCoords(col, row) {
        const isEvenCol = col % 2 === 0;
        const coords = [];
        
        // Return in same order as main.js: ['NW', 'N', 'NE', 'SW', 'S', 'SE']
        
        // NW (Northwest)
        if (isEvenCol) {
            coords.push([col - 1, row - 1]);
        } else {
            coords.push([col - 1, row]);
        }
        
        // N (North)
        coords.push([col, row - 1]);
        
        // NE (Northeast)
        if (isEvenCol) {
            coords.push([col + 1, row - 1]);
        } else {
            coords.push([col + 1, row]);
        }
        
        // SW (Southwest)
        if (isEvenCol) {
            coords.push([col - 1, row]);
        } else {
            coords.push([col - 1, row + 1]);
        }
        
        // S (South)
        coords.push([col, row + 1]);
        
        // SE (Southeast)
        if (isEvenCol) {
            coords.push([col + 1, row]);
        } else {
            coords.push([col + 1, row + 1]);
        }
        
        return coords;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new MapSettings();
});