<script>
  // Exported properties for the electron component
  export let center;
  // Radius of the shell the electron is on
  export let shellRadius;
  // Radius of the electron itself
  export let electronRadius;
  // Index of the electron on its shell
  export let idx;
  // Total number of electrons on the shell
  export let total;
  // Index of the shell
  export let shellIdx;
  // Current time or animation progress
  export let time;
  // Color of the electron
  export let color;
  // Speed of the electron's orbit (default to 1)
  export let speed = 1;

  // Reactive declaration: Calculate the angle of the electron
  // The angle is determined by its index, the total number of electrons, and the current time and speed.
  $: angle = (2 * Math.PI * idx) / total + time * speed;

  // Reactive declaration: Calculate the x-coordinate of the electron
  // This is based on the center, shell radius, and the calculated angle.
  $: x = center + shellRadius * Math.cos(angle);

  // Reactive declaration: Calculate the y-coordinate of the electron
  // This is based on the center, shell radius, and the calculated angle.
  $: y = center + shellRadius * Math.sin(angle);
</script>

<circle
  <!-- Attributes for the SVG circle representing the electron -->
  cx={x}
  r={electronRadius}
  fill={color}
  stroke="#333"
  stroke-width="1"
/> 