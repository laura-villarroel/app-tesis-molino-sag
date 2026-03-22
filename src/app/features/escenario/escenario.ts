import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';

import { GeneralStore, GeneralScenario } from '../../shared/data/general.store';
import { Stage2KpiStore } from '../../shared/data/stage2-kpi.store';
import { Stage45Store } from '../../shared/data/stage45.store';
import { Stage3FemStore } from '../../shared/data/stage3-fem.store';
import {
  Stage1WearStore,
  Stage1WearItem,
  Stage1WearTransition,
} from '../../shared/data/stage1-wear.store';
import { normalizeScenarioId } from '../../shared/data/scenario-id';
import { StrategyAdaptiveStore } from '../../shared/data/strategy-adaptive.store';

// ==========================================================
// TYPES
// ==========================================================
type TabKey = 'general' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'stage6';

type SummaryRow = {
  key: string;
  label: string;
  value: string;
  muted?: boolean;
  mono?: boolean;
};

type Stage2Row = { label: string; value: string; muted?: boolean; mono?: boolean };



type Vm = {
  id: string;
  loading: boolean;
  error: string | null;
  general?: GeneralScenario | null;
  generalSummaryRows: SummaryRow[];
  hasStage1: boolean;
  hasStage2: boolean;
  hasStage3: boolean;
  hasStage4: boolean;
  hasStage5: boolean;
  hasStage6: boolean;
  stage2Video?: string | null;
  stage2IndGlobal?: number | null;
  stage2Image?: string | null;
  stage2Data?: any | null;
  stage45IndGlobal?: number | null;
  stage45Capacity?: number | null;
  stage45P80?: number | null;
  stage45VWear?: number | null;
  stage1Video?: string | null;
  stage1StateImage?: string | null;
  stage1StateLabel?: string | null;
  stage1Metrics?: { dH_mm: number; v_mm_h: number; t_months: number }
  stage2MainImage?: string | null;
  stage2ExtraImages?: { key: string; label: string; src: string }[];
  stage2Rows?: { label: string; value: string; muted?: boolean; mono?: boolean }[];
  generalAngles?: any;
  isBaseScenario: boolean;
  stage2IsWinner: boolean;
  canAdvanceAfterStage2: boolean;
  stage3MainImage?: string | null;
  stage3Rows?: { label: string; value: string; muted?: boolean; mono?: boolean }[];
  stage3ExtraImages?: { key: string; label: string; src: string }[];
  stage4ExtraImages?: { key: string; label: string; src: string }[];
  stage4Video?: string | null;
  stage4MainImage?: string | null;
  stage4WearImage?: string | null;
  stage4Rows?: { label: string; value: string; muted?: boolean; mono?: boolean }[];
  stage5Video?: string | null;
  stage5MainImage?: string | null;
  stage5Rows?: { label: string; value: string; muted?: boolean; mono?: boolean }[];
  stage5ExtraImages?: { key: string; label: string; src: string }[];
  stage6Rows?: { label: string; value: string; muted?: boolean; mono?: boolean }[];
  stage6Formula?: string;
  stage6Weights?: { key: string; value: number }[];

};

@Component({
  standalone: true,
  selector: 'app-escenario',
  imports: [CommonModule, RouterLink],
  templateUrl: './escenario.html',
  styleUrl: './escenario.scss',
})
export class EscenarioComponent implements AfterViewInit, OnDestroy {
 // ==========================================================
// INYECCIONES
// ==========================================================
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  private generalStore = inject(GeneralStore);
  private stage1Store = inject(Stage1WearStore);
  private stage2Store = inject(Stage2KpiStore);
  private stage3Store = inject(Stage3FemStore);
  private stage45Store = inject(Stage45Store);
  private stage6Store = inject(StrategyAdaptiveStore);

  private hostEl = inject(ElementRef<HTMLElement>);
// ==========================================================
// ESTADO UI
// ==========================================================
  readonly tab$ = new BehaviorSubject<TabKey>('general');


  readonly preview$ = new BehaviorSubject<{ title: string; img: string } | null>(
    null
  );
// ==========================================================
// CONTROL HEADER STICKY
// ==========================================================
  @ViewChild('fixedHeaderEl', { static: false })
  fixedHeaderEl?: ElementRef<HTMLElement>;

  private ro?: ResizeObserver;
// ==========================================================
// VIEW MODEL PRINCIPAL
// ==========================================================

  readonly vm$ = combineLatest([
    this.route.paramMap.pipe(map((pm) => (pm.get('id') ?? '').trim())),
    this.generalStore.map$,
    this.stage1Store.map$,
    this.stage2Store.map$,
    this.stage3Store.map$,
    this.stage45Store.map$,
    this.stage6Store.map$,
  ]).pipe(
    map(([id, g, s1, s2, s3, s45, s6]): Vm => {
      // --------------------------------------------------
      // VALIDACIÓN ID
      // --------------------------------------------------
if (!id) {
  return this.emptyVm(id, 'No se recibió el id del escenario.');
}
      // ==================================================
      // 2. EXTRACCIÓN DE DATOS BASE
      // ==================================================
        const general = g?.[id] ?? null;
        const st1 = s1?.[id] ?? null;
        const st2 = s2?.[id] ?? null;
        const st3x = s3?.[id] ?? null;
        const st45 = s45?.[id] ?? null;
        const st6x = s6?.[id] ?? null;

      // ==================================================
      // 3. REGLAS
      // ==================================================
        const isBaseScenario = normalizeScenarioId(id) === normalizeScenarioId('E1-V4-L2');
        const stage2Raw = (st2?.comment ?? '').toString().trim().toLowerCase();
        const stage2IsWinner = stage2Raw === 'ganador';
        const canAdvanceAfterStage2 = isBaseScenario || stage2IsWinner;
        const existsSomewhere = !!(general || st1 || st2 || st3x || st45 || st6x);
        if (!existsSomewhere) {
        return {
          id,
          loading: false,
          error: `No se encontró información para el escenario "${id}".`,
          general: null,
          generalSummaryRows: [],
          hasStage1: false,
          hasStage2: false,
          hasStage3: false,
          hasStage4: false,
            hasStage5: false,
          hasStage6: false,

    isBaseScenario: false,
    stage2IsWinner: false,
    canAdvanceAfterStage2: false,


        };
      }

      // --------------------------------------------------
      // ETAPA 1 — DESGASTE
      // --------------------------------------------------
      const baseKey = normalizeScenarioId('E1-V4-L2');
      const stage1Base: Stage1WearItem | null =
        (s1?.[baseKey] as any) ??
        (Object.values(s1 ?? {})[0] as any) ??
        null;

      const stateId =
        (general as any)?.state ??
        (general as any)?.Estado ??
        null;

      const stage1Transition: Stage1WearTransition | null = !stage1Base
        ? null
        : stateId === 'E1'
          ? stage1Base.base
          : (stage1Base.transitions ?? []).find((t) => t.transition === stateId) ?? null;

      const stage1StateImage = stage1Transition?.statesImage ?? null;
      const stage1Video = stage1Base?.wearVideoDefault ?? null;

      const stage1Metrics = stage1Transition
        ? {
            dH_mm: Number(stage1Transition.dH_mm ?? 0),
            v_mm_h: Number(stage1Transition.v_mm_h ?? 0),
            t_months: Number(stage1Transition.t_months ?? 0),
          }
        : null;

      const stage1StateLabel =
        stage1Transition?.transition
          ? `Estado ${stage1Transition.transition}`
          : (stateId ? `Estado ${stateId}` : null);
      // --------------------------------------------------
      // ETAPA 2 — DEM
      // --------------------------------------------------
      const generalAngles = {
        thetaS_dem: this.g(general, 'Ѳs_ DEM (°)', 'thetaS_dem', 'thetaS_DEM'),
        errThetaS: this.g(general, 'Error Ѳs (%)', 'errThetaS', 'errorThetaS'),
        thetaT_dem: this.g(general, 'Ѳt_ DEM (°)', 'thetaT_dem', 'thetaT_DEM'),
        thetaTiro_dem: this.g(general, 'Ѳtiro DEM (°)', 'thetaTiro_dem', 'thetaTiro_DEM'),
        errThetaT: this.g(general, 'Error Ѳt (%)', 'errThetaT', 'errorThetaT'),
      };

    const stage2Rows = this.buildStage2Rows(st2, generalAngles, id);
    const stage2Image =
      st2?.specImpactPowerRockRockImg ??
      st2?.impactPowerLinerImg ??
      null;
    const stage2Data = st2 ?? null;
    const stage2MainImage = this.g(general, 'anglesImage');


    const stage2ExtraImages = [
  {
    key: 'specImpactPowerRockRockImg',
    label: 'Rock–Rock · Specific impact power',
    src: st2?.specImpactPowerRockRockImg ?? '',
  },
  {
    key: 'impactPowerLinerImg',
    label: 'Liner · Impact power',
    src: st2?.impactPowerLinerImg ?? '',
  },
].filter((x) => !!x.src);

      // --------------------------------------------------
      // ETAPA 3 — FEM
      // --------------------------------------------------
    const stage3MainImage = this.g(general, 'anglesImage');
    const stage3Rows = this.buildStage3Rows(st3x, id);
    const stage3ExtraImages = [
      { key: 'pressureImg', label: 'Imported pressure', src: (st3x?.pressureImg ?? '').toString() },
      { key: 'forceImg', label: 'Force reaction', src: (st3x?.forceImg ?? '').toString() },
      { key: 'stressImg', label: 'Equivalent stress (Von Mises)', src: (st3x?.stressImg ?? '').toString() },
      { key: 'displacementImg', label: 'Total deformation', src: (st3x?.displacementImg ?? '').toString() },
      { key: 'energyImg', label: 'Strain energy', src: (st3x?.energyImg ?? '').toString() },
    ].filter(x => !!x.src);

      // --------------------------------------------------
      // ETAPA 4 — DESGASTE VALIDACIÓN
      // --------------------------------------------------
    const stage4Video = st45?.wearVideo ?? null;
    const stage4MainImage = this.g(general, 'anglesImage');
    const stage4WearImage = st45?.wearImage ?? null;
    const stage4Rows = this.buildStage4Rows(st45, general);
    const stage4ExtraImages = [
  { key: 'productsImg', label: 'Productos', src: (st45?.productsImg ?? '').toString() },
  { key: 'histMassCumSizeImg', label: 'Cumulative particle mass', src: (st45?.histMassCumSizeImg ?? '').toString() },
  { key: 'histPctMassCumSizeImg', label: 'P80 / cumulative % mass', src: (st45?.histPctMassCumSizeImg ?? '').toString() },
    ].filter(x => !!x.src);
      // --------------------------------------------------
      // ETAPA 5 — PRODUCCIÓN
      // --------------------------------------------------
    const stage5Video = st45?.breakageVideo ?? null;
    const stage5MainImage = this.g(general, 'anglesImage');
    const stage5Rows = this.buildStage5Rows(st45, general);
    const stage5ExtraImages = [
      { key: 'productsImg', label: 'Productos', src: (st45?.productsImg ?? '').toString() },
      { key: 'histMassCumSizeImg', label: 'Cumulative particle mass', src: (st45?.histMassCumSizeImg ?? '').toString() },
      { key: 'histPctMassCumSizeImg', label: 'Cumulative % mass (P80)', src: (st45?.histPctMassCumSizeImg ?? '').toString() },
    ].filter(x => !!x.src);
      // --------------------------------------------------
      // ETAPA 6 — INTEGRACIÓN
      // --------------------------------------------------
    const stage6Rows = this.buildStage6Rows(st45, general, id);
    const stage6Weights = [
      { key: 'wdesg', value: 0.35 },
      { key: 'wT', value: 0.30 },
      { key: 'wP80', value: 0.20 },
      { key: 'wEcs', value: 0.15 },
    ];
    const stage6Formula =
    'IG = 0.35·I_desg + 0.30·I_T + 0.20·I_P80 + 0.15·I_Ecs';

      return {
        id,
        loading: false,
        error: null,
        general,
        generalSummaryRows: this.buildGeneralSummaryRows(general, id),
        hasStage1: true,
        stage1Video,
        stage1StateImage,
        stage1StateLabel,
        hasStage2: !!st2,
        isBaseScenario,
        stage2IsWinner,
        canAdvanceAfterStage2,
        stage2Video: (st2 as any)?.video ?? null,
        stage2IndGlobal: (st2 as any)?.indGlobal ?? null,
        stage2Image,
        stage2Data,
        stage2MainImage,
        stage2ExtraImages,
        generalAngles,
        stage2Rows,
        hasStage3: canAdvanceAfterStage2 && !!st3x,
        stage3MainImage,
        stage3Rows,
        stage3ExtraImages,
        stage4Video,
        stage4ExtraImages,
        stage4MainImage,
        stage4WearImage,
        stage4Rows,
        hasStage4: canAdvanceAfterStage2 && !!st45,
        stage45IndGlobal: (st45 as any)?.indGlobal ?? null,
        stage45Capacity: (st45 as any)?.capacity_tph ?? null,
        stage45P80: (st45 as any)?.p80_mm ?? null,
        stage45VWear: (st45 as any)?.vWear_mm_s ?? null,
        hasStage5: canAdvanceAfterStage2 && !!st45,
        stage5Video,
        stage5MainImage,
        stage5Rows,
        stage5ExtraImages,
        hasStage6: canAdvanceAfterStage2 && !!st45,
        stage6Rows,
        stage6Weights,
        stage6Formula,

      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

// ==========================================================
// BUILDERS — ETAPA 2
// ==========================================================
private buildStage2Rows(
  st2: any | null | undefined,
  generalAngles: any | null | undefined,
  scenarioIdFallback: string
): Stage2Row[] {
  const rows: Stage2Row[] = [];

  const scenarioId = (st2?.scenarioId ?? scenarioIdFallback ?? '').toString();
  rows.push({ label: 'Escenario', value: scenarioId, mono: true });

  if (generalAngles) {
    rows.push(
      { label: 'θs DEM', value: `${this.fmt(generalAngles.thetaS_dem, 2)} °`, mono: true },
      { label: 'Error θs', value: this.pct(generalAngles.errThetaS, 2), mono: true },
      { label: 'θt DEM', value: `${this.fmt(generalAngles.thetaT_dem, 2)} °`, mono: true },
      { label: 'θtiro DEM', value: `${this.fmt(generalAngles.thetaTiro_dem, 2)} °`, mono: true },
      { label: 'Error θt', value: this.pct(generalAngles.errThetaT, 2), mono: true },
    );
  }

  if (!st2) return rows;


  rows.push(
    { label: 'Ancho', value: this.unit(st2.ancho_deg, '°'), mono: true },
    { label: 'Indicador (Tray)', value: this.num(st2.indTray), mono: true },

    { label: 'P. útil RR', value: this.unit(st2.pUtilRR_kW, 'kW'), mono: true },
    { label: 'Indicador (Rotura)', value: this.num(st2.indRotura), mono: true },

    { label: 'E. impacto liner', value: this.unit(st2.eImpLiner_kW, 'kW'), mono: true },
    { label: 'Indicador (Liner)', value: this.num(st2.indLiner), mono: true },

    { label: 'W rocky', value: this.unit(st2.wRocky_kW, 'kW'), mono: true },
    { label: 'Indicador (Potencia)', value: this.num(st2.indPot), mono: true },
  );
  const isBase = normalizeScenarioId(scenarioId) === normalizeScenarioId('E1-V4-L2');
  const raw = (st2.comment ?? '').toString().trim().toLowerCase();
  const isWinner = raw === 'ganador';
  const decision = isWinner
    ? 'Ganador etapa 2'
    : (isBase ? 'Caso base (continúa)' : 'No ganador');

  rows.push(
    { label: 'Indicador global', value: this.num(st2.indGlobal), mono: true },
    { label: 'Resultado', value: decision, mono: true },
  );

  return rows;
}
// ==========================================================
// BUILDERS — ETAPA 3
// ==========================================================
private buildStage3Rows(st3: any | null | undefined, scenarioIdFallback: string) {
  const rows: { label: string; value: string; muted?: boolean; mono?: boolean }[] = [];
  const scenarioId = (st3?.scenarioId ?? scenarioIdFallback ?? '').toString();
  rows.push({ label: 'Escenario', value: scenarioId, mono: true });

  if (!st3) return rows;


  rows.push(
    { label: 'F máx resultante', value: this.unit(st3.fResultMax_kN, 'kN'), mono: true },
    { label: 'Reacción resultante', value: this.unit(st3.reacResult_kN, 'kN'), mono: true },
    { label: 'Error fuerza', value: this.pct(st3.errorF_pct, 2), mono: true },
    { label: 'Presión contacto máx', value: this.unit(st3.pContMax_MPa, 'MPa'), mono: true },
    { label: 'σ Von Mises máx', value: this.unit(st3.sigmaVMMax_MPa, 'MPa'), mono: true },
    { label: 'Desplazamiento máx', value: this.unit(st3.dispMax_um, 'µm'), mono: true },
    { label: 'Energía deformación', value: this.unit(st3.u_mJ, 'mJ'), mono: true },
    { label: 'Factor de seguridad', value: this.num(st3.fs), mono: true },
  );

  return rows;
}
// ==========================================================
// BUILDERS — ETAPA 4
// ==========================================================
private buildStage4Rows(st45: any | null | undefined, general: any | null | undefined) {
  const rows: { label: string; value: string; muted?: boolean; mono?: boolean }[] = [];
const sid = (st45?.scenarioId ?? '').toString().trim();
rows.push({ label: 'Escenario', value: sid || '—', mono: true });

  const H = Number(this.g(general, 'thicknessH_mm') ?? this.g(general, 'Espesor H (mm)') ?? NaN);
  const dSin = Number(st45?.d_sin ?? NaN);
  const dCon = Number(st45?.d_con ?? NaN);
  const hasDiameters = Number.isFinite(dSin) && Number.isFinite(dCon);
  const deltaH = hasDiameters ? (dCon - dSin) / 2 : NaN;
  const simTime_s = 100;
  const H100 = Number.isFinite(H) && Number.isFinite(deltaH) ? (H - deltaH) : NaN;

  rows.push(
    { label: 'Tiempo de simulación', value: `${simTime_s} s`, mono: true },

    { label: 'Dsin', value: this.unit(dSin, 'mm'), mono: true },
    { label: 'Dcon', value: this.unit(dCon, 'mm'), mono: true },

    { label: 'ΔH', value: this.unit(deltaH, 'mm'), mono: true },


    { label: 'v_desg', value: this.unit(st45?.vWear_mm_s, 'mm/s'), mono: true },

    { label: 'H100', value: this.unit(H100, 'mm'), mono: true },
  );

  return rows;
}
// ==========================================================
// BUILDERS — ETAPA 5
// ==========================================================
private buildStage5Rows(st45: any | null | undefined, general: any | null | undefined) {
  const rows: { label: string; value: string; muted?: boolean; mono?: boolean }[] = [];
  const pDem = this.g(general, 'powerDem_kW') ?? this.g(general, 'P_Motor DEM (kW)');
  const sid = (st45?.scenarioId ?? '').toString();
  if (sid) rows.push({ label: 'Escenario', value: sid, mono: true });

  rows.push(
    { label: 'Capacidad', value: this.unit(st45?.capacity_tph, 't/h'), mono: true },
    { label: 'P80', value: this.unit(st45?.p80_mm, 'mm'), mono: true },
    { label: 'Potencia DEM', value: this.unit(pDem, 'kW'), mono: true },
    { label: 'Ecs', value: this.unit(st45?.ecs_kWh_t, 'kWh/t'), mono: true },
  );

  return rows;
}
// ==========================================================
// BUILDERS — ETAPA 6
// ==========================================================
private buildStage6Rows(st45: any | null | undefined, general: any | null | undefined, id: string) {
  const rows: { label: string; value: string; muted?: boolean; mono?: boolean }[] = [];
  rows.push({ label: 'Escenario', value: id, mono: true });
  const pDem = this.g(general, 'powerDem_kW') ?? this.g(general, 'P_Motor DEM (kW)');
  rows.push(
    { label: 'Velocidad de desgaste', value: this.unit(st45?.vWear_mm_s, 'mm/s'), mono: true },
    { label: 'Indicador desgaste', value: this.num(st45?.indWear), mono: true },

    { label: 'Capacidad', value: this.unit(st45?.capacity_tph, 't/h'), mono: true },
    { label: 'Indicador capacidad', value: this.num(st45?.indCapacity), mono: true },

    { label: 'P80', value: this.unit(st45?.p80_mm, 'mm'), mono: true },
    { label: 'Indicador P80', value: this.num(st45?.indP80), mono: true },

    { label: 'Ecs', value: this.unit(st45?.ecs_kWh_t, 'kWh/t'), mono: true },
    { label: 'Indicador Ecs', value: this.num(st45?.indEcs), mono: true },

    { label: 'Potencia DEM', value: this.unit(pDem, 'kW'), mono: true },
  );


  const raw = (st45?.comment ?? '').toString().trim().toLowerCase();
  const isWinner = raw === 'ganador';

  const isBase = normalizeScenarioId(id) === normalizeScenarioId('E1-V4-L2');

  const resultLabel = isWinner ? 'Ganador final' : (isBase ? 'Caso base (continúa)' : 'No ganador');

  rows.push(
    { label: 'Indicador global', value: this.num(st45?.indGlobal), mono: true } as any,
    { label: 'Resultado', value: resultLabel, mono: true } as any,
  );

  return rows;
}
// ==========================================================
// HELPERS
// ==========================================================
 fmt(n: any, digits = 2): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  return v.toFixed(digits);
}
pct(n: any, digits = 2): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';

  let v = Number(n);
  if (v >= 0 && v <= 1) v = v * 100;

  return `${this.fmt(v, digits)}%`;
}
toAssetUrl(path?: string | null): string | null {
  if (!path) return null;

  if (path.startsWith('assets/')) return path;
  return path;
}
g(it: GeneralScenario | null | undefined, ...keys: string[]): any {
    if (!it) return null;
    for (const k of keys) {
      const v = (it as any)?.[k];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }
private buildGeneralSummaryRows(
    general: GeneralScenario | null | undefined,
    fallbackScenarioId: string
  ): SummaryRow[] {
    const rows: SummaryRow[] = [];


    const scenarioId =
      (general as any)?.scenarioId ??
      (general as any)?.scenario ??
      (general as any)?.id ??
      fallbackScenarioId;

    rows.push({
      key: 'scenarioId',
      label: 'Escenario',
      value: String(scenarioId ?? fallbackScenarioId),
      mono: true,
    });


    const preferredOrder: string[] = [
      'state',
      'N',
      'wearPct',
      'thicknessH_mm',
      'NcPct',
      'rpm',
      'fillPct',
      'ballsPct',
      'rocksPct',
      'ballsMass_t',
      'rocksMass_t',
      'totalMass_t',
      'ballFraction',
      'thetaS_morrell_deg',
      'thetaT_morrell_deg',
      'Ѳs_ DEM (°)',
      'Error Ѳs (%)',
      'Ѳt_ DEM (°)',
      'Ѳtiro DEM (°)',
      'Error Ѳt (%)',
      'powerMorrell_kW',
      'powerDem_kW',
      'powerErrorPct',
      'anglesImage',
    ];

    const allKeys = Object.keys(general as any);

    const skip = new Set(['scenarioId', 'scenario', 'id']);

    const inPreferred = preferredOrder.filter(
      (k) => !skip.has(k) && (general as any)[k] !== undefined
    );

    const rest = allKeys
      .filter((k) => !skip.has(k) && !preferredOrder.includes(k))
      .sort((a, b) => a.localeCompare(b));

const summaryExcludeKeys = new Set<string>([

  'state',
  'N',
  'wearPct',
  'thicknessH_mm',
  'NcPct',
  'rpm',
  'fillPct',
  'ballsPct',
  'rocksPct',
  'totalMass_t',
  'powerDem_kW',
  'anglesImage',
  'angles_image',
  'anglesImg',

]);
const finalKeys = [...inPreferred, ...rest].filter((k) => !summaryExcludeKeys.has(k));

for (const key of finalKeys) {
  const raw = (general as any)[key];
  rows.push({
    key,
    label: this.labelForGeneralKey(key),
    value: this.valueForGeneralKey(key, raw),
    mono:
      typeof raw === 'string' &&
      /(^assets\/|\/|\\|\.png$|\.jpg$|\.json$)/i.test(raw),
  });
}
    return rows;
  }
private labelForGeneralKey(key: string): string {
   const map: Record<string, string> = {
  state: 'Estado',
  N: 'N°',
  wearPct: '% desgaste',
  thicknessH_mm: 'Espesor H',
  NcPct: '%Nc',
  rpm: 'N',
  fillPct: 'Llenado total',
  ballsPct: '% bolas',
  rocksPct: '% rocas',
  ballsMass_t: 'Masa de bolas',
  rocksMass_t: 'Masa de rocas',
  totalMass_t: 'Masa total',
  ballFraction: 'Fracción bolas',
  thetaS_morrell_deg: 'θs Morrell',
  thetaT_morrell_deg: 'θt Morrell',
  powerMorrell_kW: 'P. Morrell',
  powerDem_kW: 'P. Motor DEM',
  powerErrorPct: 'Error potencia',

};
    if (map[key]) return map[key];
    if (/[^\w\s]/.test(key)) return key;
    const s = key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();

    return s.charAt(0).toUpperCase() + s.slice(1);
  }
private valueForGeneralKey(key: string, v: any): string {
    if (v === null || v === undefined || v === '') return '—';
if (
  typeof v === 'number' ||
  (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v)))
) {
  const n = Number(v);
const looksLikePercent =
  key.endsWith('Pct') ||
  key.toLowerCase().includes('error') ||
  key.includes('%');

if (looksLikePercent) {
  let p = n;
  if (p >= 0 && p <= 1) p = p * 100;
  return `${this.fmt(p,2)} %`;
}

  if (key.endsWith('_kW')) return `${this.fmt(n, 2)} kW`;
  if (key.endsWith('_mm')) return `${this.fmt(n, 2)} mm`;
  if (key.endsWith('_t')) return `${this.fmt(n, 2)} t`;
  if (key === 'rpm') return `${this.fmt(n, 2)} rpm`;
  if (key.endsWith('_deg')) return `${this.fmt(n, 2)} °`;
  if (key.includes('DEM') && key.includes('°')) return `${this.fmt(n, 2)} °`;

  const digits = Number.isInteger(n) ? 0 : 2;
  return this.fmt(n, digits);
}

    if (typeof v === 'boolean') return v ? 'Sí' : 'No';


    if (typeof v === 'object') {
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }


    return String(v);
  }
asYouTubeEmbed(url?: string | null): SafeResourceUrl | null {
    const u = (url ?? '').trim();
    if (!u) return null;

    const m1 = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    const m2 = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    const m3 = u.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
    const id = (m1?.[1] ?? m2?.[1] ?? m3?.[1] ?? '').trim();

    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  }

private num(v: any, digits = 2): string {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return this.fmt(Number(v), digits);
}

private unit(v: any, u: string, digits = 2): string {
  const n = this.num(v, digits);
  return n === '—' ? '—' : `${n} ${u}`;
}
private emptyVm(id: string, error: string): Vm {
  return {
    id,
    loading: false,
    error,
    general: null,
    generalSummaryRows: [],
    hasStage1: false,
    hasStage2: false,
    hasStage3: false,
    hasStage4: false,
    hasStage5: false,
    hasStage6: false,
    isBaseScenario: false,
    stage2IsWinner: false,
    canAdvanceAfterStage2: false,
  };
}
// ==========================================================
// UI ACTIONS
// ==========================================================
setTab(t: TabKey) {
    this.tab$.next(t);
    requestAnimationFrame(() =>
      document.getElementById('tabTop')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    );
  }
openPreview(imgPath: string, title: string) {
    const src = this.toAssetUrl(imgPath);
    if (!src) return;
    this.preview$.next({ title, img: src });
  }

closePreview() {
    this.preview$.next(null);
  }
// ==========================================================
// LIFECYCLE
// ==========================================================

 ngAfterViewInit(): void {
    const el = this.fixedHeaderEl?.nativeElement;
    if (!el) return;

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      this.hostEl.nativeElement.style.setProperty('--scenario-header-h', `${h}px`);
    };

    update();
    this.ro = new ResizeObserver(() => update());
    this.ro.observe(el);

    setTimeout(update, 0);
    setTimeout(update, 200);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

}
