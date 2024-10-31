/* eslint-disable */
// @ts-nocheck
import { useFrame } from '@react-three/fiber'
import { useState, useMemo } from 'react';
import * as THREE from 'three';
import * as baffer from './otsiuda_bafaemsya';

export default class Dai_Bog_Zdoroviya {

    static z_heksa_na_erdzhibi = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        return [r, g, b];
    }

    static shvydenko_porahuu_geometrychnu_korobochnu_rozmalyovku = (
        tak_a_po_chomu_vlasne_rahuvaty,
        chym_maluem,
        naskolko_banochka_ushla,
        obrizaem_hvostiki = false
    ) => {
        const karobochnyi_material = this.z_heksa_na_erdzhibi(chym_maluem);
        const nagadalysya_za_banochku = tak_a_po_chomu_vlasne_rahuvaty && tak_a_po_chomu_vlasne_rahuvaty.length;

        const odna_sutsilna_hapka = useMemo(() => {
            if (!nagadalysya_za_banochku) return;

            if (obrizaem_hvostiki)
                tak_a_po_chomu_vlasne_rahuvaty.pop();

            const dzheometriiisy = tak_a_po_chomu_vlasne_rahuvaty.map(cell => {
                const dzheometriii = new THREE.BufferGeometry();
                const dyryavim_tochki_dlya_baniury = new Float32Array([
                    ...cell.tochki_na_celle.liva_nyzhnya,
                    ...cell.tochki_na_celle.prava_nyzhnya,
                    ...cell.tochki_na_celle.prava_verhnya,
                    ...cell.tochki_na_celle.liva_verhnya
                ]);


                const naskolko_banka_prosvietilasya = 1 - naskolko_banochka_ushla(cell, tak_a_po_chomu_vlasne_rahuvaty.at(-1).stepchiki_suda);
                const kraska_malyara = [...karobochnyi_material, naskolko_banka_prosvietilasya];

                dzheometriii.setAttribute('position', new THREE.BufferAttribute(dyryavim_tochki_dlya_baniury, 3));
                dzheometriii.setAttribute('color', new THREE.BufferAttribute(new Float32Array([...kraska_malyara, ...kraska_malyara, ...kraska_malyara, ...kraska_malyara]), kraska_malyara.length));
                dzheometriii.setIndex([0, 1, 2, 0, 2, 3]);

                return dzheometriii;
            });

            return baffer.mergeBufferGeometries(dzheometriiisy);

        }, [tak_a_po_chomu_vlasne_rahuvaty])

        return {
            odna_sutsilna_hapka,
            nagadalysya_za_banochku
        }
    }

    static gadau_po_malyarskiy_doloni = (
        zhytevi_linii_na_doloni,
        lainovi_nastroiki
    ) => {
        const [progressiya_po_lainu, set_progressiya_po_lainu] = useState(0);
        const [uves_lain_na_malyarskiy_doloni, set_uves_lain_na_malyarskiy_doloni] = useState(new THREE.BufferGeometry());

        const stepovoi_animeit = lainovi_nastroiki.stepchik_animeita / 1000;
        const mozhna_dvizhuvaty_dali = zhytevi_linii_na_doloni.length && uves_lain_na_malyarskiy_doloni.attributes.position && uves_lain_na_malyarskiy_doloni.attributes.position.count;

        useFrame(() => {
            if (!zhytevi_linii_na_doloni.length) return;

            if (progressiya_po_lainu + stepovoi_animeit <= 1) {
                set_progressiya_po_lainu(progressiya_po_lainu + stepovoi_animeit);
            }

            const geometries = zhytevi_linii_na_doloni.map(metka => {
                const geometry = new THREE.BufferGeometry();

                const [x0, y0, z0] = metka[0];
                const [x1, y1, z1] = metka[1];

                const interpolizuvali_point_kincya_lainu = [
                    x0 + (x1 - x0) * progressiya_po_lainu,
                    y0 + (y1 - y0) * progressiya_po_lainu,
                    z0 + (z1 - z0) * progressiya_po_lainu,
                ];

                const positions = new Float32Array([x0, y0, z0, ...interpolizuvali_point_kincya_lainu]);

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                return geometry;
            });

            set_uves_lain_na_malyarskiy_doloni(baffer.mergeBufferGeometries(geometries));
        });

        return {
            mozhna_dvizhuvaty_dali,
            uves_lain_na_malyarskiy_doloni
        }
    }
}