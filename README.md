# Advanced 3D Periodic Table

An interactive, high-performance 3D Periodic Table web application built with SvelteKit and Tailwind CSS. Featuring a premium glassmorphism UI, detailed element data, real-time advanced filtering, and stunning visualizations.

## Features

- **Interactive Periodic Grid**: Navigate all 118 elements with beautiful hover states and responsive layouts.
- **Deep Element Insights**: 
  - Click any element to view comprehensive physical, chemical, and atomic properties.
  - Explore isotope and compound data.
  - Seamlessly pulls dynamic Wikipedia summaries, PTable data, and external references.
- **Advanced Search & Filtering**: 
  - Instantly search by name, symbol, atomic number, or category.
  - Apply granular filters (e.g., categories, phases, blocks) with a sleek Filter Panel.
- **Electron Shell Visualizations**: Dynamic SVG visualizations mapping atomic electron orbits for each element.
- **Stunning UI**: Custom glassmorphism design, utilizing smooth micro-animations and an aesthetically vibrant color palette.

## Tech Stack

- **Framework**: SvelteKit / Vite (Svelte 4)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide Svelte
- **Data Pipeline**: Custom JSON data generator integrating Wikipedia, PTable, and Enhanced JSON datasets.
- **Deployment**: Ready for Coolify

## Setup & Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Generate Enhanced Element Data (if not present)**:
   The application uses a unified enhanced JSON data file. If you need to regenerate it, run:
   ```bash
   node src/lib/data/generateEnhancedData.js
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the app.

## Deployment on Coolify

This project is intended to be deployed on Coolify. Coolify can automatically build and deploy SvelteKit applications.
- Ensure your Coolify instance is set up.
- Connect your Git repository to Coolify.
- Coolify should detect it as a SvelteKit/Node.js application and configure the build accordingly using `adapter-auto`.