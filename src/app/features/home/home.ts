import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


type Winner = { state: string; scenario: string };
type Kpi = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
};
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {

  heroImageSrc = 'assets/branding/molino-sag-v2.png';


  kpis: Kpi[] = [
    { title: 'Estados Desgastado (Etapa 1)', value: 5, subtitle: 'E1–E5 (DEM, desgaste activo, 1300 s)', icon: 'fem'  },
    { title: 'Simulaciones DEM (Etapa 2)', value: 31, subtitle: 'Exploración operacional (sin rotura ni desgaste)', icon: 'fem'  },
    { title: 'Ganadores Etapa 2', value: 10, subtitle: 'Selección por indicador global', icon: 'fem'  },
    { title: 'Casos FEM (Etapa 3)', value: 11, subtitle: 'ANSYS Mechanical (10 ganadores + base)', icon: 'fem'  },
    { title: 'Casos DEM (Etapa 4)', value: 11, subtitle: 'Desgaste activo (velocidad de desgaste)', icon: 'fem'  },
    { title: 'Casos DEM (Etapa 5)', value: 11, subtitle: 'Rotura activa (sin desgaste activo)', icon: 'fem'  },
    { title: 'Videos documentados', value: 54, subtitle: 'Etapa 1 (1) + Etapa 2 (31) + Etapa 4 (11) + Etapa 5 (11)', icon: 'fem'  },
  ];


  winners: Winner[] = [
    { state: 'E1 (Nuevo)', scenario: 'E1-V2-L2' },
    { state: 'E2 (25% desgaste)', scenario: 'E2-V2-L3' },
    { state: 'E3 (50% desgaste)', scenario: 'E3-V3-L4' },
    { state: 'E4 (75% desgaste)', scenario: 'E4-V3-L5' },
    { state: 'E5 (Crítico)', scenario: 'E5-V3-L5' },
  ];


  methodologySteps: Array<{ title: string; desc: string }> = [
    { title: 'Etapa 1 — Base geométrica (DEM, desgaste activo)', desc: 'Simulación DEM con desgaste activo (1300 s) para definir estados E1–E5. Caso base: E1-V4-L2.' },
    { title: 'Etapa 2 — Exploración operacional (DEM)', desc: '31 casos (30 + base) para evaluar desempeño operacional sin rotura y sin desgaste (comparación controlada).' },
    { title: 'Etapa 3 — Evaluación FEM', desc: '11 casos (10 ganadores + base) evaluados en ANSYS Mechanical para respuesta estructural.' },
    { title: 'Etapa 4 — Desgaste activo (DEM)', desc: '11 casos para estimar velocidad de desgaste (sin rotura activa).' },
    { title: 'Etapa 5 — Rotura activa (DEM)', desc: '11 casos con rotura activa (sin desgaste activo). Se extraen indicadores finales para seleccionar 5 ganadores (E1–E5).' },
    { title: 'Etapa 6 — Indicador global y selección final', desc: 'Cálculo del indicador global combinando resultados de Etapa 4 (desgaste activo) y Etapa 5 (rotura activa). Se determinó un escenario ganador óptimo por cada estado operativo (E1–E5).' },
  ];
  trackByTitle = (_: number, item: { title: string }) => item.title;
trackByScenario = (_: number, item: { scenario: string }) => item.scenario;
}
