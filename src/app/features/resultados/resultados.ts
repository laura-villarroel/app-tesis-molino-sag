import {
  Component,
  computed,
  inject,
  signal,
  TrackByFunction,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/page-hero/page-hero';
import { GeneralStore } from '../../shared/data/general.store';
import { Stage2KpiStore } from '../../shared/data/stage2-kpi.store';
import { Stage45Store } from '../../shared/data/stage45.store';
import { toSignal } from '@angular/core/rxjs-interop';

type StateFilter = 'all' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
type WinnerFilter = 'all' | 'stage2' | 'final';
type ViewMode = 'cards' | 'table';

type ScenarioRow = {
  scenarioId: string;
  state: 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
  wearPct: number | null;
  NcPct: number | null;
  fillPct: number | null;
  rpm: number | null;
  totalMass_t: number | null;
  powerMorrell_kW: number | null;
  anglesImage: string | null;
  isStage2Winner: boolean;
  isFinalWinner: boolean;
  winnerLabel: 'Ganador etapa 2' | 'Ganador final' | null;
   domId: string;
};

type TopKpi = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
};

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss'],
})
export class ResultadosComponent {

  private generalStore = inject(GeneralStore);
  private stage2Store = inject(Stage2KpiStore);
  private stage45Store = inject(Stage45Store);

  readonly generalMap = toSignal(this.generalStore.map$, { initialValue: {} as Record<string, any> });
  readonly stage2Map  = toSignal(this.stage2Store.map$,   { initialValue: {} as Record<string, any> });
  readonly stage45Map = toSignal(this.stage45Store.map$,  { initialValue: {} as Record<string, any> });

  readonly q = signal('');
  readonly stateFilter = signal<StateFilter>('all');
  readonly winnerFilter = signal<WinnerFilter>('all');
  readonly viewMode = signal<ViewMode>('cards');
  readonly flashId = signal<string | null>(null);
  readonly lightboxOpen = signal(false);
  readonly lightboxSrc = signal('');
  readonly lightboxAlt = signal('');

  private normId(id: any): string {
    return String(id ?? '')
      .trim()
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  private normState(x: any): 'E1' | 'E2' | 'E3' | 'E4' | 'E5' {
    const s = String(x ?? '').trim().toUpperCase();
    const m = s.match(/E[1-5]/);
    return (m?.[0] as any) ?? 'E1';
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private toPct(v: any): number | null {
    const n = this.toNumber(v);
    if (n === null) return null;
    if (n <= 1.5) return n * 100;
    return n;
  }

  private stateToWearPct(state: 'E1' | 'E2' | 'E3' | 'E4' | 'E5'): number {
    return state === 'E1'
      ? 0
      : state === 'E2'
      ? 25
      : state === 'E3'
      ? 50
      : state === 'E4'
      ? 75
      : 100;
  }

  private normImg(v: any): string | null {
    const s = String(v ?? '').trim();
    return s || null;
  }

  private extractWinnerIdsFromJson(raw: any): Set<string> {
    const set = new Set<string>();
    if (!raw) return set;

    const items =
      raw['items'] ??
      raw['scenarios'] ??
      raw['data'] ??
      raw['results'] ??
      raw;

    const winnerRegex = /\bganador(es)?\b/i;

    if (items && typeof items === 'object' && !Array.isArray(items)) {
      for (const [k, v] of Object.entries(items)) {
        const obj = v as any;
        const id = this.normId(obj?.scenarioId ?? k);

        const comment = String(
          obj?.comment ??
          obj?.comments ??
          obj?.notes ??
          obj?.nota ??
          obj?.observacion ??
          obj?.observación ??
          ''
        );

        if (winnerRegex.test(comment)) set.add(id);
      }
      return set;
    }

    if (Array.isArray(items)) {
      for (const it of items as any[]) {
        const id = this.normId(it?.scenarioId ?? it?.id ?? it?.name);

        const comment = String(
          it?.comment ??
          it?.comments ??
          it?.notes ??
          it?.nota ??
          it?.observacion ??
          it?.observación ??
          ''
        );

        const winnerBool =
          it?.winner === true ||
          it?.isWinner === true ||
          (it?.stage2 && it?.stage2?.winner === true) ||
          (it?.stage5 && it?.stage5?.winner === true);

        if (winnerRegex.test(comment) || winnerBool) set.add(id);
      }
    }

    return set;
  }

  readonly stage2Winners = computed(() =>
    this.extractWinnerIdsFromJson(this.stage2Map())
  );

  readonly finalWinners = computed(() =>
    this.extractWinnerIdsFromJson(this.stage45Map())
  );

  readonly rows = computed<ScenarioRow[]>(() => {
    const g = this.generalMap();
    if (!g) return [];

    const src =
      (Array.isArray(g['scenarios']) && g['scenarios']) ||
      (Array.isArray(g['items']) && g['items']) ||
      (g['items'] && typeof g['items'] === 'object'
        ? Object.values(g['items'])
        : null) ||
      (g && typeof g === 'object' && !Array.isArray(g)
        ? Object.values(g)
        : null) ||
      [];

    const stage2Set = this.stage2Winners();
    const finalSet = this.finalWinners();

    return (src as any[]).map((x) => {
      const scenarioId = this.normId(
        x?.scenarioId ?? x?.id ?? x?.scenario ?? x?.name
      );

      const state = this.normState(
        x?.state ?? x?.stateCode ?? x?.wearState ?? x?.estado
      );

      const wearRaw = this.toPct(x?.wearPct ?? x?.wear_pct ?? x?.wear);
      const wearPct = wearRaw ?? this.stateToWearPct(state);

      const NcPct = this.toPct(x?.NcPct ?? x?.pctNc ?? x?.nc ?? x?.nc_pct);
      const fillPct = this.toPct(x?.fillPct ?? x?.fill ?? x?.fill_pct);
      const rpm = this.toNumber(x?.rpm);

      const totalMass_t = this.toNumber(
        x?.totalMass_t ?? x?.totalMass ?? x?.m_total_t ?? x?.total_mass_t
      );

      const powerMorrell_kW = this.toNumber(
        x?.powerMorrell_kW ?? x?.power_morrell_kw ?? x?.power
      );

      const anglesImage = this.normImg(
        x?.anglesImage ?? x?.angles_image ?? x?.anglesImg
      );

      const isStage2Winner = stage2Set.has(scenarioId);
      const isFinalWinner = finalSet.has(scenarioId);

      const winnerLabel =
        isFinalWinner
          ? 'Ganador final'
          : isStage2Winner
          ? 'Ganador etapa 2'
          : null;

      return {
  scenarioId,
  state,
  wearPct,
  NcPct,
  fillPct,
  rpm,
  totalMass_t,
  powerMorrell_kW,
  anglesImage,
  isStage2Winner,
  isFinalWinner,
  winnerLabel,
  domId: `card-${scenarioId}`
};
    });
  });

  readonly filtered = computed(() => {
    const q = this.normId(this.q());
    const st = this.stateFilter();
    const wf = this.winnerFilter();

    return this.rows().filter((r) => {
      if (q && !r.scenarioId.includes(q)) return false;
      if (st !== 'all' && r.state !== st) return false;
      if (wf === 'stage2' && !r.isStage2Winner) return false;
      if (wf === 'final' && !r.isFinalWinner) return false;
      return true;
    });
  });

  readonly totalScenarios = computed(() => this.rows().length);

  readonly totalStage2Winners = computed(() =>
    this.rows().filter(r => r.isStage2Winner).length
  );

  readonly totalFinalWinners = computed(() =>
    this.rows().filter(r => r.isFinalWinner).length
  );

  readonly kpis = computed<TopKpi[]>(() => {
    const total = this.totalScenarios();
    const w2 = this.totalStage2Winners();
    const wf = this.totalFinalWinners();

    const finals =
      this.rows()
        .filter(r => r.isFinalWinner)
        .map(r => r.scenarioId)
        .sort()
        .join(' · ') || '—';

    return [
  {
    title: 'Estados Desgastado (Etapa 1)',
    value: '5',
    subtitle: 'E1–E5 (DEM, desgaste activo, 1300 s)',
    icon: '📊'
  },
  {
    title: 'Simulaciones DEM (Etapa 2)',
    value: String(total),
    subtitle: 'Exploración operacional (sin rotura ni desgaste)',
    icon: '⚙️'
  },
  {
    title: 'Ganadores Etapa 2',
    value: String(w2),
    subtitle: 'Selección por indicador global',
    icon: '🏆'
  },
  {
    title: 'Casos FEM (Etapa 3)',
    value: '11',
    subtitle: 'ANSYS Mechanical (10 ganadores + base)',
    icon: '🧩'
  },
  {
    title: 'Casos DEM (Etapa 4)',
    value: '11',
    subtitle: 'Desgaste activo (velocidad de desgaste)',
    icon: '⚙️'
  },
  {
    title: 'Casos DEM (Etapa 5)',
    value: '11',
    subtitle: 'Rotura activa (sin desgaste activo)',
    icon: '⚙️'
  },
  {
    title: 'Ganadores finales (Etapa 6)',
    value: String(wf),
    subtitle: finals,
    icon: '🏆'
  }
];
  });

  trackKpi: TrackByFunction<TopKpi> = (_i, k) => k.title;
  trackByScenarioId: TrackByFunction<ScenarioRow> = (_i, r) => r.scenarioId;

  setQ(v: string) {
    this.q.set(v ?? '');
  }

  setState(v: string) {
    const vv = String(v ?? '').toUpperCase().trim();
    if (vv === 'ALL' || vv === 'TODOS') this.stateFilter.set('all');
    else if (['E1','E2','E3','E4','E5'].includes(vv))
      this.stateFilter.set(vv as StateFilter);
    else this.stateFilter.set('all');
  }

  setWinner(v: string) {
    const vv = String(v ?? '').toLowerCase().trim();
    if (vv === 'stage2') this.winnerFilter.set('stage2');
    else if (vv === 'final') this.winnerFilter.set('final');
    else this.winnerFilter.set('all');
  }

  setView(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  fmtNum(v: number | null, digits = 2): string {
    if (v === null || v === undefined) return '—';
    return v.toFixed(digits);
  }

  fmtPct(v: number | null, digits = 0): string {
    if (v === null || v === undefined) return '—';
    return `${v.toFixed(digits)}%`;
  }

  openCardFromTable(id: string) {
    const sid = this.normId(id);
    this.viewMode.set('cards');
    this.flashId.set(sid);

    setTimeout(() => {
      const el = document.getElementById(this.cardDomId(sid));
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        if (this.flashId() === sid) this.flashId.set(null);
      }, 1800);
    }, 50);
  }

  cardDomId(id: string) {
    return `card-${this.normId(id)}`;
  }

  openLightbox(src: string | null, alt: string) {
    if (!src) return;
    this.lightboxSrc.set(src);
    this.lightboxAlt.set(alt);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  imgFallback(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    img.src = '/assets/branding/molino-sag-v2.png';
  }
}
