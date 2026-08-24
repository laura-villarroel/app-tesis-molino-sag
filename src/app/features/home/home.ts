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
    { title: 'Estados Desgastado (Etapa 1)', value: 5, subtitle: 'E1 a E5, de revestimiento nuevo a límite de recambio', icon: 'fem'  },
    { title: 'Simulaciones DEM (Etapa 2)', value: 31, subtitle: 'Bloque principal, anclado en flujos másicos', icon: 'fem'  },
    { title: 'Ganadores Etapa 2', value: 10, subtitle: 'Los dos mejores de cada estado por índice global', icon: 'fem'  },
    { title: 'Casos FEM (Etapa 3)', value: 11, subtitle: 'ANSYS Mechanical, 10 preseleccionados más el caso base', icon: 'fem'  },
    { title: 'Casos DEM (Etapa 4)', value: 11, subtitle: 'Desgaste activo, 100 s por escenario', icon: 'fem'  },
    { title: 'Casos DEM (Etapa 5)', value: 11, subtitle: 'Rotura activa: capacidad, P80 y consumo específico', icon: 'fem'  },
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
    { title: 'Etapa 1 — Obtención de los estados de desgaste', desc: 'Una corrida DEM con desgaste activo de 1 300 s sobre el caso base E1-V4-L2 define los cinco estados, de revestimiento nuevo a límite de recambio.' },
    { title: 'Etapa 2 — Exploración operacional (DEM sin rotura)', desc: '31 escenarios anclados en flujos másicos, más 27 a carga de bolas constante. De aquí salen los candidatos que pasan a las etapas siguientes.' },
    { title: 'Etapa 3 — Verificación estructural por FEM', desc: '11 escenarios, los diez preseleccionados más el caso base, verificados en ANSYS Mechanical con las cargas de contacto transferidas desde el DEM.' },
    { title: 'Etapa 4 — Evaluación de la velocidad de desgaste', desc: '11 escenarios con desgaste activo durante 100 s, para medir el espesor consumido y estimar la duración de cada tramo del ciclo.' },
    { title: 'Etapa 5 — Estimación de producción', desc: '11 escenarios con rotura activa del mineral, de los que se estiman capacidad de procesamiento, tamaño del producto y consumo específico de energía.' },
    { title: 'Etapa 6 — Integración final y selección', desc: 'Índice global que combina los indicadores de la Etapa 4, desgaste activo, y de la Etapa 5, rotura activa. Entrega un escenario recomendado para cada estado de desgaste, de E1 a E5.' },
  ];
  trackByTitle = (_: number, item: { title: string }) => item.title;
trackByScenario = (_: number, item: { scenario: string }) => item.scenario;
}
