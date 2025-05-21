# Periodic Table Website

A simple interactive periodic table website built with SvelteKit.

## Features

- Displays elements: Name, Symbol, Number, Atomic Weight, Orbital Formula.
- Click on an element to view detailed information from Wikipedia in a popup.
- Wikipedia content is displayed in an iframe with an attempted dark mode.

## Tech Stack

- Frontend: SvelteKit
- Data: JSON file sourced from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON)
- Deployment: Configured for Coolify

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Coolify

This project is intended to be deployed on Coolify. Coolify can automatically build and deploy SvelteKit applications using Nixpacks or a Dockerfile.

- Ensure your Coolify instance is set up.
- Connect your Git repository to Coolify.
- Coolify should detect it as a SvelteKit/Node.js application and configure the build accordingly.
- For static output, Coolify's static site service can be used, pointing to the `build` directory after `npm run build` (adapter might need to be changed to `adapter-static`). However, `adapter-auto` should work fine with Nixpacks for a Node server. 