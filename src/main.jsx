import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import AirTravelSlider from './AirTravelSlider.jsx';
import TextOverlay from './TextOverlay.jsx';
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
const overlayRoot = ReactDOM.createRoot(document.createElement('div'));
document.body.appendChild(overlayRoot._internalRoot.containerInfo);

function makeRollingTextBG() {
  const W = 2048, H = 512;
  const art = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const actx = art.getContext('2d');
  const skyGrad = actx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0.0, 'skyblue');
  skyGrad.addColorStop(0.46, '#2fa7e7');
  skyGrad.addColorStop(0.9, '#723bfb');
  actx.fillStyle = skyGrad;
  actx.fillRect(0, 0, W, H);
  actx.font = '900 380px "Fredoka", "Arial Black", sans-serif';
  actx.textAlign = 'center';
  actx.textBaseline = 'middle';
  actx.lineJoin = 'round';
  actx.lineWidth = 20;
  actx.strokeStyle = '#fff';
  const TEXT = 'JET SET GO';
  const grad = actx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0.00, '#b625ff');
  grad.addColorStop(0.50, '#0078ff');
  grad.addColorStop(1.00, '#00e07a');
  actx.strokeText(TEXT, W / 2, H / 2);
  actx.fillStyle = grad;
  actx.fillText(TEXT, W / 2, H / 2);
  actx.save();
  actx.scale(1, -1);
  actx.globalAlpha = 0.35;
  actx.translate(0, -H + 40);
  actx.strokeText(TEXT, W / 2, H / 2);
  actx.fillText(TEXT, W / 2, H / 2);
  actx.restore();
  const cvs = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = cvs.getContext('2d');
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  return { art, cvs, ctx, tex, W, H, offset: 0, step: 4 };
}

const bg = makeRollingTextBG();
const scene = new THREE.Scene();
scene.background = bg.tex;

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
document.body.style.margin = '0';
document.body.append(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xfff2cc, 4);
sun.position.set(50, 80, -30);
const spot = new THREE.SpotLight(0xffcc99, 7, 200, Math.PI / 8, 0.35);
spot.visible = false;
scene.add(sun, spot, spot.target);

const WRAP = 1000, clouds = [];
new GLTFLoader().load('/models/cloud.glb', glb => {
  for (let i = 0; i < 40; i++) {
    const c = glb.scene.clone();
    c.position.set((Math.random() - 0.5) * 1600, 25 + (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 1600);
    c.scale.setScalar(5 + Math.random() * 10);
    c.rotation.y = Math.random() * Math.PI * 2;
    clouds.push(c);
    c.translucent = true;
    scene.add(c);
  }
});

let plane, planeMix, planeAnims = [],
  speed = 0.5, nextClicked = false, nextBtn, fade = 0, zoomDone = false;

new GLTFLoader().load('/models/787.glb', glb => {
  plane = glb.scene;
  plane.position.set(0, 14, -120);
  plane.rotation.set(Math.PI, Math.PI / 2, Math.PI);
  plane.scale.setScalar(0.6);
  scene.add(plane);
  planeAnims = glb.animations;
  planeMix = new THREE.AnimationMixer(plane);
});

function roundRect(ctx, x, y, w, h, r = 10) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function createNextButtonSprite() {
  const W = 500, H = 160, r = H / 2;
  const cvs = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = cvs.getContext('2d');
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, 0, 0, W, H, r);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.font = '600 70px Arial';
  ctx.fillStyle = '#212121';
  ctx.textBaseline = 'middle';
  ctx.fillText('Next', 130, H / 2);
  const cr = 65, cx = W - cr - 15, cy = H / 2;
  const grad = ctx.createLinearGradient(cx - cr, cy - cr, cx + cr, cy + cr);
  grad.addColorStop(0, '#0cc6d8');
  grad.addColorStop(1, '#00a9be');
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('➔', cx + 4, cy + 4);
  const tex = new THREE.CanvasTexture(cvs);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 }));
  spr.scale.set(W * 0.01 / 12, H * 0.01 / 12, 1);
  spr.name = 'nextButton';
  return spr;
}

const T = { A: 2, B: 3, C: 3 };
const OFF = {
  tail: new THREE.Vector3(80, 12, 40),
  belly: new THREE.Vector3(12, 40, 30),
  diag: new THREE.Vector3(40, 3, 15),
  hero: new THREE.Vector3(30, 10, 50)
};
function lerp(a, b, k) {
  return a.clone().multiplyScalar(1 - k).add(b.clone().multiplyScalar(k));
}

const clock = new THREE.Clock();
let animId;
function animate() {
  animId = requestAnimationFrame(animate);
  const dt = clock.getDelta(), t = clock.elapsedTime;
  bg.offset = (bg.offset + bg.step) % bg.W;
  const { ctx, cvs, art, W } = bg;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.save();
  ctx.translate(-bg.offset, 0);
  ctx.drawImage(art, 0, 0);
  ctx.translate(W, 0);
  ctx.drawImage(art, 0, 0);
  ctx.restore();
  bg.tex.needsUpdate = true;

  if (plane) {
    nextClicked ? (speed += 0.015, plane.position.y += 0.12) : plane.position.y -= 0.01;
    plane.position.z += speed;
    if (!nextClicked) {
      let off;
      if (t < T.A) off = lerp(OFF.tail, OFF.belly, (t) / T.A);
      else if (t < T.A + T.B) {
        const k = (t - T.A) / T.B,
          base = lerp(OFF.belly, OFF.diag, k),
          r = base.length(),
          ang = k * Math.PI;
        off = new THREE.Vector3(Math.cos(ang) * r, base.y, Math.sin(ang) * r);
      }
      else if (t < T.A + T.B + T.C) off = lerp(OFF.diag, OFF.hero, (t - T.A - T.B) / T.C);
      else off = OFF.hero;
      camera.position.copy(plane.position).add(off);
    } else {
      const dirToPlane = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.quaternion);
      const frontOffset = dirToPlane.multiplyScalar(80).add(new THREE.Vector3(0, 10, 0));
      camera.position.lerp(plane.position.clone().add(frontOffset), 0.05);
    }
    camera.lookAt(plane.position);
    const zStart = T.A + T.B + T.C + 1, zDur = 2, tgtFOV = 75 / 3;
    if (!zoomDone) {
      if (t > zStart && t < zStart + zDur) {
        camera.fov = THREE.MathUtils.lerp(75, tgtFOV, (t - zStart) / zDur);
        camera.updateProjectionMatrix();
      } else if (t >= zStart + zDur) {
        camera.fov = tgtFOV;
        camera.updateProjectionMatrix();
        zoomDone = true;
        nextBtn = createNextButtonSprite();
        scene.add(nextBtn);
      }
    }
    if (nextBtn && fade < 1) {
      fade = Math.min(1, fade + dt * 2);
      nextBtn.material.opacity = fade;
    }
    if (nextBtn) {
      const base = new THREE.Vector3(0, -0.25, -0.7).unproject(camera),
        dir = base.sub(camera.position).normalize();
      nextBtn.position.copy(camera.position).add(dir.multiplyScalar(5));
      nextBtn.lookAt(camera.position);
    }
    if (!spot.visible && t > T.A) spot.visible = true;
    if (spot.visible) {
      spot.position.set(plane.position.x + 10, plane.position.y + 18, plane.position.z + 8);
      spot.target.position.copy(plane.position);
    }
    clouds.forEach(c => {
      if (c.position.z - plane.position.z > WRAP / 2) {
        c.position.z -= WRAP;
        c.position.x = plane.position.x + (Math.random() - 0.5) * 1600;
        c.position.y = 25 + (Math.random() - 0.5) * 40;
      }
      c.lookAt(camera.position);
    });
    if (planeMix) planeMix.update(dt);
  }

  renderer.render(scene, camera);
}
animate();

function disposeMainScene() {
  cancelAnimationFrame(animId);
  removeEventListener('resize', onWindowResize);
  removeEventListener('click', onClick);
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose?.();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
      else obj.material.dispose?.();
    }
  });
  renderer.domElement.parentElement.removeChild(renderer.domElement);
  renderer.dispose();
}

function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', onWindowResize);

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(e) {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects([nextBtn].filter(Boolean))[0];
  if (hit && hit.object.name === 'nextButton') {
    if (planeAnims.length) planeMix.clipAction(planeAnims[0]).play();
    nextClicked = true;
    overlayRoot.render(<TextOverlay />);
    setTimeout(() => {
      disposeMainScene();
      root.render(
        <React.StrictMode>
          <AirTravelSlider />
        </React.StrictMode>
      );
      overlayRoot.unmount();
    }, 4000);
  }
}
addEventListener('click', onClick);

const style = document.createElement('style');
style.textContent = `
  #overlay-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
document.head.appendChild(style);
