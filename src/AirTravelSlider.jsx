"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const cardsData = [
  { 
    url: "/swiss.jpeg", 
    title: "Swiss Alps", 
    subtitle: "Crisp air & alpine peaks",

  },
  { 
    url: "/lon.jpeg", 
    title: "London Skies", 
    subtitle: "Historic rooftops below",
  },
  { 
    url: "/thai.jpeg", 
    title: "Thai Coast", 
    subtitle: "Golden beaches & bays",
  },
];


export default function CompactTravelSlider() {
  const ref = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 2, 0.1, 100);
    camera.position.set(0, 0, 10);
    // Gradient background using a canvas texture
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 32;
    bgCanvas.height = 256;
    const ctx = bgCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0.0, 'skyblue');  
    gradient.addColorStop(0.9, '#4b308e');  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    scene.background = bgTexture;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    // Card container
    const cardContainer = new THREE.Group();
    scene.add(cardContainer);

    // Smaller card dimensions
    const cardWidth = 3.5;  // Reduced from 5
    const cardHeight = 4.9; // Reduced from 7 (maintaining 5:7 ratio)
    const cardThickness = 0.15; // Reduced from 0.2
    const gap = 5; // Reduced from 7

    const loader = new THREE.TextureLoader();
    const cards = cardsData.map((data, i) => {
      const geo = new RoundedBoxGeometry(cardWidth, cardHeight, cardThickness, 8, 0.15);
      const mat = new THREE.MeshStandardMaterial({
        map: loader.load(data.url),
        roughness: 0.15,
        metalness: 0.3,
        color: new THREE.Color(data.color).multiplyScalar(0.8)
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((i - (cardsData.length - 1) / 2) * gap, 0, -i * 0.2);
      mesh.userData = { index: i, title: data.title, subtitle: data.subtitle };
      cardContainer.add(mesh);
      return mesh;
    });

    // Text elements
    const textContainer = document.createElement('div');
    textContainer.style.position = 'absolute';
    textContainer.style.top = '0';
    textContainer.style.left = '0';
    textContainer.style.width = '100%';
    textContainer.style.height = '100%';
    textContainer.style.pointerEvents = 'none';
    mount.appendChild(textContainer);

    cardsData.forEach((data, i) => {
      const textDiv = document.createElement('div');
      textDiv.style.position = 'absolute';
      textDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      textDiv.style.opacity = '0';
      textDiv.style.transform = 'translateY(20px)';
      textDiv.style.textAlign = 'center';
      textDiv.style.width = '100%';
      textDiv.style.bottom = '20%'; // Adjusted for smaller cards
      
      const title = document.createElement('h2');
      title.textContent = data.title;
      title.style.fontSize = 'clamp(1.2rem, 2.5vw, 2rem)'; // Slightly smaller
      title.style.fontface='sans-serif';
      title.style.fontWeight = '500';
      title.style.margin = '0 0 0.3rem 0';
      title.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
      
      const subtitle = document.createElement('p');
      subtitle.textContent = data.subtitle;
      subtitle.style.fontSize = 'clamp(0.9rem, 1.8vw, 1.3rem)'; // Slightly smaller
      subtitle.style.fontface='sans-serif';
      subtitle.style.fontWeight = '300';
      subtitle.style.margin = '0';
      subtitle.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
      
      textDiv.appendChild(title);
      textDiv.appendChild(subtitle);
      textContainer.appendChild(textDiv);
      textRefs.current[i] = textDiv;
    });

    let focused = 1;
    let targetRotation = 0;
    let isDragging = false;
    let previousMouseX = 0;

    const focusCard = (index) => {
      focused = index;
      textRefs.current.forEach((text, i) => {
        text.style.opacity = i === index ? '1' : '0';
        text.style.transform = i === index ? 'translateY(0)' : 'translateY(20px)';
      });
    };

    // Interaction handlers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      targetRotation += deltaX * 0.005;
    };

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      if (Math.abs(e.clientX - previousMouseX) < 5) {
        const rect = mount.getBoundingClientRect();
        mouse.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(cards);
        if (hits.length > 0) focusCard(hits[0].object.userData.index);
      }
    };

    mount.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Post Processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // Slightly reduced bloom
      0.3,
      0.2
    );
    composer.addPass(bloomPass);

    // Animation loop
    const clock = new THREE.Clock();
    let frame;

    function loop() {
      clock.getDelta(); // Only for updating the clock, value not needed
      const time = clock.getElapsedTime();
      
      targetRotation *= 0.95;
      cardContainer.rotation.y += (targetRotation - cardContainer.rotation.y) * 0.1;
      
      cards.forEach((card, i) => {
        const targetX = (i - focused) * gap;
        const targetZ = i === focused ? 0 : -Math.abs(i - focused) * 0.3;
        
        card.position.x += (targetX - card.position.x) * 0.1;
        card.position.z += (targetZ - card.position.z) * 0.1;
        
        const scale = i === focused ? 1.15 : 0.85; // Slightly less scaling
        card.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        
        if (i === focused) {
          card.position.y = Math.sin(time * 2) * 0.08; // Smaller bounce
          card.rotation.y = Math.sin(time) * 0.03; // Less rotation
        } else {
          card.position.y = 0;
          card.rotation.y = 0;
        }
      });

      camera.position.z += (9.5 - Math.abs(targetRotation) * 4 - camera.position.z) * 0.05;
      composer.render();
      frame = requestAnimationFrame(loop);
    }
    loop();

    // Responsive handling
    function onResize() {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      renderer.setSize(width, height);
      composer.setSize(width, height);
      
      camera.aspect = width / height;
      camera.fov = width / height > 1.5 ? 50 : 55;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    focusCard(focused);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      
      if (mount) {
        mount.removeEventListener('pointerdown', handlePointerDown);
        const canvas = mount.querySelector("canvas");
        if (canvas) mount.removeChild(canvas);
        const textContainer = mount.querySelector("div");
        if (textContainer) mount.removeChild(textContainer);
      }

      renderer.dispose();
    };
  }, []);

  return (
    <div ref={ref} style={{ 
      width: "100vw", 
      height: "100vh", 
      overflow: "hidden",
      position: "relative",
    }} />
  );
}