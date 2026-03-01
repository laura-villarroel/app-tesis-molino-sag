import { Routes } from '@angular/router';
import { ResultadosComponent } from './features/resultados/resultados';
import { AnexosComponent } from './features/anexos/anexos';

// ✅ placeholders mínimos (los creamos abajo)
import { HomeComponent } from './features/home/home';
import { DecisionComponent } from './features/decision/decision';
import { ProcedimientoComponent } from './features/procedimiento/procedimiento';
import { AcercaComponent } from './features/acerca/acerca';
import { EscenarioComponent } from './features/escenario/escenario';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },

  { path: 'decision', component: DecisionComponent },
  { path: 'procedimiento', component: ProcedimientoComponent },
  { path: 'biblioteca', component: ResultadosComponent },
  { path: 'acerca', component: AcercaComponent },


  { path: 'escenario/:id', component: EscenarioComponent },


  { path: 'anexos', component: AnexosComponent },

  { path: '**', redirectTo: '' },
];
