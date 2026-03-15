import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
readonly year = new Date().getFullYear();
  readonly location = 'Lima, Perú';

  readonly thesisTitle =
    'Optimización de parámetros operacionales de un molino SAG en función del desgaste de sus revestimientos mediante simulación DEM y FEM';

  readonly author = 'Laura Marina Villarroel Rivero';
}
