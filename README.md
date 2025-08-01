
# HexMap Viewer

A simple, two-page hex map app with old-world fantasy style, persistent local data, and full import/export support. Designed for hosting on GitHub Pages.

## 🔧 Features
	•	Two HTML pages: index.html (map) and settings.html (management)
	•	Browser localStorage for storing multiple maps
	•	Import/export of maps to JSON with versioning for compatibility
	•	Map creation, deletion, renaming, and switching
	•	Click on hexes to view/edit biome, feature, notes
	•	Insight generation from neighboring hexes
	•	Gritty hand-drawn-style icons for biomes (TBD)
	•	Styled like an old fantasy map with parchment theme and fantasy fonts

## 📁 File Structure

📁 hexmap/
├── index.html
├── settings.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── settings.js
├── assets/
│   ├── icons/        # Biome icons (SVG or PNG, gritty style)
│   └── fonts/        # Fantasy fonts
├── data/
│   └── sample-map.json
└── README.md

## 🚧 TODO
	•	Design and render SVG or canvas-based hex grid
	•	Implement click/inspect on hex
	•	Neighbor hex insight system
	•	Style page like a gritty old map
	•	Add fantasy font
	•	Add localStorage schema (maps, activeMap, version)
	•	Implement seed-based procedural map gen
	•	Add import/export buttons
	•	Design settings UI (create, rename, delete maps)
	•	Support schema versioning for future compatibility
	•	Source or create gritty biome icons for:
	•	Forest
	•	Plains
	•	Mountains
	•	Swamp
	•	Desert
	•	Hills
	•	Tundra
	•	Jungle

##  🧪 Sample Data Structure

{
  "version": "1.0",
  "maps": {
    "My Cool Map": {
      "seed": "My Cool Map",
      "hexes": {
        "0,0": {"biome": "Forest", "feature": "Ruins", "notes": "Overgrown"},
        "0,1": {"biome": "Hills", "feature": "Camp", "notes": "Abandoned"}
      }
    }
  },
  "activeMap": "My Cool Map"
}

📦 Hosting
	•	Just push to a GitHub repo and enable GitHub Pages.

⸻

