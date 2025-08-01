
# HexMap Viewer – Design Spec

## 📜 Project Overview

A lightweight browser-based hex map explorer with a parchment aesthetic. Core functionality:
	•	3-mile hexes with biome/feature/notes
	•	Player-visible hex grid with interactive elements
	•	Settings page for all map management and data operations

## 📋 Pages

index.html
	•	Render interactive hex grid
	•	On-click: show modal with:
	•	Biome
	•	Feature
	•	Notes
	•	Neighboring hex insights: “To the north, you see rolling hills…”

settings.html
	•	Create, rename, delete maps
	•	Switch active map
	•	Export current maps to JSON (download link)
	•	Import map from JSON (merge or overwrite)
	•	Validate schema (versioned)

## 🎨 Style
	•	Theme: Old fantasy parchment
	•	Typography: Fantasy font (e.g., “Uncial Antiqua”)
	•	Icons: Hand-drawn biome symbols (SVG or PNG)
	•	Grid: Hex-based, styled with sketchy border effect

## 📁 Data Format

Same as README, with focus on version for import compatibility.

## ⚙️ Technologies
	•	HTML, CSS, JavaScript
	•	LocalStorage for state persistence
	•	JSON import/export via Blob/FileReader
	•	GitHub Pages-compatible (no server needed)

## 🧠 Advanced Ideas
	•	Procedural insights from adjacent hexes using heuristic text generation
	•	Text snippets seeded by hex content + biome + feature + elevation

Example: If North hex is Hills + River + Town:
“To the north, you see rolling hills and a river with a small town nestled between the slopes.”

## 🔍 Accessibility Goals
	•	Simple layout and keyboard accessible
	•	Responsive hex grid (mobile-friendly)

## 🔗 Export Plan
	•	JSON downloads include version number
	•	Validate on import and migrate if needed


## Gitignore

ignore anything that's not necessary to reproduce the app.
