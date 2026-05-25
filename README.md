# 𓂀 Egypt Through Time — 3D Scroll-Driven Concept City

<p align="center">
  <img src="assets/banner.png" alt="Egypt Through Time Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="WebGL" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Git-F05033?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
</p>

---

## 📖 Project Overview

A premium, interactive 3D scroll-driven visual journey through 6,000 years of Egyptian architecture — from the monumental stone pyramids of the pharaohs to a futuristic, neon-lit sci-fi concept metropolis.

*   **🔗 Live Production URL:** [https://dynamic-murex.vercel.app](https://dynamic-murex.vercel.app)
*   **💻 GitHub Repository:** [Falconbeast21k/city-of-Egypt](https://github.com/Falconbeast21k/city-of-Egypt)

---

## 🗺️ The Scroll Journey

Below is the path the camera travels along as you scroll through the timeline, color-coded by the active atmospheric environment:

```mermaid
graph TD
    A[𓁮 Scroll Start] --> B[𓂀 Dawn of Civilization]
    B --> C[𓉴 Age of the Pharaohs<br/>Giza Pyramids & Obelisks]
    C --> D[𓆣 Classical Egypt<br/>Temple of Karnak & Lotus Columns]
    D --> E[☽ Islamic Cairo<br/>Fatimid Minarets & Domes]
    E --> F[⬡ Modern Cairo<br/>Cairo Tower & Helical Skyscraper]
    F --> G[✦ Future Kemet Metropolis<br/>Sci-Fi Concept City]
    G --> H[∞ Egypt Eternal<br/>The Nile Runs Forever]

    style A fill:#1c0d04,stroke:#e8900a,stroke-width:2px,color:#fff
    style B fill:#2b180d,stroke:#e8900a,stroke-width:2px,color:#fff
    style C fill:#422a1d,stroke:#ffb03a,stroke-width:2px,color:#fff
    style D fill:#1d382d,stroke:#4caf50,stroke-width:2px,color:#fff
    style E fill:#0d233a,stroke:#2196f3,stroke-width:2px,color:#fff
    style F fill:#212529,stroke:#6c757d,stroke-width:2px,color:#fff
    style G fill:#031224,stroke:#00f5ff,stroke-width:3px,color:#fff,stroke-dasharray: 5 5
    style H fill:#010208,stroke:#bf5fff,stroke-width:2px,color:#fff
```

---

## 🌌 The Journey Through Eras

| Era | Architectural Style | Core 3D Elements | Visual Palette |
| :--- | :--- | :--- | :--- |
| **Ancient** | Monumental stone | Giza Pyramids, Sphinx, Obelisks, Sand dunes | Sand stone, Amber, Gold |
| **Classical** | Columnar shrines | Karnak Hypostyle Hall, Lotus columns | Marble, Lotus green, Gold |
| **Medieval** | Arabesque stone | Fatimid domes, Minarets, Bazaar stars | Cobalt, Ivory, Gold |
| **Modern** | Steel & glass | Nile bridges, Cairo Tower, Helical Skyscrapers | Steel blue, Concrete grey, Neon red |
| **Future** | Cybernetic concept | Floating pyramids, Honeycomb Citadels, Laser Obelisks | Neon cyan, Violet, Laser green |

---

## 🛸 Sci-Fi Concept Mechanics

To bring the **Future Kemet Metropolis** to life, several interactive 3D systems are proceduralized inside the Three.js scene:

*   🌀 **Holographic Quantum Core**: A giant nested double-octahedron wireframe rotating dynamically above the central helical pyramid, casting flickering sci-fi lighting.
*   🛸 **Segmented Floating Obelisks**: Obelisks split into floating modules hovering out-of-phase with each other, connected by vertical laser beams.
*   🛰️ **Aerial Traffic Lanes**: Glowing curves with light pods (sci-fi flying vehicles) traveling dynamically between modern and future structures.
*   🧬 **Living Honeycomb Citadels**: Clusters of hexagonal prisms that rise and fall dynamically to represent living biotech structures.

---

## 🛠️ Technology Stack & Optimization

*   **Three.js (r128)**: Renders the 3D scene, dynamic lighting, custom glass materials, and line edge frameworks.
*   **GSAP & ScrollTrigger**: Handles smooth camera target interpolations, background scene fog transitions, and HUD progress updates.
*   **Custom Cursor Optimization**: Built using hardware-accelerated CSS `translate3d()` transforms to avoid style parsing lag and layout thrashing.
*   **Offline-first dependencies**: Three.js, GSAP, and ScrollTrigger are bundled locally within the repository to enable local/offline development.

---

## 🚀 Getting Started

### Prerequisites

You only need **Node.js** installed on your system.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Falconbeast21k/city-of-Egypt.git
    cd city-of-Egypt
    ```
2.  **Launch the dev server:**
    ```bash
    npm start
    ```
3.  **Open your browser:**
    Navigate to **`http://localhost:3000/`**.
