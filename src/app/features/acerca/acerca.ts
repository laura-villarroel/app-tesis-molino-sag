import { Component } from '@angular/core';
import { PageHeroComponent, HeroAction } from '../../shared/page-hero/page-hero';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-acerca',
  standalone: true,
  imports: [PageHeroComponent,NgFor],
  templateUrl: './acerca.html',
  styleUrl: './acerca.scss',
})
export class AcercaComponent {

  //type HeroAction
  readonly heroActions: HeroAction[] = [
  { label: 'Ir a la herramienta de decisión', link: '/decision', variant: 'cta' },
  { label: 'Ver procedimiento', link: '/procedimiento' },
];

readonly heroChips: string[] = [
  'Basado en 40+ simulaciones Rocky DEM',
  'Validado con ANSYS Mechanical (FEM)',
];
// Assets
  readonly heroImage = 'assets/branding/molino-sag-v2.png';
  readonly pucpLogo = 'assets/branding/pucp_logo.png';
  readonly thesisPdf = 'assets/doc/tesis-laura-villarroel-2026.pdf';

  // Meta tesis
  readonly thesisTitle =
    'Optimización de parámetros operacionales de un molino SAG en función del desgaste de sus revestimientos mediante simulación DEM y FEM';
  readonly author = 'Laura Marina Villarroel Rivero';
  readonly advisor = 'Pedro Alonso Flores Álvarez';
  readonly institution = 'Pontificia Universidad Católica del Perú (PUCP)';
  readonly institutionSub = 'Escuela de Posgrado · Ingeniería Mecánica';
  readonly location = 'Lima, Perú';
  readonly year = 2026;

  // Links
  readonly linkedin = 'https://www.linkedin.com/in/laura-villarroel-32863261/';

  // Texto resumen (cap. 6 / herramienta)
  readonly whatDoesAppDo = [
    'Estima el estado de desgaste (E1–E5) a partir del espesor remanente H (mm) medido en el revestimiento.',
    'Recomienda setpoints operacionales: velocidad (%Nc y rpm) y llenado (% y masa equivalente), con referencias directas para ajuste del operador.',
    'Organiza y presenta evidencia técnica por escenario (KPIs, imagen DEM y video) para sustentar la recomendación.',
  ];

  // Justificación resumida (extracto optimizado)
  readonly justification =
    'Los molinos SAG son equipos críticos en plantas concentradoras por su alta capacidad de conminución y su impacto directo en la continuidad operacional. El desgaste de los revestimientos afecta la eficiencia, la potencia consumida y la disponibilidad del equipo. Las detenciones no programadas pueden representar pérdidas del orden de US$ 100.000 por hora. Frente a la limitada precisión de modelos empíricos/deterministas para describir la dinámica de carga, este trabajo utiliza simulación DEM y validación FEM para modelar el comportamiento del medio de molienda y evaluar escenarios operacionales con mayor realismo.';

  // Evidencia / etapas
  readonly evidenceText =
    'La aplicación está diseñada para mostrar una carta por escenario, donde se reúnen KPIs, imágenes y videos como evidencia de cada simulación. Los resultados se organizan por 5 etapas del estudio, facilitando trazabilidad y comparación técnica.';

  readonly stages = [
    { k: 'Etapa 1', v: 'Base geométrica y estados E1–E5 (Caso Base E1-V4-L2 con desgaste activo DEM)' },
    { k: 'Etapa 2', v: 'Exploración operacional DEM (sin rotura)' },
    { k: 'Etapa 3', v: 'Evaluación FEM (ANSYS Mechanical)' },
    { k: 'Etapa 4', v: 'Desgaste activo (DEM)' },
    { k: 'Etapa 5', v: 'Rotura activa y selección final' },
    { k: 'Etapa 6', v: 'Indicador global y selección final' },
  ];

  // Alcance y limitación
  readonly scope =
    'El estudio se enfoca en los revestimientos de la coraza del cilindro que conecta la alimentación con la descarga del molino SAG, analizando la influencia del espesor desgastado sobre los parámetros operacionales óptimos.';
  readonly limitations = [
    'Se excluyen del análisis otros elementos y partes que conforman el molino.',
    'Los resultados dependen de las condiciones y supuestos del modelo numérico (DEM–FEM) definidos en el estudio.',
  ];

}
