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
  let orbitalMesh: THREE.Mesh | null = null;
  let atomicNucleus: THREE.Mesh | null = null;

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
    // This is a placeholder - will be enhanced in task 6.2
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (orbitalType) {
      case 's':
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        material = new THREE.MeshPhongMaterial({
          color: 0x00aaff,
          transparent: true,
          opacity: 0.3,
          wireframe: false
        });
        break;
      case 'p':
        geometry = new THREE.CapsuleGeometry(0.5, 2, 16, 32);
        material = new THREE.MeshPhongMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.3
        });
        break;
      case 'd':
        geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
        material = new THREE.MeshPhongMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: 0.3
        });
        break;
      case 'f':
        geometry = new THREE.IcosahedronGeometry(1.2, 2);
        material = new THREE.MeshPhongMaterial({
          color: 0xff00aa,
          transparent: true,
          opacity: 0.3
        });
        break;
      default:
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        material = new THREE.MeshPhongMaterial({
          color: 0x00aaff,
          transparent: true,
          opacity: 0.3
        });
    }

    orbitalMesh = new THREE.Mesh(geometry, material);
    orbitalMesh.castShadow = true;
    orbitalMesh.receiveShadow = true;
    scene.add(orbitalMesh);
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
</style>