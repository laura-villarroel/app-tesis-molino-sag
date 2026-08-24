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
  '58 escenarios simulados en Rocky DEM',
  'Verificación estructural en ANSYS Mechanical',
  'Cinco estados de desgaste, de revestimiento nuevo a límite de recambio',
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
    'Identifica el estado de desgaste, de E1 a E5, a partir del espesor remanente del levantador bajo medido en milímetros.',
    'Entrega la condición operacional recomendada para ese estado: velocidad de giro en porcentaje de la crítica y en rpm, y nivel de llenado efectivo.',
    'Reúne la evidencia de cada escenario, con indicadores, imágenes de la simulación y vídeo, de modo que la recomendación sea trazable hasta el cálculo que la sustenta.',
  ];

  // Justificación resumida (extracto optimizado)
  readonly justification =
    'Los molinos SAG son equipos críticos en las plantas concentradoras: concentran buena parte del consumo energético de la conminución y su disponibilidad condiciona la continuidad de toda la línea. El desgaste de los revestimientos modifica la geometría interna del equipo y con ella la trayectoria de la carga, la potencia demandada y el desempeño de la molienda. En la operación esos parámetros suelen mantenerse fijos durante toda la campaña, o ajustarse por experiencia, sin un criterio que los vincule al estado del revestimiento. Esta investigación aborda ese vacío mediante simulación DEM y verificación estructural por FEM, evaluando cincuenta y ocho escenarios operacionales sobre cinco estados de desgaste.';

  // Resultado destacado de la tarjeta principal
  readonly highlight = {
    k: 'Resultado principal',
    v: '×3.75 la duración del ciclo del revestimiento',
    s: 'Ajustar velocidad y llenado por estado frente a operar en condición fija.',
  };

  // Hallazgos
  readonly keyFindings = [
    'La condición favorable cambia con el estado del revestimiento. La velocidad pasa del 65 % al 70 % de la crítica entre E2 y E3, y el llenado efectivo crece del 20.9 % al 32 % a medida que el levantador pierde altura. La estrategia consiste en compensar la pérdida de capacidad de levantamiento con más carga y algo más de velocidad.',
    'La demanda de potencia crece con el desgaste. Entre el revestimiento nuevo y el de recambio la masa de carga aumenta un 53.6 % y la potencia un 27.8 %. Sube menos que la masa porque la densidad aparente cae de 3.660 a 3.067 t/m³ al reducirse la proporción de acero.',
    'Aumentar el llenado en los estados avanzados solo es viable si la carga de bolas se reduce en paralelo. Con la carga de diseño del 15 % fija, ocho de los veintisiete escenarios del bloque complementario superan la potencia admisible del motor, y todos corresponden a estados con desgaste igual o superior al 50 %.',
    'A igualdad de estado, de llenado total y de velocidad de giro, elevar la carga de bolas del 5.6 % al 15 % incrementa la demanda de potencia entre un 27 % y un 31 %.',
    'Ajustar por estados frente a operar en condición fija multiplica por 3.75 la duración estimada del ciclo del revestimiento, con una reducción del 73 % en la velocidad media de desgaste.',
    'El criterio de decisión se desplaza a lo largo del ciclo. Con el revestimiento sano deciden la capacidad de procesamiento y la finura del producto; a partir del estado intermedio el desgaste pasa a dominar el índice.',
    'Minimizar el desgaste no equivale a optimizar la operación. El escenario de menor velocidad de desgaste coincide con el recomendado en tres de los cinco estados y no en los otros dos, porque reducir la severidad del impacto penaliza al mismo tiempo la capacidad y el consumo específico.',
    'Ninguno de los escenarios evaluados se aproxima a una condición estructural crítica. Las tensiones equivalentes quedan tres órdenes de magnitud por debajo del límite elástico, de modo que la verificación por elementos finitos acota la viabilidad pero no discrimina entre condiciones.',
  ];

  // Recomendación de continuidad
  readonly economicNote =
    'La comparación entre rutas completas delimita el margen económico disponible: recorrer el ciclo priorizando el tratamiento entrega una capacidad media un 9.7 % superior y acorta la campaña un 44 %, lo que equivale a 1.78 veces más recambios por unidad de tiempo. Resolver cuál de las dos conviene exige tres datos de planta que este estudio no incorpora: el costo del juego de revestimientos, el valor unitario del mineral tratado y el costo de la detención por recambio. Con ellos, la ponderación técnica del índice podría sustituirse por una función objetivo económica, y la metodología ya entrega las magnitudes que esa función necesita.';

  // Evidencia / etapas
  readonly evidenceText =
    'Cada escenario tiene su propia ficha, con los indicadores, las imágenes y los vídeos de la simulación que lo sustenta. Los resultados se organizan en las seis etapas del estudio, de modo que cualquier recomendación puede seguirse hasta el cálculo del que procede.';

  readonly stages = [
    { k: 'Etapa 1', v: 'Obtención de los estados de desgaste. Una corrida DEM con desgaste activo sobre el caso base E1-V4-L2 genera los cinco estados, de revestimiento nuevo a límite de recambio.' },
    { k: 'Etapa 2', v: 'Exploración operacional con DEM sin rotura. Treinta y un escenarios anclados en flujos másicos, más veintisiete a carga de bolas constante.' },
    { k: 'Etapa 3', v: 'Verificación estructural por FEM en ANSYS Mechanical, con las cargas de contacto transferidas desde el DEM.' },
    { k: 'Etapa 4', v: 'Evaluación de la velocidad de desgaste de los escenarios candidatos, otra vez con desgaste activo.' },
    { k: 'Etapa 5', v: 'Estimación de producción con rotura activa del mineral: capacidad, tamaño de producto y consumo específico.' },
    { k: 'Etapa 6', v: 'Integración multicriterio y selección del escenario recomendado para cada estado de desgaste.' },
  ];

  // Alcance y limitación
  readonly scope =
    'El estudio se centra en el revestimiento del cilindro del molino, entre la alimentación y la descarga, y evalúa cómo el espesor remanente del levantador condiciona la velocidad de giro y el nivel de llenado más favorables. Se analizó un molino SAG de 18′ × 14.5′ con capacidad nominal de 192 t/h que procesa mineral de cobre.';
  readonly blockNote =
    'La herramienta reúne la evidencia del bloque principal, los treinta y un escenarios anclados en flujos másicos. El bloque complementario, veintisiete escenarios con la carga de bolas fijada en el 15 %, sustenta las conclusiones sobre el efecto de la carga de bolas en la demanda de potencia, pero sus datos no se incorporan aquí. Su desarrollo está en el Capítulo 5 de la tesis, descargable desde el encabezado de esta página.';

  readonly limitations = [
    'Las condiciones recomendadas son las mejores del conjunto de escenarios simulados, no óptimos globales.',
    'La pulpa no se modela: la carga se representa como un medio granular seco.',
    'Las simulaciones se ejecutan sobre un segmento axial de 0.5 m, sin los efectos de los extremos del molino.',
    'La correspondencia entre tiempo de simulación y tiempo de operación es una convención de escala, no una predicción de vida útil.',
    'La capacidad, el tamaño de producto y el consumo específico son magnitudes comparativas entre escenarios.',
    'El análisis estructural es estático lineal y se limita al anillo de revestimiento.',
  ];
trackByValue = (_: number, v: string) => v;
trackByStage = (_: number, s: { k: string }) => s.k;
}
