<template>
  <transition name="fade-scale">
    <div
      v-if="panorama.isOpen"
      class="modal-backdrop"
      @click.self="panorama.close()"
    >
      <div class="modal">
        <div class="modal-header">
          <div class="left">
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">−</button>
            <button @click="resetView">Сброс</button>
          </div>
          <button class="close-btn" @click="panorama.close()">Закрыть</button>
        </div>

        <div class="modal-body">
          <canvas ref="canvasEl"></canvas>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const panorama = usePanoramaStore();

const canvasEl = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let sphere: THREE.Mesh | null = null;
let animationId: number | null = null;

const initFov = 65;
const minFov = 30;
const maxFov = 90;

const animate = () => {
  if (!renderer || !scene || !camera || !controls) return;
  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

const resize = () => {
  if (!renderer || !camera) return;
  const parent = renderer.domElement.parentElement as HTMLElement;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};

const zoomIn = () => {
  if (!camera) return;
  camera.fov = Math.max(minFov, camera.fov - 5);
  camera.updateProjectionMatrix();
};
const zoomOut = () => {
  if (!camera) return;
  camera.fov = Math.min(maxFov, camera.fov + 5);
  camera.updateProjectionMatrix();
};
const resetView = () => {
  if (!camera || !controls) return;
  camera.fov = initFov;
  camera.updateProjectionMatrix();
  controls.reset();
};

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") panorama.close();
};

const cleanup = () => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener("resize", resize);
  window.removeEventListener("keydown", onKey);

  controls?.dispose();
  renderer?.dispose();
  sphere?.geometry.dispose();
  if (sphere?.material) (sphere.material as THREE.Material).dispose();

  renderer = null;
  scene = null;
  camera = null;
  controls = null;
  sphere = null;
}

const initScene = async () => {
  await nextTick();
  const canvas = canvasEl.value;
  if (!canvas) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(initFov, 1, 0.1, 1000);
  camera.position.set(0, 0, 0.1);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  resize();
  const tex = new THREE.TextureLoader().load("/assets/panorama.jpg");
  const geom = new THREE.SphereGeometry(50, 64, 64);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide });
  sphere = new THREE.Mesh(geom, mat);
  scene.add(sphere);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.rotateSpeed = 0.5;
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", onKey);
  resetView();
  animate();
}

watch(
  () => panorama.isOpen,
  async (open) => {
    if (open) await initScene();
    else cleanup();
  }
);

onBeforeUnmount(() => cleanup());
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: min(1000px, 95vw);
  height: min(650px, 85vh);
  background: #111;
  color: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  background: #1f2937;
}

.modal-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-header button {
  padding: 6px 10px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  background: #2d3748;
  color: #fff;
  font-weight: 500;
  transition: 0.2s ease;
}

.modal-header button:hover {
  background: #4b5563;
}

.close-btn {
  background: #b91c1c !important;
}

.modal-body {
  flex: 1;
  position: relative;
}

canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>