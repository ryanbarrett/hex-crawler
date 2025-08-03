# HexMap Viewer

A fantasy-themed interactive hex map explorer with fog of war mechanics and procedural generation. Designed for tabletop RPG campaigns and exploration-based gameplay.

## ✨ Features

### 🗺️ Core Map Functionality
- **Interactive 12x12 hex grid** with SVG-based rendering
- **Click-to-explore mechanics** with detailed hex information panels
- **Biome system** with 8 distinct biomes: Forest, Plains, Mountains, Hills, Swamp, Desert, Ocean, River
- **Feature system** with over 300+ unique features specific to each biome
- **Notes system** for custom annotations and campaign notes
- **Auto-save functionality** with persistent browser storage

### 🌫️ Exploration Mode
- **Fog of War** toggle for discovery-based gameplay
- **Starting point generation** with 2d12 rolls or quick edge selection
- **Dynamic neighbor generation** when exploring new hexes
- **Biome clustering** for realistic terrain generation (60% chance neighbors match)
- **Procedural feature placement** with configurable density

### ⚙️ Map Management
- **Multiple map support** with create, rename, delete, and switching
- **Random map generator** with seeded generation for reproducible results
- **Terrain variety controls** (low/medium/high clustering)
- **Feature density settings** (sparse/normal/dense)
- **Water coverage options** (minimal/low/medium/high)
- **Import/Export functionality** with JSON format and version compatibility

### 🎨 Visual Design
- **Old fantasy parchment theme** with aged appearance
- **Fantasy typography** using Cinzel and Uncial Antiqua fonts
- **Biome-specific icons** with sepia tone filtering
- **Responsive layout** with mobile-friendly design
- **Spatial neighbor display** with hexagonal arrangement

### 🎯 Advanced Features
- **Help system** with comprehensive documentation
- **Starting point prompts** for unexplored maps
- **Edge/corner quick selection** for map boundaries
- **Coordinate validation** with visual feedback
- **Cross-window messaging** between main map and settings
- **Backup creation** before data deletion operations

## 📁 File Structure

```
hex-crawler/
├── index.html              # Main map interface
├── settings.html           # Map management and configuration
├── css/
│   └── style.css          # Parchment theme and responsive styles
├── js/
│   ├── main.js           # Core map functionality and exploration
│   └── settings.js       # Settings, generation, and data management
├── assets/
│   └── icons/            # Biome icons (placeholder directory)
├── CLAUDE.md             # Project specifications and design doc
├── CLAUDE.local.md       # Development notes
└── README.md
```

## 🎮 How to Use

### Basic Map Interaction
1. **Click any hex** to view and edit its information
2. **Edit biome, features, and notes** in the right panel
3. **Save changes** automatically when editing fields
4. **Navigate using neighbor hexes** for quick movement around the map

### Exploration Mode
1. **Enable Fog of War** using the header toggle button
2. **Set a starting point** in Settings → Exploration Mode
3. **Roll 2d12** for random coordinates or use quick edge selection
4. **Click "Explore!"** on any hex to mark it as discovered
5. **Generate neighbors** automatically when exploring new areas

### Map Management
1. **Create new maps** with custom names
2. **Switch between maps** using the dropdown in settings
3. **Generate random maps** with customizable parameters
4. **Export maps to JSON** for backup and sharing
5. **Import maps** to merge or replace existing data

## 🔧 Data Format

Maps are stored in browser localStorage with this structure:

```json
{
  "version": "1.0",
  "maps": {
    "My Adventure Map": {
      "seed": "adventure123",
      "hexes": {
        "0,0": {
          "biome": "Forest",
          "feature": "Ancient Grove",
          "notes": "Party camped here on day 3",
          "explored": true
        },
        "1,0": {
          "biome": "Plains",
          "feature": "",
          "notes": "",
          "explored": false
        }
      }
    }
  },
  "activeMap": "My Adventure Map",
  "explorationMode": true
}
```

## 🎲 Procedural Generation

### Biome Generation
- **Seeded random generation** for reproducible maps
- **Terrain clustering** for realistic geography
- **Ocean placement** based on water coverage settings
- **River generation** from mountains to oceans
- **Creek placement** near river systems

### Feature Generation
Each biome has unique features:
- **Forest**: Ancient Groves, Druid Circles, Bandit Camps, Fairy Circles
- **Plains**: Villages, Trading Posts, Stone Circles, Battlefields
- **Mountains**: Mines, Dragon Lairs, Ancient Fortresses, Crystal Caverns
- **Hills**: Watchtowers, Burial Mounds, Scout Posts, Stone Circles
- **Swamp**: Witch's Huts, Sunken Temples, Alchemist Gardens
- **Desert**: Oases, Nomad Camps, Buried Ruins, Starfall Craters
- **Ocean**: Shipwrecks, Coral Reefs, Lighthouses, Hidden Coves
- **River**: Bridges, Watermills, Ferry Crossings, Sacred Springs

## 🌐 Deployment

### GitHub Pages Setup
1. Push repository to GitHub
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)
4. Access via `https://username.github.io/repository-name`

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or server required

## 🎯 Advanced Usage

### Exploration Campaigns
- Use **fog of war** for discovery-based gameplay
- Set **starting points** at map edges for exploration campaigns
- **Generate neighbors** dynamically as players explore
- **Export maps** to share with other DMs or backup campaign progress

### World Building
- **Create multiple maps** for different regions
- Use **seeded generation** to create consistent worlds
- **Customize terrain and feature density** for different environments
- **Add detailed notes** for campaign-specific information

## 🔮 Future Enhancements

Potential improvements outlined in the design specification:
- Enhanced biome icons with hand-drawn aesthetics
- Cross-hex road and river generation systems
- Mountain elevation viewing for extended neighbor visibility
- Additional procedural generation algorithms
- Campaign integration features

---

Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and GitHub Pages hosting.