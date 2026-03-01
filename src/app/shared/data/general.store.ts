import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { normalizeScenarioId } from './scenario-id';

export type GeneralScenario = {
  scenarioId: string;
  state: 'E1'|'E2'|'E3'|'E4'|'E5';

  NcPct: number;
  rpm: number;
  fillPct: number;

  ballsPct: number;
  rocksPct: number;
  ballsMass_t: number;
  rocksMass_t: number;
  totalMass_t: number;

  powerDem_kW: number;
  anglesImage: string;
};

type GeneralJson = { items: Record<string, GeneralScenario> };

@Injectable({ providedIn: 'root' })
export class GeneralStore {
  private http = inject(HttpClient);

  readonly map$: Observable<Record<string, GeneralScenario>> =
    this.http.get<GeneralJson>('assets/data/general.json').pipe(
      map(r => {
        const items = r?.items ?? {};
        const out: Record<string, GeneralScenario> = {};
        for (const [k, v] of Object.entries(items)) out[normalizeScenarioId(k)] = v;
        return out;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
