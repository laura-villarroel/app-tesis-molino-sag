import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { normalizeScenarioId } from '../../../app/shared/data/scenario-id';
import { GeneralStore } from '../../../app/shared/data/general.store';
import { Stage45Store } from '../../../app/shared/data/stage45.store';
import { Stage2KpiStore } from '../../../app/shared/data/stage2-kpi.store';
import { StrategyAdaptiveStore } from '../../../app/shared/data/strategy-adaptive.store';
import type { Stage45Scenario } from '../../../app/shared/data/stage45.store';
import type { GeneralScenario } from '../../../app/shared/data/general.store';
import type { Stage2KpiScenario } from '../../../app/shared/data/stage2-kpi.store';
import type { StrategyAdaptiveTransitionRow } from '../../../app/shared/data/strategy-adaptive.store';

type Vm = {
  id: string;
  general: GeneralScenario | null;
  stage45: Stage45Scenario | null;
  stage2: Stage2KpiScenario | null;
  adaptive: StrategyAdaptiveTransitionRow | null;
  videoEmbed: SafeResourceUrl | null;
};

@Component({
  selector: 'app-decision-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './decision-result.html',
  styleUrl: './decision-result.scss',
})
export class DecisionResult {
  private sanitizer = inject(DomSanitizer);
  private generalStore = inject(GeneralStore);
  private stage45Store = inject(Stage45Store);
  private stage2Store = inject(Stage2KpiStore);
  private adaptiveStore = inject(StrategyAdaptiveStore);

  private scenarioId$ = new BehaviorSubject<string>('');

  @Input({ required: true })
  set scenarioId(v: string) { this.scenarioId$.next(normalizeScenarioId(v ?? '')); }
  get scenarioId(): string { return this.scenarioId$.value; }

  @Input() hMm: number | null = null;
  @Input() state: string | null = null;
  @Input() stateRangeText: string | null = null;
  @Input() ncFillText: string | null = null;
  @Input() scenarioLink: any[] | null = null;

  readonly vm$ = combineLatest([
    this.scenarioId$.pipe(distinctUntilChanged()),
    this.generalStore.map$,
    this.stage45Store.map$,
    this.stage2Store.map$,
    this.adaptiveStore.map$,
  ]).pipe(
    map(([id, gMap, s45Map, s2Map, aMap]): Vm => {
      const general = gMap[id] ?? null;
      const stage45 = s45Map[id] ?? null;
      const stage2 = s2Map[id] ?? null;
      const adaptive = aMap[id] ?? null;

      const videoEmbed = stage2?.video ? this.toYoutubeEmbed(stage2.video) : null;
      return { id, general, stage45, stage2, adaptive, videoEmbed };

    })
  );


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


  // -------- helpers --------
  pct(v?: number | null): string {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    return `${Math.round(v * 100)}%`;
  }
  num(v?: number | null, d = 0): string {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    return v.toFixed(d);
  }

  private toYoutubeEmbed(url: string): SafeResourceUrl {
    // Soporta youtu.be/ID y youtube.com/watch?v=ID
    const id =
      (url.match(/youtu\.be\/([^?]+)/)?.[1]) ??
      (url.match(/[?&]v=([^&]+)/)?.[1]) ??
      '';

    const embed = id ? `https://www.youtube.com/embed/${id}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }
  getIndicatorLevel(v: number | null | undefined): 'ok' | 'mid' | 'low' {
  const val = v ?? 0;

  if (val >= 0.7) return 'ok';
  if (val >= 0.5) return 'mid';
  return 'low';
}

getIndicatorLabel(v: number | null | undefined): string {
  const val = v ?? 0;

  if (val >= 0.7) return 'Bueno';
  if (val >= 0.5) return 'Medio';
  return 'Bajo';
}
}
