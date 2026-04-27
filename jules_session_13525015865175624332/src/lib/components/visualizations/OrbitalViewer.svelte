<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import type { Element } from '$lib/types/element';

  export let element: Element | null = null;
  export let orbitalType: string = 's';
  export let animationSpeed: number = 1.0;
  export let width: number = 400;
  export let height: number = 300;

  let canvas: HTMLCanvasElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: any; // Will be OrbitControls
  let animationId: number;
  let isInitialized = false;

  // Scene objects
  let orbitalMesh: THREE.Group | null = null;
  let atomicNucleus: THREE.Mesh | null = null;
  let electronParticles: THREE.Points[] = [];
  let fillingAnimation: { active: boolean; progress: number } = { active: false, progress: 0 };

  onMount(async () => {
    await initializeThreeJS();
    if (element) {
      setupOrbitalVisualization();
    }
    animate();
  });

  onDestroy(() => {
    cleanup();
  });

  async function initializeThreeJS() {
    try {
      // Import OrbitControls dynamically
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      // Initialize scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      // Initialize camera
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);

      // Initialize renderer
      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Initialize controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.enableRotate = true;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 2.0;

      // Add lighting
      setupLighting();

      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Three.js:', error);
    }
  }

  function setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Directional light for shadows and definition
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 100);
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);
  }

  function setupOrbitalVisualization() {
    if (!isInitialized || !element) return;

    // Clear existing orbital mesh
    if (orbitalMesh) {
      scene.remove(orbitalMesh);
      orbitalMesh = null;
    }

    // Clear existing nucleus
    if (atomicNucleus) {
      scene.remove(atomicNucleus);
      atomicNucleus = null;
    }

    // Create atomic nucleus
    createAtomicNucleus();

    // Create orbital based on type
    createOrbitalShape();

    // Create electron configuration
    createElectronConfiguration();
  }

  function createAtomicNucleus() {
    const nucleusGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const nucleusMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4444,
      emissive: 0x220000,
      shininess: 100
    });
    
    atomicNucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomicNucleus.castShadow = true;
    scene.add(atomicNucleus);
  }

  function createOrbitalShape() {
    // Clear existing orbital mesh
    if (orbitalMesh) {
      scene.remove(orbitalMesh);
      orbitalMesh = null;
    }

    // Create orbital group to hold multiple meshes if needed
    const orbitalGroup = new THREE.Group();

    switch (orbitalType) {
      case 's':
        createSOrbital(orbitalGroup);
        break;
      case 'p':
        createPOrbital(orbitalGroup);
        break;
      case 'd':
        createDOrbital(orbitalGroup);
        break;
      case 'f':
        createFOrbital(orbitalGroup);
        break;
      default:
        createSOrbital(orbitalGroup);
    }

    orbitalMesh = orbitalGroup;
    orbitalMesh.castShadow = true;
    orbitalMesh.receiveShadow = true;
    scene.add(orbitalMesh);
  }

  function createSOrbital(group: THREE.Group) {
    // S orbital: spherical shape with probability cloud
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    // Create main orbital shape
    const material = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.4,
      wireframe: false,
      side: THREE.DoubleSide
    });
    
    const orbital = new THREE.Mesh(geometry, material);
    group.add(orbital);

    // Add probability cloud effect with particles
    createProbabilityCloud(group, 's', 1.5);
  }

  function createPOrbital(group: THREE.Group) {
    // P orbital: dumbbell shape (figure-8)
    const dumbbellGeometry = createDumbbellGeometry(0.8, 2.5, 32);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    
    const orbital = new THREE.Mesh(dumbbellGeometry, material);
    group.add(orbital);

    // Add probability cloud
    createProbabilityCloud(group, 'p', 2.5);
  }

  function createDOrbital(group: THREE.Group) {
    // D orbital: cloverleaf pattern (4 lobes)
    const cloverGeometry = createCloverleafGeometry(1.2, 32);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const orbital = new THREE.Mesh(cloverGeometry, material);
    group.add(orbital);

    // Add probability cloud
    createProbabilityCloud(group, 'd', 1.8);
  }

  function createFOrbital(group: THREE.Group) {
    // F orbital: complex multi-lobed shape
    const complexGeometry = createComplexFGeometry(1.5, 48);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00aa,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    
    const orbital = new THREE.Mesh(complexGeometry, material);
    group.add(orbital);

    // Add probability cloud
    createProbabilityCloud(group, 'f', 2.0);
  }

  function createDumbbellGeometry(radius: number, height: number, segments: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];

    // Create dumbbell shape using parametric equations
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        
        // Dumbbell parametric equations
        const r = radius * Math.sin(phi);
        const x = r * Math.cos(theta);
        const y = (height / 2) * Math.cos(phi);
        const z = r * Math.sin(theta);
        
        vertices.push(x, y, z);
        
        // Calculate normals
        const nx = Math.cos(theta) * Math.sin(phi);
        const ny = Math.cos(phi);
        const nz = Math.sin(theta) * Math.sin(phi);
        normals.push(nx, ny, nz);
      }
    }

    // Create indices for triangles
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  function createCloverleafGeometry(size: number, segments: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];

    // Create 4-lobed cloverleaf pattern
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        
        // Cloverleaf parametric equations (simplified d-orbital shape)
        const r = size * Math.sin(2 * theta) * Math.sin(phi);
        const x = r * Math.cos(theta);
        const y = size * 0.5 * Math.cos(phi);
        const z = r * Math.sin(theta);
        
        vertices.push(x, y, z);
        
        // Calculate normals
        const nx = Math.cos(theta);
        const ny = 0.5;
        const nz = Math.sin(theta);
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals.push(nx / length, ny / length, nz / length);
      }
    }

    // Create indices
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  function createComplexFGeometry(size: number, segments: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];

    // Create complex multi-lobed f-orbital shape
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        
        // Complex f-orbital parametric equations
        const r = size * Math.sin(3 * theta) * Math.sin(phi) * Math.cos(phi);
        const x = r * Math.cos(theta);
        const y = size * 0.7 * (Math.cos(phi) - 0.3 * Math.cos(3 * phi));
        const z = r * Math.sin(theta);
        
        vertices.push(x, y, z);
        
        // Calculate normals
        const nx = Math.cos(theta);
        const ny = 0.7;
        const nz = Math.sin(theta);
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals.push(nx / length, ny / length, nz / length);
      }
    }

    // Create indices
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  function createProbabilityCloud(group: THREE.Group, orbitalType: string, maxRadius: number) {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    // Generate particle positions based on orbital probability distribution
    for (let i = 0; i < particleCount; i++) {
      const position = generateOrbitalPosition(orbitalType, maxRadius);
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: getOrbitalColor(orbitalType),
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    group.add(particles);
  }

  function generateOrbitalPosition(orbitalType: string, maxRadius: number): THREE.Vector3 {
    const position = new THREE.Vector3();
    
    switch (orbitalType) {
      case 's':
        // Spherical distribution
        const r = Math.random() * maxRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        position.x = r * Math.sin(phi) * Math.cos(theta);
        position.y = r * Math.sin(phi) * Math.sin(theta);
        position.z = r * Math.cos(phi);
        break;
        
      case 'p':
        // Dumbbell distribution
        const pTheta = Math.random() * Math.PI * 2;
        const pPhi = Math.random() * Math.PI;
        const pR = Math.random() * maxRadius * Math.sin(pPhi);
        
        position.x = pR * Math.cos(pTheta);
        position.y = (maxRadius / 2) * Math.cos(pPhi) * (Math.random() > 0.5 ? 1 : -1);
        position.z = pR * Math.sin(pTheta);
        break;
        
      case 'd':
        // Cloverleaf distribution
        const dTheta = Math.random() * Math.PI * 2;
        const dR = Math.random() * maxRadius * Math.abs(Math.sin(2 * dTheta));
        
        position.x = dR * Math.cos(dTheta);
        position.y = (Math.random() - 0.5) * maxRadius * 0.5;
        position.z = dR * Math.sin(dTheta);
        break;
        
      case 'f':
        // Complex multi-lobed distribution
        const fTheta = Math.random() * Math.PI * 2;
        const fPhi = Math.random() * Math.PI;
        const fR = Math.random() * maxRadius * Math.abs(Math.sin(3 * fTheta));
        
        position.x = fR * Math.cos(fTheta);
        position.y = maxRadius * 0.7 * (Math.cos(fPhi) - 0.3 * Math.cos(3 * fPhi));
        position.z = fR * Math.sin(fTheta);
        break;
    }
    
    return position;
  }

  function getOrbitalColor(orbitalType: string): number {
    const colors = {
      's': 0x00aaff,
      'p': 0x00ff00,
      'd': 0xffaa00,
      'f': 0xff00aa
    };
    return colors[orbitalType] || 0x00aaff;
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (!isInitialized) return;

    // Update controls
    controls.update();

    // Animate orbital rotation
    if (orbitalMesh) {
      orbitalMesh.rotation.y += 0.005 * animationSpeed;
    }

    // Animate nucleus glow
    if (atomicNucleus) {
      const time = Date.now() * 0.001;
      const material = atomicNucleus.material as THREE.MeshPhongMaterial;
      material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
    }

    // Animate electron filling
    if (fillingAnimation.active) {
      updateFillingAnimation();
    }

    // Animate electron particles
    electronParticles.forEach((particles, index) => {
      if (particles.material instanceof THREE.PointsMaterial) {
        const time = Date.now() * 0.001;
        particles.material.opacity = 0.4 + Math.sin(time * 2 + index) * 0.2;
      }
    });

    renderer.render(scene, camera);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    if (renderer) {
      renderer.dispose();
    }

    if (controls) {
      controls.dispose();
    }

    // Clean up geometries and materials
    scene?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
  }

  // Reactive updates
  $: if (isInitialized && element) {
    setupOrbitalVisualization();
  }

  $: if (renderer && camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function updateFillingAnimation() {
    if (!fillingAnimation.active) return;

    fillingAnimation.progress += 0.02 * animationSpeed;
    
    if (fillingAnimation.progress >= 1.0) {
      fillingAnimation.active = false;
      fillingAnimation.progress = 1.0;
    }

    // Update electron visibility based on filling progress
    electronParticles.forEach((particles, index) => {
      if (particles.material instanceof THREE.PointsMaterial) {
        const targetOpacity = index < fillingAnimation.progress * electronParticles.length ? 0.8 : 0.1;
        particles.material.opacity = THREE.MathUtils.lerp(particles.material.opacity, targetOpacity, 0.1);
      }
    });
  }

  function createElectronConfiguration() {
    if (!element || !isInitialized) return;

    // Clear existing electron particles
    electronParticles.forEach(particles => {
      scene.remove(particles);
      particles.geometry.dispose();
      if (particles.material instanceof THREE.PointsMaterial) {
        particles.material.dispose();
      }
    });
    electronParticles = [];

    // Get orbital data for the element
    const orbitalData = getOrbitalDataForElement(element, orbitalType);
    
    // Create electron particles for each electron in the orbital
    for (let i = 0; i < orbitalData.electronCount; i++) {
      const electronGeometry = new THREE.BufferGeometry();
      const position = generateOrbitalPosition(orbitalType, getOrbitalRadius(orbitalType));
      
      electronGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([position.x, position.y, position.z]), 3
      ));

      const electronMaterial = new THREE.PointsMaterial({
        color: 0xffff00,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      const electron = new THREE.Points(electronGeometry, electronMaterial);
      electronParticles.push(electron);
      scene.add(electron);
    }
  }

  function getOrbitalDataForElement(element: Element, orbitalType: string) {
    // Parse electron configuration to get orbital data
    const config = element.electron_configuration || '';
    const orbitalRegex = new RegExp(`\\d+${orbitalType}(\\d+)`, 'g');
    let totalElectrons = 0;
    let match;

    while ((match = orbitalRegex.exec(config)) !== null) {
      totalElectrons += parseInt(match[1]);
    }

    return {
      electronCount: Math.min(totalElectrons, getMaxElectrons(orbitalType)),
      maxElectrons: getMaxElectrons(orbitalType)
    };
  }

  function getMaxElectrons(orbitalType: string): number {
    const maxElectrons = {
      's': 2,
      'p': 6,
      'd': 10,
      'f': 14
    };
    return maxElectrons[orbitalType] || 2;
  }

  function getOrbitalRadius(orbitalType: string): number {
    const radii = {
      's': 1.5,
      'p': 2.5,
      'd': 1.8,
      'f': 2.0
    };
    return radii[orbitalType] || 1.5;
  }

  // Public methods for external control
  export function resetCamera() {
    if (camera && controls) {
      camera.position.set(0, 0, 5);
      controls.reset();
    }
  }

  export function toggleAutoRotate() {
    if (controls) {
      controls.autoRotate = !controls.autoRotate;
    }
  }

  export function setOrbitalType(type: string) {
    orbitalType = type;
    if (isInitialized) {
      setupOrbitalVisualization();
    }
  }

  export function startFillingAnimation() {
    fillingAnimation.active = true;
    fillingAnimation.progress = 0;
  }

  export function showElectronConfiguration() {
    createElectronConfiguration();
  }
</script>

<div class="orbital-viewer-container" style="width: {width}px; height: {height}px;">
  <canvas 
    bind:this={canvas}
    class="orbital-canvas"
    style="width: 100%; height: 100%; display: block;"
  />
  
  <!-- Control overlay -->
  <div class="controls-overlay">
    <div class="control-buttons">
      <button 
        class="control-btn"
        on:click={resetCamera}
        title="Reset Camera"
      >
        🎯
      </button>
      <button 
        class="control-btn"
        on:click={toggleAutoRotate}
        title="Toggle Auto Rotate"
      >
        🔄
      </button>
      <button 
        class="control-btn"
        on:click={startFillingAnimation}
        title="Animate Orbital Filling"
      >
        ⚡
      </button>
      <button 
        class="control-btn"
        on:click={showElectronConfiguration}
        title="Show Electron Configuration"
      >
        🔬
      </button>
    </div>
    
    <!-- Orbital type selector -->
    <div class="orbital-selector">
      <label class="orbital-label">Orbital:</label>
      <select 
        bind:value={orbitalType} 
        class="orbital-select"
        on:change={() => setOrbitalType(orbitalType)}
      >
        <option value="s">s orbital</option>
        <option value="p">p orbital</option>
        <option value="d">d orbital</option>
        <option value="f">f orbital</option>
      </select>
    </div>

    <!-- Electron configuration display -->
    {#if element}
      <div class="electron-config">
        <div class="config-label">Configuration:</div>
        <div class="config-text">{element.electron_configuration || 'N/A'}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .orbital-viewer-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 40, 0.9));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .orbital-canvas {
    border-radius: 12px;
  }

  .controls-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }

  .control-buttons {
    display: flex;
    gap: 4px;
  }

  .control-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .orbital-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .orbital-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 500;
  }

  .orbital-select {
    background: transparent;
    border: none;
    color: white;
    font-size: 12px;
    cursor: pointer;
    outline: none;
  }

  .orbital-select option {
    background: #1a1a1a;
    color: white;
  }

  .electron-config {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 200px;
  }

  .config-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .config-text {
    color: #00aaff;
    font-size: 11px;
    font-family: 'Courier New', monospace;
    word-break: break-all;
    line-height: 1.2;
  }
</style>