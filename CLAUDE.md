# HexMap Viewer – Project Recreation Guide

## 📜 Project Overview

A complete hex map exploration application with fog of war mechanics, procedural generation, and campaign management tools. Built for tabletop RPG use with a fantasy parchment aesthetic.

**Core Features:**
- Interactive 12x12 hex grid with SVG rendering
- Fog of war and exploration mechanics
- Procedural map generation with seeded randomization
- Multiple map management with import/export
- Starting point selection and neighbor generation
- Comprehensive biome and feature systems

## 🏗️ Implementation Architecture

### File Structure
```
hex-crawler/
├── index.html              # Main map interface
├── settings.html           # Map management and configuration
├── css/style.css          # Complete styling with parchment theme
├── js/main.js            # Core map functionality (830+ lines)
├── js/settings.js        # Settings and generation (950+ lines)
└── assets/icons/         # Biome icon placeholders
```

### Core Classes

**HexMap (main.js)**
- SVG hex grid generation and rendering
- Click selection and info panel updates
- Exploration mechanics with fog of war
- Neighbor coordinate calculations with even/odd column logic
- Data persistence and backwards compatibility

**HexExplorer (main.js)**
- Seeded random generation for exploration
- Biome clustering (60% neighbor match chance)
- Feature generation with density controls
- 300+ unique features across 8 biomes

**MapSettings (settings.js)**
- Multi-map management (create/rename/delete/switch)
- Starting point generation with 2d12 rolls
- Edge selection grid for quick positioning
- Import/export with JSON validation

**MapGenerator (settings.js)**
- Full random map generation with seeds
- Terrain clustering and ocean placement
- River generation from mountains to oceans
- Creek placement and feature distribution

## 🎨 Visual Design Implementation

### Theme: Old Fantasy Parchment
```css
:root {
    --parchment-bg: #f4f1e8;
    --parchment-dark: #e8e0d0;
    --ink-dark: #2c1810;
    --ink-medium: #5d4e37;
    --accent-gold: #d4af37;
    --border-brown: #8b6914;
}
```

### Typography
- **Primary**: 'Cinzel', serif
- **Headers**: 'Uncial Antiqua', cursive
- **Aged background**: Radial gradients with brown tints

### Layout
- **Split Layout**: 55% map section, 45% info panel
- **Responsive**: Mobile-friendly with flex direction changes
- **Modal System**: Full-screen overlays for help and prompts

## 🗺️ Hex Grid Mathematics

### Coordinate System
- **Grid**: 12x12 hexes (0-based indexing internally, 1-based for UI)
- **Even/Odd Column Logic**: Different neighbor calculations based on column parity
- **SVG Positioning**: Calculated hex points with proper spacing

### Neighbor Calculation Algorithm
```javascript
// Six neighbors in order: NW, N, NE, SW, S, SE
// Even columns vs odd columns have different offset patterns
getNeighbors(col, row) {
    const isEvenCol = col % 2 === 0;
    // Different coordinate offsets for even/odd columns
    // Bounds checking for 12x12 grid limits
    // Returns null for out-of-bounds coordinates
}
```

## 🌫️ Exploration Mode Features

### Fog of War System
- **Visibility Logic**: Show explored hexes + their neighbors
- **Toggle Button**: Header control with active state styling
- **Starting Point Prompt**: Automatic detection when no hexes explored

### Dynamic Generation
- **Explore Button**: Marks hex as explored, generates neighbors
- **Biome Clustering**: 60% chance neighbors match explored biome
- **Feature Density**: Configurable sparse/normal/dense placement

### Starting Point Selection
- **2d12 Rolls**: Random coordinate generation
- **Edge Grid**: 9-button layout for corners/edges/center
- **Coordinate Validation**: Real-time button state updates
- **Neighbor Generation**: Automatic creation of surrounding hexes

## 🎲 Procedural Generation Systems

### Biome Distribution
```javascript
biomes: ['Forest', 'Plains', 'Mountains', 'Hills', 'Swamp', 'Desert', 'Ocean', 'River']
```

### Feature Libraries
- **Forest**: 48 features (Ancient Grove, Druid Circle, Bandit Camp...)
- **Plains**: 48 features (Village, Trading Post, Stone Circle...)
- **Mountains**: 48 features (Mine, Dragon Lair, Ancient Fortress...)
- **Hills**: 48 features (Watchtower, Burial Mound, Scout Post...)
- **Swamp**: 48 features (Witch's Hut, Sunken Temple, Alchemist Garden...)
- **Desert**: 48 features (Oasis, Nomad Camp, Buried Ruins...)
- **Ocean**: 48 features (Shipwreck, Coral Reef, Lighthouse...)
- **River**: 48 features (Bridge, Watermill, Ferry Crossing...)

### Generation Algorithms
- **Terrain Clustering**: Neighbor-based biome propagation
- **River Systems**: Mountain-to-ocean pathfinding
- **Creek Placement**: 30% chance near rivers
- **Seeded Random**: Reproducible generation with hash functions

## 📊 Data Management

### Storage Schema
```javascript
{
  "version": "1.0",
  "maps": {
    "MapName": {
      "seed": "string",
      "hexes": {
        "col,row": {
          "biome": "string",
          "feature": "string", 
          "notes": "string",
          "explored": boolean
        }
      }
    }
  },
  "activeMap": "string",
  "explorationMode": boolean
}
```

### Persistence Features
- **Auto-save**: All changes immediately saved to localStorage
- **Backwards Compatibility**: Migration for missing 'explored' field
- **Import/Export**: JSON with validation and merge options
- **Backup Creation**: Automatic before dangerous operations

## 🎯 User Interface Components

### Main Interface (index.html)
- **Header**: Title, fog toggle, settings link, help button
- **Map Section**: SVG hex grid with starting point prompt
- **Info Panel**: Hex details, exploration controls, neighbors grid
- **Help Modal**: Comprehensive documentation with 6 sections

### Settings Interface (settings.html)
- **Map Management**: Create, rename, delete, switch maps
- **Exploration Mode**: Starting point controls with edge grid
- **Random Generator**: Seed input, density controls, generation button
- **Import/Export**: File operations with validation
- **Danger Zone**: Data deletion with triple confirmation

### Interactive Elements
- **Explore Button**: State changes (Explore! → Explored)
- **Neighbor Navigation**: Click neighbors to jump around map
- **Edge Selection**: 9-button grid for quick positioning
- **Coordinate Inputs**: Real-time validation with button states

## 🔧 Key Implementation Details

### SVG Hex Rendering
```javascript
createHex(x, y, hexKey) {
    // Create hex group with polygon and text
    // Calculate 6-point hex coordinates
    // Add click handlers for selection
    // Support for biome icons
}
```

### Message Passing
- **Cross-Window Communication**: Settings → Main map updates
- **Starting Point Sync**: Real-time hex generation and selection
- **State Management**: Consistent exploration mode across windows

### Error Handling
- **Bounds Checking**: Prevent generation outside 12x12 grid
- **Validation**: Input checks for coordinates and file imports
- **Graceful Degradation**: Fallbacks for missing data

## 🚀 Deployment Requirements

### GitHub Pages Ready
- **No Build Process**: Pure HTML/CSS/JavaScript
- **No Server Dependencies**: Client-side only
- **Cross-Browser Compatible**: Modern browser features only

### Performance Optimizations
- **Efficient DOM Updates**: Selective hex refreshing
- **Memory Management**: Map cleanup on switches
- **Responsive Design**: Mobile-friendly interactions

## 🔮 Advanced Features Implemented

### Help System
- **Modal Interface**: Full-screen documentation
- **6 Sections**: Basic usage, fog of war, exploration, settings, data, pro tips
- **Keyboard Support**: Escape key to close
- **Comprehensive Coverage**: All features documented

### Starting Point Intelligence
- **Auto-Detection**: Prompts when all hexes unexplored
- **Smart Generation**: Creates starting hex + neighbors
- **Visual Feedback**: Button states and coordinate validation
- **Multiple Methods**: Roll, edge selection, manual entry

### Data Safety
- **Triple Confirmation**: For dangerous delete operations
- **Automatic Backups**: Downloaded before deletion
- **Validation**: Import/export format checking
- **Recovery**: Default map creation after data loss

## 🎮 Gameplay Features

### Exploration Mechanics
- **Discovery-Based**: Players reveal world by exploring
- **Neighbor Generation**: New areas created dynamically
- **Biome Clustering**: Realistic terrain distribution
- **Feature Placement**: Rich content in every hex

### Campaign Integration
- **Multiple Maps**: Different regions or campaigns
- **Notes System**: Campaign-specific information
- **Export/Import**: Share maps between DMs
- **Fog of War**: Perfect for exploration campaigns

## ✅ Implementation Checklist

**Core Systems:**
- [x] SVG hex grid with proper mathematics
- [x] Click selection and info panels
- [x] Biome and feature systems
- [x] Data persistence with localStorage

**Exploration Features:**
- [x] Fog of war toggle and visibility
- [x] Explore button and neighbor generation
- [x] Starting point selection and validation
- [x] Dynamic hex creation with clustering

**Map Management:**
- [x] Multiple map support
- [x] Import/export functionality
- [x] Random map generation
- [x] Settings interface

**Polish Features:**
- [x] Help system and documentation
- [x] Responsive design
- [x] Error handling and validation
- [x] Cross-window messaging

**Future Enhancements:**
- [ ] Enhanced biome icons with hand-drawn aesthetics
- [ ] Cross-hex road generation systems
- [ ] Mountain elevation for extended visibility
- [ ] Additional procedural algorithms

## 🔧 Step-by-Step Recreation Guide

### 1. Basic Structure Setup
```html
<!-- index.html: Split layout with map and info sections -->
<!-- settings.html: Settings sections with form controls -->
<!-- css/style.css: Parchment theme with CSS variables -->
```

### 2. Core Hex Grid Implementation
```javascript
// SVG hex creation with proper coordinate math
// Even/odd column neighbor calculations
// Click selection and info panel updates
```

### 3. Exploration System
```javascript
// HexExplorer class with seeded generation
// Fog of war visibility calculations
// Explore button state management
```

### 4. Map Management
```javascript
// MapSettings class with CRUD operations
// Import/export with JSON validation
// Cross-window message passing
```

### 5. Procedural Generation
```javascript
// MapGenerator with terrain clustering
// River generation algorithms
// Feature placement systems
```

### 6. Polish and UX
```html
<!-- Help modal with comprehensive documentation -->
<!-- Starting point prompts and edge selection -->
<!-- Responsive design and error handling -->
```

This guide provides complete instructions for recreating the hex crawler project with all current features and implementation details.