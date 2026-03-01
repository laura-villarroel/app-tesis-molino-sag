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
  nc: number;       // %
  fill: number;     // %
  rangeText: string;
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

    if (h < this.minH || h > this.maxH) {
      this.error = `H debe estar entre ${this.minH} y ${this.maxH} mm.`;
      return;
    }

    const state = this.mapState(h);
    this.row = this.mapRecommendation(state);
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

  private mapState(h: number): WearState {

    // E1: 229 ≥ H > 206
    // E2: 206 ≥ H > 162
    // E3: 162 ≥ H > 118
    // E4: 118 ≥ H > 73
    // E5: 73 ≥ H ≥ 51
    if (h <= 229 && h > 206) return 'E1';
    if (h <= 206 && h > 162) return 'E2';
    if (h <= 162 && h > 118) return 'E3';
    if (h <= 118 && h > 73) return 'E4';
    return 'E5';

  }

  private mapRecommendation(state: WearState): DecisionRow {
    // Recomendación
    const table: Record<WearState, DecisionRow> = {
      E1: { state: 'E1', scenarioId: 'E1-V2-L2', nc: 65, fill: 25, rangeText: '229 ≥ H > 206 mm' },
      E2: { state: 'E2', scenarioId: 'E2-V2-L3', nc: 65, fill: 30, rangeText: '206 ≥ H > 162 mm' },
      E3: { state: 'E3', scenarioId: 'E3-V3-L4', nc: 70, fill: 35, rangeText: '162 ≥ H > 118 mm' },
      E4: { state: 'E4', scenarioId: 'E4-V3-L5', nc: 70, fill: 40, rangeText: '118 ≥ H > 73 mm' },
      E5: { state: 'E5', scenarioId: 'E5-V3-L5', nc: 70, fill: 40, rangeText: '73 ≥ H ≥ 51 mm' },
    };
    return table[state];
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
