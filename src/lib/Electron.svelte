<script>
  export let center;
  export let shellRadius;
  export let electronRadius;
  export let idx;
  export let total;
  export let shellIdx;
  export let time;
  export let color;
  export let speed = 1;

  $: angle = (2 * Math.PI * idx) / total + time * speed;
  $: x = center + shellRadius * Math.cos(angle);
  $: y = center + shellRadius * Math.sin(angle);
</script>

<circle
  cx={x}
  cy={y}
  r={electronRadius}
  fill={color}
  stroke="#333"
  stroke-width="1"
/> 