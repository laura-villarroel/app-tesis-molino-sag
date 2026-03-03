import {
  Component,
  TrackByFunction,
  computed,
  inject,
  signal,Injectable,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageHeroComponent } from '../../shared/page-hero/page-hero';
import { GeneralStore } from '../../shared/data/general.store';
import { Stage2KpiStore } from '../../shared/data/stage2-kpi.store';
import { Stage45Store } from '../../shared/data/stage45.store';

import { Router } from '@angular/router';
import { Stage3FemStore, Stage3FemRow } from '../../shared/data/stage3-fem.store';
import { StrategyAdaptiveStore, StrategyAdaptiveSummary, StrategyAdaptiveTransitionRow } from '../../shared/data/strategy-adaptive.store';
type StageKey = 1 | 2 | 3 | 4 | 5| 6;

type TopKpi = { title: string; value: string; subtitle: string };

type Stage1WearTransition = {
  transition: 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
  dH_mm: number;
  v_mm_h: number;
  t_months: number;
  statesImage: string;
};

type Stage1WearItem = {
  scenarioId: string;
  wearVideoDefault?: string;
  totalTime_months?: number;
  base: Stage1WearTransition;
  transitions: Stage1WearTransition[];
};

type Stage1WearJson = {
  schemaVersion?: string;
  updatedAt?: string;
  stage?: number;
  sheet?: string;
  items: Record<string, Stage1WearItem>;
};


type Stage2Row = {
  scenarioId: string;
  indGlobal: number;
  indTray: number;
  indRotura: number;
  indLiner: number;
  indPot: number;
  comment?: string | null;
};

type GeneralRow = {
  scenarioId: string;
  N: number;
  anglesImage?: string;
};
type Stage2Detail = {
  scenarioId: string;
  indGlobal: number;
  indTray: number;
  indRotura: number;
  indLiner: number;
  indPot: number;
  comment?: string | null;


  video?: string | null;
  impactPowerLinerImg?: string | null;
  specImpactPowerRockRockImg?: string | null;


  anglesImage?: string | null;
};
// etapa 3
type Stage3RowVM = {
  scenarioId: string;
  stressImg: string;

  fResultMax_kN: number | null;
  pContMax_MPa: number | null;
  sigmaVMMax_MPa: number | null;
  dispMax_um: number | null;
  u_mJ: number | null;
  fs: number | null;
  reacResult_kN: number | null;
  errorF_pct: number | null;
  comment: string | null;
};
//Etapa 4 y 5



type Stage4RowVM = {
  scenarioId: string;
  wearImg: string | null;
  wearVideo: string | null;
  vWear_mm_s: number | null;
  vWear_mm_h: number | null;
  indWear: number | null;
  comment: string | null;
};


type Stage5RowVM = {
  scenarioId: string;
  productsImg: string | null;
  capacity_tph: number | null;
  p80_mm: number | null;
  ecs_kWh_t: number | null;
  power_kW: number | null;
  vDesg_mm_h: number | null;
  indGlobal: number | null;
  isWinner: boolean;
};

type Stage6RowVM = {
  scenarioId: string;
  anglesImg: string | null;

  vDesg_mm_h: number | null;
  indDesg: number | null;

  capacity_tph: number | null;
  indT: number | null;

  p80_mm: number | null;
  indP80: number | null;

  ecs_kWh_t: number | null;
  indEcs: number | null;

  power_kW: number | null;
  indGlobal: number | null;

  isWinner: boolean;
};
@Component({
  selector: 'app-procedimiento',
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  templateUrl: './procedimiento.html',
  styleUrls: ['./procedimiento.scss'],
})
export class ProcedimientoComponent {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private generalStore = inject(GeneralStore);
  private stage2Store = inject(Stage2KpiStore);
  private stage45Store = inject(Stage45Store);
private stage3Store = inject(Stage3FemStore);

private router = inject(Router);



  readonly generalMap = toSignal(this.generalStore.map$, {
    initialValue: {} as Record<string, any>,
  });
  readonly stage2Map = toSignal(this.stage2Store.map$, {
    initialValue: {} as Record<string, any>,
  });

readonly stage2BaseVideo = computed(() => {
  const m: any = this.stage2Map?.() ?? {};

  return (m?.['E1-V4-L2']?.video ?? m?.['E1-V4-L2']?.wearVideoDefault ?? null) as string | null;
});

readonly stage2RowsOrdered = computed(() => {
  const gMap = (this.generalMap() ?? {}) as Record<string, GeneralRow>;
  const s2Map = (this.stage2Map() ?? {}) as Record<string, Stage2Row>;

  const orderedScenarioIds = Object.values(gMap)
    .slice()
    .sort((a, b) => (a.N ?? 0) - (b.N ?? 0))
    .map((x) => x.scenarioId);


  return orderedScenarioIds
    .filter((id) => !!s2Map[id])
    .map((id) => {
      const s2 = s2Map[id];
      const g = gMap[id];
      return {
        ...s2,
        anglesImage: g?.anglesImage ?? null,
      };
    });
});


  readonly stage45Map = toSignal(this.stage45Store.map$, {
    initialValue: {} as Record<string, any>,
  });


  readonly stage1Raw = toSignal(
    this.http.get<Stage1WearJson>('assets/data/stage1.wear.json'),
    { initialValue: null }
  );


  readonly stage = signal<StageKey>(1);
readonly stage2SelectedId = signal<string | null>(null);

readonly stage2Selected = computed<Stage2Detail | null>(() => {
  const id = this.stage2SelectedId();
  if (!id) return null;

  const s2Map = (this.stage2Map() ?? {}) as Record<string, any>;
  const gMap = (this.generalMap() ?? {}) as Record<string, GeneralRow>;

  const s2 = s2Map[id];
  if (!s2) return null;

  return {
    scenarioId: s2.scenarioId ?? id,
    indGlobal: Number(s2.indGlobal ?? 0),
    indTray: Number(s2.indTray ?? 0),
    indRotura: Number(s2.indRotura ?? 0),
    indLiner: Number(s2.indLiner ?? 0),
    indPot: Number(s2.indPot ?? 0),
    comment: s2.comment ?? null,
    video: s2.video ?? null,
    impactPowerLinerImg: s2.impactPowerLinerImg ?? null,
    specImpactPowerRockRockImg: s2.specImpactPowerRockRockImg ?? null,
    anglesImage: gMap[id]?.anglesImage ?? null,
  };
});


goToScenario(id: string) {
  if (!id) return;
  this.router.navigate(['/escenario', id]);
}


closeStage2Card() {
  this.stage2SelectedId.set(null);
}

// YouTube
readonly stage2EmbedUrl = computed<SafeResourceUrl | null>(() => {
  const url = this.stage2Selected()?.video ?? '';
  if (!url) return null;

  const u = String(url);
  const m1 = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  const m2 = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  const id = m1?.[1] ?? m2?.[1] ?? '';
  if (!id) return null;

  return this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.youtube.com/embed/${id}`
  );
});

  // Hero
  readonly heroActions = [
    { label: 'Usar herramienta de decisión', link: '/decision', variant: 'cta' as const },
    { label: 'Ver biblioteca', link: '/biblioteca', variant: 'ghost' as const },
  ];

  readonly stageTabs = [
    { key: 1 as const, title: 'Etapa 1', sub: 'Desgaste activo → estados E1–E5' },
    { key: 2 as const, title: 'Etapa 2', sub: 'DEM sin rotura → screening y ganadores' },
    { key: 3 as const, title: 'Etapa 3', sub: 'FEM → verificación estructural' },
    { key: 4 as const, title: 'Etapa 4', sub: 'Desgaste (velocidad) → validación' },
    { key: 5 as const, title: 'Etapa 5', sub: 'Rotura + productividad' },
    { key: 6 as const, title: 'Etapa 6', sub: 'Evaluación final' },
  ];
  readonly wDesg = 0.35;
readonly wT = 0.30;
readonly wP80 = 0.20;
readonly wEcs = 0.15;
readonly stage6Evaluados = computed(() => this.stage6Rows().length);
readonly stage6Ganadores = computed(() => this.stage6Rows().filter(x => x.isWinner).length);

  setStage(s: StageKey) {
    this.stage.set(s);
    setTimeout(() => {
      document.getElementById('stageTop')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  }

  // ---------------- KPI / winners ----------------
  readonly totalDem = computed(() => Object.keys(this.generalMap() ?? {}).length);

  private normId(id: any): string {
    return String(id ?? '')
      .trim()
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  private extractWinnerIdsFromRecord(raw: Record<string, any> | null | undefined): Set<string> {
    const set = new Set<string>();
    if (!raw) return set;

    for (const [k, v] of Object.entries(raw)) {
      const obj = (v ?? {}) as Record<string, any>;
      const id = this.normId(obj['scenarioId'] ?? k);

      const comment = String(
        obj['comment'] ??
          obj['comments'] ??
          obj['notes'] ??
          obj['nota'] ??
          obj['observacion'] ??
          obj['observación'] ??
          ''
      )
        .toLowerCase()
        .trim();

      const winnerBool =
        obj['winner'] === true ||
        obj['isWinner'] === true ||
        (obj['stage2'] && obj['stage2']['winner'] === true) ||
        (obj['stage5'] && obj['stage5']['winner'] === true);

      if (comment.includes('ganador') || winnerBool) set.add(id);
    }

    return set;
  }

  readonly finalWinners = computed(() => this.extractWinnerIdsFromRecord(this.stage45Map()));
  readonly stage2Winners = computed(() => {
    const s2 = this.extractWinnerIdsFromRecord(this.stage2Map());
    const fin = this.finalWinners();
    for (const id of fin) s2.add(id);
    return s2;
  });

  readonly finalWinnerIds = computed(() => Array.from(this.finalWinners()).sort());

  readonly kpis = computed<TopKpi[]>(() => {
    const totalDem = this.totalDem() || 31;
    const stage2Count = this.stage2Winners().size || 10;
    const finalCount = this.finalWinners().size || 5;


    const fem = 11;
    const dem4 = 11;
    const dem5 = Object.keys(this.stage45Map() ?? {}).length || 11;

    return [
      { title: 'Estados Desgastado (Etapa 1)', value: '5', subtitle: 'E1–E5 (DEM, desgaste activo, 1300 s)' },
      { title: 'Simulaciones DEM (Etapa 2)', value: String(totalDem), subtitle: 'Exploración operacional (sin rotura ni desgaste)' },
      { title: 'Ganadores Etapa 2', value: String(stage2Count), subtitle: 'Selección por indicador global' },
      { title: 'Casos FEM (Etapa 3)', value: String(fem), subtitle: 'ANSYS Mechanical (10 ganadores + base)' },
      { title: 'Casos DEM (Etapa 4)', value: String(dem4), subtitle: 'Desgaste activo (velocidad de desgaste)' },
      { title: 'Casos DEM (Etapa 5)', value: String(dem5), subtitle: 'Rotura activa (sin desgaste activo)' },
      { title: 'Ganadores finales (Etapa 6)', value: String(finalCount), subtitle: this.finalWinnerIds().join(' · ') || '—' },
    ];
  });

  trackKpi: TrackByFunction<TopKpi> = (_i, k) => k.title;
  trackId: TrackByFunction<string> = (_i, x) => x;

  // ---------------- Stage 1 (video + estados + tabla) ----------------


  readonly stage1Item = computed<Stage1WearItem | null>(() => {
    const raw = this.stage1Raw();
   const rawObj = raw as Record<string, any>;
const items = rawObj['items'] ?? rawObj ?? {};

    const firstKey = Object.keys(items)[0];
    return firstKey ? items[firstKey] : null;
  });


  private toAssetUrl(p: any): string {
    const s = String(p ?? '').trim();
    if (!s) return 'assets/branding/molino-sag-v2.png';

    if (/^https?:\/\//i.test(s)) return s;


    if (s.startsWith('//')) return s.replace(/^\/+/, '/');

    if (s.startsWith('/assets/')) return s;
    if (s.startsWith('assets/')) return '/' + s;
    if (s.startsWith('/')) return s;

    return '/assets/' + s;
  }

  assetUrl(p?: string | null): string {
  if (!p) return '';

  return p.replace(/^\/+/, '');
}
  readonly stage1EmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.stage1Item()?.wearVideoDefault ?? '';
    if (!url) return null;

    const u = String(url);
    const m1 = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    const m2 = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    const id = m1?.[1] ?? m2?.[1] ?? '';
    if (!id) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  });

  readonly stage1States = computed(() => {
    const item = this.stage1Item();
    if (!item) return [];

    const all: Stage1WearTransition[] = [item.base, ...(item.transitions ?? [])];

    const pctOf = (t: string) => {
      const k = String(t).toUpperCase();
      if (k === 'E1') return 0;
      if (k === 'E2') return 25;
      if (k === 'E3') return 50;
      if (k === 'E4') return 75;
      if (k === 'E5') return 100;
      return null;
    };

    const order = new Map([['E1', 1], ['E2', 2], ['E3', 3], ['E4', 4], ['E5', 5]]);

    return all
      .map((tr) => ({
        state: tr.transition,
        wearPct: pctOf(tr.transition),
        dH_mm: tr.dH_mm,
        v_mm_h: tr.v_mm_h,
       t_months: tr.transition === 'E1' ? 0 : tr.t_months,

        img: this.toAssetUrl(tr.statesImage),
      }))
      .sort((a, b) => (order.get(a.state) ?? 99) - (order.get(b.state) ?? 99));
  });


  readonly stage1Summary = computed(() => {
    const item = this.stage1Item();
    const states = this.stage1States();
    if (!item || states.length === 0) return [];

    const total = Number(item.totalTime_months ?? 6);
    let acc = 0;

    const rows = states.map((s, idx) => {
      const delta = idx === 0 ? 0 : Number(s.t_months ?? 0);
      if (idx === 0) acc = 0;
      else acc += delta;

      return {
        state: s.state,
        dH_mm: s.dH_mm,
        v_mm_h: s.v_mm_h,
        deltaMonths: delta,
        accMonths: acc,
      };
    });

    if (rows.length > 1) {
      const last = rows[rows.length - 1];
      const diff = total - last.accMonths;
      if (Math.abs(diff) > 0.005) last.accMonths = total;
    }

    return rows;
  });

  imgFallback(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.includes('/assets/branding/molino-sag-v2.png')) return;
    img.src = '/assets/branding/molino-sag-v2.png';
  }
  readonly previewImg = signal<string | null>(null);
readonly previewTitle = signal<string>('');

openPreview(imgPath: string | null | undefined, title?: string) {
  const url = this.asAssetUrl(imgPath);
  if (!url) return;
  this.previewImg.set(url);
  this.previewTitle.set(title ?? '');
}


closePreview() {
  this.previewImg.set(null);
  this.previewTitle.set('');
}
// Etapa 3

readonly stage3Map = toSignal(this.stage3Store.map$, {
  initialValue: {} as Record<string, Stage3FemRow>,
});


readonly stage3Rows = computed<Stage3FemRow[]>(() => {
  const m = this.stage3Map();
  return Object.values(m ?? {});
});


readonly femYieldMPa = 680;




goScenario(id: string) {
  if (!id) return;
  this.router.navigate(['/escenario', id]);
}





asAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;
  if (p.startsWith('assets/')) return '/' + p;
  return p;
}

trackScenarioId = (_: number, r: { scenarioId: string }) => r.scenarioId;

hasStage3Comments = () => {
  const rows = this.stage3Rows?.() ?? [];
  return rows.some((r: any) => (r?.comment ?? '').toString().trim().length > 0);
};

trackByScenarioId = (_: number, r: Stage3FemRow) => r.scenarioId;

//Etapa 4 y 5

private pickNumber(obj: any, keys: string[]): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return null;
}

private pickString(obj: any, keys: string[]): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

private isScenarioId(id: string): boolean {
  return /^E[1-5]-V\d-L\d$/i.test(id.trim());
}


private toNum(v: any): number | null {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
}



private pickStr(obj: any, keys: string[]): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

private extractItemsFromStage45(raw: any): any[] {
  if (!raw) return [];

  const items = raw.items ?? raw;
  if (Array.isArray(items)) return items;
  if (items && typeof items === 'object') return Object.values(items);
  return [];
}


readonly stage4Rows = computed<Stage4RowVM[]>(() => {
  const m = (this.stage45Map?.() ?? {}) as Record<string, any>;
  const rows: Stage4RowVM[] = [];

  for (const [scenarioIdRaw, r] of Object.entries(m)) {
    const scenarioId = String(scenarioIdRaw ?? '').trim();
    if (!scenarioId) continue;

    const wearImg = this.pickString(r, ['wearImage', 'wearImg', 'wear_image', 'image', 'img']);
    const wearVideo = this.pickString(r, ['wearVideo', 'wearVideoDefault', 'video', 'url', 'youtube']);

    const vWear_mm_s =
      this.pickNumber(r, ['vWear_mm_s', 'v_desg_mm_s', 'vdesg_mm_s', 'v_desg (mm/s)', 'V_desg (mm/s)', 'v_desg']) ??
      null;

    const vWear_mm_h =
      this.pickNumber(r, ['vWear_mm_h', 'v_desg_mm_h', 'vdesg_mm_h', 'v_desg (mm/h)', 'V_desg (mm/h)']) ??
      (vWear_mm_s != null ? vWear_mm_s * 3600 : null);

    const indWear =
      this.pickNumber(r, ['indWear', 'Ind_wear', 'ind_desg', 'Ind_desg', 'indDesg', 'IndDesg']) ?? null;

    const comment = this.pickString(r, ['comment', 'comentario', 'Comentario']);


    if (vWear_mm_s == null && indWear == null && !wearImg && !wearVideo) continue;

    rows.push({
      scenarioId,
      wearImg: wearImg ?? null,
      wearVideo: wearVideo ?? null,
      vWear_mm_s,
      vWear_mm_h,
      indWear,
      comment: comment ?? null,
    });
  }

  return rows;
});

readonly stage4HasComments = computed(() => {
  return this.stage4Rows().some(r => !!(r.comment && r.comment.trim()));
});

readonly stage4RepVideo = computed<string | null>(() => {

  const row = this.stage4Rows().find(r => !!r.wearVideo);
  return row?.wearVideo ?? null;
});

trackScenarioIdStage4 = (_: number, r: Stage4RowVM) => r.scenarioId;


asYouTubeEmbed(url: string | null): any {
  if (!url) return null;

  const u = String(url).trim();


  const id =
    u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)?.[1] ??
    u.match(/[?&]v=([A-Za-z0-9_-]{6,})/)?.[1] ??
    u.match(/\/embed\/([A-Za-z0-9_-]{6,})/)?.[1] ??
    null;

  if (!id) return null;

  const embed = `https://www.youtube.com/embed/${id}`;
  return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
}


readonly stage5RepVideo = computed<string | null>(() => {
  const m = this.stage45Map?.() as any;
  return (m?.['E1-V4-L2']?.breakageVideo ?? null) as string | null;
});



readonly stage5Rows = computed<Stage5RowVM[]>(() => {
  const raw = (this.stage45Map?.() as any) ?? {};
  const values = Object.values(raw) as any[];

  const isScenarioId = (s: string) => /^E[1-5]-V\d-L\d$/i.test(s.trim());

  return values
    .map((r: any): Stage5RowVM | null => {
      const id = String(r?.scenarioId ?? r?.Escenario ?? r?.id ?? '').trim();
      if (!id || !isScenarioId(id)) return null;

      const capacity = (typeof r?.capacity_tph === 'number') ? r.capacity_tph : null;
      const ecs = (typeof r?.ecs_kWh_t === 'number') ? r.ecs_kWh_t : null;


const g: any = this.generalMap?.() ?? {};
const scenarioGeneral = g?.[id];

const power = Number(
  scenarioGeneral?.powerDem_kW ?? scenarioGeneral?.power_dem_kw ?? null
);


      const v = (typeof r?.vWear_mm_s === 'number') ? r.vWear_mm_s : null;
      const vH = (v != null) ? v * 3600 : null;

      const productsImg = this.asAssetUrl?.(r?.productsImg ?? null) ?? null;

      const comment = (r?.comment ?? r?.comentario ?? '');
      const isWinner = String(comment).toLowerCase().includes('ganador');

      return {
        scenarioId: id,
        productsImg,
        capacity_tph: capacity,
        p80_mm: (typeof r?.p80_mm === 'number') ? r.p80_mm : null,
        ecs_kWh_t: ecs,
        power_kW: power,
        vDesg_mm_h: vH,
        indGlobal: (typeof r?.indGlobal === 'number') ? r.indGlobal : null,
        isWinner,
      };
    })
    .filter((x): x is Stage5RowVM => !!x);
});

//Etapa 6
private pickNum(obj: any, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    if (v != null && Number.isFinite(n)) return n;
  }
  return null;
}

readonly stage6Rows = computed<Stage6RowVM[]>(() => {
  const raw = (this.stage45Map?.() as any) ?? {};
  const values = Object.values(raw) as any[];

  const g: any = this.generalMap?.() ?? {};

  const isScenarioId = (s: string) => /^E[1-5]-V\d-L\d$/i.test(s.trim());

  return values
    .map((r: any): Stage6RowVM | null => {
      const id = String(r?.scenarioId ?? r?.Escenario ?? r?.id ?? '').trim();
      if (!id || !isScenarioId(id)) return null;

      const scenarioGeneral = g?.[id];


      const anglesImg = (scenarioGeneral?.anglesImage ?? scenarioGeneral?.angles_image ?? null) as string | null;


      const capacity = this.pickNum(r, ['capacity_tph', 'Capacidad (t/h)', 'Capacidad', 'capacidad']);
      const p80 = this.pickNum(r, ['p80_mm', 'P80 (mm)', 'P80', 'p80']);
      const ecs = this.pickNum(r, ['ecs_kWh_t', 'Ecs (kW.h/t)', 'Ecs (kWh/t)', 'Ecs', 'ecs']);


      const power = this.pickNum(scenarioGeneral, ['powerDem_kW', 'power_dem_kw', 'power_kW', 'power']);


      const vWear_mm_s = this.pickNum(r, ['vWear_mm_s', 'V_desg (mm/s)', 'V_desg', 'v_desg']);
      const vDesg_mm_h = (vWear_mm_s != null) ? vWear_mm_s * 3600 : null;


      const indDesg = this.pickNum(r, ['indWear', 'indDesg', 'Ind_desg', 'I_desg', 'ind_desg']);
     const indT    = this.pickNum(r, ['indCapacity', 'indT', 'Ind_T', 'I_T', 'ind_t']);
      const indEcs = this.pickNum(r, ['indEcs', 'Ind_Ecs', 'I_Ecs', 'ind_ecs']);
      const indP80 = this.pickNum(r, ['indP80', 'Ind_P80', 'I_P80', 'ind_p80']);


      const indGlobal = this.pickNum(r, ['indGlobal', 'Ind_global', 'IG', 'ind_global']);

      const comment = (r?.comment ?? r?.comentario ?? '');
      const isWinner = String(comment).toLowerCase().includes('ganador');

      return {
        scenarioId: id,
        anglesImg,

        vDesg_mm_h,
        indDesg,

        capacity_tph: capacity,
        indT,

        p80_mm: p80,
        indP80,

        ecs_kWh_t: ecs,
        indEcs,

        power_kW: power,
        indGlobal,

        isWinner,
      };
    })
    .filter((x): x is Stage6RowVM => !!x);
});

//Tabla adactativa
private strategyAdaptiveStore = inject(StrategyAdaptiveStore);

readonly strategyTransitions = toSignal(this.strategyAdaptiveStore.transitions$, {
  initialValue: [] as StrategyAdaptiveTransitionRow[],
});

readonly strategySummary = toSignal(this.strategyAdaptiveStore.summary$, {
  initialValue: null as StrategyAdaptiveSummary | null,
});

trackTransition = (_: number, r: StrategyAdaptiveTransitionRow) => r.transition;

}
