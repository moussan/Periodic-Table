# Advanced 3D Periodic Table

An advanced, interactive periodic table desktop application with a futuristic Holographic/Sci-Fi HUD interface. Built with SvelteKit and packaged with Electron.

## Features

- **Futuristic UI**: Holographic/Sci-Fi HUD design with glowing text, scanline effects, and modern aesthetics.
- **Detailed Element Info**: View comprehensive element properties, including isotopes and compounds, by clicking on an element. Data is loaded dynamically.
- **Advanced Filtering & Search**: Powerful search and filter panel allowing you to filter elements by name, symbol, group, block, phase, and other characteristics. Save and manage your favorite filter presets.
- **Comparison Mode**: Select multiple elements to compare their properties side-by-side.
- **Orbital Visualization**: View 3D representations of electron orbitals for elements.
- **Desktop Application**: Packaged as a standalone Electron application for easy use on your desktop.

## Tech Stack

- **Frontend Framework**: SvelteKit
- **Styling**: TailwindCSS v4
- **3D Graphics**: Three.js (for orbital visualizations)
- **Desktop Packaging**: Electron & Electron-Builder
- **Data**: JSON file sourced from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) along with dynamic API data.

## Setup & Development

1. **Clone the repository:**
   `git clone <repository-url>`
   `cd <repository-directory>`

2. **Install dependencies:**
   `npm install`

3. **Run the development server (Web mode):**
   `npm run dev`
   This will start the SvelteKit development server, typically accessible at `http://localhost:5173`.

4. **Run the Electron app in development mode:**
   `npm run electron:dev`
   This command starts the SvelteKit development server and then launches the Electron application, pointing it to the local dev server. It allows for hot-reloading within the Electron app.

## Building the Application

1. **Build the SvelteKit app (Static HTML/JS/CSS):**
   `npm run build`
   This will generate a `build/` directory containing the static files required for the Electron app.

2. **Package the Electron application:**
   `npm run electron:build`
   This will first build the SvelteKit app (using `npm run build`) and then use `electron-builder` to package the application into standalone executables (e.g., `.AppImage`, `.snap` on Linux) located in the `dist/` directory.

## Deployment on Coolify (Web Version)

If you still wish to deploy the web version on Coolify:

- Ensure your Coolify instance is set up.
- Connect your Git repository to Coolify.
- Coolify can automatically build and deploy SvelteKit applications.
- Since the app is now using `adapter-static`, Coolify's static site service should be used. Point it to the `build` directory after the `npm run build` command has been executed.
