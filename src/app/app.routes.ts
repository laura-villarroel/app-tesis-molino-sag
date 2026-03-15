import { Routes } from '@angular/router';
import { ResultadosComponent } from './features/resultados/resultados';
import { HomeComponent } from './features/home/home';
import { DecisionComponent } from './features/decision/decision';
import { ProcedimientoComponent } from './features/procedimiento/procedimiento';
import { AcercaComponent } from './features/acerca/acerca';
import { EscenarioComponent } from './features/escenario/escenario';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },

  // Flujo principal
  { path: 'decision', component: DecisionComponent },
  { path: 'procedimiento', component: ProcedimientoComponent },
  { path: 'escenario/:id', component: EscenarioComponent },

  // Resultados
  { path: 'biblioteca', component: ResultadosComponent },

  // Información
  { path: 'acerca', component: AcercaComponent },

  // Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
