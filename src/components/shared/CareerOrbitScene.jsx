import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeNodeMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.92,
  });
}

export default function CareerOrbitScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const group = new THREE.Group();
    const clock = new THREE.Clock();

    scene.add(group);
    camera.position.set(0, 0.2, 8);

    const cyan = new THREE.Color('#00D4FF');
    const violet = new THREE.Color('#7C3AED');
    const white = new THREE.Color('#F0F4FF');

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 4),
      new THREE.MeshBasicMaterial({
        color: cyan,
        wireframe: true,
        transparent: true,
        opacity: 0.34,
      })
    );
    group.add(core);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 40, 40),
      new THREE.MeshBasicMaterial({
        color: violet,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      })
    );
    group.add(glow);

    const orbitGroup = new THREE.Group();
    group.add(orbitGroup);

    const orbitMaterials = [
      new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.28 }),
      new THREE.LineBasicMaterial({ color: violet, transparent: true, opacity: 0.24 }),
      new THREE.LineBasicMaterial({ color: white, transparent: true, opacity: 0.13 }),
    ];

    [1.95, 2.45, 2.95].forEach((radius, index) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.54, 0, Math.PI * 2);
      const points = curve.getPoints(160).map((point) => new THREE.Vector3(point.x, point.y, 0));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterials[index]);
      line.rotation.x = 0.9 + index * 0.24;
      line.rotation.y = index * 0.52;
      orbitGroup.add(line);
    });

    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.085, 20, 20);
    const nodeMaterials = [makeNodeMaterial(cyan), makeNodeMaterial(violet), makeNodeMaterial(white)];

    Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 18) * Math.PI * 2;
      const radius = 2.05 + (index % 3) * 0.35;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index % nodeMaterials.length]);
      node.userData = {
        angle,
        radius,
        speed: 0.28 + (index % 5) * 0.035,
        yScale: 0.42 + (index % 4) * 0.08,
        zOffset: ((index % 6) - 2.5) * 0.16,
      };
      nodes.push(node);
      orbitGroup.add(node);
      return node;
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    Array.from({ length: 170 }, (_, index) => {
      const spread = index % 2 === 0 ? 5.8 : 7.4;
      starPositions.push(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * 4.8,
        -1.2 - Math.random() * 3.6
      );
      return null;
    });
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: cyan,
        size: 0.025,
        transparent: true,
        opacity: 0.42,
      })
    );
    scene.add(stars);

    function resize() {
      const { clientWidth, clientHeight } = canvas.parentElement || canvas;
      const width = Math.max(clientWidth, 1);
      const height = Math.max(clientHeight, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      group.position.x = width < 760 ? 0 : 1.65;
      group.position.y = width < 760 ? 0.08 : -0.12;
      group.scale.setScalar(width < 760 ? 0.82 : 1);
    }

    let frameId;
    function render() {
      const elapsed = clock.getElapsedTime();
      if (!reduced) {
        core.rotation.x = elapsed * 0.18;
        core.rotation.y = elapsed * 0.28;
        glow.scale.setScalar(1 + Math.sin(elapsed * 1.3) * 0.035);
        orbitGroup.rotation.z = elapsed * 0.08;
        stars.rotation.z = elapsed * 0.01;
        nodes.forEach((node, index) => {
          const angle = node.userData.angle + elapsed * node.userData.speed;
          node.position.set(
            Math.cos(angle) * node.userData.radius,
            Math.sin(angle) * node.userData.radius * node.userData.yScale,
            Math.sin(angle + index) * 0.35 + node.userData.zOffset
          );
        });
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    }

    resize();
    render();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
