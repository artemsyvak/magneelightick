import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import * as baffer from '../src/otsiuda_bafaemsya';

function AnimatedLine({ points, progress }) {
  const currentPointik = {
    x: points[0][0],
    y: points[0][1],
    z: points[0][2]
  };
  const nextPointik = {
    x: points[1][0],
    y: points[1][1],
    z: points[1][2]
  };

  const interpolizuvali_points = [
    [
      currentPointik.x,
      currentPointik.y,
      currentPointik.z
    ],
    [
      currentPointik.x + (nextPointik.x - currentPointik.x) * progress,
      currentPointik.y + (nextPointik.y - currentPointik.y) * progress,
      currentPointik.z + (nextPointik.z - currentPointik.z) * progress,
    ]
  ];

  const positions = new Float32Array([...interpolizuvali_points[0], ...interpolizuvali_points[1]]);
  return positions;
}



function AnimatedPlanes({ pidsvicheni_celly, rozmir_banochky }) {
  const geometryRef = useRef();

  const mergedGeometry = useMemo(() => {
    const geometries = pidsvicheni_celly.map(cell => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        cell.tochki_na_celle.liva_nyzhnya[0], cell.tochki_na_celle.liva_nyzhnya[1], 0,
        cell.tochki_na_celle.liva_nyzhnya[0] + rozmir_banochky, cell.tochki_na_celle.liva_nyzhnya[1], 0,
        cell.tochki_na_celle.liva_nyzhnya[0] + rozmir_banochky, cell.tochki_na_celle.liva_nyzhnya[1] + rozmir_banochky, 0,
        cell.tochki_na_celle.liva_nyzhnya[0], cell.tochki_na_celle.liva_nyzhnya[1] + rozmir_banochky, 0
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
      return geometry;
    });

    return baffer.mergeBufferGeometries(geometries);
  }, [pidsvicheni_celly, rozmir_banochky]);

  return (
    <mesh geometry={mergedGeometry} ref={geometryRef}>
      <meshBasicMaterial attach="material" color="#B5EAD7" transparent opacity={0.5} />
    </mesh>
  );
}

export default function App() {
  const [metki_peremetki, set_metki_peremetki] = useState([
    [
      [0, 0, 0],
      [1, 1, 1]
    ],
    [
      [-1, 1, 1],
      [2, 2, 2]
    ]
  ]);

  const [pidsvicheni_celly, set_pidsvicheni_celly] = useState([
    {
      tochki_na_celle: {
        liva_nyzhnya: [0, 0]
      }
    },
    {
      tochki_na_celle: {
        liva_nyzhnya: [2, 2]
      }
    }
  ]);

  const [zalainili, set_zalainili] = useState(true);

  const rozmir_banochky = 1; // Example size

  function MergedLines({ metki_peremetki }) {
    const [progress, setProgress] = useState(0);
    const [start, setStart] = useState(false);
    const stepchik_animeita = 0.005;
  
    useEffect(() => {
      const timeout = setTimeout(() => {setProgress(0)}, 0);
      return () => clearTimeout(timeout);
    }, [metki_peremetki]);
  
    useFrame(() => {
      debugger
      if (progress + stepchik_animeita <= 1) {
        setProgress(progress + stepchik_animeita);
      }
      else set_zalainili(true);
    });
  
    const mergedGeometry = useMemo(() => {
      console.log(progress)
      const geometries = metki_peremetki.map((points, index) => {
        const geometry = new THREE.BufferGeometry();
        const line = AnimatedLine({ points, progress });
        
        geometry.setAttribute('position', new THREE.BufferAttribute(line, 3));
        return geometry;
      });
  
      return baffer.mergeBufferGeometries(geometries);
    }, [metki_peremetki, progress]);
  
    return (
      <lineSegments geometry={mergedGeometry}>
        <lineBasicMaterial attach="material" color="#ffffff" />
      </lineSegments>
    );
  }

  // Example update function for lines
  useEffect(() => {
    if (!zalainili) return;
    set_zalainili(false);

    debugger

    set_metki_peremetki(prev => prev.map(pair => [
      [
        pair[0][0] + (Math.random() * 2 - 1),
        pair[0][1] + (Math.random() * 2 - 1),
        pair[0][2] + (Math.random() * 2 - 1)
      ],
      [
        pair[1][0] + (Math.random() * 2 - 1),
        pair[1][1] + (Math.random() * 2 - 1),
        pair[1][2] + (Math.random() * 2 - 1)
      ]
    ]));
  }, [zalainili]);

  // Example update function for planes
  useEffect(() => {
    const interval = setInterval(() => {
      set_pidsvicheni_celly(prev => prev.map(cell => ({
        ...cell,
        tochki_na_celle: {
          ...cell.tochki_na_celle,
          liva_nyzhnya: [
            cell.tochki_na_celle.liva_nyzhnya[0] + (Math.random() * 2 - 1),
            cell.tochki_na_celle.liva_nyzhnya[1] + (Math.random() * 2 - 1)
          ]
        }
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <ambientLight intensity={0.5} />
      <MergedLines metki_peremetki={metki_peremetki} />
      {/* <AnimatedPlanes pidsvicheni_celly={pidsvicheni_celly} rozmir_banochky={rozmir_banochky} /> */}
    </Canvas>
  );
}