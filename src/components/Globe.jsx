import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3, vector3ToLatLng } from '../lib/geo.js';

// Drop your own file at public/textures/earth.jpg to self-host. Otherwise this CDN copy is used.
const REMOTE_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

function useEarthTexture() {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let cancelled = false;
    let loaded;
    const sources = [`${import.meta.env.BASE_URL}textures/earth.jpg`, REMOTE_TEXTURE];
    const loader = new THREE.TextureLoader().setCrossOrigin('anonymous');
    const attempt = (i) => {
      if (i >= sources.length) return; // keep the plain blue fallback sphere
      loader.load(
        sources[i],
        (t) => {
          if (cancelled) return t.dispose();
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = gl.capabilities.getMaxAnisotropy();
          loaded = t;
          setTexture(t);
        },
        undefined,
        () => attempt(i + 1)
      );
    };
    attempt(0);
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [gl]);
  return texture;
}

function Earth({ onPick }) {
  const map = useEarthTexture();
  return (
    <mesh
      onClick={(e) => {
        if (e.delta > 4) return; // it was a drag, not a click
        e.stopPropagation();
        onPick(vector3ToLatLng(e.point));
      }}
    >
      <sphereGeometry args={[1, 96, 96]} />
<meshStandardMaterial map={map} color={map ? '#ffffff' : '#1b4b63'} roughness={0.95} />
    </mesh>
  );
}

const atmosphere = {
  vertex: `varying vec3 vNormal;
    void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragment: `varying vec3 vNormal;
    void main() { float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(0.44, 0.84, 0.78, 1.0) * i; }`,
};

function Atmosphere() {
  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphere.vertex}
        fragmentShader={atmosphere.fragment}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Marker({ lat, lng, still }) {
  const pos = useMemo(() => latLngToVector3(lat, lng, 1.004), [lat, lng]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()),
    [pos]
  );
  const ring = useRef();
  useFrame(({ clock }) => {
    if (!ring.current || still) return;
    const t = (clock.elapsedTime % 1.6) / 1.6;
    ring.current.scale.setScalar(1 + t * 2.2);
    ring.current.material.opacity = 0.8 * (1 - t);
  });
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color="#ffb454" />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.02, 0.026, 48]} />
        <meshBasicMaterial color="#ffb454" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Glides the camera around the sphere (never through it) to a searched place.
function CameraRig({ focus, controls, still }) {
  const goal = useRef(null);
  useEffect(() => {
    const c = controls.current;
    const stop = () => (goal.current = null); // user takes over
    c?.addEventListener('start', stop);
    return () => c?.removeEventListener('start', stop);
  }, [controls]);
  useEffect(() => {
    if (!focus) return;
    const len = THREE.MathUtils.clamp(controls.current?.object.position.length() ?? 3, 2.2, 3.4);
    goal.current = latLngToVector3(focus.lat, focus.lng, len);
    if (still && controls.current) {
      controls.current.object.position.copy(goal.current);
      goal.current = null;
    }
  }, [focus, controls, still]);
  useFrame(({ camera }) => {
    const g = goal.current;
    if (!g) return;
    const from = camera.position.clone().normalize();
    const to = g.clone().normalize();
    if (from.angleTo(to) < 0.01) {
      goal.current = null;
      return;
    }
    const step = new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(from, to), 0.08);
    camera.position.applyQuaternion(step);
    camera.position.setLength(THREE.MathUtils.lerp(camera.position.length(), g.length(), 0.08));
  });
  return null;
}

export default function Globe({ selected, focus, onPick, reducedMotion }) {
  const controls = useRef();
  return (
    <div className="globe">
      <Canvas camera={{ position: [0, 0, 3.4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 3, 5]} intensity={2.2} />
        <Stars radius={60} depth={30} count={2500} factor={3} fade speed={reducedMotion ? 0 : 0.5} />
        <Earth onPick={onPick} />
        <Atmosphere />
        {selected && <Marker lat={selected.lat} lng={selected.lng} still={reducedMotion} />}
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          minDistance={1.6}
          maxDistance={6}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
          autoRotate={!selected && !reducedMotion}
          autoRotateSpeed={0.35}
        />
        <CameraRig focus={focus} controls={controls} still={reducedMotion} />
      </Canvas>
    </div>
  );
}
