import './App.css';
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Plane } from "@react-three/drei";
import { useState, useEffect } from 'react';

function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [metki_peremetki, set_metki_peremetki] = useState([])
  const [razgadali_malyameizik, set_razgadali_malyameizik] = useState([])
  const [pidsvicheni_celly, set_pidsvicheni_celly] = useState([])
  const [naskolko_obtsunamilis, set_naskolko_obtsunamilis] = useState(0)
  const [chy_blyskae, set_chy_blyskae] = useState(false);

  const yak_zashyroko_zaplutalo = 42;
  const yak_zavysoko_zaplutalo = 42;

  const standart_goyana = 15;
  const rozmir_banochky = 1 / yak_zashyroko_zaplutalo * standart_goyana;

  const naskilki_zadulo_z_vikna = Math.floor(yak_zashyroko_zaplutalo / 2) * rozmir_banochky;
  const naskilki_zahotilosya_chhnuty = Math.floor(yak_zavysoko_zaplutalo / 2) * rozmir_banochky;

  const gridosik = [];
  const chy_treba_provernutysya = 63;
  const chy_treba_nam_nagnutysya = 17;

  const koef_otvlecheniy_ot_razvlecheniy = 800;

  const kontrakt_po_woolsam = [1, 1, 1, 1, 1, 2, 3];

  const kuda_podnyalosya_tsunami = 7;

  let zaraz_blymne = false;

  const chy_znayshlasya_farba_dlya_chohos = (schos) => {
    return Math.random() * 100 < schos;
  }

  const cell_gridosika = {
    stepchiki_suda: -1,
    tochki_na_celle: {},
    woolsy: {
      zverhu: false,
      pravoruch: false,
      pid_nyzom: false,
      i_otako_zliva: false,
    },
    de_ya_vbik: Number.MIN_SAFE_INTEGER,
    de_ya_vglyb: Number.MIN_SAFE_INTEGER,

    de_ya_zboku_buv: Number.MAX_SAFE_INTEGER,
    de_ya_opuskavsya: Number.MAX_SAFE_INTEGER
  }

  const startovyi_cellchik = {
    ...cell_gridosika,
    de_ya_vbik: Math.floor(yak_zashyroko_zaplutalo / 2),
    de_ya_vglyb: 0,
    stepchiki_suda: 0,
  }

  let cellchik_kuda_zalaitsorsil = {
    ...cell_gridosika,
    de_ya_vbik: Number.MAX_SAFE_INTEGER,
    de_ya_vglyb: Number.MAX_SAFE_INTEGER,
  }

  useEffect(() => {
    debugger
    if (gridosik.length)
      return;

    for (let i = 0; i < yak_zavysoko_zaplutalo; i++) {

      const rowchik_gridosika = [];
      for (let j = 0; j < yak_zashyroko_zaplutalo; j++) {
        const woolsy_navkolo_nas = {
          zverhu: i > 0 && gridosik[i - 1][j].woolsy.pid_nyzom,
          pid_nyzom: false,
          pravoruch: false,
          i_otako_zliva: j > 0 && rowchik_gridosika[j - 1].woolsy.pravoruch
        };

        const do_chogo_dobazarylys = kontrakt_po_woolsam[Math.floor(Math.random() * kontrakt_po_woolsam.length)];
        const skilky_vzhe_zamaliuvaly = woolsy_navkolo_nas.zverhu + woolsy_navkolo_nas.i_otako_zliva;
        const skilky_she_nam_bazaryty = Math.max(0, do_chogo_dobazarylys - skilky_vzhe_zamaliuvaly);

        const keys = ['pid_nyzom', 'zverhu', 'pravoruch'];
        !j && keys.push('i_otako_zliva');

        const keys_poshafili = poshalil_s_kostyami(keys, skilky_she_nam_bazaryty);
        keys_poshafili.forEach(keychik => woolsy_navkolo_nas[keychik] = true);

        const cellchik = {
          ...cell_gridosika,
          de_ya_vbik: j,
          de_ya_vglyb: i,
          woolsy: woolsy_navkolo_nas
        };

        rowchik_gridosika.push(cellchik);
      }

      gridosik.push(rowchik_gridosika);
    }

    set_metki_peremetki(malyarskie_metki_dostaem_s_karmana())

    gridosik[startovyi_cellchik.de_ya_vglyb][startovyi_cellchik.de_ya_vbik].stepchiki_suda = startovyi_cellchik.stepchiki_suda;
    posylaem_magneelightniy_signalchik([startovyi_cellchik]);

    set_razgadali_malyameizik(gridosik);
    renderKarobochki()
  }, [chy_blyskae])

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'b') {
        // debugger
        // set_chy_blyskae(!chy_blyskae);
        // if (!chy_blyskae)
        //   zaraz_blymne = false;
        // gridosik.splice(0,gridosik.length)
        // set_razgadali_malyameizik([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);



  const zakonsollogaem_sobi_prosto = () => {
    let drovaem_stepchiki = '';
    gridosik.forEach(rovniy_rowchik => {
      rovniy_rowchik.forEach(cellchik => {
        drovaem_stepchiki += `\t${cellchik.stepchiki_suda}`;
      })
      drovaem_stepchiki += '\n';
    })   
  }

  const posylaem_magneelightniy_signalchik = (current_cellchiky) => {
    for (let i = 0; i < current_cellchiky.length; i++) {
      zakonsollogaem_sobi_prosto();
      if (zaraz_blymne)
        return;

      const current_cellchik = gridosik[current_cellchiky[i].de_ya_vglyb][current_cellchiky[i].de_ya_vbik];

      if (current_cellchik.de_ya_vglyb == yak_zavysoko_zaplutalo - 1) {
        if (chy_blyskae) {
          cellchik_kuda_zalaitsorsil = gridosik[current_cellchiky[i].de_ya_vglyb][current_cellchiky[i].de_ya_vbik];
          zaraz_blymne = true;
          return;
        }
      }

      const stepchiki_tuda = current_cellchik.stepchiki_suda + 1;

      if (current_cellchik.de_ya_vglyb > 0 && !current_cellchik.woolsy.zverhu
        && gridosik[current_cellchik.de_ya_vglyb - 1][current_cellchik.de_ya_vbik].stepchiki_suda < 0
      ) {
        gridosik[current_cellchik.de_ya_vglyb - 1][current_cellchik.de_ya_vbik].stepchiki_suda = stepchiki_tuda;
        gridosik[current_cellchik.de_ya_vglyb - 1][current_cellchik.de_ya_vbik].de_ya_zboku_buv = current_cellchik.de_ya_vbik;
        gridosik[current_cellchik.de_ya_vglyb - 1][current_cellchik.de_ya_vbik].de_ya_opuskavsya = current_cellchik.de_ya_vglyb;

        current_cellchiky.push(gridosik[current_cellchik.de_ya_vglyb - 1][current_cellchik.de_ya_vbik]);
      }

      if (current_cellchik.de_ya_vglyb < yak_zavysoko_zaplutalo - 1 && !current_cellchik.woolsy.pid_nyzom
        && gridosik[current_cellchik.de_ya_vglyb + 1][current_cellchik.de_ya_vbik].stepchiki_suda < 0) {
        gridosik[current_cellchik.de_ya_vglyb + 1][current_cellchik.de_ya_vbik].stepchiki_suda = stepchiki_tuda;
        gridosik[current_cellchik.de_ya_vglyb + 1][current_cellchik.de_ya_vbik].de_ya_zboku_buv = current_cellchik.de_ya_vbik;
        gridosik[current_cellchik.de_ya_vglyb + 1][current_cellchik.de_ya_vbik].de_ya_opuskavsya = current_cellchik.de_ya_vglyb;

        current_cellchiky.push(gridosik[current_cellchik.de_ya_vglyb + 1][current_cellchik.de_ya_vbik]);
      }

      if (current_cellchik.de_ya_vbik > 0 && !current_cellchik.woolsy.i_otako_zliva
        && gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik - 1].stepchiki_suda < 0) {
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik - 1].stepchiki_suda = stepchiki_tuda;
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik - 1].de_ya_zboku_buv = current_cellchik.de_ya_vbik;
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik - 1].de_ya_opuskavsya = current_cellchik.de_ya_vglyb;

        current_cellchiky.push(gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik - 1]);
      }

      if (current_cellchik.de_ya_vbik < yak_zashyroko_zaplutalo - 1 && !current_cellchik.woolsy.pravoruch
        && gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik + 1].stepchiki_suda < 0) {
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik + 1].stepchiki_suda = stepchiki_tuda;
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik + 1].de_ya_zboku_buv = current_cellchik.de_ya_vbik;
        gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik + 1].de_ya_opuskavsya = current_cellchik.de_ya_vglyb;

        current_cellchiky.push(gridosik[current_cellchik.de_ya_vglyb][current_cellchik.de_ya_vbik + 1]);
      }

      current_cellchiky.splice(i--, 1);
    }

  }


  const malyarskie_metki_dostaem_s_karmana = () => {
    const metki = []
    for (let i = 0; i < yak_zavysoko_zaplutalo; i++) {
      for (let j = 0; j < yak_zashyroko_zaplutalo; j++) {
        const cellchik = gridosik[i][j];

        const tochki_na_celle = {
          liva_verhnya: [j * rozmir_banochky - naskilki_zadulo_z_vikna, -i * rozmir_banochky + naskilki_zahotilosya_chhnuty, 0],
          prava_verhnya: [j * rozmir_banochky + rozmir_banochky - naskilki_zadulo_z_vikna, -i * rozmir_banochky + naskilki_zahotilosya_chhnuty, 0],
          liva_nyzhnya: [j * rozmir_banochky - naskilki_zadulo_z_vikna, -i * rozmir_banochky - rozmir_banochky + naskilki_zahotilosya_chhnuty, 0],
          prava_nyzhnya: [j * rozmir_banochky + rozmir_banochky - naskilki_zadulo_z_vikna, -i * rozmir_banochky - rozmir_banochky + naskilki_zahotilosya_chhnuty, 0],
        }

        gridosik[i][j].tochki_na_celle = tochki_na_celle

        if (!i && cellchik.woolsy.zverhu) {
          metki.push([
            tochki_na_celle.liva_verhnya,
            tochki_na_celle.prava_verhnya
          ]);
        }
        if (cellchik.woolsy.pid_nyzom) {
          metki.push([
            tochki_na_celle.liva_nyzhnya,
            tochki_na_celle.prava_nyzhnya
          ]);
        }
        if (cellchik.woolsy.pravoruch) {
          metki.push([
            tochki_na_celle.prava_verhnya,
            tochki_na_celle.prava_nyzhnya
          ]);
        }
        if (!j && cellchik.woolsy.i_otako_zliva) {
          metki.push([
            tochki_na_celle.liva_verhnya,
            tochki_na_celle.liva_nyzhnya
          ]);
        }

      }
    }
    return metki;
  }

  function poshalil_s_kostyami(gridosichnyi_array, count = 0) {
    if (!count)
      return [];

    const array = JSON.parse(JSON.stringify(gridosichnyi_array));

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, count);
  }

  const zaderzhymsya_nenadolgo = (delay) => {
    const mozhem_pity_poranshe = Math.random() * delay;
    return mozhem_pity_poranshe;
  }

  // let metki_peremetki = malyarskie_metki_dostaem_s_karmana();
  // metki_peremetki = poshalil_s_kostyami(metki_peremetki, metki_peremetki.length);

  const renderKarobochki = () => {
    Array.from({ length: zaraz_blymne ? cellchik_kuda_zalaitsorsil.stepchiki_suda + 1:
      Math.max(...gridosik.map(rowchik => 
        Math.max(...rowchik.map(cellik => cellik.stepchiki_suda)))) + 1 + kuda_podnyalosya_tsunami
    }, 
      (_, i) => i).map((_, stepchik_suda) => {

      setTimeout(() => {       
        const pidsvicheni_cellchiky = gridosik.flatMap(rowchik =>
          rowchik.filter(cellik =>
            cellik.stepchiki_suda >= Math.max(0,stepchik_suda - kuda_podnyalosya_tsunami) &&
            cellik.stepchiki_suda <= stepchik_suda
          ));

        pidsvicheni_cellchiky.push(stepchik_suda);
        set_pidsvicheni_celly(pidsvicheni_cellchiky);
      }, stepchik_suda * 100)
    })
  }

  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 15] }}
        onCreated={({ gl }) => {
          gl.setClearColor('#2F4F4F')
        }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {
          metki_peremetki.map((metka, index) => (
            <AnimatedLine key={index} points={metka} delay={zaderzhymsya_nenadolgo(index / metki_peremetki.length * koef_otvlecheniy_ot_razvlecheniy)} />
          ))
        }

        {
          pidsvicheni_celly.map((pidsvicheni_cell, index) => {
            if (index === pidsvicheni_celly.length - 1) {
              return
            }
            return (
              <AnimatedPlane
                key={Math.random().toString(36).substr(2, 9)}
                position={[pidsvicheni_cell.tochki_na_celle.liva_nyzhnya[0] + rozmir_banochky / 2, pidsvicheni_cell.tochki_na_celle.liva_nyzhnya[1] + rozmir_banochky / 2, 0]}
                args={[rozmir_banochky, rozmir_banochky]}               
                color='#B5EAD7'
                opacity={1 - ((pidsvicheni_celly[pidsvicheni_celly.length - 1] - pidsvicheni_cell.stepchiki_suda) * (1 / kuda_podnyalosya_tsunami))}
              />
            )
          })
        }
      </Canvas>
    </div>
  )
}

function AnimatedPlane({ position, args, color, opacity }) {
  const [progress, setProgress] = useState(0);
  const stepchik_animeita = 1;
  const [vertaemsya_nazad, set_vertaemsya_nazad] = useState(false)

  const animatedOpacity = progress;

  return (
    <Plane position={position} args={args}>
      <meshStandardMaterial attach="material" color={color} transparent opacity={opacity} />
    </Plane>
  );
}

function AnimatedLine({ points, delay }) {
  const [progress, setProgress] = useState(0);
  const [start, setStart] = useState(false);
  const stepchik_animeita = Math.random() * (0.05 - 0.005) + 0.005;

  useEffect(() => {
    // const delay = Math.random() * 2000; // Random delay between 0 and 2000 ms
    const timeout = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(timeout);
  }, []);

  useFrame(() => {
    if (start && progress + stepchik_animeita <= 1) {
      setProgress(progress + stepchik_animeita);
    }
  });

  const interpolatedPoints = () => {
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

    return [
      [
        currentPointik.x,
        currentPointik.y,
        currentPointik.z
      ],
      [
        currentPointik.x + (nextPointik.x - currentPointik.x) * progress,
        currentPointik.y + (nextPointik.y - currentPointik.y) * progress,
        currentPointik.z + (nextPointik.z - currentPointik.z) * progress,
      ]];
  };

  return (
    <Line
      points={interpolatedPoints()}
      color={'#696969'}
      lineWidth={2}
      dashed={false}
    />
  );
}

function CameraController({ mouse }) {
  useFrame(({ camera }) => {
    camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default App;
