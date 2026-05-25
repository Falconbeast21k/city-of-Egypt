# Egypt Through Time — 3D Scroll-Driven Concept City

A premium, interactive 3D scroll-driven visual journey through 6,000 years of Egyptian architecture — from the monumental stone pyramids of the pharaohs to a futuristic, neon-lit sci-fi concept metropolis.

**Live Production URL:** [https://dynamic-murex.vercel.app](https://dynamic-murex.vercel.app)  
**GitHub Repository:** [Falconbeast21k/city-of-Egypt](https://github.com/Falconbeast21k/city-of-Egypt)

---

## 🌌 The Journey Through Eras

As you scroll down the page, you travel through six distinct historical and futuristic eras of Egyptian civilization:

1. **Dawn of Civilization & Age of the Pharaohs (circa 2560 BCE)**:
   - The Great Pyramids of Giza rising from shiftable sand dunes.
   - High-precision obelisks pointing towards the sun god Ra.
   - The Sphinx stands guard, aligned to sacred geometric ratios.
2. **Classical Egypt & Temple of Karnak (circa 500 BCE)**:
   - Grand hypostyle halls constructed of massive lotus and papyrus columns.
   - Avenues lined with sphinxes, aligning pathways to the rising sun.
3. **Medieval Islamic Cairo (circa 969 CE)**:
   - Domes, mosques, and towering minarets rising above the bazaar.
   - Intricate star-lattice arches and geometric arabesques representing infinite cosmic order.
4. **Modern Cairo (2024 CE)**:
   - The Nile River flowing between traditional stonework and modern skyscrapers.
   - Detailed structural bridges and the blinking red beacon of the Cairo Tower.
   - Twisted, glass-faceted **Helical Skyscrapers** rotating along the banks.
5. **Future Sci-Fi Concept Metropolis (2150 CE)**:
   - Massive **Inverted Pyramids** floating suspended on anti-gravity magnetic fields.
   - Crystalline **Honeycomb Citadels** made of nested hexagonal prism columns that organically oscillate in height.
   - **Segmented Floating Obelisks** hovering in sections, connected by a core plasma/laser beam.
   - Dynamic **Aerial Traffic Lanes** with glowing sci-fi vehicle pods traveling between skyscrapers.
   - A counter-rotating **Holographic Quantum Core** projecting coordinate telemetry above the central helical pyramid.
6. **Egypt Eternal (Outro)**:
   - A poetic lookback at the entire city grid as the Nile runs forever into the future.

---

## 🛠️ Technology Stack & Features

*   **Three.js (r128)**: Renders the rich 3D scene, lighting, materials, and custom-designed geometries (helical towers, honeycomb grids, segmented cylinders).
*   **GSAP & ScrollTrigger**: Drives the camera path keyframe interpolations, background fog transitions, and HUD progress tracking.
*   **Custom Cursor Optimization**: Instead of redrawing styles dynamically, coordinates are mapped using hardware-accelerated CSS `translate3d()` transforms to eliminate layout thrashing.
*   **Offline-first Dependency Loading**: All core scripts (Three.js, GSAP, ScrollTrigger) are hosted locally to avoid CDN failure states and allow 100% offline functionality.
*   **Active Cache-Busting**: Integrated query versioning on stylesheet and script links to prevent client-side browser caching blocks.

---

## 🚀 Getting Started

### Prerequisites

You only need **Node.js** installed on your system.

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Falconbeast21k/city-of-Egypt.git
   cd city-of-Egypt
   ```
2. Launch the dev server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to **`http://localhost:3000/`**.

---

## ☁️ Deployment

This project is connected directly to **Vercel** for automatic continuous integration:
* Every commit pushed to the `main` branch of this repository triggers a production build and deployment automatically.
* Since the project is built using vanilla HTML/JS/CSS, it is served as a high-performance static site without requiring server-side compute.
