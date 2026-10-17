/* ============================================================
   SIMULADOR TÁCTICO DE INVESTIGACIÓN CRIMINAL — app.js
   Con sistema de imágenes realistas + fallback SVG automático
   ============================================================ */

'use strict';

const STATE = {
  selectedScenes: [], difficulty: null, sceneQueueIdx: 0, questionIdx: 0,
  score: 0, sceneScore: 0, scenesResults: [], custodyLog: [], questionsAnswered: [],
};

// ──────────────────────────────────────────────
//  SCENES DATA
// ──────────────────────────────────────────────
const SCENES = [
  {
    id: 'caso01', num: '01', title: 'Robo en Residencia',
    subtitle: 'Ingreso forzado · Huellas latentes · Evidencia biológica',
    img: './assets/burglary.png', color: '#f59e0b',
    dificil: [
      { phase: 'FASE 1 · FOTOGRAFÍA FORENSE', text: 'Al llegar a la escena del robo observas una huella dactilar latente en el vidrio de la ventana forzada. ¿Cuál es el protocolo fotográfico correcto antes de iniciar el revelado?', img: 'assets/q01_1.png', opts: ['Fotografiar con flash directo y sin escala.', 'Tomar tres disparos: general, medio y macro 1:1 con escala ABFO.', 'Fotografiar con luz natural.', 'Filmar en video primero.'], correct: 1, fb: '<strong>Protocolo en tres tiempos:</strong> General, medio y macro 1:1 a 90° con escala ABFO.', custody: '📸 Fotografía forense registrada.', pts: 10 },
      { phase: 'FASE 2 · REVELADO DE HUELLAS', text: 'La huella está sobre aluminio (superficie no porosa). ¿Qué técnica de revelado es la más adecuada?', img: 'assets/q01_2.png', opts: ['Ninhidrina en spray.', 'Polvo magnético negro con aplicador de vara.', 'Vapores de cianocrilato.', 'Solución DFO.'], correct: 1, fb: '<strong>Polvo magnético:</strong> Ideal para superficies no porosas lisas como el aluminio.', custody: '🔍 Revelado físico realizado.', pts: 10 },
      { phase: 'FASE 3 · EVIDENCIA BIOLÓGICA', text: 'Detectas una mancha seca en el piso. Luminol positivo. ¿Cómo recolectas para ADN?', img: 'assets/q01_3.png', opts: ['Raspar con bisturí.', 'Técnica de doble hisopo (húmedo y seco).', 'Recortar el piso.', 'Hisopo seco directamente.'], correct: 1, fb: '<strong>Doble hisopo:</strong> Rehidratar con hisopo húmedo y absorber con hisopo seco.', custody: '🧬 Muestra biológica colectada.', pts: 10 },
      { phase: 'FASE 4 · EMBALAJE DE VIDRIOS', text: 'Debes levantar fragmentos de vidrio para correlación física. ¿Cuál es el embalaje correcto?', img: 'assets/q01_4.png', opts: ['Todos juntos en bolsa zip.', 'Individualmente en papel kraft y caja rígida.', 'En papel de aluminio.', 'En frasco de vidrio.'], correct: 1, fb: '<strong>Embalaje individual:</strong> Papel kraft individual para evitar fracturas artificiales.', custody: '🔺 Vidrios fracturados embalados.', pts: 10 },
      { phase: 'FASE 5 · SELLADO Y ENTREGA', text: '¿Cuál es el procedimiento correcto para sellar y transferir la custodia?', img: 'assets/q01_5.png', opts: ['Firmar solo la planilla de recepción.', 'Cinta adhesiva común.', 'Precinto tamper-evident, firma cruzada y formulario FOCAD-07.', 'Sellar con cera lacre.'], correct: 2, fb: '<strong>Cadena de custodia:</strong> Precinto inviolable, firma cruzada y FOCAD-07.', custody: '🔒 Sellos tamper-evident aplicados.', pts: 10 }
    ],
    experto: [
      { phase: 'FASE 1 · FOTOGRAFÍA AVANZADA', text: 'La huella está en una manija curva. ¿Qué técnica supera la distorsión de perspectiva?', img: 'assets/q01_1.png', opts: ['Aumentar resolución.', 'RTI (Reflectance Transformation Imaging).', 'Iluminación coaxial.', 'HDR desde 6 ángulos.'], correct: 1, fb: '<strong>RTI:</strong> Reconstruye el relieve superficial a nivel de micras.', custody: '📸 RTI realizado.', pts: 20 },
      { phase: 'FASE 2 · REVELADO COMPLEJO', text: 'Huella sobre cartón poroso húmedo con segunda huella superpuesta. ¿Secuencia correcta?', img: 'assets/q01_2.png', opts: ['DFO → Ninhidrina → PD.', 'SPR → Cianocrilato → Rodamina.', 'PD → DFO → Ninhidrina.', 'Ninhidrina → DFO → PD.'], correct: 0, fb: '<strong>Secuencia:</strong> DFO → Ninhidrina → Physical Developer (PD).', custody: '🔬 Revelado secuencial realizado.', pts: 20 },
      { phase: 'FASE 3 · DEGRADACIÓN DE ADN', text: 'ADN degradado (<0.1 ng/µL) expuesto a UV. ¿Estrategia con mayor probabilidad?', img: 'assets/q01_3.png', opts: ['PowerPlex Fusion 6C.', 'WGA.', 'Kit MiniFiler (amplicons <200 pb).', 'NGS mitocondrial.'], correct: 2, fb: '<strong>MiniFiler:</strong> Diseñado para ADN degradado con fragmentos cortos.', custody: '🧬 Muestra enviada a lab.', pts: 20 },
      { phase: 'FASE 4 · ÍNDICE REFRACTIVO', text: '¿Qué análisis es más específico para determinar origen común de vidrios?', img: 'assets/q01_4.png', opts: ['Índice de Refracción (RI).', 'SEM-EDS.', 'LA-ICP-MS (40+ elementos traza).', 'Espectroscopía Raman.'], correct: 2, fb: '<strong>LA-ICP-MS:</strong> Poder discriminante >99.99% para lotes de fábrica.', custody: '🔺 Fragmentos enviados a LA-ICP-MS.', pts: 20 },
      { phase: 'FASE 5 · RUPTURA DE CADENA', text: 'Falta firma del receptor en FOCAD-07. La defensa pide exclusión. ¿Respuesta procesal correcta?', img: 'assets/q01_5.png', opts: ['Evidencia inadmisible.', 'Solicitar affidávit y bitácora electrónica para restaurar trazabilidad.', 'Repetir recolección.', 'Presentar peritaje independiente.'], correct: 1, fb: '<strong>Sanación:</strong> Un vacío aislado no es causal automática de inadmisibilidad.', custody: '⚠️ ALERTA CADENA: Vacío detectado.', pts: 20 }
    ]
  },
  {
    id: 'caso02', num: '02', title: 'Homicidio en Parque',
    subtitle: 'Cadáver en exterior · Arma blanca · Pisadas en barro',
    img: 'assets/homicide_park.png', color: '#ef4444',
    dificil: [
      { phase: 'FASE 1 · ACORDONAMIENTO', text: 'Cadáver sobre césped húmedo. Zona pública con curiosos. ¿Primera acción?', img: 'assets/q02_1.png', opts: ['Examinar el cadáver.', 'Triple acordonamiento: exclusión, tránsito y contención.', 'Entrevistar testigos.', 'Fotografiar primero.'], correct: 1, fb: '<strong>Triple acordonamiento:</strong> Proteger primero, documentar después.', custody: '🚨 Acordonamiento establecido.', pts: 10 },
      { phase: 'FASE 2 · IMPRESIONES DE CALZADO', text: 'Huellas en barro húmedo. Lluvia en 40 min. ¿Protocolo de conservación?', img: 'assets/q02_2.png', opts: ['Vaciar con yeso París.', 'Fijar con laca, vaciar con yeso dental Clase III.', 'Cubrir con plástico.', 'Levantar el barro.'], correct: 1, fb: '<strong>Yeso dental Clase III:</strong> Reproduce detalles <0.5mm.', custody: '👣 Vaciado realizado.', pts: 10 },
      { phase: 'FASE 3 · ARMA BLANCA', text: 'Cuchillo con sangre en hoja y huellas en mango. ¿Embalaje dual?', img: 'assets/q02_3.png', opts: ['Bolsa ziplock.', 'Mango y hoja en papel kraft separado, caja rígida con bridas.', 'Dejar in situ.', 'Pinzas por la hoja.'], correct: 1, fb: '<strong>Embalaje dual:</strong> Papel kraft y bridas para inmovilizar.', custody: '🔪 Cuchillo embalado.', pts: 10 },
      { phase: 'FASE 4 · PELO CON BULBO', text: 'Pelo con bulbo anágeno intacto. ¿Valor diferencial y recolección?', img: 'assets/q02_4.png', opts: ['Sin bulbo también sirve.', 'Bulbo anágeno: ADN nuclear, perfil STR completo. Pinzas sin punta dentada.', 'Solo ADN mitocondrial.', 'Pegar con cinta.'], correct: 1, fb: '<strong>Bulbo anágeno:</strong> ADN nuclear de doble hebra para individualización.', custody: '🧬 Pelo con bulbo recolectado.', pts: 10 },
      { phase: 'FASE 5 · LEVANTAMIENTO', text: 'Protección de manos del cadáver antes del traslado. ¿Procedimiento?', img: 'assets/q02_5.png', opts: ['Bolsas plásticas.', 'No cubrir.', 'Bolsas de papel kraft transpirables atadas con hilo.', 'Gasas húmedas.'], correct: 2, fb: '<strong>Bolsas de papel:</strong> Evitan maceración y preservan ADN subungueal.', custody: '✋ Manos protegidas.', pts: 10 }
    ],
    experto: [
      { phase: 'FASE 1 · BIOARQUEOLOGÍA FORENSE', text: 'Cadáver movido. Livores no coinciden. ¿Secuencia para reconstruir locus delicti?', img: 'assets/q02_1.png', opts: ['Fotografiar livores.', 'Entomología del suelo.', 'Fotogrametría 3D + livores + suelo + satelización.', 'Rigor mortis.'], correct: 2, fb: '<strong>Multidisciplinario:</strong> Fotogrametría + Entomología + Suelo.', custody: '🗺️ Análisis multidisciplinario.', pts: 20 },
      { phase: 'FASE 2 · PISADAS EN CONTEXTO MIXTO', text: 'Pisada mitad barro, mitad asfalto. ¿Documentación y levantamiento?', img: 'assets/q02_2.png', opts: ['Vaciar solo barro.', 'Fotografiar, polvo en asfalto, vaciar barro, gelatina BVDA, fusionar.', 'Extrapolar por simetría.', 'Cinta adhesiva.'], correct: 1, fb: '<strong>Protocolo integrado:</strong> Gelatina BVDA + Dental Stone + Fotogrametría.', custody: '👣 Pisada mixta levantada.', pts: 20 },
      { phase: 'FASE 3 · TRAYECTORIA DE HERIDA', text: 'Herida inciso-punzante oblicua en flanco derecho. ¿Posición agresor-víctima?', img: 'assets/q02_3.png', opts: ['Agresor detrás y arriba.', 'Víctima boca abajo.', 'Agresor zurdo de frente.', 'Víctima arrodillada.'], correct: 0, fb: '<strong>Trayecto:</strong> Superior-inferior y posterior-anterior = agresor detrás y arriba.', custody: '🔬 Trayecto documentado.', pts: 20 },
      { phase: 'FASE 4 · MEZCLA DE ADN', text: 'Perfil STR mixto (2 contribuyentes). ¿Enfoque estadístico robusto?', img: 'assets/q02_4.png', opts: ['LR binario.', 'Proporción de loci.', 'STRmix/TrueAllele con LR bayesiano.', 'Re-análisis 30 loci.'], correct: 2, fb: '<strong>Probabilistic Genotyping:</strong> STRmix para mezclas complejas.', custody: '🧬 Mezcla compleja analizada.', pts: 20 },
      { phase: 'FASE 5 · ESTIMACIÓN DE HORA DE MUERTE', text: 'Temp. rectal 27°C, ambiental 14°C. Rigor completo, livor fijo. ¿Método más preciso?', img: 'assets/q02_5.png', opts: ['Regla de Henssge.', '1°C/hora.', 'Rigor y livor solos.', 'Integrar Henssge + Rigor + Livor + Entomología.'], correct: 3, fb: '<strong>Integración multi-método:</strong> Solo la integración es admisible en tribunal.', custody: '⏱️ PMI calculado.', pts: 20 }
    ]
  },
  {
    id: 'caso03', num: '03', title: 'Siniestro Vial Doloso',
    subtitle: 'Colisión en calzada · Huellas de frenada · Dosaje etílico',
    img: 'assets/traffic_accident.png', color: '#f97316',
    dificil: [
      { phase: 'FASE 1 · MEDICIÓN DE HUELLAS', text: 'Huellas de frenada de 28m. ¿Qué datos necesitas para reconstruir velocidad?', img: 'assets/q03_1.png', opts: ['Solo longitud.', 'Longitud, neumáticos, coeficiente de fricción µ, pavimento.', 'Longitud y velocímetro.', 'Pavimento y temperatura.'], correct: 1, fb: '<strong>Fórmula:</strong> V = √(2 × µ × g × d). Sin µ real no es admisible.', custody: '🚗 Huellas documentadas.', pts: 10 },
      { phase: 'FASE 2 · ESCAMAS DE PINTURA', text: 'Escamas de pintura azul metálica en asfalto. ¿Recolección?', img: 'assets/q03_2.png', opts: ['Cinta adhesiva.', 'Espátula plástica estéril y sobre de papel glassine.', 'Aspiradora forense.', 'Dejar in situ.'], correct: 1, fb: '<strong>Papel glassine:</strong> Sin adhesivos que contaminen GC-MS.', custody: '🎨 Escamas recolectadas.', pts: 10 },
      { phase: 'FASE 3 · FLUIDOS DEL VEHÍCULO', text: 'Charco de aceite de motor. ¿Valor individualizable y recolección?', img: 'assets/q03_3.png', opts: ['Sin valor.', 'Pipeta Pasteur, frasco vidrio ámbar, comparar con cárter.', 'Gasas estériles.', 'Ficha técnica.'], correct: 1, fb: '<strong>Firma química:</strong> Aditivos y desgaste metálico individualizan.', custody: '🛢️ Aceite recolectado.', pts: 10 },
      { phase: 'FASE 4 · DOSAJE ETÍLICO', text: 'Muestra para juicio. ¿Tubo y antiséptico?', img: 'assets/q03_4.png', opts: ['Tubo rojo y alcohol.', 'Tubo lila y cualquier antiséptico.', 'Tubo gris NaF/K₂EDTA y Betadine.', 'Tubo verde y cloruro.'], correct: 2, fb: '<strong>Tubo gris NaF:</strong> Inhibe glicolisis. Betadine, nunca alcohol.', custody: '🩸 Dosaje realizado.', pts: 10 },
      { phase: 'FASE 5 · PRECINTADO DE VEHÍCULO', text: 'Vehículo a depósito judicial. ¿Procedimiento antes del traslado?', img: 'assets/q03_5.png', opts: ['Trasladar sin precinto.', 'Documentar kilometraje, sellos tamper-evident en todas las aperturas, acta.', 'Solo fotografiar exterior.', 'Sellar solo puerta conductor.'], correct: 1, fb: '<strong>Escena móvil:</strong> Sellos numerados en todas las aperturas.', custody: '🚨 Vehículo precintado.', pts: 10 }
    ],
    experto: [
      { phase: 'FASE 1 · VELOCÍMETRO FORENSE', text: 'Cámara CCTV con distorsión de perspectiva. ¿Método riguroso para velocidad?', img: 'assets/q03_1.png', opts: ['Medir píxeles.', 'Ignorar video.', 'Calibración fotogramétrica con GCPs y rectificación.', 'Factor del fabricante.'], correct: 2, fb: '<strong>Fotogrametría:</strong> Calibración con puntos de control terrestres (GCP).', custody: '📹 Calibración realizada.', pts: 20 },
      { phase: 'FASE 2 · ESTRATIGRAFÍA AUTOMOTRIZ', text: 'Micro-FTIR revela 5 capas. Imprimación no coincide con PDQ. ¿Estrategia?', img: 'assets/q03_2.png', opts: ['Declarar no identificable.', 'Py-GC-MS para monómeros de resinas.', 'Colorimetría CIE L*a*b*.', 'Aumentar resolución FTIR.'], correct: 1, fb: '<strong>Py-GC-MS:</strong> Fragmenta resinas no indexadas en PDQ.', custody: '🎨 Py-GC-MS solicitado.', pts: 20 },
      { phase: 'FASE 3 · PERFIL DE ACEITE AVANZADO', text: 'ICP-OES: Fe=180, Cu=45. Vehículo: Fe=185, Cu=44. ¿Análisis estadístico?', img: 'assets/q03_3.png', opts: ['Diferencia porcentual.', 'ANOVA.', 'PCA + Distancia de Mahalanobis.', 'Coincidencia visual.'], correct: 2, fb: '<strong>Mahalanobis:</strong> Distancia multivariada normalizada por varianza.', custody: '🛢️ Análisis PCA+Mahalanobis.', pts: 20 },
      { phase: 'FASE 4 · TOXICOLOGÍA AVANZADA', text: 'Etilemia 1.2 g/L a 2h post-accidente. Defensa alega consumo post. ¿Análisis?', img: 'assets/q03_4.png', opts: ['No determinable.', 'Segunda muestra y Widmark.', 'Widmark estándar.', 'Ratio sangre:orina (fase absorción/eliminación).'], correct: 3, fb: '<strong>Ratio sangre:orina:</strong> Determina fase cinética directamente.', custody: '🩸 Análisis de orina solicitado.', pts: 20 },
      { phase: 'FASE 5 · ACCIDENTOLOGÍA AVANZADA', text: 'Frenazo inicia 8m DESPUÉS del impacto. ¿Hipótesis?', img: 'assets/q03_5.png', opts: ['Frenó antes.', 'Reacción tardía post-impacto o embestida dolosa.', 'Aceleraba.', 'Punto mal calculado.'], correct: 1, fb: '<strong>Dolo:</strong> No intentó detenerse antes. Consistente con embestida.', custody: '🚗 Análisis EDR solicitado.', pts: 20 }
    ]
  },
  {
    id: 'caso04', num: '04', title: 'Análisis en Laboratorio',
    subtitle: 'AFIS · ADN-STR · Balística · SEM-EDS · Testimonio',
    img: 'assets/forensic_lab.png', color: '#06b6d4',
    dificil: [
      { phase: 'FASE 1 · DACTILOSCOPIA', text: 'AFIS arroja 14 minucias. ¿Mínimo para identificación plena?', img: 'assets/q04_1.png', opts: ['14 es suficiente.', 'Varía (8-16), pero determinante es ACE-V cualitativo.', 'Mínimo 30.', 'AFIS es definitivo.'], correct: 1, fb: '<strong>ACE-V:</strong> Análisis, Comparación, Evaluación, Verificación.', custody: '🔍 AFIS - 14 minucias.', pts: 10 },
      { phase: 'FASE 2 · PERFIL STR', text: 'STR 20 loci. RMP 1 en 10 billones. ¿Reporte pericial?', img: 'assets/q04_2.png', opts: ['"100% del sospechoso."', 'LR=10¹³ a favor de hipótesis del fiscal.', '"Es culpable."', '"No es definitivo."'], correct: 1, fb: '<strong>LR:</strong> Lenguaje estadístico neutro. Nunca culpabilidad.', custody: '🧬 Informe STR emitido.', pts: 10 },
      { phase: 'FASE 3 · BALÍSTICA', text: 'Dos vainillas 9mm. Marcas de percutor similares. ¿Conclusión?', img: 'assets/q04_3.png', opts: ['"Certeza absoluta."', '"Consistent with same firearm" (AFTE).', '"Mismo calibre, misma arma."', '"Solo proyectiles."'], correct: 1, fb: '<strong>AFTE:</strong> Identified, Consistent, Inconclusive, Eliminated.', custody: '🔫 Comparación concluida.', pts: 10 },
      { phase: 'FASE 4 · RESIDUOS DE DISPARO', text: 'SEM-EDS: partículas esferoidales Pb+Ba+Sb. ¿Significado?', img: 'assets/q04_4.png', opts: ['Disparó o estuvo cerca de disparo.', 'Municiones artesanales.', 'Contaminación industrial.', 'Inconcluso.'], correct: 0, fb: '<strong>GSR:</strong> Morfología esferoidal + Pb+Ba+Sb = diagnóstico.', custody: '💥 GSR positivo.', pts: 10 },
      { phase: 'FASE 5 · TESTIMONIO EXPERTO', text: 'Defensa pregunta: "¿Transferencia secundaria de GSR?" ¿Respuesta correcta?', img: 'assets/q04_5.png', opts: ['"Imposible."', '"Posible pero improbable con densidad de disparo directo."', '"No puedo responder."', '"Es la principal causa."'], correct: 1, fb: '<strong>Honestidad pericial:</strong> Reconocer posibilidad y aportar datos cuantitativos.', custody: '⚖️ Testimonio completado.', pts: 10 }
    ],
    experto: [
      { phase: 'FASE 1 · DACTILOSCOPIA CUANTITATIVA', text: '7 minucias, AFIS score 856. ¿Procedimiento OSAC/SWGFAST?', img: 'assets/q04_1.png', opts: ['Dictamen por score.', 'Insuficiente, no concluir.', 'ACE-V con GYRO, conclusión conservadora.', 'Imagen hiperspectral.'], correct: 2, fb: '<strong>OSAC:</strong> Evaluación GYRO y conclusión más conservadora.', custody: '🔍 ACE-V con GYRO.', pts: 20 },
      { phase: 'FASE 2 · MEZCLA STR COMPLEJA', text: 'Drop-in en D8S1179, drop-out en vWA. STRmix LR=4.2×10⁶. ¿Acción?', img: 'assets/q04_2.png', opts: ['Reportar directo.', 'Invalidar todo.', 'Verificar artefactos manualmente, excluir y recalcular.', 'Repetir extracción.'], correct: 2, fb: '<strong>Verificación manual:</strong> Confirmar si drop-in es stutter antes de reportar.', custody: '🧬 Revisión manual completada.', pts: 20 },
      { phase: 'FASE 3 · BALÍSTICA DE PROYECTIL DEFORMADO', text: 'Proyectil deformado, 30% superficie con estrías. ¿Protocolo?', img: 'assets/q04_3.png', opts: ['No comparativo.', 'Microscopio de luz.', 'Microscopía confocal 3D + correlación CSAFE + umbral NIST.', 'Nuevo disparo testigo.'], correct: 2, fb: '<strong>Confocal + CSAFE:</strong> Mapas 3D y umbrales estadísticos NIST.', custody: '🔫 Microscopía confocal.', pts: 20 },
      { phase: 'FASE 4 · GSR EN CONTEXTO OCUPACIONAL', text: 'Pintor de carrocerías alega contaminación. ¿Análisis discriminante?', img: 'assets/q04_4.png', opts: ['Comparar con pinturas del taller.', 'Pb+Ba+Sb es diagnóstico.', 'Morfología esferoidal vs. angular + tamaño + sistema ternario.', 'Análisis de orina.'], correct: 2, fb: '<strong>Discriminación:</strong> Morfología, tamaño y sistema ternario en misma partícula.', custody: '💥 Discriminación completada.', pts: 20 },
      { phase: 'FASE 5 · CONTRAINTERROGATORIO', text: 'Fiscal: "¿Es el donante?" Defensor: "¿Base de datos equivocada?" ¿Respuesta?', img: 'assets/q04_5.png', opts: ['Sí al fiscal, no al defensor.', 'No al fiscal (LR no es culpabilidad); al defensor: reportar LR multi-poblacional.', 'Sí a ambos.', 'No responder.'], correct: 1, fb: '<strong>Doble respuesta:</strong> LR cuantifica evidencia, no culpabilidad.', custody: '⚖️ Testimonio final.', pts: 20 }
    ]
  }
];

// ──────────────────────────────────────────────
//  GENERADOR DE PLACEHOLDER SVG FORENSE
//  Se usa cuando una imagen no existe
// ──────────────────────────────────────────────
function generateForensicPlaceholder(phase, sceneTitle, originalPath) {
  const colors = {
    'Robo en Residencia': '#f59e0b',
    'Homicidio en Parque': '#ef4444',
    'Siniestro Vial Doloso': '#f97316',
    'Análisis en Laboratorio': '#06b6d4'
  };
  const accent = colors[sceneTitle] || '#06b6d4';
  
  const icons = {
    'FOTOGRAFÍA': '📸', 'REVELADO': '🖐️', 'EVIDENCIA': '🩸',
    'EMBALAJE': '🔺', 'SELLADO': '🔒', 'ACORDONAMIENTO': '🚨',
    'IMPRESIONES': '👣', 'ARMA': '🔪', 'PELO': '🔬',
    'LEVANTAMIENTO': '✋', 'MEDICIÓN': '🚗', 'ESCAMAS': '🎨',
    'FLUIDOS': '🛢️', 'DOSAJE': '🩸', 'PRECINTADO': '🚔',
    'DACTILOSCOPIA': '🔍', 'PERFIL': '🧬', 'BALÍSTICA': '🔫',
    'RESIDUOS': '💥', 'TESTIMONIO': '⚖️', 'ÍNDICE': '🔬',
    'BIOARQUEOLOGÍA': '🗺️', 'MEZCLA': '🧬', 'ESTIMACIÓN': '⏱️',
    'VELOCÍMETRO': '📹', 'ESTRATIGRAFÍA': '🎨', 'TOXICOLOGÍA': '🧪',
    'ACCIDENTOLOGÍA': '🚗', 'DEGRADACIÓN': '🧬', 'TRAYECTORIA': '🔬',
    'RUPTURA': '⚠️', 'CONTRAINTERROGATORIO': '⚖️'
  };
  
  let icon = '🔍';
  for (const key in icons) {
    if (phase.toUpperCase().includes(key)) { icon = icons[key]; break; }
  }
  
  const shortPhase = phase.length > 40 ? phase.substring(0, 37) + '...' : phase;
  const shortScene = sceneTitle.length > 30 ? sceneTitle.substring(0, 27) + '...' : sceneTitle;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a1628"/>
        <stop offset="50%" style="stop-color:#050b14"/>
        <stop offset="100%" style="stop-color:#0d1b30"/>
      </linearGradient>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.15"/>
      </pattern>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${accent};stop-opacity:0.25"/>
        <stop offset="100%" style="stop-color:${accent};stop-opacity:0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="500" fill="url(#bgGrad)"/>
    <rect width="1200" height="500" fill="url(#grid)"/>
    <ellipse cx="600" cy="250" rx="400" ry="250" fill="url(#glow)"/>
    <path d="M 40 40 L 40 90 M 40 40 L 90 40" stroke="${accent}" stroke-width="3" fill="none"/>
    <path d="M 1160 40 L 1160 90 M 1160 40 L 1110 40" stroke="${accent}" stroke-width="3" fill="none"/>
    <path d="M 40 460 L 40 410 M 40 460 L 90 460" stroke="${accent}" stroke-width="3" fill="none"/>
    <path d="M 1160 460 L 1160 410 M 1160 460 L 1110 460" stroke="${accent}" stroke-width="3" fill="none"/>
    <circle cx="600" cy="210" r="90" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
    <circle cx="600" cy="210" r="60" fill="none" stroke="${accent}" stroke-width="1" opacity="0.7"/>
    <circle cx="600" cy="210" r="110" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.3" stroke-dasharray="5,5"/>
    <line x1="600" y1="90" x2="600" y2="130" stroke="${accent}" stroke-width="1" opacity="0.6"/>
    <line x1="600" y1="290" x2="600" y2="330" stroke="${accent}" stroke-width="1" opacity="0.6"/>
    <line x1="480" y1="210" x2="520" y2="210" stroke="${accent}" stroke-width="1" opacity="0.6"/>
    <line x1="680" y1="210" x2="720" y2="210" stroke="${accent}" stroke-width="1" opacity="0.6"/>
    <text x="600" y="245" font-size="90" text-anchor="middle" fill="${accent}" opacity="0.9">${icon}</text>
    <rect x="440" y="330" width="320" height="30" rx="4" fill="#000" opacity="0.6"/>
    <text x="600" y="350" font-family="monospace" font-size="14" fill="#7f95b0" text-anchor="middle" letter-spacing="2">${shortScene.toUpperCase()}</text>
    <rect x="340" y="370" width="520" height="38" rx="4" fill="#000" opacity="0.7" stroke="${accent}" stroke-width="1"/>
    <text x="600" y="395" font-family="monospace" font-size="17" font-weight="bold" fill="${accent}" text-anchor="middle">${shortPhase}</text>
    <rect x="80" y="450" width="240" height="20" fill="#000" opacity="0.7"/>
    <rect x="90" y="455" width="40" height="10" fill="#fff"/>
    <rect x="130" y="455" width="40" height="10" fill="#000"/>
    <rect x="170" y="455" width="40" height="10" fill="#fff"/>
    <rect x="210" y="455" width="40" height="10" fill="#000"/>
    <rect x="250" y="455" width="40" height="10" fill="#fff"/>
    <text x="200" y="485" font-family="monospace" font-size="10" fill="#fff" text-anchor="middle">0    20   40   60   80cm</text>
    <text x="600" y="480" font-family="monospace" font-size="10" fill="#7f95b0" text-anchor="middle" opacity="0.5">IMAGEN PENDIENTE · ${originalPath}</text>
  </svg>`;
  
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ──────────────────────────────────────────────
//  AUDIO
// ──────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playTone(freq, type, duration, gainVal) {
  try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration); } catch(e) {}
}
function playSuccess() { playTone(880,'sine',0.15,0.3); setTimeout(()=>playTone(1320,'sine',0.25,0.25),100); }
function playError() { playTone(200,'sawtooth',0.18,0.25); setTimeout(()=>playTone(160,'sawtooth',0.22,0.2),80); }
function playClick() { playTone(600,'square',0.06,0.12); }
function playTick() { playTone(1200,'sine',0.04,0.1); }

function $(id) { return document.getElementById(id); }

// ──────────────────────────────────────────────
//  NAVIGATION
// ──────────────────────────────────────────────
const SCREENS = ['portada','escena','dificultad','preguntas','resultado','dictamen','escena3d'];
const NAV_MAP = { portada:'nav-portada', escena:'nav-escena', dificultad:'nav-dificultad', preguntas:'nav-preguntas', dictamen:'nav-dictamen', escena3d:'nav-escena3d' };

function goToScreen(name) {
  SCREENS.forEach(s => { const el = $(`view-${s}`); if (el) el.classList.remove('active'); });
  const target = $(`view-${name}`);
  if (target) { requestAnimationFrame(() => { target.classList.add('active'); target.scrollIntoView({ behavior:'smooth', block:'start' }); }); }
  Object.entries(NAV_MAP).forEach(([k, v]) => { const el = $(v); if (el) el.classList.toggle('active', k === name || k === (name === 'resultado' ? 'preguntas' : name)); });
  playClick();
}

// ──────────────────────────────────────────────
//  SCENE SELECTION
// ──────────────────────────────────────────────
function renderSceneSelectGrid() {
  const grid = $('scene-select-grid');
  if (!grid) return;
  grid.innerHTML = SCENES.map((s, i) => `
    <div class="scene-select-card" id="scene-card-${i}" onclick="toggleScene(${i})">
      <img class="scene-select-img" src="${s.img}" alt="${s.title}" loading="lazy" 
           onerror="this.onerror=null; this.src=generateForensicPlaceholder('${s.title.toUpperCase()}', '${s.title}', '${s.img}')">
      <div class="scene-select-body">
        <span class="scene-num-tag">CASO ${s.num}</span>
        <div class="scene-select-title">${s.title}</div>
        <div class="scene-select-desc">${s.subtitle}</div>
      </div>
    </div>`).join('');
  $('btn-select-all-scenes').addEventListener('click', () => {
    if (STATE.selectedScenes.length === SCENES.length) { STATE.selectedScenes = []; document.querySelectorAll('.scene-select-card').forEach(c => c.classList.remove('selected')); }
    else { STATE.selectedScenes = SCENES.map((_, i) => i); document.querySelectorAll('.scene-select-card').forEach(c => c.classList.add('selected')); }
    updateScenesCounter(); playTick();
  });
}

function toggleScene(idx) {
  const card = $(`scene-card-${idx}`);
  const pos = STATE.selectedScenes.indexOf(idx);
  if (pos === -1) { STATE.selectedScenes.push(idx); card.classList.add('selected'); }
  else { STATE.selectedScenes.splice(pos, 1); card.classList.remove('selected'); }
  updateScenesCounter(); playTick();
}

function updateScenesCounter() {
  const n = STATE.selectedScenes.length;
  $('scenes-counter').textContent = `${n} de 4 seleccionadas`;
  const btn = $('btn-proceed-to-difficulty');
  if (n > 0) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  else { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
}

function proceedToDifficulty() { if (STATE.selectedScenes.length === 0) return; STATE.selectedScenes.sort((a,b)=>a-b); goToScreen('dificultad'); }

// ──────────────────────────────────────────────
//  DIFFICULTY
// ──────────────────────────────────────────────
function selectDifficulty(diff) {
  STATE.difficulty = diff;
  const badge = $('diff-badge-header');
  badge.className = `diff-badge-header ${diff}`; badge.textContent = diff === 'dificil' ? '🔥 DIFÍCIL' : '💀 EXPERTO'; badge.style.display = 'inline-flex';
  STATE.sceneQueueIdx = 0; STATE.questionIdx = 0; STATE.score = 0; STATE.scenesResults = []; STATE.custodyLog = []; STATE.questionsAnswered = [];
  $('score-display').textContent = '0'; loadCurrentScene(); goToScreen('preguntas'); playSuccess();
}

// ──────────────────────────────────────────────
//  QUESTIONS
// ──────────────────────────────────────────────
function loadCurrentScene() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  STATE.sceneScore = 0; STATE.questionIdx = 0;
  $('scene-case-badge').textContent = `CASO ${scene.num}`;
  $('scene-title-display').textContent = scene.title;
  $('scene-subtitle-display').textContent = scene.subtitle;
  $('active-case-label').textContent = `CASO ${scene.num} · ACTIVO`;
  $('q-total-num').textContent = getQuestions(sceneIdx).length;
  renderQuestion();
}

function getQuestions(sceneIdx) { return STATE.difficulty === 'experto' ? SCENES[sceneIdx].experto : SCENES[sceneIdx].dificil; }

function renderQuestion() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  const questions = getQuestions(sceneIdx);
  const q = questions[STATE.questionIdx];
  
  $('q-current-num').textContent = STATE.questionIdx + 1;
  $('q-total-num').textContent = questions.length;
  $('question-phase-badge').textContent = q.phase;
  $('question-text').textContent = q.text;
  
  const qcard = $('question-card'); 
  qcard.className = 'question-card'; 
  qcard.classList.add(STATE.difficulty === 'experto' ? 'expert-mode' : 'hard-mode');
  
  // CARGAR IMAGEN CON FALLBACK
  const imgPanel = $('question-image-panel');
  const existingImg = imgPanel.querySelector('.question-scene-img');
  if (existingImg) existingImg.remove();
  
  const img = document.createElement('img');
  img.className = 'question-scene-img';
  img.alt = q.phase;
  img.src = q.img;
  img.onerror = function() {
    this.onerror = null;
    this.src = generateForensicPlaceholder(q.phase, scene.title, q.img);
  };
  imgPanel.insertBefore(img, imgPanel.firstChild);
  
  $('hud-scene-name').textContent = scene.title.toUpperCase();
  $('hud-diff-pill').textContent = STATE.difficulty === 'experto' ? '💀 EXPERTO' : '🔥 DIFÍCIL';
  $('hud-diff-pill').className = `hud-pill ${STATE.difficulty === 'experto' ? 'expert-hud' : 'hard-hud'}`;
  $('hud-evidence-tag').textContent = q.phase;
  $('hud-q-counter').textContent = `P.${STATE.questionIdx + 1}/${questions.length}`;
  
  const optsContainer = $('options-container'); 
  optsContainer.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button'); 
    btn.className = 'option-btn'; 
    btn.id = `opt-${i}`;
    btn.innerHTML = `<span class="option-letter">${['A','B','C','D'][i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i)); 
    optsContainer.appendChild(btn);
  });
  
  $('feedback-box').className = 'feedback-box hidden'; 
  $('btn-next-question').classList.add('hidden');
}

function selectAnswer(chosenIdx) {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const questions = getQuestions(sceneIdx); const q = questions[STATE.questionIdx];
  document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; b.style.cursor = 'default'; });
  const isCorrect = chosenIdx === q.correct; const pts = isCorrect ? q.pts : 0;
  const chosenBtn = $(`opt-${chosenIdx}`);
  if (isCorrect) { chosenBtn.classList.add('selected-correct'); playSuccess(); }
  else { chosenBtn.classList.add('selected-wrong'); $(`opt-${q.correct}`).classList.add('revealed-correct'); playError(); }
  if (isCorrect) { STATE.score += pts; STATE.sceneScore += pts; $('score-display').textContent = STATE.score; }
  const fb = $('feedback-box'); fb.className = `feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}`;
  $('feedback-status').textContent = isCorrect ? '✓ CORRECTO' : '✗ INCORRECTO';
  $('feedback-points').textContent = isCorrect ? `+${pts} PTS` : '+0 PTS';
  $('feedback-body').innerHTML = q.fb;
  const cn = $('custody-notice');
  if (q.custody) { cn.textContent = q.custody; cn.style.display = 'block'; STATE.custodyLog.push({ scene: SCENES[sceneIdx].title, phase: q.phase, text: q.custody, correct: isCorrect, timestamp: new Date().toLocaleTimeString('es-AR', { hour12:false }) }); }
  else cn.style.display = 'none';
  STATE.questionsAnswered.push({ scene: SCENES[sceneIdx].title, phase: q.phase, isCorrect, pts });
  $('btn-next-question').classList.remove('hidden');
}

function nextQuestion() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  STATE.questionIdx++;
  if (STATE.questionIdx >= getQuestions(sceneIdx).length) showSceneResult(); else renderQuestion();
}

// ──────────────────────────────────────────────
//  RESULTS
// ──────────────────────────────────────────────
function showSceneResult() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  const questions = getQuestions(sceneIdx);
  const maxPts = questions.length * (STATE.difficulty === 'experto' ? 20 : 10);
  const correct = STATE.questionsAnswered.filter(q => q.scene === scene.title && q.isCorrect).length;
  STATE.scenesResults.push({ sceneId: scene.id, sceneNum: scene.num, sceneTitle: scene.title, correct, pts: STATE.sceneScore, maxPts, diff: STATE.difficulty });
  $('result-scene-title').textContent = `📋 Resultado — ${scene.title}`;
  $('result-scene-score').textContent = STATE.sceneScore;
  $('result-scene-max').textContent = maxPts;
  $('result-total-score').textContent = STATE.score;
  const area = $('result-checklist-area');
  const sceneAnswers = STATE.questionsAnswered.filter(q => q.scene === scene.title);
  area.innerHTML = `<h3 style="font-family:var(--font-mono); color:var(--color-cyan-bright); font-size:0.88rem; text-transform:uppercase; margin-bottom:0.85rem;">Resumen</h3><div class="checklist-items-grid">${sceneAnswers.map(a => `<div class="check-item"><span style="font-size:1.2rem;">${a.isCorrect ? '✅' : '❌'}</span><div><div style="font-weight:700; font-size:0.88rem; color:#fff;">${a.phase}</div><div style="font-size:0.78rem; color:var(--text-muted);">${a.isCorrect ? `+${a.pts} pts` : 'Sin puntuación'}</div></div></div>`).join('')}</div>`;
  const hasMore = STATE.sceneQueueIdx < STATE.selectedScenes.length - 1;
  const nextBtn = $('btn-next-scene');
  if (hasMore) { nextBtn.textContent = 'Siguiente Caso →'; nextBtn.style.display = 'inline-flex'; }
  else { nextBtn.textContent = 'Ver Dictamen Final →'; nextBtn.onclick = () => showFinalReport(); }
  goToScreen('resultado');
}

function loadNextScene() {
  STATE.sceneQueueIdx++;
  if (STATE.sceneQueueIdx < STATE.selectedScenes.length) { loadCurrentScene(); goToScreen('preguntas'); }
  else showFinalReport();
}

// ──────────────────────────────────────────────
//  FINAL REPORT
// ──────────────────────────────────────────────
function showFinalReport() {
  const totalPts = STATE.score;
  const totalPossible = STATE.scenesResults.reduce((acc, r) => acc + r.maxPts, 0);
  const pct = totalPossible > 0 ? Math.round((totalPts / totalPossible) * 100) : 0;
  $('final-total-pts').textContent = totalPts; $('final-max-pts').textContent = totalPossible;
  $('dictamen-date').textContent = new Date().toLocaleString('es-AR', { dateStyle:'full', timeStyle:'short' });
  $('dictamen-expediente').textContent = `DET-${new Date().getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
  setTimeout(() => { $('final-pct-bar').style.width = pct + '%'; $('final-pct-label').textContent = pct + '%'; }, 400);
  const ranks = [
    { min:0, icon:'🔰', name:'Agente en Formación', desc:'Necesitas reforzar los fundamentos.' },
    { min:40, icon:'🥉', name:'Detective de Homicidios', desc:'Dominas lo básico pero fallas en lo complejo.' },
    { min:60, icon:'🥈', name:'Detective Senior', desc:'Sólido conocimiento procedimental.' },
    { min:75, icon:'🥇', name:'Jefe de Unidad Forense', desc:'Excelente desempeño.' },
    { min:90, icon:'🏆', name:'Inspector Jefe · Élite', desc:'Rendimiento sobresaliente.' }
  ];
  const rank = ranks.reverse().find(r => pct >= r.min) || ranks[0]; ranks.reverse();
  $('final-rank-icon').textContent = rank.icon; $('final-rank-name').textContent = rank.name; $('final-rank-desc').textContent = rank.desc;
  const tbody = $('final-scene-tbody');
  tbody.innerHTML = STATE.scenesResults.map(r => `<tr><td style="font-family:var(--font-mono); color:var(--color-cyan);">CASO ${r.sceneNum}</td><td style="font-weight:700; color:#fff;">${r.sceneTitle}</td><td><span style="font-family:var(--font-mono); font-size:0.8rem; padding:0.2rem 0.5rem; border-radius:4px; background:${r.diff==='experto'?'rgba(168,85,247,0.2)':'rgba(249,115,22,0.2)'}; color:${r.diff==='experto'?'#a855f7':'#f97316'};">${r.diff.toUpperCase()}</span></td><td style="font-family:var(--font-mono); color:${r.correct===5?'var(--color-success)':r.correct>=3?'var(--color-yellow)':'var(--color-danger)'};">${r.correct}/5</td><td style="font-family:var(--font-mono); font-weight:800; color:var(--color-yellow-bright);">${r.pts}/${r.maxPts}</td></tr>`).join('');
  goToScreen('dictamen'); playSuccess();
}

// ──────────────────────────────────────────────
//  RESET & MODALS
// ──────────────────────────────────────────────
function resetSimulator() {
  STATE.selectedScenes = []; STATE.difficulty = null; STATE.sceneQueueIdx = 0; STATE.questionIdx = 0; STATE.score = 0; STATE.sceneScore = 0; STATE.scenesResults = []; STATE.custodyLog = []; STATE.questionsAnswered = [];
  $('score-display').textContent = '0'; $('diff-badge-header').style.display = 'none'; $('active-case-label').textContent = 'SISTEMA ACTIVO';
  document.querySelectorAll('.scene-select-card').forEach(c => c.classList.remove('selected')); updateScenesCounter(); goToScreen('portada'); playClick();
}

function openCustodyModal() {
  $('custody-modal').classList.remove('hidden');
  $('custody-folio-label').textContent = `Folio: FOCAD-${new Date().getFullYear()}-${Math.floor(Math.random()*900+100)}`;
  const list = $('custody-entries-list');
  if (STATE.custodyLog.length === 0) { list.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">📋 Sin registros aún.</div>`; return; }
  list.innerHTML = STATE.custodyLog.map((e,i) => `<div class="custody-entry-card ${e.correct?'sealed':''}"><div style="display:flex; justify-content:space-between;"><span style="font-family:var(--font-mono); font-weight:800; color:${e.correct?'var(--color-success)':'var(--color-danger)'};">${e.correct?'✅':'⚠️'} ENTRADA N° ${String(i+1).padStart(3,'0')}</span></div><div class="custody-meta-grid"><span>🏷️ ${e.scene}</span><span>📋 ${e.phase}</span><span>⏰ ${e.timestamp}</span></div><div style="font-size:0.88rem; color:var(--text-sub); font-family:var(--font-mono);">${e.text}</div></div>`).join('');
}
function closeCustodyModal() { $('custody-modal').classList.add('hidden'); }

function openToolsModal() {
  const grid = $('tools-kit-grid');
  const kit = [{icon:'📷',name:'Cámara DSLR Macro',phase:'Fotografía',desc:'Full frame, macro 100mm, escala ABFO.'},{icon:'🔦',name:'Luz ALS Forense',phase:'Inspección',desc:'450nm/530nm para huellas y fibras.'},{icon:'🖐️',name:'Kit de Polvo Dactilar',phase:'Huellas',desc:'Polvo magnético y cinta lifting.'},{icon:'🧬',name:'Kit de ADN de Campo',phase:'Biología',desc:'Hisopos estériles DNA-free.'},{icon:'🔺',name:'Embalajes Forenses',phase:'Custodia',desc:'Bolsas kraft, glassine, cajas rígidas.'},{icon:'🔒',name:'Sellos Tamper-Evident',phase:'Cadena',desc:'Precintos VOID numerados.'},{icon:'📋',name:'Formularios FOCAD',phase:'Documentación',desc:'FOCAD-07, 08, 09.'},{icon:'🧪',name:'Reactivos de Campo',phase:'Química',desc:'Luminol, Kastle-Meyer.'},{icon:'👣',name:'Kit de Vaciado',phase:'Huellas',desc:'Yeso dental Clase III.'},{icon:'🛡️',name:'EPP Personal',phase:'Protección',desc:'Guantes nitrilo, mono Tyvek.'}];
  grid.innerHTML = kit.map(t => `<div style="background:#060d1a; border:1px solid var(--border-tactical); border-radius:8px; padding:0.95rem; display:flex; gap:0.75rem;"><span style="font-size:1.8rem;">${t.icon}</span><div><div style="font-weight:800; color:#fff;">${t.name}</div><div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--color-cyan);">FASE: ${t.phase}</div><div style="font-size:0.82rem; color:var(--text-muted);">${t.desc}</div></div></div>`).join('');
  $('tools-modal').classList.remove('hidden');
}
function closeToolsModal() { $('tools-modal').classList.add('hidden'); }

// ──────────────────────────────────────────────
//  CHATBOT
// ──────────────────────────────────────────────
let chatOpen = false;
function toggleChat() {
  chatOpen = !chatOpen; $('chat-window').classList.toggle('open', chatOpen);
  if (chatOpen && $('chat-body').children.length === 0) {
    addChatMsg('bot', '🤖 <strong>Inspector Detective IA en línea.</strong><br>Soy tu asistente táctico forense. ¿En qué te asesoro?');
  }
  playTick();
}
function addChatMsg(type, html) { const b = $('chat-body'); const m = document.createElement('div'); m.className = `chat-msg ${type}`; m.innerHTML = html; b.appendChild(m); b.scrollTop = b.scrollHeight; }
function askChat(q) { if (!chatOpen) toggleChat(); addChatMsg('user', q); setTimeout(() => addChatMsg('bot', '🔍 Procesando consulta forense... En un caso real, siempre prioriza la protección de la escena y la cadena de custodia.'), 500); }
function openChatWithMessage(m) { if (!chatOpen) toggleChat(); setTimeout(() => { addChatMsg('user', m); setTimeout(() => addChatMsg('bot', '📋 El simulador te permite elegir escenas, dificultad y analizar evidencia. Usa el maletín en la Escena 3D para interactuar.'), 600); }, 300); }
function sendChatMessage() { const i = $('chat-input'); const t = i.value.trim(); if (!t) return; addChatMsg('user', t); i.value = ''; setTimeout(() => addChatMsg('bot', '🔍 Consulta registrada. Revisa los protocolos de cadena de custodia.'), 600); }

// ──────────────────────────────────────────────
//  ESCENA 3D
// ──────────────────────────────────────────────
const SCENE_3D_STATE = { collectedEvidence: [] };

function dragTool(event) { event.dataTransfer.setData("text/plain", event.target.closest('.tool-item').dataset.tool); playTick(); }
function moveHandTo(x, y) { const h = document.getElementById('interactive-hand'); if (h) { h.style.left = x+'px'; h.style.top = y+'px'; h.style.opacity = '1'; setTimeout(() => h.style.opacity = '0', 600); } }

function useTool(tool, x, y) {
  const infoTitle = document.getElementById('info-title'); const infoText = document.getElementById('info-text');
  const container = document.getElementById('scene3d-container'); if (!container) return;
  const rect = container.getBoundingClientRect();
  const elements = document.elementsFromPoint(x + rect.left, y + rect.top);
  let target = null;
  for (let el of elements) { if (el.classList.contains('scene-object')) { target = el; break; } }
  if (target) {
    const name = target.querySelector('.object-label')?.textContent || 'Objeto';
    let msg = '';
    if (tool === 'lupa') msg = `🔍 Analizas ${name} con lupa. Encuentras partículas de pólvora.`;
    else if (tool === 'hisopo') msg = `🧬 Tomas muestra de ${name}. Luminol positivo.`;
    else if (tool === 'polvo') msg = `🖐️ Aplicas polvo en ${name}. Huella latente revelada.`;
    else msg = `📷 Fotografías ${name} con escala métrica.`;
    SCENE_3D_STATE.collectedEvidence.push({ tool, target: name });
    infoTitle.textContent = `🔬 Análisis: ${name}`; infoText.textContent = msg;
    playSuccess(); target.style.transform = 'scale(1.2)'; setTimeout(() => target.style.transform = 'scale(1)', 300);
  } else {
    infoTitle.textContent = `🔬 Herramienta: ${tool}`; infoText.textContent = `Suelta la herramienta justo encima de un objeto.`;
    playError();
  }
}

function inspectCadaver(event) {
  event.stopPropagation();
  document.getElementById('info-title').textContent = '🩸 Inspección del Cadáver';
  document.getElementById('info-text').textContent = 'Herida de bala en torso. Sangre acumulada. Salpicaduras indican disparo a corta distancia.';
  playSuccess();
  const c = document.getElementById('cadaver'); if (c) { c.style.filter = 'brightness(1.3)'; setTimeout(() => c.style.filter = 'brightness(1)', 500); }
}

function inspectObject(id, event) {
  event.stopPropagation();
  const el = document.getElementById(`obj-${id}`);
  const name = el?.querySelector('.object-label')?.textContent || id;
  const desc = { weapon:'🔫 Arma de fuego 9mm.', phone:'📱 Teléfono bloqueado.', glass:'🥃 Vaso roto.', shell:'💊 Vaina 9mm.', footprint:'👣 Huella talla 42-43.' };
  document.getElementById('info-title').textContent = `🔎 ${name}`;
  document.getElementById('info-text').textContent = desc[id] || 'Objeto forense.';
  playSuccess(); el.style.transform = 'scale(1.15)'; setTimeout(() => el.style.transform = 'scale(1)', 300);
}

function reset3DScene() {
  SCENE_3D_STATE.collectedEvidence = [];
  document.querySelectorAll('.evidence-marker').forEach(m => m.style.display = 'none');
  document.querySelectorAll('.scene-object').forEach(o => o.style.transform = 'scale(1)');
  document.getElementById('info-title').textContent = '🔎 Esperando acción...';
  document.getElementById('info-text').textContent = 'Haz clic en un objeto o arrastra una herramienta.';
  playClick();
}

function finish3DInvestigation() {
  const n = SCENE_3D_STATE.collectedEvidence.length;
  if (n === 0) { document.getElementById('info-title').textContent = '⚠️ Incompleto'; document.getElementById('info-text').textContent = 'No has recolectado evidencia.'; playError(); return; }
  document.getElementById('info-title').textContent = '✅ Análisis Finalizado';
  document.getElementById('info-text').textContent = `Has recolectado ${n} evidencias. Procede al cuestionario.`;
  playSuccess();
  setTimeout(() => { if (STATE.selectedScenes.length === 0) STATE.selectedScenes = [1]; goToScreen('escena'); }, 2000);
}

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSceneSelectGrid();
  $('btn-custody-open').addEventListener('click', openCustodyModal);
  $('btn-tools-open').addEventListener('click', openToolsModal);
  $('btn-print').addEventListener('click', () => window.print());
  $('custody-modal').addEventListener('click', e => { if (e.target === $('custody-modal')) closeCustodyModal(); });
  $('tools-modal').addEventListener('click', e => { if (e.target === $('tools-modal')) closeToolsModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCustodyModal(); closeToolsModal(); }
    if (['1','2','3','4'].includes(e.key) && $('view-preguntas').classList.contains('active')) {
      const btn = $(`opt-${parseInt(e.key)-1}`); if (btn && !btn.disabled) btn.click();
    }
  });
  const container = document.getElementById('scene3d-container');
  if (container) {
    container.addEventListener('dragover', e => e.preventDefault());
    container.addEventListener('drop', e => {
      e.preventDefault();
      const tool = e.dataTransfer.getData("text/plain");
      if (!tool) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      moveHandTo(x, y); useTool(tool, x, y);
    });
  }
  document.querySelectorAll('.evidence-marker').forEach(m => m.style.display = 'none');
  
  // Aplicar fallback a las imágenes de la portada
  document.querySelectorAll('.preview-card-img').forEach(img => {
    img.onerror = function() {
      this.onerror = null;
      const sceneTitle = this.dataset.scene || 'Escena Forense';
      this.src = generateForensicPlaceholder(sceneTitle.toUpperCase(), sceneTitle, this.src);
    };
  });
});