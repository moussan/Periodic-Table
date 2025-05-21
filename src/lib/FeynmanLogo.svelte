<script>
  export let size = 40;
</script>
<svg width={size} height={size} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Feynman diagram logo">
  <!-- Fermion lines (straight, with arrows) -->
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#333" />
    </marker>
    <pattern id="wavy" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0,4 Q2,0 4,4 T8,4" stroke="#bb86fc" stroke-width="1.5" fill="none"/>
    </pattern>
  </defs>
  <!-- Incoming fermion -->
  <line x1="10" y1="10" x2="60" y2="20" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
  <!-- Outgoing fermion -->
  <line x1="60" y1="20" x2="110" y2="10" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
  <!-- Loop (virtual particle) -->
  <ellipse cx="80" cy="25" rx="15" ry="8" stroke="#333" stroke-width="2" fill="none" />
  <path d="M65 25 Q80 40 95 25" stroke="#333" stroke-width="2" fill="none" />
  <!-- Photon (wavy) lines -->
  <path d="M60 20 Q65 10 80 10 Q95 10 100 20" stroke="url(#wavy)" stroke-width="2" fill="none" />
  <path d="M60 20 Q65 30 80 30 Q95 30 100 20" stroke="url(#wavy)" stroke-width="2" fill="none" />
  <!-- Vertex dots -->
  <circle cx="60" cy="20" r="3.5" fill="#bb86fc" stroke="#333" stroke-width="1.2" />
  <circle cx="80" cy="10" r="2.5" fill="#bb86fc" stroke="#333" stroke-width="1" />
  <circle cx="80" cy="30" r="2.5" fill="#bb86fc" stroke="#333" stroke-width="1" />
  <circle cx="100" cy="20" r="2.5" fill="#bb86fc" stroke="#333" stroke-width="1" />
</svg> 