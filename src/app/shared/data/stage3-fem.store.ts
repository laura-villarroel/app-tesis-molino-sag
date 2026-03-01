import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

type AnyObj = Record<string, any>;

export type Stage3FemRow = {  scenarioId: string;


  // métricas FEM (todas opcionales)
  fResultMax_kN: number | null;
  pContMax_MPa: number | null;
  sigmaVMMax_MPa: number | null;
  dispMax_um: number | null;
  u_mJ: number | null;
  fs: number | null;
  reacResult_kN: number | null;
  errorF_pct: number | null;

  comment: string | null;
   // Imágenes FEM (paths en assets)
  pressureImg: string | null;
  forceImg: string | null;
  stressImg: string | null;
  displacementImg: string | null;
  energyImg: string | null;
};



export type Stage3FemJson = AnyObj;

@Injectable({ providedIn: 'root' })
export class Stage3FemStore {
  private http = inject(HttpClient);

  /** rows list (normalizado) */
  readonly rows$: Observable<Stage3FemRow[]> = this.http
    .get<Stage3FemJson>('assets/data/stage3.fem.json')
    .pipe(
      map((raw) => this.normalizeRows(raw)),
      shareReplay(1),
    );

  /** map por scenarioId  */
  readonly map$: Observable<Record<string, Stage3FemRow>> = this.rows$.pipe(
    map((rows) => this.toMap(rows)),
    shareReplay(1),
  );

  // ---------------------------
  // Normalización / parsing
  // ---------------------------

  private normalizeRows(raw: Stage3FemJson): Stage3FemRow[] {
    const items = this.extractItems(raw);
    const rows = this.toRows(items);
    return rows;
  }

  private extractItems(raw: Stage3FemJson): AnyObj[] {
    if (!raw) return [];

    const asObj = raw as AnyObj;

    const candidate = asObj['items'] ?? asObj;


    if (Array.isArray(candidate)) return candidate as AnyObj[];


    if (candidate && typeof candidate === 'object') {
      return Object.values(candidate) as AnyObj[];
    }

    return [];
  }

  private toRows(items: AnyObj[]): Stage3FemRow[] {
    const isScenarioId = (s: string) => /^E[1-5]-V\d-L\d$/i.test(s.trim());

    return items
      .map((r: AnyObj): Stage3FemRow | null => {
        const idRaw =
          this.pickString(r, [
            'scenarioId',
            'ScenarioId',
            'Escenario',
            'scenario',
            'id',
          ]) ?? '';

        const scenarioId = String(idRaw).trim();
        if (!scenarioId || !isScenarioId(scenarioId)) return null;


const pressureFromJson = this.pickString(r, ['pressureImg', 'pressure_img']);
const forceFromJson = this.pickString(r, ['forceImg', 'force_img']);
const stressFromJson = this.pickString(r, ['stressImg', 'stress_img', 'vonMisesImg', 'img']);
const displacementFromJson = this.pickString(r, ['displacementImg', 'displacement_img']);
const energyFromJson = this.pickString(r, ['energyImg', 'energy_img']);

const pressureImg =
  (pressureFromJson?.trim() ? pressureFromJson.trim() : `assets/fem/imported_pressure/${scenarioId}.png`) ?? null;

const forceImg =
  (forceFromJson?.trim() ? forceFromJson.trim() : `assets/fem/force_reaction/${scenarioId}.png`) ?? null;

const stressImg =
  (stressFromJson?.trim() ? stressFromJson.trim() : `assets/fem/equivalent_stress_vonmises/${scenarioId}.png`) ?? null;

const displacementImg =
  (displacementFromJson?.trim() ? displacementFromJson.trim() : `assets/fem/total_deformation/${scenarioId}.png`) ?? null;

const energyImg =
  (energyFromJson?.trim() ? energyFromJson.trim() : `assets/fem/strain_energy/${scenarioId}.png`) ?? null;

        return {
  scenarioId,

  // imágenes FEM
  pressureImg,
  forceImg,
  stressImg,
  displacementImg,
  energyImg,

  // métricas
  fResultMax_kN: this.pickNumber(r, ['fResultMax_kN', 'F_result-max (kN)', 'F_result_max (kN)', 'F_result-max', 'F_result_max']),
  pContMax_MPa: this.pickNumber(r, ['pContMax_MPa', 'Pcont-max (MPa)', 'Pcont-max', 'Pcont_max']),
  sigmaVMMax_MPa: this.pickNumber(r, ['sigmaVMMax_MPa', 'σVM-max (MPa)', 'sigmaVM-max (MPa)', 'sigmaVM-max', 'σVM-max']),
  dispMax_um: this.pickNumber(r, ['dispMax_um', 'Disp-max (µm)', 'Disp-max (um)', 'Disp-max', 'Disp_max']),
  u_mJ: this.pickNumber(r, ['u_mJ', 'U (mJ)', 'U(mJ)', 'U']),
  fs: this.pickNumber(r, ['fs', 'FS']),
  reacResult_kN: this.pickNumber(r, ['reacResult_kN', 'Reac_result (kN)', 'Reac_result(kN)', 'Reac_result', 'Reac_result_kN', 'reac']),
  errorF_pct: this.pickNumber(r, ['errorF_pct', 'ErrorF (%)', 'ErrorF(%)', 'ErrorF', 'errorF']),

  comment: this.pickString(r, ['comment', 'comentario', 'Comentario']) ?? null,
};
      })

      .filter((x): x is Stage3FemRow => x !== null);
  }

  private toMap(rows: Stage3FemRow[]): Record<string, Stage3FemRow> {
    const out: Record<string, Stage3FemRow> = {};
    for (const r of rows) out[r.scenarioId] = r;
    return out;
  }

  // ---------------------------
  // Helpers de lectura robusta
  // ---------------------------

  private pickString(obj: AnyObj, keys: string[]): string | null {
    for (const k of keys) {
      const v = obj?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (typeof v === 'number') return String(v);
    }
    return null;
  }

  private pickNumber(obj: AnyObj, keys: string[]): number | null {
    for (const k of keys) {
      const v = obj?.[k];
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string' && v.trim()) {
        const n = Number(v.replace(',', '.'));
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  }
}
