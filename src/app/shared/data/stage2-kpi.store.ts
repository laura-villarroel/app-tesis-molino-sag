import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { normalizeScenarioId } from './scenario-id';

export type Stage2KpiScenario = {
  scenarioId: string;

  // KPIs / métricas
  ancho_deg?: number;
  indTray?: number;
  pUtilRR_kW?: number;
  indRotura?: number;
  eImpLiner_kW?: number;
  indLiner?: number;
  wRocky_kW?: number;
  indPot?: number;
  indGlobal?: number;

  comment?: string | null;

  // Assets
  specImpactPowerRockRockImg?: string;
  impactPowerLinerImg?: string;

  // Media
  video?: string; // youtu.be / youtube
};

type Json = { items: Record<string, Stage2KpiScenario> };

@Injectable({ providedIn: 'root' })
export class Stage2KpiStore {
  private http = inject(HttpClient);

  readonly map$: Observable<Record<string, Stage2KpiScenario>> =
    this.http.get<Json>('assets/data/stage2.kpi.json').pipe(
      map(r => {
        const items = r?.items ?? {};
        const out: Record<string, Stage2KpiScenario> = {};
        for (const [k, v] of Object.entries(items)) out[normalizeScenarioId(k)] = v;
        return out;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
