import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { normalizeScenarioId } from './scenario-id';

export type Stage45Scenario = {
  scenarioId: string;

  // desgaste
  d_sin?: number;
  d_con?: number;
  vWear_mm_s?: number;
  indWear?: number;

  // producción
  capacity_tph?: number;
  indCapacity?: number;
  ecs_kWh_t?: number;
  indEcs?: number;
  p80_mm?: number;
  indP80?: number;

  // integración
  indGlobal?: number;
  comment?: string | null;

  // media
  wearVideo?: string;
  wearImage?: string;
  breakageVideo?: string;

  // imágenes etapa 5
  productsImg?: string;
  histMassCumSizeImg?: string;
  histPctMassCumSizeImg?: string;
};

type Json = { items: Record<string, Stage45Scenario> };

@Injectable({ providedIn: 'root' })
export class Stage45Store {
  private http = inject(HttpClient);

  readonly map$: Observable<Record<string, Stage45Scenario>> =
    this.http.get<Json>('assets/data/stage45.performance.json').pipe(
      map(r => {
        const items = r?.items ?? {};
        const out: Record<string, Stage45Scenario> = {};
        for (const [k, v] of Object.entries(items)) out[normalizeScenarioId(k)] = v;
        return out;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
