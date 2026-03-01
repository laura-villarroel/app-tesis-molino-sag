import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';
import { catchError, map, of, startWith } from 'rxjs';

type Api = {
  schemaVersion: string;
  updatedAt: string;
  stage: string;
  sheet: string;
  items: Record<string, GeneralItem>;
};

type GeneralItem = {
  scenarioId: string;
  state?: string;
  wearPct?: number;
  thicknessH_mm?: number;
  powerMorrel_kW?: number;
  powerDem_kW?: number;
  anglesImage?: string;

};

type Row = GeneralItem & { key: string };

type Vm = { loading: boolean; error: string | null; rows: Row[] };

@Component({
  standalone: true,
  selector: 'app-anexos',
  imports: [CommonModule],
  templateUrl: './anexos.html',
  styleUrl: './anexos.scss',
})
export class AnexosComponent {
  private data = inject(DataService);

  private readonly FILE = 'general.json';

  vm$ = this.data.load<Api>(this.FILE).pipe(
    map((api) => {
      const rows: Row[] = Object.entries(api.items ?? {}).map(([key, v]) => ({ key, ...v }));
      return { loading: false, error: null, rows } satisfies Vm;
    }),
    startWith({ loading: true, error: null, rows: [] } satisfies Vm),
    catchError((err) =>
      of({
        loading: false,
        rows: [],
        error: `HTTP ${err?.status ?? '?'} - ${err?.message ?? 'Error'} (archivo: ${this.FILE})`,
      } satisfies Vm)
    )
  );

  toAssetUrl(path?: string | null): string | null {
    if (!path) return null;
    return path.startsWith('assets/') ? `/${path}` : path;
  }
}
