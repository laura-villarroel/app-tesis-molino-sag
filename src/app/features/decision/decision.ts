import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeroComponent } from '../../shared/page-hero/page-hero';
import { DecisionResult } from '../../features/decision-result/decision-result';


type WearState = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

type DecisionRow = {
  state: WearState;
  scenarioId: string;
  nc: number;
  fill: number;
  rangeText: string;

  min: number;
  max: number;
};

@Component({
  selector: 'app-decision',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeroComponent,DecisionResult],
  templateUrl: './decision.html',
  styleUrl: './decision.scss',
})
export class DecisionComponent {
  private router = inject(Router);

  // Entrada
  h: number | null = 170;

  // UI
  computed = false;
  error = '';

  // Resultado
  row: DecisionRow | null = null;

  // Presets
  presets = [220, 180, 140, 90, 60];

  // Rangos globales
  readonly minH = 51;
  readonly maxH = 229;
  // Tabla de rango
private readonly decisionTable: DecisionRow[] = [
  { state: 'E1', scenarioId: 'E1-V2-L2', nc: 65, fill: 25, rangeText: '229 ≥ H > 206 mm', min: 206, max: 229 },
  { state: 'E2', scenarioId: 'E2-V2-L3', nc: 65, fill: 30, rangeText: '206 ≥ H > 162 mm', min: 162, max: 206 },
  { state: 'E3', scenarioId: 'E3-V3-L4', nc: 70, fill: 35, rangeText: '162 ≥ H > 118 mm', min: 118, max: 162 },
  { state: 'E4', scenarioId: 'E4-V3-L5', nc: 70, fill: 40, rangeText: '118 ≥ H > 73 mm',  min: 73,  max: 118 },
  { state: 'E5', scenarioId: 'E5-V3-L5', nc: 70, fill: 40, rangeText: '73 ≥ H ≥ 51 mm',   min: 51,  max: 73  },
] as const;


private findRow(h: number): DecisionRow | null {
  return this.decisionTable.find(r => h <= r.max && h >= r.min) ?? null;
}
  get rangeText(): string {
    return `${this.minH}–${this.maxH} mm`;
  }

  get scenarioId(): string {
    return this.row?.scenarioId ?? '—';
  }

  get stateRangeText(): string {
    return this.row?.rangeText ?? '—';
  }

  get ncFillText(): string {
    if (!this.row) return '—';
    return `Nc ${this.row.nc}% · Llenado ${this.row.fill}%`;
  }

  // --------- Acción principal ----------
  calculate(): void {
    this.computed = true;
    this.error = '';
    this.row = null;

    const h = this.normalizeH(this.h);

    if (h === null) {
      this.error = 'Ingresa un valor válido de H (mm).';
      return;
    }
if (h < this.minH) {
  this.error =
    `Espesor crítico. H = ${h} mm es menor al límite mínimo (${this.minH} mm). ` +
    `Se recomienda programar el cambio del revestimiento (estado E5 – crítico).`;
  return;
}

if (h > this.maxH) {
  this.error =
    `El valor ingresado (${h} mm) excede el espesor nominal sin desgaste del lifter bajo (${this.maxH} mm). ` +
    `Verifique la medición.`;
  return;
}

this.row = this.findRow(h);

if (!this.row) {
  this.error = 'No se pudo determinar el estado.';
}

  }

  clear(): void {
    this.h = null;
    this.computed = false;
    this.error = '';
    this.row = null;
  }

  setPreset(v: number): void {
    this.h = v;
  }

  openScenario(): void {
    if (!this.row) return;
    this.router.navigate(['/escenario', this.row.scenarioId]);
  }

  // --------- Helpers ----------
  private normalizeH(v: number | null): number | null {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.round(n);
  }





  stateLabel(state?: string | null): string {
    switch (state) {
      case 'E1': return '(Nuevo)';
      case 'E2': return '(25% desgaste)';
      case 'E3': return '(50% desgaste)';
      case 'E4': return '(75% desgaste)';
      case 'E5': return '(Crítico)';
      default: return '';
    }
  }
  lightboxOpen = false;
lightboxSrc = '';
lightboxAlt = '';

openLightbox(src: string, alt: string) {
  this.lightboxSrc = src;
  this.lightboxAlt = alt;
  this.lightboxOpen = true;
}

closeLightbox() {
  this.lightboxOpen = false;
}

}


