import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs';

export type Stage1WearTransition = {
  transition: 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
  dH_mm: number;
  v_mm_h: number;
  t_months: number;
  statesImage: string; // viene como "assets/stage1/E1_0.png"
};

export type Stage1WearItem = {
  scenarioId: string;
  wearVideoDefault?: string;
  totalTime_months?: number;
  base: Stage1WearTransition; // transition = E1
  transitions: Stage1WearTransition[]; // E2..E5
};

type Stage1WearJson = {
  schemaVersion?: string;
  updatedAt?: string;
  stage?: number;
  sheet?: string;
  items: Record<string, Stage1WearItem>;
};

// normaliza ids con – y —
export function normalizeScenarioId(id: string): string {
  return String(id ?? '')
    .trim()
    .replace(/[–—]/g, '-') // en-dash/em-dash -> hyphen
    .replace(/\s+/g, '')
    .toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class Stage1WearStore {
  private http = inject(HttpClient);

  /** Mapa normalizado: "E1-V4-L2" -> item */
  readonly map$ = this.http.get<Stage1WearJson>('assets/data/stage1.wear.json').pipe(
    map((json) => {
      const out: Record<string, Stage1WearItem> = {};
      const items = json?.items ?? {};
      for (const [k, v] of Object.entries(items)) {
        const key = normalizeScenarioId(v?.scenarioId ?? k);
        out[key] = v;
      }
      return out;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
