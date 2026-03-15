import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { normalizeScenarioId } from './scenario-id';
type AnyObj = Record<string, any>;

export type StrategyAdaptiveJson = AnyObj;

export type StrategyAdaptiveSummary = {
  months: number | null;
  monthsWithFS: number | null;
  additionalMonths: number | null;
};

export type StrategyAdaptiveTransitionRow = {
  transition: string;                 // "E1→E2"
  scenarioId: string;                 // "E1-V2-L2"
  deltaH_mm: number | null;           // ΔH (mm)
  v_mm_h: number | null;              // v (mm/h)
  months: number | null;              // t (meses)
  monthsWithFS: number | null;        // t (meses, FS=0.72)
  additionalMonthsVsBaseFS: number | null; // +meses vs base (FS)
};

export type StrategyAdaptiveScenario = StrategyAdaptiveTransitionRow;

@Injectable({ providedIn: 'root' })
export class StrategyAdaptiveStore {
  private http = inject(HttpClient);

  private readonly raw$ = this.http
    .get<StrategyAdaptiveJson>('assets/data/strategy_adaptive.json')
    .pipe(shareReplay(1));

  /** Tabla de transiciones (para Procedimiento / Etapa 5) */
  readonly transitions$: Observable<StrategyAdaptiveTransitionRow[]> = this.raw$.pipe(
    map((raw) => this.extractTransitions(raw)),
    map((items) => items.map((t) => this.toRow(t)).filter((x): x is StrategyAdaptiveTransitionRow => !!x)),
    shareReplay(1)
  );


  readonly map$: Observable<Record<string, StrategyAdaptiveScenario>> = this.transitions$.pipe(
    map((rows) => {
      const out: Record<string, StrategyAdaptiveScenario> = {};
      for (const r of rows) out[r.scenarioId] = r;
      return out;
    }),
    shareReplay(1)
  );





  readonly summary$: Observable<StrategyAdaptiveSummary | null> = this.raw$.pipe(
    map((raw) => this.extractSummary(raw)),
    shareReplay(1)
  );

  // -------------------------
  // Parsing helpers
  // -------------------------

  private extractTransitions(raw: StrategyAdaptiveJson): AnyObj[] {
    const obj = raw as any;
    const t = obj?.transitions;

    if (Array.isArray(t)) return t as AnyObj[];
    if (t && typeof t === 'object') return Object.values(t) as AnyObj[];


    if (Array.isArray(raw)) return raw as unknown as AnyObj[];

    return [];
  }

  private extractSummary(raw: StrategyAdaptiveJson): StrategyAdaptiveSummary | null {
    const obj = raw as any;
    const s = obj?.summary;
    if (!s || typeof s !== 'object') return null;

    return {
      months: this.pickNumber(s, ['months', 't_months', 't', 'totalMonths']),
      monthsWithFS: this.pickNumber(s, ['monthsWithFS', 'months_with_fs', 't_months_fs', 'tFS']),
      additionalMonths: this.pickNumber(s, ['additionalMonths', 'additional_months', 'extraMonths', 'deltaMonths']),
    };
  }

  private toRow(t: AnyObj): StrategyAdaptiveTransitionRow | null {
    const transition = this.pickString(t, ['transition', 'Transición', 'transicion']) ?? '';
    const rawScenario =
      this.pickString(t, ['scenarioId', 'Escenario', 'scenario', 'id']) ?? '';

    const scenarioId = normalizeScenarioId(rawScenario);
    if (!scenarioId) return null;

    return {
      transition: transition || '',
      scenarioId,
      deltaH_mm: this.pickNumber(t, ['deltaH_mm', 'ΔH (mm)', 'ΔH', 'dH', 'dH_mm', 'DH']),
      v_mm_h: this.pickNumber(t, ['v_mm_h', 'v (mm/h)', 'v', 'v_mmhr', 'v_mmh']),
      months: this.pickNumber(t, ['months', 't (meses)', 't', 't_months']),
     monthsWithFS: this.pickNumber(t, [
  'monthsWithFS',
  'months_with_fs',
  't_months_fs',
  't (meses, FS=0.72)',
  't_fs',
  'tFS',
]),

additionalMonthsVsBaseFS: this.pickNumber(t, [
  'additionalMonthsVsBaseFS',
  'additionalMonths_fs',
  '+meses vs base (FS)',
  'plusMonthsVsBaseFS',
]),};
  }



  private pickNumber(obj: AnyObj, keys: string[]): number | null {
    if (!obj) return null;
    for (const k of keys) {
      const v = obj[k];
      if (v === 0) return 0;
      if (v == null) continue;
      const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  private pickString(obj: AnyObj, keys: string[]): string | null {
    if (!obj) return null;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  }
}
