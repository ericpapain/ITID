import { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Points, PointMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomyStore } from '../../store/anatomyStore';

const MedicalMaterial = new THREE.MeshStandardMaterial({
  color: '#1e4bd2',
  emissive: '#0055ff',
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  wireframe: true,
  // Stencil setup: The body writes 1 to the stencil buffer
  stencilWrite: true,
  stencilRef: 1,
  stencilZPass: THREE.ReplaceStencilOp,
});

function FluxParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      const y = (Math.random() - 0.5) * 3.5;
      
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y + 1;
      pos[i * 3 + 2] = r * Math.sin(theta);
    }
    return pos;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 3000; i++) {
        positions[i * 3 + 1] += 0.002;
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = -0.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false} renderOrder={1}>
      <PointMaterial
        transparent
        color="#00d2ff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function BloodStreaks({ bone, active }: { bone: THREE.Bone | undefined, active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create 30 slow-moving streaks (lava-like)
  const streaks = useMemo(() => Array.from({ length: 30 }, () => ({
    pos: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    life: 0,
    speed: Math.random() * 0.15 + 0.05, // very slow, like thick lava
  })), []);
  
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  
  useFrame((_state, delta) => {
    if (!active || !groupRef.current || !bone) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    
    // Get world position of the active bone
    bone.getWorldPosition(tempPos);
    groupRef.current.parent?.worldToLocal(tempPos);
    
    // Get world position of the parent bone (where the blood flows to)
    let parentBone = bone.parent as THREE.Bone;
    if (parentBone && parentBone.isBone) {
      parentBone.getWorldPosition(targetPos);
      groupRef.current.parent?.worldToLocal(targetPos);
    } else {
      // Fallback if no parent bone
      targetPos.copy(tempPos);
      targetPos.y += 0.2;
    }
    
    streaks.forEach((streak, i) => {
      streak.life -= delta;
      if (streak.life <= 0) {
        // Spawn around the active bone
        streak.pos.copy(tempPos);
        
        // Add some noise so they fill the width of the limb
        streak.pos.x += (Math.random() - 0.5) * 0.05;
        streak.pos.y += (Math.random() - 0.5) * 0.05;
        streak.pos.z += (Math.random() - 0.5) * 0.05;
        
        // Direction strictly towards the parent bone (flows along the limb)
        streak.dir.subVectors(targetPos, tempPos).normalize();
        
        // Add tiny noise to direction so they aren't perfectly parallel
        streak.dir.x += (Math.random() - 0.5) * 0.2;
        streak.dir.y += (Math.random() - 0.5) * 0.2;
        streak.dir.z += (Math.random() - 0.5) * 0.2;
        streak.dir.normalize();
        
        streak.life = Math.random() * 1.5 + 0.5;
      } else {
        streak.pos.addScaledVector(streak.dir, streak.speed * delta);
      }
      
      const child = groupRef.current!.children[i] as THREE.Line;
      if (child && child.geometry) {
        // Create a line segment pointing in the direction of travel
        const points = [
          streak.pos.clone(),
          streak.pos.clone().addScaledVector(streak.dir, -0.05) // Length of the line
        ];
        (child.geometry as THREE.BufferGeometry).setFromPoints(points);
        
        const mat = child.material as THREE.LineBasicMaterial;
        mat.opacity = Math.max(0, Math.min(0.8, streak.life));
      }
    });
  });

  return (
    <group ref={groupRef}>
      {streaks.map((_, i) => (
        <primitive 
          key={i} 
          object={new THREE.Line(
            new THREE.BufferGeometry(), 
            new THREE.LineBasicMaterial({ 
              color: 0xff2200, 
              transparent: true, 
              opacity: 0.8, 
              depthTest: false, 
              blending: THREE.AdditiveBlending,
              stencilWrite: true,
              stencilRef: 1,
              stencilFunc: THREE.EqualStencilFunc
            })
          )} 
          renderOrder={3} 
        />
      ))}
    </group>
  );
}

const BODY_PART_LABELS: Record<string, string> = {
  head: "Tête",
  neck: "Cou",
  shoulder: "Épaule",
  elbow: "Coude",
  wrist_hand: "Poignet / Main",
  fingers: "Doigts",
  spine: "Rachis",
  back: "Dos",
  abdomen: "Abdomen",
  pelvis: "Bassin / Pelvis",
  hip: "Hanche",
  thigh: "Cuisse",
  knee: "Genou",
  ankle: "Cheville",
  toes: "Orteils"
};

function BoneHitbox({ boneName, bodyPartId, nodes, offset }: { boneName: string, bodyPartId: string, nodes: any, offset?: [number, number, number] }) {
  const { selectedBodyParts, setSelectedBodyPart } = useAnatomyStore();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const bone = nodes[boneName];
  const isSelected = selectedBodyParts.includes(bodyPartId);
  
  const targetPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (bone && meshRef.current) {
      bone.getWorldPosition(targetPos);
      meshRef.current.parent?.worldToLocal(targetPos);
      if (offset) {
        targetPos.x += offset[0];
        targetPos.y += offset[1];
        targetPos.z += offset[2];
      }
      meshRef.current.position.copy(targetPos);
    }
  });

  if (!bone) return null;

  return (
    <>
      <mesh
        ref={meshRef}
        renderOrder={4}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedBodyPart(bodyPartId as any);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial 
          color={isSelected ? "#ff0000" : (hovered ? "#fb923c" : "#ea580c")} 
          transparent 
          opacity={isSelected ? 0.9 : (hovered ? 0.9 : 0.8)} 
          depthTest={false}
        />
        {hovered && (
          <Html position={[0, 0.05, 0]} center zIndexRange={[100, 0]}>
            <div className="px-2 py-1 bg-[#1a3a5c] text-white text-xs font-bold rounded shadow-lg whitespace-nowrap pointer-events-none transform -translate-y-2">
              {BODY_PART_LABELS[bodyPartId] || bodyPartId}
            </div>
          </Html>
        )}
      </mesh>
      <BloodStreaks bone={bone} active={isSelected} />
    </>
  );
}

export function HumanModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, nodes } = useGLTF('/human.glb');
  
  const initialRotations = useMemo(() => new Map<string, THREE.Euler>(), []);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = MedicalMaterial;
        (child as THREE.Mesh).renderOrder = 0;
      }
      if ((child as THREE.Bone).isBone) {
        initialRotations.set(child.name, child.rotation.clone());
      }
    });
  }, [scene, initialRotations]);

  // Movement disabled as requested

  return (
    <group ref={group} position={[0, -1.0, 0]} scale={[1.2, 1.2, 1.2]} dispose={null}>
      <primitive object={scene} />
      
      <BoneHitbox boneName="mixamorigHead" bodyPartId="head" nodes={nodes} offset={[0, 0.15, 0]} />
      <BoneHitbox boneName="mixamorigNeck" bodyPartId="neck" nodes={nodes} offset={[0, 0.05, 0]} />
      
      <BoneHitbox boneName="mixamorigSpine2" bodyPartId="back" nodes={nodes} />
      <BoneHitbox boneName="mixamorigSpine1" bodyPartId="spine" nodes={nodes} />
      <BoneHitbox boneName="mixamorigSpine" bodyPartId="abdomen" nodes={nodes} />
      <BoneHitbox boneName="mixamorigHips" bodyPartId="pelvis" nodes={nodes} />

      <BoneHitbox boneName="mixamorigLeftShoulder" bodyPartId="shoulder" nodes={nodes} offset={[0.06, 0, 0]} />
      <BoneHitbox boneName="mixamorigRightShoulder" bodyPartId="shoulder" nodes={nodes} offset={[-0.06, 0, 0]} />
      
      <BoneHitbox boneName="mixamorigLeftForeArm" bodyPartId="elbow" nodes={nodes} />
      <BoneHitbox boneName="mixamorigRightForeArm" bodyPartId="elbow" nodes={nodes} />
      
      <BoneHitbox boneName="mixamorigLeftHand" bodyPartId="wrist_hand" nodes={nodes} />
      <BoneHitbox boneName="mixamorigRightHand" bodyPartId="wrist_hand" nodes={nodes} />
      
      <BoneHitbox boneName="mixamorigLeftHandMiddle1" bodyPartId="fingers" nodes={nodes} offset={[0.05, 0, 0]} />
      <BoneHitbox boneName="mixamorigRightHandMiddle1" bodyPartId="fingers" nodes={nodes} offset={[-0.05, 0, 0]} />
      
      <BoneHitbox boneName="mixamorigLeftUpLeg" bodyPartId="hip" nodes={nodes} offset={[0.04, 0, 0]} />
      <BoneHitbox boneName="mixamorigRightUpLeg" bodyPartId="hip" nodes={nodes} offset={[-0.04, 0, 0]} />
      
      <BoneHitbox boneName="mixamorigLeftLeg" bodyPartId="knee" nodes={nodes} />
      <BoneHitbox boneName="mixamorigRightLeg" bodyPartId="knee" nodes={nodes} />
      
      <BoneHitbox boneName="mixamorigLeftFoot" bodyPartId="ankle" nodes={nodes} />
      <BoneHitbox boneName="mixamorigRightFoot" bodyPartId="ankle" nodes={nodes} />
      
      <BoneHitbox boneName="mixamorigLeftToeBase" bodyPartId="toes" nodes={nodes} />
      <BoneHitbox boneName="mixamorigRightToeBase" bodyPartId="toes" nodes={nodes} />
    </group>
  );
}

useGLTF.preload('/human.glb');

