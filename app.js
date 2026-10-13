/* ============================================================
   SIMULADOR TÁCTICO DE INVESTIGACIÓN CRIMINAL — app.js
   Detective Edition 2026 · Escenas + Dificultad + Imágenes
   ============================================================ */

'use strict';

// ──────────────────────────────────────────────
//  GAME STATE
// ──────────────────────────────────────────────
const STATE = {
  selectedScenes: [],      // índices de escenas elegidas
  difficulty: null,        // 'dificil' | 'experto'
  sceneQueueIdx: 0,        // posición actual en selectedScenes
  questionIdx: 0,          // pregunta actual dentro de la escena
  score: 0,                // puntaje total
  sceneScore: 0,           // puntaje de la escena en curso
  scenesResults: [],       // {sceneId, sceneTitle, correct, pts, maxPts, diff}
  custodyLog: [],          // registro de cadena de custodia
  questionsAnswered: [],   // {text, correct, chosenIdx, correctIdx}
};

// ──────────────────────────────────────────────
//  SCENES DATA
// ──────────────────────────────────────────────
const SCENES = [
  {
    id: 'caso01',
    num: '01',
    title: 'Robo en Residencia',
    subtitle: 'Ingreso forzado · Huellas latentes · Evidencia biológica',
    img: 'assets/burglary.png',
    color: '#f59e0b',
    phases: ['Inspección Ocular','Recolección de Evidencia','Embalaje','Cadena de Custodia','Sellado Final'],
    dificil: [
      {
        phase: 'FASE 1 · FOTOGRAFÍA FORENSE',
        text: 'Al llegar a la escena del robo observas una huella dactilar latente en el vidrio de la ventana forzada. ¿Cuál es el protocolo fotográfico correcto antes de iniciar el revelado?',
        img: { type:'canvas', scene:'burglary', focus:'fingerprint', label:'Huella Dactilar Latente', sublabel:'Vidrio de ventana — Inspección Ocular' },
        opts: [
          'Fotografiar la huella con flash directo y sin escala métrica.',
          'Tomar tres disparos: plano general de la escena, plano medio del área y macro 1:1 a 90° con escala ABFO.',
          'Fotografiar únicamente con luz natural para no alterar el indicio.',
          'Filmar en video primero y luego capturar una foto de referencia.'
        ],
        correct: 1,
        fb: '<strong>Protocolo fotográfico en tres tiempos:</strong> El estándar forense requiere: (1) plano general para situar el indicio en la escena, (2) plano medio para contexto inmediato, y (3) macro 1:1 a 90° con escala ABFO colocada en el mismo plano focal para registro métrico fiel. El flash lateral a 45° puede usarse para revelar huellas en superficie no porosa, pero jamás sin escala métrica.',
        custody: '📸 Fotografía forense registrada — folio FOCAD-A1. Indicio N° 001 documentado en tres planos.',
        pts: 10
      },
      {
        phase: 'FASE 2 · REVELADO DE HUELLAS',
        text: 'La huella dactilar está sobre la hoja de aluminio de la ventana (superficie no porosa). ¿Qué técnica de revelado es la más adecuada y por qué?',
        img: { type:'canvas', scene:'burglary', focus:'powder', label:'Revelado con Polvo Magnético', sublabel:'Superficie no porosa — Aluminio' },
        opts: [
          'Ninhidrina en spray, porque reacciona con aminoácidos del sudor.',
          'Polvo magnético negro con aplicador de vara magnética, sin contacto de cerdas con la superficie.',
          'Vapores de cianocrilato en cámara sellada, seguido de rodamina 6G.',
          'Solución DFO bajo luz ALS, porque el aluminio es fluorescente.'
        ],
        correct: 1,
        fb: '<strong>Polvo magnético en superficies no porosas metálicas:</strong> La ninhidrina y el DFO reaccionan con aminoácidos, pero son técnicas para sustratos porosos (papel, cartón). El cianocrilato es excelente pero requiere laboratorio. En campo, sobre superficies no porosas lisas como aluminio, el polvo magnético negro con vara magnética es la primera elección porque no hay contacto mecánico que distorsione la huella. El rodamina 6G se aplica DESPUÉS del cianocrilato para fluorescencia.',
        custody: '🔍 Revelado físico realizado — Polvo magnético negro. Indicio N° 001 levantado con cinta adhesiva forense.',
        pts: 10
      },
      {
        phase: 'FASE 3 · EVIDENCIA BIOLÓGICA',
        text: 'En la cocina detectas una mancha oscura seca sobre el piso de madera. La prueba de Luminol dio resultado positivo. ¿Cómo recolectas correctamente la muestra para análisis de ADN?',
        img: { type:'canvas', scene:'burglary', focus:'blood', label:'Mancha Biológica Seca', sublabel:'Piso de madera — Prueba Luminol Positivo' },
        opts: [
          'Raspar toda la mancha con un bisturí estéril y depositar en frasco de plástico hermético.',
          'Aplicar la técnica de doble hisopo: primer hisopo humedecido con agua estéril para rehidratar, segundo hisopo seco para absorber la muestra.',
          'Recortar el fragmento de madera completo y embalarlo en bolsa plástica hermética con silica gel.',
          'Aplicar el hisopo directamente en seco sin humectar para preservar la muestra en la fibra.'
        ],
        correct: 1,
        fb: '<strong>Técnica del doble hisopo (doble swab):</strong> El protocolo estándar para manchas biológicas secas en superficies no porosas o semi-porosas incluye: (1) hisopo N°1 humedecido con agua bidestilada estéril para rehidratar y disolver células, (2) hisopo N°2 seco aplicado inmediatamente para absorber la solución celular. Esto maximiza la recuperación de ADN. Embalar en sobre de papel permeable para que la humedad residual no genere hongos que degraden el ADN.',
        custody: '🧬 Muestra biológica colectada — Técnica doble hisopo. Indicio N° 002 refrigerado a 4°C. Cadena de frío iniciada.',
        pts: 10
      },
      {
        phase: 'FASE 4 · EMBALAJE DE VIDRIOS',
        text: 'Debes levantar fragmentos de vidrio del marco de la ventana rota para estudio de correlación física. ¿Cuál es el embalaje correcto?',
        img: { type:'canvas', scene:'burglary', focus:'glass', label:'Fragmentos de Vidrio', sublabel:'Correlación física — Marco de ventana forzada' },
        opts: [
          'Recolectar todos los fragmentos juntos en una bolsa plástica con cierre zip.',
          'Envolver cada fragmento individualmente en papel kraft y empacarlos en caja rígida con relleno protector, sin que se toquen entre sí.',
          'Envolver los fragmentos en papel de aluminio para preservar huellas latentes residuales.',
          'Colocar todos los fragmentos en frasco de vidrio con tapa de rosca, precintado.'
        ],
        correct: 1,
        fb: '<strong>Embalaje de fragmentos vítreos para correlación física:</strong> Los vidrios fracturados pueden correlacionarse físicamente (jigsaw fit) para reconstruir la dirección del golpe y el mecanismo del ingreso. Para esto, cada fragmento debe embalarse individualmente en papel kraft —nunca juntos— para evitar que nuevas fracturas artificiales comprometan la correlación. La caja rígida con relleno EPS previene el movimiento y nuevas rupturas durante el transporte.',
        custody: '🔺 Vidrios fracturados embalados — 7 fragmentos individuales en caja rígida. Indicio N° 003. Correlación física posible.',
        pts: 10
      },
      {
        phase: 'FASE 5 · SELLADO Y ENTREGA',
        text: 'Una vez embaladas todas las evidencias, ¿cuál es el procedimiento correcto para sellar y transferir la custodia al laboratorio forense?',
        img: { type:'canvas', scene:'burglary', focus:'seal', label:'Sellado de Evidencias', sublabel:'Cadena de Custodia — Transferencia a Laboratorio' },
        opts: [
          'Firmar únicamente la planilla de recepción del laboratorio al momento de la entrega.',
          'Aplicar cinta adhesiva común sobre los embalajes y entregarlos sin firma adicional.',
          'Colocar precinto inviolable (tamper-evident) cruzando la solapa, firmar con pluma permanente sobre el precinto y el embalaje, completar el formulario FOCAD-07 con horario, temperatura y nombre del destinatario antes de cada transferencia.',
          'Sellar con cera lacre y rubricar solo al finalizar el turno de guardia.'
        ],
        correct: 2,
        fb: '<strong>Sellado y transferencia de custodia:</strong> El principio rector es la "continuidad de custodia" (chain of custody). Cada transferencia debe documentarse de forma que cualquier intermediario pueda ser identificado. El precinto tamper-evident revela manipulación posterior. La firma cruzando precinto y embalaje garantiza que el sello no fue movido. El FOCAD-07 es el formulario oficial de transferencia con: horario, temperatura ambiente, identificación del destinatario y descripción del estado del embalaje.',
        custody: '🔒 Sellos tamper-evident aplicados. Formulario FOCAD-07 completado. Cadena de custodia cerrada para Caso 01.',
        pts: 10
      }
    ],
    experto: [
      {
        phase: 'FASE 1 · FOTOGRAFÍA AVANZADA',
        text: 'La huella dactilar está sobre la manija curva de la ventana. El relieve de la superficie introduce distorsión de perspectiva. ¿Qué técnica supera las limitaciones de la fotografía ortogonal convencional en este caso?',
        img: { type:'canvas', scene:'burglary', focus:'fingerprint', label:'Superficie Curva — Distorsión de Perspectiva', sublabel:'Análisis avanzado de impresión digital' },
        opts: [
          'Incrementar la resolución de la cámara a 42 megapíxeles y usar objetivo macro 100mm f/2.8.',
          'Aplicar Reflectance Transformation Imaging (RTI) con domo de LED multipunto para reconstruir el relieve en post-proceso.',
          'Utilizar iluminación coaxial axial (collinear) con flash de anillo para eliminar sombras de la curvatura.',
          'Fotografiar desde 6 ángulos distintos a 60° cada uno y fusionar por software HDR para neutralizar la distorsión.'
        ],
        correct: 1,
        fb: '<strong>RTI (Reflectance Transformation Imaging):</strong> Es la técnica más avanzada para superficies con relieve complejo. Un domo semiesférico con múltiples LEDs ilumina la huella desde diferentes ángulos secuencialmente. El software (PTM/HSH) reconstruye matemáticamente la geometría superficial a nivel de micras, revelando minucias que la fotografía convencional pierde. La iluminación coaxial elimina sombras pero no resuelve la distorsión geométrica 3D. El HDR mejora el rango dinámico, no la geometría.',
        custody: '📸 RTI realizado — 64 capturas multipunto. Mapa de relieve superficial generado. Indicio N° 001.',
        pts: 20
      },
      {
        phase: 'FASE 2 · REVELADO COMPLEJO',
        text: 'Detectas una huella de interés sobre cartón corrugado poroso y húmedo. Además, hay una segunda huella superpuesta en el mismo punto. ¿Cuál es la secuencia de tratamientos que maximiza la diferenciación de ambas huellas?',
        img: { type:'canvas', scene:'burglary', focus:'powder', label:'Huellas Superpuestas — Sustrato Poroso Húmedo', sublabel:'Protocolo secuencial de revelado' },
        opts: [
          'DFO → Ninhidrina → 1,8-Diazafluoren-9-one → Physical Developer (PD) en secuencia decreciente de agresividad.',
          'Small Particle Reagent (SPR) → Cianocrilato en frío → Rodamina 6G para discriminar huellas por florescencia diferencial.',
          'Physical Developer (PD) → DFO bajo ALS 490nm → Ninhidrina con calor seco para cada huella por amino acid profiling.',
          'Ninhidrina caliente → DFO → Physical Developer (PD) → cuantificación de pépticos en fluorescencia diferencial a 530nm.'
        ],
        correct: 0,
        fb: '<strong>Secuencia multi-reactivo para poroso húmedo:</strong> El principio es ir de lo menos destructivo a lo más destructivo, preservando materia para siguiente etapa. DFO (reacción con aminoácidos, fluorescencia 570nm) es la primera elección en húmedo; luego Ninhidrina (reacciona con grupos amino que DFO no agotó); después 1,8-Diazafluoren-9-one para huellas más antiguas. El Physical Developer actúa sobre grasas no solubles en agua, es la última etapa porque destruye las anteriores. Esta secuencia permite detectar huellas de distintas personas que usan diferentes sudores (sebáceo vs. acuoso).',
        custody: '🔬 Revelado secuencial realizado — 4 técnicas aplicadas. Dos perfiles distintos identificados en el indicio.',
        pts: 20
      },
      {
        phase: 'FASE 3 · DEGRADACIÓN DE ADN',
        text: 'La mancha biológica tiene 6 semanas de antigüedad y estuvo expuesta a rayos UV directos. El extractor reporta baja concentración de ADN (< 0.1 ng/µL) y degradación moderada. ¿Qué estrategia analítica tiene mayor probabilidad de generar un perfil STR completo?',
        img: { type:'canvas', scene:'burglary', focus:'blood', label:'ADN Degradado — Baja Concentración', sublabel:'Muestra antigua expuesta a UV — Estrategia analítica' },
        opts: [
          'Amplificar directamente con kit PowerPlex Fusion 6C (27 loci) usando 30 ciclos de PCR.',
          'Pre-amplificar con Whole Genome Amplification (WGA) para aumentar la cantidad de molde antes del STR.',
          'Aplicar kit MiniFiler (8 loci con amplicons < 200 pb) diseñado para ADN degradado, más SurvivorTM o DNA IQ para limpieza previa.',
          'Secuenciar directamente con NGS (Next Generation Sequencing) el ADN mitocondrial del bucle control D-loop.'
        ],
        correct: 2,
        fb: '<strong>MiniFiler para ADN degradado:</strong> Cuando el ADN está degradado, las cadenas largas están fragmentadas. Los amplicons grandes (> 400 pb de PowerPlex Fusion) simplemente no amplificarán. MiniFiler usa primers que generan amplicons < 200 pb, diseñados específicamente para trabajar con fragmentos cortos. El WGA amplifica indiscriminadamente ADN muy degradado o dañado, introduciendo artefactos. El NGS de ADN mitocondrial es útil pero no permite individualización (es matrilineal). La combinación MiniFiler + limpieza IQ/Survivor maximiza el rendimiento.',
        custody: '🧬 Muestra enviada a lab genética con nota de degradación. Kit MiniFiler autorizado. Indicio N° 002.',
        pts: 20
      },
      {
        phase: 'FASE 4 · ÍNDICE REFRACTIVO',
        text: 'Quieres determinar si los 7 fragmentos de vidrio provienen de la misma hoja original. ¿Qué análisis instrumental es el más específico para determinar homogeneidad composicional y origen común?',
        img: { type:'canvas', scene:'burglary', focus:'glass', label:'Análisis Composicional de Vidrio', sublabel:'Determinación de origen común — SEM-EDS y RI' },
        opts: [
          'Medición del Índice de Refracción (RI) por método GRIM3 con control de temperatura ±0.001°C.',
          'SEM-EDS para análisis elemental semicuantitativo de óxidos (SiO₂, Na₂O, CaO, MgO, Al₂O₃).',
          'LA-ICP-MS (ablación láser acoplada a ICP-MS) para perfilado elemental traza multielementar de 40+ elementos.',
          'Espectroscopía Raman confocal para análisis de tensión residual en la red amorfa del silicato.'
        ],
        correct: 2,
        fb: '<strong>LA-ICP-MS como gold standard en vidrios forenses:</strong> El RI (GRIM3) distingue vidrios de composición similar pero no diferencia lotes de la misma fábrica. El SEM-EDS es semicuantitativo y solo detecta elementos mayoritarios. La Raman mide tensión estructural, útil para tipo de vidrio (recocido vs. templado) pero no para origen. LA-ICP-MS con 40+ elementos traza (Ba, Sr, Zr, Ce, La, REE...) tiene un poder discriminante > 99.99% para distinguir vidrios del mismo fabricante con diferente lote de producción, que es exactamente lo requerido.',
        custody: '🔺 Fragmentos enviados a espectrometría LA-ICP-MS. 7 muestras + 1 control de vidrio del mercado. Indicio N° 003.',
        pts: 20
      },
      {
        phase: 'FASE 5 · RUPTURA DE CADENA',
        text: 'Al revisar el formulario FOCAD-07, detectas que una de las transferencias no tiene la firma del receptor, creando un vacío documental de 3 horas. La defensa solicita la exclusión de toda la evidencia. ¿Cuál es la respuesta procesal correcta?',
        img: { type:'canvas', scene:'burglary', focus:'seal', label:'Ruptura Documental — Cadena de Custodia', sublabel:'Vacío de 3 horas en registro de transferencia' },
        opts: [
          'La evidencia es automáticamente inadmisible porque la cadena de custodia tiene un eslabón roto.',
          'Solicitar un affidávit del personal de laboratorio que recibió la evidencia, acompañado del registro de acceso electrónico al laboratorio (bitácora de entrada), para restaurar la trazabilidad del período no documentado.',
          'La única solución es repetir toda la recolección de evidencia desde la escena del crimen.',
          'Presentar un peritaje independiente nuevo para reemplazar la evidencia contaminada por el vacío documental.'
        ],
        correct: 1,
        fb: '<strong>Sanación de la cadena de custodia:</strong> En la mayoría de los sistemas procesales modernos (incluyendo sistemas latinoamericanos con Código Procesal Penal adversarial), una omisión documental aislada no es causal automática de inadmisibilidad. El principio es la "integridad de la evidencia". Si se puede demostrar por otros medios (affidávit, registros biométricos de acceso, CCTV del laboratorio, auditoría de temperatura de la cámara frigorífica) que la evidencia no fue manipulada durante ese período, el juez puede decidir admitirla con la explicación correspondiente. La defensa deberá demostrar manipulación real, no meramente la posibilidad teórica de la misma.',
        custody: '⚠️ ALERTA CADENA: Vacío documental detectado. Affidávit iniciado. Bitácora electrónica solicitada al laboratorio.',
        pts: 20
      }
    ]
  },
  {
    id: 'caso02',
    num: '02',
    title: 'Homicidio en Parque',
    subtitle: 'Cadáver en exterior · Arma blanca · Pisadas en barro',
    img: 'assets/homicide_park.png',
    color: '#ef4444',
    phases: ['Acordonamiento','Pisadas','Arma Blanca','Evidencia Biológica','Levantamiento de Cadáver'],
    dificil: [
      {
        phase: 'FASE 1 · ACORDONAMIENTO',
        text: 'Al llegar al parque encuentras el cadáver sobre el césped húmedo. Es una zona de libre acceso y ya hay curiosos. ¿Cuál es la primera acción táctica correcta?',
        img: { type:'canvas', scene:'homicide', focus:'cordon', label:'Acordonamiento Perimetral', sublabel:'Zona exterior — Área pública con acceso libre' },
        opts: [
          'Examinar inmediatamente el cadáver para determinar la causa de muerte.',
          'Establecer triple acordonamiento: zona de exclusión interna, zona de tránsito forense y zona de contención de curiosos, priorizando la protección de huellas en el suelo húmedo.',
          'Entrevistar a los testigos presentes antes de acordonar la escena.',
          'Documentar el cadáver con fotografías y luego acordonar.'
        ],
        correct: 1,
        fb: '<strong>Triple acordonamiento en escena exterior:</strong> La secuencia correcta es PRIMERO PROTEGER, LUEGO DOCUMENTAR. En suelo húmedo, cada segundo suma pisadas de contaminación. El triple cordón es: (1) cinta interna que circunda solo el cadáver y las evidencias críticas; (2) cinta de tránsito para personal forense autorizado; (3) cinta exterior para contención de curiosos y prensa. Solo se establece un punto de entrada/salida único documentado. Las entrevistas son importantes pero posteriores a la protección del suelo.',
        custody: '🚨 Acordonamiento establecido — Triple perímetro. Acceso controlado. Registro de ingreso de personal iniciado.',
        pts: 10
      },
      {
        phase: 'FASE 2 · IMPRESIONES DE CALZADO',
        text: 'Encuentras huellas de calzado profundas en el barro cerca del cadáver. El parte meteorológico indica lluvia en 40 minutos. ¿Cuál es el protocolo correcto de conservación antes del vaciado?',
        img: { type:'canvas', scene:'homicide', focus:'footprint', label:'Huellas de Calzado en Barro', sublabel:'Condición urgente — Lluvia en 40 minutos' },
        opts: [
          'Vaciar directamente con yeso París sin tratamiento previo de la huella.',
          'Fotografiar, aplicar spray fijador de laca a 30cm de distancia a 45°, aguardar 60 segundos y vaciar con yeso dental piedra Clase III (tipo dental stone) a razón de 350g/100mL de agua.',
          'Cubrir las huellas con una lámina plástica transparente para protegerlas de la lluvia.',
          'Levantar el barro completo con espátula y embalarlo para vaciado en laboratorio.'
        ],
        correct: 1,
        fb: '<strong>Protocolo de vaciado de huellas en barro húmedo:</strong> La laca fijadora estabiliza las paredes de la huella antes del vaciado, evitando que el yeso al verterse desmorone los bordes. El yeso dental piedra Clase III (hemihydrato β) es el estándar porque logra una dureza Shore A de 80+ y reproduce detalles < 0.5mm. El yeso París común es más blando y menos fiel. El plástico acumula agua y destruye la huella. Levantar el barro sin vaciado previo destruye la impresión 3D. Tiempo de fraguado: 30-45 minutos.',
        custody: '👣 Vaciado en yeso dental Clase III realizado — 3 huellas. Fotografía métrica previa. Indicio N° 004-006.',
        pts: 10
      },
      {
        phase: 'FASE 3 · ARMA BLANCA',
        text: 'Identificas un cuchillo de cocina con posibles manchas de sangre en la hoja y posibles huellas en el mango. ¿Cuál es el método correcto de embalaje que preserva AMBAS evidencias simultáneamente?',
        img: { type:'canvas', scene:'homicide', focus:'knife', label:'Cuchillo con Manchas de Sangre', sublabel:'Evidencia dual — Huellas y ADN en el mismo objeto' },
        opts: [
          'Embolsar el cuchillo en bolsa plástica ziplock para preservar la sangre de contaminación aérea.',
          'Envolver el mango en papel kraft y la hoja en papel kraft separado, luego colocar el cuchillo en caja rígida con bridas plásticas que lo inmovilicen sin tocar superficies críticas.',
          'Fotografiar y dejar el cuchillo in situ hasta que llegue el laboratorio móvil.',
          'Levantar el cuchillo con pinzas por la hoja y colocarlo en tubo de cartón sellado.'
        ],
        correct: 1,
        fb: '<strong>Embalaje de arma blanca con evidencia dual:</strong> El plástico genera humedad condensada que degrada el ADN sanguíneo (la sangre seca en plástico desarrolla hongos en 48h). El papel kraft es permeable y permite transpiración. Inmovilizar con bridas plásticas en zonas no críticas (talón del mango) evita que la hoja de la arma corte el embalaje y que el arma roce superficies que destruyan las huellas. Nunca tomar por el mango (zona de huellas) ni por el filo (riesgo de herida y contaminación).',
        custody: '🔪 Cuchillo embalado — Caja rígida con bridas. Mango y hoja protegidos individualmente. Indicio N° 007.',
        pts: 10
      },
      {
        phase: 'FASE 4 · PELO CON BULBO',
        text: 'Encuentras un pelo en la mano de la víctima. Tiene el bulbo radicular (raíz) intacto. ¿Cuál es el valor diferencial de este hallazgo y cómo lo recolectas?',
        img: { type:'canvas', scene:'homicide', focus:'hair', label:'Pelo con Bulbo Radicular Anágeno', sublabel:'ADN nuclear disponible — Valor de individualización máximo' },
        opts: [
          'El pelo sin bulbo también permite análisis de ADN completo, por lo que el bulbo no tiene valor adicional.',
          'El bulbo anágeno contiene ADN nuclear con ambas hebras, lo que permite un perfil STR completo para comparación e individualización; recolectar con pinzas sin punta dentada y embalar en sobre de papel.',
          'El bulbo solo aporta ADN mitocondrial; embalarlo en tubo de vidrio con etanol al 70%.',
          'Pegar el pelo directamente sobre cinta de embalaje transparente para preservarlo extendido.'
        ],
        correct: 1,
        fb: '<strong>Pelo con bulbo anágeno — ADN nuclear:</strong> El folículo en fase anágena (crecimiento activo) contiene células nucleadas con ADN nuclear de doble hebra, lo que permite generar un perfil STR completo de 20+ loci para individualización. El pelo sin bulbo (fase catágena/telógena) solo tiene ADN mitocondrial (matrilineal, no individualizante). Las pinzas sin punta dentada no cortan las células del bulbo. El etanol preserva el ADN pero destruye la morfología del pelo para análisis tricológico. El sobre de papel permite transpiración y evita degradación fúngica.',
        custody: '🧬 Pelo con bulbo anágeno — Perfil STR posible. Pinzas planas utilizadas. Sobre de papel. Indicio N° 008.',
        pts: 10
      },
      {
        phase: 'FASE 5 · LEVANTAMIENTO',
        text: 'El Médico Forense autoriza el levantamiento del cadáver. ¿Cuál es el procedimiento correcto de protección de evidencia en las manos de la víctima previo al traslado?',
        img: { type:'canvas', scene:'homicide', focus:'hands', label:'Protección de Manos — Levantamiento de Cadáver', sublabel:'Preservación de material biológico subungueal' },
        opts: [
          'Colocar bolsas plásticas en ambas manos atadas con cintas adhesivas para evitar contaminación.',
          'No cubrir las manos para no interferir con el análisis de temperatura corporal para estimación de tiempo de muerte.',
          'Colocar bolsas de papel kraft transpirables en ambas manos, atadas con hilo de algodón a nivel de la muñeca, para preservar el material subungueal (restos de piel, sangre, fibras) del agresor.',
          'Envolver las manos en gasas estériles humedecidas con solución fisiológica para preservar la humedad celular.'
        ],
        correct: 2,
        fb: '<strong>Bolsas de papel en manos de cadáver:</strong> El papel kraft transpirable previene la acumulación de humedad que provocaría maceración cutánea y degradación de ADN. Las bolsas plásticas generan condensación y hongos. Las gasas húmedas favorecen la contaminación fúngica y la migración celular. El material subungueal (bajo las uñas) es de altísima prioridad: puede contener células epiteliales del agresor (ADN), fibras de su ropa, y la posición de los dedos puede indicar mecanismo de defensa. El hilo de algodón no daña los tejidos blandos como lo haría la cinta adhesiva.',
        custody: '✋ Manos protegidas con bolsas de papel. Material subungueal preservado. Cadáver trasladado a morgue. Caso 02 cerrado.',
        pts: 10
      }
    ],
    experto: [
      {
        phase: 'FASE 1 · BIOARQUEOLOGÍA FORENSE',
        text: 'Al llegar encuentras que el cadáver ha sido movido desde su posición original (livores mortis no coinciden con posición actual). ¿Qué secuencia de documentación forense permite reconstruir el lugar original del deceso (locus delicti)?',
        img: { type:'canvas', scene:'homicide', focus:'cordon', label:'Cadáver Desplazado — Livores Discordantes', sublabel:'Reconstrucción del locus delicti' },
        opts: [
          'Fotografiar los livores actuales y comparar con la posición del cadáver para determinar el tiempo de desplazamiento por el grado de fijación.',
          'Análisis de entomología forense (fauna cadavérica de primera colonización) para determinar el sitio original por distribución de insectos en el suelo.',
          'Usar modelo fotogramétrico 3D del cadáver + mapeo de livores + análisis de suelo bajo el cadáver (entomología, presión de pisada, materia orgánica) + búsqueda de satelización de evidencias (manchas de sangre, cabello) en radio expandido.',
          'Determinar el rigor mortis y la temperatura central del cuerpo para calcular la hora de muerte y el desplazamiento probable.'
        ],
        correct: 2,
        fb: '<strong>Enfoque multidisciplinario para locus delicti:</strong> Ningún método aislado es suficiente. La reconstrucción requiere: (1) fotogrametría para posición exacta del cuerpo; (2) análisis de livores (fijados > 8-12h) para posición original del deceso; (3) entomología del suelo original (huevos, larvas L1 de Calliphora) que solo eclosionan donde hubo cadáver; (4) búsqueda de "satelización" — evidencias pequeñas irradiadas desde el punto de muerte original por el arrastre. La temperatura central solo estima tiempo, no ubicación.',
        custody: '🗺️ Análisis multidisciplinario activado — Fotogrametría + Entomología + Suelo. Caso de movimiento post-mortem.',
        pts: 20
      },
      {
        phase: 'FASE 2 · PISADAS EN CONTEXTO MIXTO',
        text: 'La pisada está en la intersección barro/asfalto: la mitad anterior en barro y la mitad posterior en asfalto. ¿Cómo documentas y levantas la impresión de manera que se preserve la totalidad de la huella bidimensional y tridimensional?',
        img: { type:'canvas', scene:'homicide', focus:'footprint', label:'Pisada en Sustrato Mixto', sublabel:'Intersección barro-asfalto — Documentación bidimensional y tridimensional' },
        opts: [
          'Vaciar solo la parte en barro (3D) y levantar la parte en asfalto (2D) con cinta electrostática, luego unir digitalmente.',
          'Fotografiar toda la huella con escala, aplicar revelador magnético sobre el asfalto para la porción bidimensional, vaciar la porción en barro con dental stone, levantar la parte 2D con gelatina amarilla forense BVDA, digitalizar ambas en fotogrametría y fusionar.',
          'Reconstruir la pisada completa usando solo la porción 3D del barro, extrapolando la parte bidimensional por simetría del calzado.',
          'Levantar primero la parte en asfalto con cinta adhesiva ancha y luego vaciar la parte en barro por separado.'
        ],
        correct: 1,
        fb: '<strong>Protocolo integrado para pisada en sustrato mixto:</strong> La clave es que la pisada es una unidad de evidencia aunque esté en dos sustratos. La gelatina amarilla BVDA es el mejor levantador para huellas 2D en asfalto (recoge hasta 0.1mm de detalle). El revelado con polvo magnético previo en asfalto aumenta el contraste. La fotogrametría de ambas partes por separado y su fusión 3D por software permite reconstruir la huella completa. La extrapolación por simetría NO es admisible como evidencia individualizable.',
        custody: '👣 Pisada mixta levantada — Gelatina BVDA + Dental Stone. Fusión fotogramétrica 3D realizada. Indicio N° 004.',
        pts: 20
      },
      {
        phase: 'FASE 3 · TRAYECTORIA DE HERIDA',
        text: 'El médico forense describe herida inciso-punzante de 3.2cm en flanco derecho, trayecto oblicuo de arriba-abajo y atrás-adelante. ¿Cómo correlaciona este hallazgo con la posición relativa atacante-víctima en el momento del ataque?',
        img: { type:'canvas', scene:'homicide', focus:'knife', label:'Herida Inciso-Punzante — Trayecto Oblicuo', sublabel:'Reconstrucción de posición relativa agresor-víctima' },
        opts: [
          'El agresor estaba detrás y por arriba de la víctima, que estaba de pie o doblada hacia adelante.',
          'La víctima estaba boca abajo en el suelo y el agresor la atacó desde atrás.',
          'La trayectoria indica que el agresor era zurdo y atacó de frente.',
          'El trayecto de arriba-abajo indica que la víctima estaba arrodillada y el agresor de pie frente a ella.'
        ],
        correct: 0,
        fb: '<strong>Reconstrucción por trayecto de herida:</strong> Un trayecto oblicuo de superior-a-inferior y posterior-a-anterior en flanco derecho indica: el arma entró por la espalda derecha con dirección hacia adelante y hacia abajo. Esto posiciona al agresor detrás y por arriba (o la víctima inclinada hacia adelante). Si el agresor fuera diestro, la trayectoria de derecha a izquierda del cuerpo también es consistente. Si la víctima estuviera arrodillada de frente, el trayecto sería anterior-posterior. Si estuviera boca abajo, la dirección dorsal a ventral sin componente oblicuo-anterior sería diferente.',
        custody: '🔬 Análisis de trayecto de herida documentado. Correlación con posición de huellas de calzado del agresor.',
        pts: 20
      },
      {
        phase: 'FASE 4 · MEZCLA DE ADN',
        text: 'El análisis STR del pelo revela un perfil mixto con un mínimo de dos contribuyentes. El perfil mayoritario coincide con la víctima. ¿Cuál es el enfoque estadístico más robusto para presentar la evidencia del perfil minoritario en juicio?',
        img: { type:'canvas', scene:'homicide', focus:'hair', label:'Perfil STR Mixto — Dos Contribuyentes', sublabel:'Estadística de mezclas de ADN — Presentación en juicio' },
        opts: [
          'Calcular el LR (Likelihood Ratio) con el modelo de mezcla binario asumiendo proporciones conocidas de cada contribuyente.',
          'Reportar solo la proporción de loci compartidos entre el perfil minoritario y el sospechoso.',
          'Aplicar análisis probabilístico de mezclas (STRmix, TrueAllele o ArmedXpert) con el modelo de mezclas estocásticas para calcular un LR bayesiano bajo la hipótesis del fiscal vs. hipótesis de la defensa.',
          'Solicitar re-análisis con kit de mayor resolución (30 loci) para separar los perfiles por número de repeticiones alélicas.'
        ],
        correct: 2,
        fb: '<strong>Probabilistic Genotyping (PG) para mezclas:</strong> El análisis manual de mezclas complejas está sujeto a sesgo interpretativo. Los softwares de genotipado probabilístico (STRmix, TrueAllele, ArmedXpert) modelan el proceso de PCR, la estocástica de bajas plantillas, drop-in y drop-out alélico, y calculan un LR bayesiano que compara H_p: sospechoso contribuyó vs. H_d: persona no relacionada contribuyó. Este es el estándar internacional ISFG/SWGDAM para mezclas. El modelo binario simple es inadmisible para mezclas complejas en tribunales que aplican estándar Daubert.',
        custody: '🧬 Mezcla compleja de ADN — STRmix activado. LR bayesiano en cálculo. Hipótesis Fiscal/Defensa formuladas.',
        pts: 20
      },
      {
        phase: 'FASE 5 · ESTIMACIÓN DE HORA DE MUERTE',
        text: 'El cadáver fue hallado a las 06:00h. Temperatura ambiental: 14°C. Temperatura rectal: 27°C. Rigor mortis completo. Livor mortis fijo. ¿Cuál es el método más preciso para estimar el intervalo post-mortem (PMI)?',
        img: { type:'canvas', scene:'homicide', focus:'hands', label:'Estimación del Intervalo Post-Mortem', sublabel:'Temperatura + Rigor + Livor — Integración de métodos' },
        opts: [
          'Aplicar la regla de Henssge con nomograma corporal para calcular el PMI por enfriamiento en función del peso del cadáver y temperatura ambiental.',
          'Estimar 1°C de descenso por hora desde 37°C hasta temperatura ambiental: PMI = (37-27)/1 = 10 horas.',
          'El rigor mortis completo indica más de 12 horas de fallecido; el livor fijo indica más de 8 horas.',
          'Integrar la ecuación de Henssge (nomograma), el estado del rigor (estadio cronológico por grupos musculares), la fase de livor y la colonización entomológica (si presente) para obtener un intervalo consensuado con rangos de confianza.'
        ],
        correct: 3,
        fb: '<strong>Integración multi-método para PMI:</strong> La regla del 1°C/hora es una aproximación burda que ignora las variables de enfriamiento no lineal (zona de plateau inicial, efecto de ropa, peso corporal, corrientes de aire). El nomograma de Henssge (con corrección por peso) es más preciso pero tiene ±2-3h de error. El rigor completo sugiere > 6-12h pero varía por temperatura y actividad muscular previa. El livor fijo > 8-12h. La entomología puede precisar a ±1h para muertes > 24h. Solo la INTEGRACIÓN de todos los métodos disponibles con sus respectivos intervalos de confianza es admisible para dar una estimación defensible en tribunal.',
        custody: '⏱️ PMI multi-método calculado. Nomograma de Henssge + Rigor + Livor integrados. Entomólogo forense convocado.',
        pts: 20
      }
    ]
  },
  {
    id: 'caso03',
    num: '03',
    title: 'Siniestro Vial Doloso',
    subtitle: 'Colisión en calzada · Huellas de frenada · Dosaje etílico',
    img: 'assets/traffic_accident.png',
    color: '#f97316',
    phases: ['Perímetro Vial','Huellas de Frenada','Transferencia de Pintura','Toxicología','Precintado de Vehículo'],
    dificil: [
      {
        phase: 'FASE 1 · MEDICIÓN DE HUELLAS DE FRENADA',
        text: 'En la calzada encuentras huellas de frenada de 28 metros. Para reconstruir la velocidad previa al impacto, ¿qué datos necesitas medir en campo?',
        img: { type:'canvas', scene:'traffic', focus:'skid', label:'Huellas de Frenada — 28 metros', sublabel:'Reconstrucción de velocidad — Parámetros de medición' },
        opts: [
          'Solo la longitud de la huella de frenada.',
          'Longitud total de la huella, largo de cada neumático, coeficiente de fricción de la calzada (µ) medido con decelerómetro o drag sled, y tipo de pavimento con estado superficial.',
          'Longitud de frenada y la velocidad que indicaba el velocímetro según el conductor.',
          'Solo el tipo de pavimento y la temperatura ambiente.'
        ],
        correct: 1,
        fb: '<strong>Parámetros para reconstrucción de velocidad por frenada:</strong> La fórmula básica es V = √(2 × µ × g × d), donde µ es el coeficiente de fricción dinámica de la calzada, g = 9.81 m/s², y d = longitud de la huella. El µ varía: asfalto seco ~0.75, asfalto húmedo ~0.45, adoquín ~0.50. Un error del 10% en µ se traduce en ~5% de error en velocidad. El decelerómetro o el "drag sled" permiten medir µ directamente en el punto del accidente. Sin µ real medido, la reconstrucción de velocidad no es admisible ante tribunal.',
        custody: '🚗 Huellas de frenada documentadas — 28.4m + coeficiente de fricción µ=0.68 medido. Indicio N° 009.',
        pts: 10
      },
      {
        phase: 'FASE 2 · ESCAMAS DE PINTURA',
        text: 'Encuentras pequeñas escamas de pintura azul metálica en el punto de impacto sobre el asfalto. ¿Cómo las recolectas correctamente para análisis de capas en laboratorio?',
        img: { type:'canvas', scene:'traffic', focus:'paint', label:'Escamas de Pintura Metálica', sublabel:'Transferencia de contacto — Perfil estratigráfico' },
        opts: [
          'Recolectar con cinta adhesiva de embalaje para fijar las escamas en su posición.',
          'Usar espátula de plástico estéril para transferir las escamas a un sobre de papel glassine (papel vegetal), rotular con el número de indicio y la orientación de la muestra.',
          'Aspirar las escamas con aspiradora forense sobre papel de filtro y embolsar en plástico.',
          'Fotografiar y dejar las escamas in situ marcadas con testigo métrico.'
        ],
        correct: 1,
        fb: '<strong>Recolección de transferencia de pintura:</strong> Las escamas de pintura automotriz tienen capas de hasta 5 estratos (imprimación fosfatada, base electrodepositada, sellador, base color, barniz clear coat). La espátula plástica estéril evita contaminación metálica. El sobre de papel glassine (semitransparente, sin adhesivos) permite examinar el contenido sin manipularlo. Nunca se usa cinta adhesiva porque los adhesivos contaminan la muestra con compuestos orgánicos que interfieren con GC-MS y micro-FTIR. La aspiración puede mezclar partículas de distintos vehículos.',
        custody: '🎨 Escamas de pintura recolectadas — Espátula plástica + papel glassine. Estratigrafía preservada. Indicio N° 010.',
        pts: 10
      },
      {
        phase: 'FASE 3 · FLUIDOS DEL VEHÍCULO',
        text: 'Hay un charco de aceite de motor en el asfalto bajo el vehículo. ¿Para qué sirve este indicio y cómo se recolecta para que pueda compararse con el aceite del vehículo sospechoso?',
        img: { type:'canvas', scene:'traffic', focus:'fluid', label:'Fluido de Motor — Aceite de Cárter', sublabel:'Individualización química — Muestra de referencia necesaria' },
        opts: [
          'El aceite no tiene valor individualizable; solo sirve para conocer el estado mecánico del vehículo.',
          'Recolectar el aceite del asfalto con pipeta Pasteur en frasco de vidrio ámbar y, si el vehículo sospechoso está disponible, tomar muestra del cárter del motor para comparación química (degradación de aditivos, contaminación metálica por desgaste de motor).',
          'Absorber el charco con gasas estériles y embolsarlas en plástico hermético.',
          'Documentar el charco fotográficamente y solicitar la ficha técnica del aceite de la marca del vehículo.'
        ],
        correct: 1,
        fb: '<strong>Valor individualizable del aceite de motor:</strong> El aceite de motor en servicio tiene una "firma química" única determinada por: (a) marca y tipo del aceite base, (b) paquete de aditivos (ZDDP, detergentes, dispersantes), (c) degradación termoxidativa por horas de servicio, y (d) contaminación metálica por desgaste de pistones, cojinetes y árboles de levas (Fe, Al, Cu, Pb en ppm). La comparación por GC-MS y ICP-OES puede individualizar el aceite del asfalto con el del cárter del vehículo imputado. El frasco de vidrio ámbar (borosilicato) evita migración de plastificantes que contaminarían el análisis.',
        custody: '🛢️ Aceite de motor recolectado — Frasco vidrio ámbar 20mL. Muestra cárter del vehículo solicitada. Indicio N° 011.',
        pts: 10
      },
      {
        phase: 'FASE 4 · DOSAJE ETÍLICO',
        text: 'El conductor imputado es derivado al centro de salud para dosaje etílico. Para una muestra válida en juicio, ¿qué tipo de tubo y antiséptico se deben usar?',
        img: { type:'canvas', scene:'traffic', focus:'blood_tube', label:'Dosaje Etílico — Extracción de Sangre', sublabel:'Tubo gris NaF/K₂EDTA — Antiséptico no alcohólico' },
        opts: [
          'Tubo rojo (sin anticoagulante) y antiséptico con alcohol isopropílico al 70%.',
          'Tubo lila (EDTA) y cualquier antiséptico disponible en el servicio.',
          'Tubo gris con fluoruro de sodio (NaF) como antifermentativo y oxalato de potasio como anticoagulante; antiséptico con Betadine (povidona yodada) o clorhexidina acuosa, nunca alcohol.',
          'Tubo verde (heparina de litio) y antiséptico con cloruro de benzalconio.'
        ],
        correct: 2,
        fb: '<strong>Tubo gris NaF/K₂Oxalato para etilemia:</strong> El fluoruro de sodio (NaF) inhibe la glicolisis bacteriana que produciría etanol endógeno post-extracción, falsando el resultado al alza. El oxalato de potasio anticoagula sin reaccionar con etanol. NUNCA usar alcohol como antiséptico porque puede contaminar la piel y elevar artificialmente la concentración detectada. La Betadine o clorhexidina acuosa son alternativas válidas. El tubo debe llenarse completamente (vacío mínimo < 15%) para reducir el espacio de cabeza (headspace) que afecta la concentración. El análisis por cromatografía de gases headspace (GC-HS) es el método de referencia.',
        custody: '🩸 Dosaje etílico realizado — Tubo gris NaF+K₂Ox. Betadine como antiséptico. Cadena de frío. Indicio N° 012.',
        pts: 10
      },
      {
        phase: 'FASE 5 · PRECINTADO DE VEHÍCULO',
        text: 'El vehículo debe ser trasladado al depósito judicial como evidencia. ¿Qué procedimiento se debe seguir antes del traslado para preservar la condición del vehículo como elemento de prueba?',
        img: { type:'canvas', scene:'traffic', focus:'vehicle', label:'Precintado de Vehículo — Evidencia Judicial', sublabel:'Traslado a depósito judicial — Estado de evidencia' },
        opts: [
          'Trasladar el vehículo al depósito con la grúa sin necesidad de precinto.',
          'Documentar el kilometraje, estado de la carrocería, vidrios y neumáticos fotográficamente; colocar sellos tamper-evident numerados cruzando las uniones de todas las puertas, capó y portamaletas; registrar el número de serie de cada sello en el acta de secuestro antes del traslado.',
          'Solo fotografiar el exterior del vehículo antes del traslado.',
          'Sellar únicamente las puertas del conductor y solicitar al depósito que lleve el control del vehículo.'
        ],
        correct: 1,
        fb: '<strong>Precintado forense de vehículo secuestrado:</strong> El vehículo es una "escena del crimen móvil". El kilometraje inicial documentado impide que aleguen que fue movido. Los sellos tamper-evident numerados en TODAS las aperturas (4 puertas, capó, portamaletas, tapa de combustible) permiten detectar acceso no autorizado posterior. La numeración secuencial de cada sello permite saber si un sello fue reemplazado. El acta de secuestro debe incluir: fecha/hora, condición visual de los sellos, número de cada sello, firma del agente y del depositario.',
        custody: '🚨 Vehículo precintado — 7 sellos tamper-evident numerados. Km inicial: 87.432. Acta de secuestro firmada. Caso 03 cerrado.',
        pts: 10
      }
    ],
    experto: [
      {
        phase: 'FASE 1 · VELOCÍMETRO FORENSE',
        text: 'La cámara de vigilancia capturó el vehículo, pero el ángulo de la cámara introduce distorsión de perspectiva que afecta la medición de velocidad por análisis de video. ¿Cuál es el método más riguroso para calcular la velocidad real?',
        img: { type:'canvas', scene:'traffic', focus:'skid', label:'Análisis Videométrico — Distorsión de Perspectiva', sublabel:'Corrección fotogramétrica para velocidad real' },
        opts: [
          'Medir el desplazamiento en píxeles entre cuadros y dividir por el tiempo entre cuadros usando un factor de escala estimado.',
          'Ignorar el video y reconstruir la velocidad exclusivamente por las huellas de frenada con el modelo de Limpert.',
          'Realizar una calibración fotogramétrica de la cámara usando puntos de control terrestres (GCP) con coordenadas reales medidas, rectificar la imagen con un modelo de distorsión radial/tangencial y calcular la velocidad en el espacio objeto corregido.',
          'Pedir al fabricante de la cámara el factor de corrección de la lente y aplicarlo directamente.'
        ],
        correct: 2,
        fb: '<strong>Fotogrametría forense para velocimetría en CCTV:</strong> La distorsión de perspectiva en cámaras de vigilancia es compleja (radial, tangencial, skew). La corrección por factor de fabricante es una generalización que no considera el estado real de la óptica. El método riguroso requiere: (1) calibración de la cámara in situ con GCPs (puntos de control terrestres) con coordenadas medidas con GPS RTK; (2) ajuste del modelo de distorsión (Lensfun o OpenCV); (3) rectificación ortofotográfica; (4) medición de velocidad en el espacio objeto corregido. Las huellas de frenada completan la reconstrucción pero no son admisibles como único método si el video está disponible.',
        custody: '📹 Calibración fotogramétrica de CCTV realizada. 12 GCPs medidos. Velocidad corregida calculada. Indicio N° 009.',
        pts: 20
      },
      {
        phase: 'FASE 2 · ESTRATIGRAFÍA AUTOMOTRIZ',
        text: 'El análisis por micro-FTIR de las escamas de pintura revela 5 capas estratigráficas. La capa de imprimación tiene un espectro que no coincide exactamente con el de la base de datos PDQ (Paint Data Query). ¿Qué estrategia analítica complementaria maximiza la discriminación?',
        img: { type:'canvas', scene:'traffic', focus:'paint', label:'Micro-FTIR — Perfil de 5 Capas', sublabel:'Discriminación con PDQ — Estrategia complementaria' },
        opts: [
          'Declarar la muestra no identificable por la falta de coincidencia con PDQ y solicitar nueva muestra.',
          'Aplicar pirolisis acoplada a cromatografía de gases-espectrometría de masas (Py-GC-MS) para identificar los monómeros de resinas de la imprimación y comparar con biblioteca de espectros de pirólisis.',
          'Usar únicamente colorimetría CIE L*a*b* para comparar el color de la capa base con el del vehículo sospechoso.',
          'Aumentar la resolución del FTIR de 4 cm⁻¹ a 1 cm⁻¹ y repetir el análisis con 512 scans acumulados.'
        ],
        correct: 1,
        fb: '<strong>Py-GC-MS para imprimaciones no identificadas en PDQ:</strong> La base de datos PDQ (RCMP) cubre principalmente vehículos norteamericanos y algunas marcas europeas. Vehículos de importación o con reparaciones previas de carrocería (repintados) pueden tener imprimaciones no indexadas. La pirolisis acoplada a GC-MS fragmenta las macromoléculas poliméricas de las resinas de imprimación (alquídicas, epoxídicas, poliésteres) en monómeros y oligómeros característicos identificables en bibliotecas NIST. Esto supera las limitaciones del PDQ y permite comparar marcas de imprimación independientemente de la base de datos vehicular.',
        custody: '🎨 Py-GC-MS solicitado — 5 estratos documentados. Imprimación no en PDQ — análisis alternativo activado. Indicio N° 010.',
        pts: 20
      },
      {
        phase: 'FASE 3 · PERFIL DE ACEITE AVANZADO',
        text: 'El análisis ICP-OES del aceite de la escena revela: Fe=180ppm, Cu=45ppm, Al=22ppm, Pb=8ppm. El aceite del cárter del vehículo sospechoso da: Fe=185ppm, Cu=44ppm, Al=21ppm, Pb=9ppm. ¿Qué análisis estadístico determina si la diferencia es o no significativa?',
        img: { type:'canvas', scene:'traffic', focus:'fluid', label:'Comparación ICP-OES — Perfil de Desgaste', sublabel:'¿Diferencias estadísticamente significativas?' },
        opts: [
          'Calcular la diferencia porcentual entre cada par de valores y si es < 10% declarar coincidencia.',
          'Realizar un análisis de varianza (ANOVA) entre los dos conjuntos si hay múltiples réplicas de cada muestra.',
          'Aplicar Análisis de Componentes Principales (PCA) con los 4 metales como variables, proyectar ambas muestras en el espacio de componentes y calcular la distancia de Mahalanobis entre ellas considerando la varianza intra-laboratorio.',
          'Declarar coincidencia visual porque los valores son muy similares sin necesidad de estadística formal.'
        ],
        correct: 2,
        fb: '<strong>Distancia de Mahalanobis en comparación multivariada de aceites:</strong> La diferencia porcentual simple no tiene en cuenta la varianza de medición ni la correlación entre las variables (los metales de desgaste no son independientes). El ANOVA compara grupos, no pares de muestras individuales. La distancia de Mahalanobis en el espacio PCA es el método correcto: proyecta ambas muestras en el espacio de componentes principales (que captura la varianza real del sistema), y mide la distancia geométrica normalizada por la varianza del laboratorio. Si d_M < 2 (95% CI), las muestras son estadísticamente indistinguibles y la coincidencia es informable.',
        custody: '🛢️ Análisis PCA + Mahalanobis completado. Distancia estadística calculada. Informe de coincidencia emitido. Ind. N° 011.',
        pts: 20
      },
      {
        phase: 'FASE 4 · TOXICOLOGÍA AVANZADA',
        text: 'La etilemia por GC-HS da 1.2 g/L a las 02:30h (2h post-accidente). La defensa argumenta que el conductor bebió DESPUÉS del accidente. ¿Qué análisis retroproyectivo permite refutar o confirmar el argumento?',
        img: { type:'canvas', scene:'traffic', focus:'blood_tube', label:'Etilemia Retroproyectiva', sublabel:'2 horas post-accidente — ¿Consumo pre o post-accidente?' },
        opts: [
          'Declarar que no es posible determinar si el consumo fue pre o post-accidente sin más información.',
          'Tomar una segunda muestra de sangre 1 hora después y calcular la tasa de descenso real del paciente para retroproyectar la concentración al tiempo del accidente usando el modelo de Widmark.',
          'Aplicar directamente la tasa de eliminación estándar de Widmark (0.15 g/L/h) para retroproyectar 2 horas: BAC_accidente = 1.2 + (0.15 × 2) = 1.5 g/L.',
          'Analizar el alcohol en orina (AOr) para comparar la ratio sangre:orina y determinar si el conductor estaba en fase de absorción o eliminación en el momento del accidente.'
        ],
        correct: 3,
        fb: '<strong>Ratio sangre:orina para fase de absorción/eliminación:</strong> Si la defensa alega consumo post-accidente, la clave es determinar la fase cinética en el momento del accidente. Si BAC > AOr/1.3, el individuo estaba en fase de absorción (el etanol aún se absorbía, lo que contradice consumo reciente de alta dosis pre-muestreo). Si AOr/1.3 > BAC, estaba en eliminación (bebió hace tiempo). La retroproyección con Widmark estándar (0.15 g/L/h) tiene ±40% de error por variabilidad inter-individual. La segunda muestra para calcular la tasa REAL de eliminación del paciente específico es más precisa, pero el ratio sangre:orina responde directamente la pregunta de la defensa.',
        custody: '🩸 Análisis de orina solicitado — Ratio sangre:orina para determinar fase cinética. Retroproyección con tasa real en proceso.',
        pts: 20
      },
      {
        phase: 'FASE 5 · ACCIDENTOLOGÍA VIAL AVANZADA',
        text: 'El análisis de huellas revela que el frenazo comienza 8 metros DESPUÉS del punto de impacto proyectado. ¿Qué hipótesis de reconstrucción es más consistente con este hallazgo?',
        img: { type:'canvas', scene:'traffic', focus:'vehicle', label:'Huellas Post-Impacto — Inicio a 8m del punto proyectado', sublabel:'Dinámica de colisión — Hipótesis de reconstrucción' },
        opts: [
          'El conductor frenó antes del impacto y las huellas corresponden a la víctima del otro vehículo.',
          'Las huellas pertenecen al período post-colisión: el conductor comenzó a frenar DESPUÉS del impacto, lo que indica reacción tardía post-impacto o que el impacto ocurrió a velocidad sin intento previo de evasión, siendo consistente con hipótesis dolosa de embestida.',
          'El vehículo chocó mientras aceleraba y las huellas son de rodadura, no de frenada.',
          'El punto de impacto fue calculado incorrectamente y debe recalcularse a partir de las huellas.'
        ],
        correct: 1,
        fb: '<strong>Huellas post-impacto y dolo en siniestro vial:</strong> Las huellas de frenada que inician DESPUÉS del punto de impacto indican que el conductor no intentó detenerse antes del choque. Existen dos interpretaciones: (1) el conductor no vio a la víctima (imprudencia/negligencia) o (2) el conductor eligió no frenar antes del impacto (dolo). La distancia de inicio de frenada posterior al impacto + velocidad calculada + videos de CCTV + análisis de EDR (Event Data Recorder, "caja negra") del vehículo integran la evidencia para determinar la intencionalidad. El EDR registra aceleración, frenada y velocidad en los 5 segundos previos al evento.',
        custody: '🚗 Análisis de EDR solicitado. Hipótesis dolosa documentada. Huellas post-impacto correlacionadas. Caso 03 cerrado.',
        pts: 20
      }
    ]
  },
  {
    id: 'caso04',
    num: '04',
    title: 'Análisis en Laboratorio',
    subtitle: 'AFIS · ADN-STR · Balística · SEM-EDS · Testimonio Experto',
    img: 'assets/forensic_lab.png',
    color: '#06b6d4',
    phases: ['Dactiloscopia AFIS','Genética STR','Balística','GSR-SEM','Testimonio Experto'],
    dificil: [
      {
        phase: 'FASE 1 · IDENTIFICACIÓN DACTILOSCÓPICA',
        text: 'El sistema AFIS arroja una coincidencia de 14 puntos característicos (minucias) entre la huella dubitada y el sospechoso. ¿Cuántas minucias se requieren habitualmente como mínimo para una identificación plena?',
        img: { type:'canvas', scene:'lab', focus:'afis', label:'Sistema AFIS — Comparación Biométrica', sublabel:'14 minucias concordantes — Evaluación de suficiencia' },
        opts: [
          'Con 14 minucias es suficiente para individualización plena en todos los países.',
          'El número mínimo varía por jurisdicción (8-16 según INTERPOL/FBI), pero lo determinante es la evaluación cualitativa del perito dactiloscopista mediante el proceso ACE-V (Análisis, Comparación, Evaluación, Verificación), no el número solo.',
          'Se requieren mínimo 30 minucias para que la coincidencia sea estadísticamente significativa.',
          'El AFIS es definitivo y no requiere revisión humana posterior.'
        ],
        correct: 1,
        fb: '<strong>Proceso ACE-V y número de minucias:</strong> No existe un número universal; varía por sistema jurídico (8 en Francia, 12 en INTERPOL, 16 en algunos estados de EE.UU., ningún mínimo establecido en UK). Lo más importante es el proceso ACE-V: (A)nálisis de la calidad de la huella, (C)omparación sistemática de minucias, (E)valuación del perito sobre la concordancia/discordancia, y (V)erificación por un segundo perito ciego. El AFIS es una herramienta de preselección, no el dictamen final.',
        custody: '🔍 AFIS — 14 minucias concordantes. ACE-V iniciado por dactiloscopista. Verificación ciega en proceso.',
        pts: 10
      },
      {
        phase: 'FASE 2 · PERFIL STR',
        text: 'El laboratorio genera un perfil STR de 20 loci. La probabilidad de coincidencia aleatoria (RMP) es 1 en 10 billones. ¿Cómo se debe reportar este resultado en el informe pericial?',
        img: { type:'canvas', scene:'lab', focus:'dna', label:'Perfil STR — 20 Loci', sublabel:'RMP 1:10¹³ — Reporte en informe pericial' },
        opts: [
          '"El ADN es 100% del sospechoso."',
          '"El perfil STR del indicio coincide con el del sospechoso. La probabilidad de que un individuo no relacionado presente el mismo perfil es 1 en 10 billones (10¹³), lo que equivale a un LR de 10¹³ a favor de la hipótesis de que el sospechoso es el donante."',
          '"El sospechoso es culpable según el análisis de ADN."',
          '"El perfil coincide, pero no es definitivo porque el ADN puede contaminarse."'
        ],
        correct: 1,
        fb: '<strong>Reporte forense de ADN con LR:</strong> El perito forense NUNCA dice "100% del sospechoso" porque no es científicamente posible —solo inferiría culpabilidad, que es función del juez, no del perito. El perito reporta: (1) concordancia del perfil, (2) el RMP (Random Match Probability) como probabilidad de coincidencia aleatoria, (3) el LR (Likelihood Ratio) como peso de evidencia bayesiano. El lenguaje debe ser estadístico y neutral. Afirmar culpabilidad es una transgresión ética grave del rol pericial.',
        custody: '🧬 Informe STR emitido con LR=10¹³. Lenguaje estadístico neutro. Dictamen pericial firmado por genetista forense.',
        pts: 10
      },
      {
        phase: 'FASE 3 · BALÍSTICA COMPARATIVA',
        text: 'Se comparan dos vainillas (casquillos) de 9mm. El microscopio comparador muestra marcas similares de percutor. ¿Qué concluye el perito?',
        img: { type:'canvas', scene:'lab', focus:'ballistic', label:'Microscopio Comparador Balístico', sublabel:'Marcas de percutor — Dos vainillas 9mm Parabellum' },
        opts: [
          '"Ambas vainillas fueron disparadas por la misma arma con certeza absoluta."',
          '"Las marcas de clase (percutor, cazador de expulsión) son compatibles; las marcas de subclase y las estrías del cañón confirman el arma de origen, pero se reporta como "concordancia balística" con grado de certeza según AFTE: Consistent with being fired from the same firearm."',
          '"Las vainillas son del mismo calibre, por lo que provienen del mismo arma."',
          '"No es posible relacionar dos vainillas entre sí, solo proyectiles."'
        ],
        correct: 1,
        fb: '<strong>Terminología AFTE en balística forense:</strong> La Association of Firearm and Toolmark Examiners (AFTE) establece cuatro niveles de conclusión: (1) Identified (Same gun), (2) Consistent (Compatible), (3) Inconclusive, (4) Eliminated. Las marcas de CLASE (diseño del percutor) son comunes a todas las armas del mismo modelo. Las marcas de SUBCLASE y de INDIVIDUO (estrías microscópicas únicas por el proceso de manufactura y desgaste) permiten la identificación. El perito aplica el proceso AFTE de comparación y reporta el nivel de conclusión apropiado, nunca "certeza absoluta".',
        custody: '🔫 Comparación balística concluida — Concordancia AFTE: "Consistent with same firearm". Informe emitido.',
        pts: 10
      },
      {
        phase: 'FASE 4 · RESIDUOS DE DISPARO',
        text: 'El análisis por SEM-EDS de las muestras de mano del sospechoso revela partículas esferoidales con Pb, Ba y Sb. ¿Qué significa este hallazgo?',
        img: { type:'canvas', scene:'lab', focus:'sem', label:'SEM-EDS — Partículas de GSR', sublabel:'Morfología esferoidal con Pb+Ba+Sb — Confirmación diagnóstica' },
        opts: [
          'El sospechoso disparó un arma de fuego recientemente o estuvo muy cerca de alguien que lo hizo.',
          'El sospechoso fabricó municiones artesanales porque las partículas tienen plomo.',
          'La presencia de bario y antimonio solo se explica por contaminación industrial.',
          'El hallazgo es inconcluso porque pueden ser partículas de pintura de plomo.'
        ],
        correct: 0,
        fb: '<strong>GSR (Gunshot Residue) por SEM-EDS:</strong> Las partículas esferoidales de GSR se forman por la condensación rápida de los vapores generados por la deflagración de la pólvora (Pb-estifnato, Ba-nitrato, Sb₂S₃ del fulminante de cápsula). La morfología esferoidal es diagnóstica del proceso de condensación a > 2000°C. La composición trinaria Pb+Ba+Sb es altamente específica de GSR (probabilidad de ocurrencia ambiental < 0.001%). La interpretación correcta es: "disparó" o "estuvo en el entorno inmediato de un disparo" o "manipuló el arma o la munición". La pintura de plomo no tiene Ba+Sb en combinación esferoidal.',
        custody: '💥 GSR positivo — 3 partículas esferoidales Pb+Ba+Sb confirmadas. SEM-EDS informe emitido. Indicio N° 013.',
        pts: 10
      },
      {
        phase: 'FASE 5 · TESTIMONIO EXPERTO',
        text: 'Durante el juicio, el abogado defensor te pregunta: "¿Es posible que las partículas de GSR llegaran a las manos del acusado por transferencia secundaria desde otra persona?" ¿Cuál es la respuesta pericial correcta?',
        img: { type:'canvas', scene:'lab', focus:'court', label:'Testimonio en Juicio — Testigo Experto', sublabel:'Transferencia secundaria de GSR — Pregunta de la defensa' },
        opts: [
          '"No, la transferencia secundaria de GSR es imposible."',
          '"Sí, es posible en teoría, pero estadísticamente improbable si las partículas fueron encontradas en dorso y palma de ambas manos con densidad consistente con disparo directo."',
          '"No puedo responder esa pregunta en juicio."',
          '"Sí, la transferencia secundaria es la principal causa de GSR en inocentes."'
        ],
        correct: 1,
        fb: '<strong>Transferencia secundaria de GSR:</strong> La posibilidad de transferencia secundaria (de una persona que disparó a otra por contacto) está documentada científicamente, pero los estudios muestran que la transferencia es cuantitativamente menor (1-5 partículas vs. docenas en un tirador). Un testimonio pericial honesto reconoce la posibilidad teórica y simultáneamente aporta los datos cuantitativos (número de partículas, distribución en manos, densidad) que permiten al juez evaluar el peso de la evidencia. Negar la posibilidad es científicamente incorrecto. Afirmar que es "la principal causa" también es incorrecto estadísticamente.',
        custody: '⚖️ Testimonio experto completado — Transferencia secundaria reconocida y cuantificada. Dictamen final emitido.',
        pts: 10
      }
    ],
    experto: [
      {
        phase: 'FASE 1 · DACTILOSCOPIA CUANTITATIVA',
        text: 'La huella dubitada tiene solo 7 minucias identificables por baja calidad. El sistema AFIS propone al sospechoso con score 856/1000. ¿Cuál es el procedimiento correcto bajo el sistema no-numérico OSAC/SWGFAST actualizado?',
        img: { type:'canvas', scene:'lab', focus:'afis', label:'Huella de Baja Calidad — 7 Minucias AFIS Score 856', sublabel:'Protocolo OSAC/SWGFAST para evidencia marginal' },
        opts: [
          'Emitir dictamen de identificación basado en el alto score AFIS (>800) aunque las minucias sean pocas.',
          'Declarar la huella de insuficiente calidad y no emitir ninguna conclusión.',
          'Aplicar ACE-V con evaluación de calidad-cantidad (GYRO: Good, Usable, Reliable, Observable) de cada minucia, e informar con el nivel de conclusión más conservador que los datos soporten: desde "Consistent" hasta "Inconclusive", documentando explícitamente la base factual.',
          'Solicitar un segundo análisis independiente con tecnología de imagen hiperspectral para recuperar minucias no visibles a simple vista antes de emitir cualquier dictamen.'
        ],
        correct: 2,
        fb: '<strong>Marco OSAC/SWGFAST para huellas de calidad marginal:</strong> Los estándares OSAC (NIST) y SWGFAST rechazan el dictamen basado en número de minucias o en score AFIS exclusivamente. El proceso ACE-V exige: (A) Análisis de calidad individual de cada minucia mediante el sistema GYRO (calidad buena/usable/confiable/observable); (C) Comparación con los rasgos de clase y subclase de la huella del sospechoso; (E) Evaluación del nivel de conclusión que los datos soportan; (V) Verificación ciega. Para huellas marginales, el dictamen más correcto puede ser "Inconclusive" documentado con rigor, lo que es científicamente más defendible que una identificación frágil.',
        custody: '🔍 ACE-V con GYRO completado — 7 minucias evaluadas individualmente. Dictamen: Inconclusive por calidad insuficiente.',
        pts: 20
      },
      {
        phase: 'FASE 2 · MEZCLA STR COMPLEJA',
        text: 'El electrroferograma STR de la ropa del sospechoso muestra un perfil mixto con "drop-in" alélico (pico artefacto) en D8S1179 y "drop-out" probable en vWA (falta un alelo esperado). El software STRmix reporta un LR=4.2×10⁶. ¿Cuál es la acción correcta?',
        img: { type:'canvas', scene:'lab', focus:'dna', label:'Electroferograma STR — Drop-in y Drop-out', sublabel:'STRmix LR=4.2×10⁶ — Revisión de artefactos' },
        opts: [
          'Reportar el LR=4.2×10⁶ directamente en el dictamen como resultado del análisis.',
          'Invalidar el resultado completo porque los artefactos STR hacen todo el perfil no confiable.',
          'Revisar manualmente el cromatograma para confirmar si el "drop-in" es un artefacto real (pico stutter, artefacto de PCR) o un alelo verdadero bajo, y evaluar si el "drop-out" afecta la hipótesis del sospechoso; si el drop-in es confirmado como artefacto, excluirlo del análisis en STRmix y recalcular el LR.',
          'Repetir la extracción de ADN con mayor cantidad de plantilla para eliminar el efecto estocástico.'
        ],
        correct: 2,
        fb: '<strong>Interpretación de artefactos en STR:</strong> Drop-in y drop-out son fenómenos estocásticos de plantillas bajas en PCR. El "stutter" es el artefacto más común (pico n-4 pb del alelo principal), y si se confunde con alelo verdadero, sesga el LR. STRmix modela el stutter, pero el analista debe verificar manualmente que el pico marcado como "drop-in" no sea un stutter del alelo adyacente. Si se confirma artefacto, se excluye y se recalcula. El LR recalculado puede subir o bajar. Reportar el LR sin esta verificación es negligencia profesional. Descartar el resultado completo es excesivo si solo un locus está afectado.',
        custody: '🧬 Revisión manual de artefactos STR completada. Drop-in confirmado como stutter. LR recalculado. Dictamen actualizado.',
        pts: 20
      },
      {
        phase: 'FASE 3 · BALÍSTICA DE PROYECTIL DEFORMADO',
        text: 'El proyectil recuperado en autopsia está deformado (mushroom) por el impacto en hueso. Solo el 30% de la superficie tiene estrías comparables. ¿Cuál es el protocolo correcto para extraer la máxima información identificativa?',
        img: { type:'canvas', scene:'lab', focus:'ballistic', label:'Proyectil Deformado en Autopsia', sublabel:'Solo 30% de superficie con estrías — Protocolo avanzado' },
        opts: [
          'Declarar el proyectil como no comparativo por deformación excesiva y no emitir conclusión.',
          'Fotografiar las estrías visibles con microscopio de luz y comparar directamente con el proyectil testigo disparado del arma sospechosa.',
          'Aplicar microscopía confocal de barrido óptico (CSI) para obtener un mapa topográfico 3D de las estrías, complementar con comparación por correlación cruzada digital (CSAFE/Ballistics Toolmark Research) y aplicar el umbral estadístico de la base de datos NIST NBIDE para el nivel de conclusión soportado por los datos.',
          'Realizar un nuevo disparo testigo con el arma sospechosa y comparar los patrones de deformación del proyectil.'
        ],
        correct: 2,
        fb: '<strong>Microscopía confocal + correlación digital en balística:</strong> La microscopía confocal de barrido óptico genera mapas topográficos 3D de las estrías con resolución nanométrica, permitiendo comparar fragmentos de proyectil deformado que no serían comparables visualmente. El software CSAFE (Center for Statistics and Applications in Forensic Evidence) de NIST usa correlación cruzada de los perfiles de estrías y calcula estadísticamente cuántos mm de estría se necesitan para alcanzar diferentes umbrales de confianza. Esto permite emitir un nivel de conclusión formal ("Consistent" o "Inconclusive") incluso con 30% de superficie útil, superando el método visual tradicional.',
        custody: '🔫 Microscopía confocal 3D realizada — Correlación CSAFE calculada. Umbral NIST NBIDE aplicado. Informe emitido.',
        pts: 20
      },
      {
        phase: 'FASE 4 · GSR EN CONTEXTO OCUPACIONAL',
        text: 'El sospechoso trabaja como pintor de carrocerías automotrices. Alega que las partículas de Pb+Ba+Sb en sus manos son de la pintura industrial. ¿Qué análisis discrimina definitivamente el GSR de la contaminación ocupacional?',
        img: { type:'canvas', scene:'lab', focus:'sem', label:'Discriminación GSR vs. Contaminación Ocupacional', sublabel:'Pintor de carrocerías — Análisis discriminante morfológico' },
        opts: [
          'Recolectar muestras de las pinturas del taller del sospechoso y analizar por SEM-EDS para comparar su composición elemental.',
          'La presencia de Pb+Ba+Sb es diagnóstica de GSR independientemente de la ocupación.',
          'Analizar la morfología (forma esferoidal vs. angular/irregular) y la composición exacta del sistema ternario Pb-Ba-Sb con mapeo elemental por EDS + determinar el diámetro (0.5-5 µm para GSR vs. > 10 µm para pigmentos de pintura) + comparar con muestras de control del taller del sospechoso.',
          'Solicitar un análisis de orina para metales pesados para confirmar exposición crónica a Pb en lugar de exposición aguda de disparo.'
        ],
        correct: 2,
        fb: '<strong>Discriminación morfológica y dimensional GSR vs. pigmentos industriales:</strong> Los pigmentos de pintura automotriz que contienen Pb son en su mayoría cromato de Pb (amarillo/verde) y minio (Pb₃O₄, rojo). El Ba se usa como sulfato de bario (barita) como carga inerte. El Sb se usa en pinturas ignífugas. Sin embargo, la clave discriminante es: (1) Morfología: GSR es esferoidal (condensación desde gas); pigmentos son angulares o aciculares; (2) Tamaño: GSR 0.5-5µm; pigmentos > 10µm; (3) Sistema ternario: Ba-Sb-Pb en la MISMA partícula como sistema ternario con mapeo EDS es altamente específico de GSR. Los pigmentos de pintura raramente co-existen los tres en una sola partícula esferoidal.',
        custody: '💥 Discriminación GSR/pigmento completada — Morfología esferoidal + EDS ternario Pb+Ba+Sb confirmados. Ind. N° 013.',
        pts: 20
      },
      {
        phase: 'FASE 5 · CONTRAINTERROGATORIO EXPERTO',
        text: 'El fiscal pregunta: "Con el LR de ADN de 10¹³, ¿podemos decir que el acusado ES el donante de la muestra?" El abogado defensor pregunta: "¿Y si ese LR fue calculado con la base de datos de población equivocada?" ¿Cuál es la respuesta pericial técnicamente correcta a ambas preguntas?',
        img: { type:'canvas', scene:'lab', focus:'court', label:'Contrainterrogatorio Experto — Doble Pregunta', sublabel:'LR y base de datos de población — Respuesta pericial técnica' },
        opts: [
          'Sí al fiscal: el LR de 10¹³ equivale a certeza práctica. No al defensor: las bases de datos de población están estandarizadas.',
          'No al fiscal: el perito no determina culpabilidad; el LR=10¹³ significa que la evidencia es 10 billones de veces más probable si el acusado es el donante que si no lo es. Al defensor: es una objeción válida; el LR debe reportarse para múltiples bases de datos poblacionales relevantes (hispana, afroamericana, caucásica) para demostrar robustez del resultado frente a la incertidumbre de la composición de la población.',
          'Sí al fiscal, y al defensor: la base de datos no importa cuando el LR es tan alto.',
          'No puedo responder a preguntas hipotéticas durante el testimonio pericial.'
        ],
        correct: 1,
        fb: '<strong>Doble respuesta pericial — Culpabilidad y sensibilidad de base de datos:</strong> (1) Al FISCAL: El LR cuantifica el peso de la evidencia, no la culpabilidad. El "teorema de Bayes" forense: LR multiplica la odds prior del juez sobre la culpabilidad del acusado para llegar a la odds posterior. La culpabilidad es determinación judicial, no pericial. (2) Al DEFENSOR: Es una objeción científicamente válida y el perito debe haberla anticipado. Reportar el LR para las 3-4 bases de datos poblacionales más relevantes para el caso (y mostrar que incluso en la base de datos más desfavorable el LR sigue siendo > 10⁹) demuestra la robustez de la conclusión y refuerza la credibilidad del perito.',
        custody: '⚖️ Testimonio experto final completado. LR multi-poblacional reportado. Rol pericial definido. Caso 04 cerrado.',
        pts: 20
      }
    ]
  }
];

// ──────────────────────────────────────────────
//  CANVAS DRAWING ENGINE
//  Renders a forensic-themed HUD image for each question
// ──────────────────────────────────────────────
const CANVAS_THEMES = {
  burglary:  { bg: '#070d18', accent: '#f59e0b', scene: 'assets/burglary.png' },
  homicide:  { bg: '#0a0610', accent: '#ef4444', scene: 'assets/homicide_park.png' },
  traffic:   { bg: '#060c14', accent: '#f97316', scene: 'assets/traffic_accident.png' },
  lab:       { bg: '#050d14', accent: '#06b6d4', scene: 'assets/forensic_lab.png' }
};

const FOCUS_ICONS = {
  fingerprint: '🔍', powder: '🖐️', blood: '🩸', glass: '🔺', seal: '🔒',
  cordon: '🚨', footprint: '👣', knife: '🔪', hair: '🔬', hands: '✋',
  skid: '🚗', paint: '🎨', fluid: '🧪', blood_tube: '🩸', vehicle: '🚨',
  afis: '💻', dna: '🧬', ballistic: '🔫', sem: '⚙️', court: '⚖️'
};

let imgCache = {};
async function loadImg(src) {
  if (imgCache[src]) return imgCache[src];
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgCache[src] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawQuestionCanvas(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 900;
  const H = 320;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const theme = CANVAS_THEMES[config.scene] || CANVAS_THEMES.lab;

  // Load and draw background scene image
  const bgImg = await loadImg(theme.scene);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, W, H);
    // Overlay gradient for readability
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(5,11,20,0.45)');
    grad.addColorStop(0.5, 'rgba(5,11,20,0.2)');
    grad.addColorStop(1, 'rgba(5,11,20,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Fallback: solid dark background with grid
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  // Focus spotlight on specific area based on focus type
  const spotlightPositions = {
    fingerprint: { x: W * 0.6, y: H * 0.45 },
    powder:      { x: W * 0.55, y: H * 0.4 },
    blood:       { x: W * 0.5, y: H * 0.55 },
    glass:       { x: W * 0.45, y: H * 0.5 },
    seal:        { x: W * 0.65, y: H * 0.5 },
    cordon:      { x: W * 0.5, y: H * 0.4 },
    footprint:   { x: W * 0.45, y: H * 0.65 },
    knife:       { x: W * 0.55, y: H * 0.5 },
    hair:        { x: W * 0.5, y: H * 0.45 },
    hands:       { x: W * 0.5, y: H * 0.55 },
    skid:        { x: W * 0.5, y: H * 0.6 },
    paint:       { x: W * 0.5, y: H * 0.5 },
    fluid:       { x: W * 0.5, y: H * 0.45 },
    blood_tube:  { x: W * 0.5, y: H * 0.45 },
    vehicle:     { x: W * 0.5, y: H * 0.5 },
    afis:        { x: W * 0.5, y: H * 0.45 },
    dna:         { x: W * 0.5, y: H * 0.5 },
    ballistic:   { x: W * 0.5, y: H * 0.45 },
    sem:         { x: W * 0.5, y: H * 0.5 },
    court:       { x: W * 0.5, y: H * 0.5 },
  };
  const sp = spotlightPositions[config.focus] || { x: W * 0.5, y: H * 0.5 };
  const spotGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 180);
  spotGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
  spotGrad.addColorStop(0.5, 'rgba(255,255,255,0.01)');
  spotGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, W, H);

  // Accent circle pulse at focus point
  ctx.save();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.arc(sp.x, sp.y, 45, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(sp.x, sp.y, 70, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Crosshair lines
  ctx.save();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.moveTo(sp.x - 90, sp.y); ctx.lineTo(sp.x - 50, sp.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sp.x + 50, sp.y); ctx.lineTo(sp.x + 90, sp.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sp.x, sp.y - 90); ctx.lineTo(sp.x, sp.y - 50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sp.x, sp.y + 50); ctx.lineTo(sp.x, sp.y + 90); ctx.stroke();
  ctx.restore();

  // Focus icon
  const icon = FOCUS_ICONS[config.focus] || '🔎';
  ctx.font = '2.4rem serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.92;
  ctx.fillText(icon, sp.x, sp.y);
  ctx.globalAlpha = 1;

  // HUD corner boxes
  const roundRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  };

  // Top-left: CASO box
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(5,11,20,0.78)';
  roundRect(12, 12, 140, 36, 6); ctx.fill();
  ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.5;
  roundRect(12, 12, 140, 36, 6); ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('◆ ESCENA DEL CRIMEN', 22, 30);
  ctx.restore();

  // Scale bar bottom right
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = 'rgba(5,11,20,0.75)';
  roundRect(W - 130, H - 40, 118, 28, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
  roundRect(W - 130, H - 40, 118, 28, 5); ctx.stroke();
  // Scale segments
  const scaleX = W - 118; const scaleY = H - 26;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#fff' : '#000';
    ctx.fillRect(scaleX + i * 20, scaleY - 4, 20, 8);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('0    20   40   60cm', scaleX + 40, scaleY - 6);
  ctx.restore();

  // Bottom-left: Evidence label
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(5,11,20,0.8)';
  roundRect(12, H - 52, 260, 40, 6); ctx.fill();
  ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.2;
  roundRect(12, H - 52, 260, 40, 6); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(config.label || 'EVIDENCIA FORENSE', 22, H - 36);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '10px monospace';
  ctx.fillText(config.sublabel || '', 22, H - 22);
  ctx.restore();
}

// ──────────────────────────────────────────────
//  TOOLS KIT DATA
// ──────────────────────────────────────────────
const DETECTIVE_KIT = [
  { icon:'📷', name:'Cámara DSLR Macro', phase:'Fotografía', desc:'Full frame, objetivo macro 100mm, trípode articulado para fotografía forense 1:1 a 90°. Escala ABFO No.2 incluida.' },
  { icon:'🔦', name:'Luz ALS Forense', phase:'Inspección', desc:'Luz alternativa forense 450nm/530nm. Revela huellas latentes, fibras y manchas biológicas no visibles bajo luz blanca.' },
  { icon:'🖐️', name:'Kit de Polvo Dactilar', phase:'Huellas', desc:'Polvo magnético negro/gris, vara magnética, pincel cebello de camello, cinta lifting forense 4" y acetato.' },
  { icon:'🧬', name:'Kit de ADN de Campo', phase:'Biología', desc:'Hisopos estériles DNA-free, fundas de papel perforado, solución salina estéril. Para la técnica de doble hisopo.' },
  { icon:'🔺', name:'Embalajes Forenses', phase:'Custodia', desc:'Bolsas de papel kraft, sobres de papel glassine, cajas rígidas con espuma EPS, bridas plásticas, papel libre de ácidos.' },
  { icon:'🔒', name:'Sellos Tamper-Evident', phase:'Cadena', desc:'Precintos con patrón VOID rojo, numeración secuencial, pluma permanente Staedtler. Formularios FOCAD-07.' },
  { icon:'📋', name:'Formularios FOCAD', phase:'Documentación', desc:'FOCAD-07: Libro de evidencias. FOCAD-08: Dictamen pericial. FOCAD-09: Traslado de cadáver. Con trazabilidad GPS.' },
  { icon:'🧪', name:'Reactivos de Campo', phase:'Química', desc:'Luminol aerosol, reactivo Kastle-Meyer (Hemastix), kit confirmatorio Hexagon-OBTI para sangre humana.' },
  { icon:'👣', name:'Kit de Vaciado', phase:'Huellas', desc:'Yeso dental Clase III (tipo dental stone), mezclador desechable, lata de laca fijadora, cajones de contención para yeso.' },
  { icon:'🛡️', name:'EPP Personal', phase:'Protección', desc:'Guantes nitrilo doble, mono Tyvek Cat. III, cubrezapatos desechables, mascarilla FFP2. Para preservar la escena y al detective.' },
];

// ──────────────────────────────────────────────
//  CHATBOT KNOWLEDGE BASE
// ──────────────────────────────────────────────
const CHAT_KB = {
  'cadena de custodia': '📋 <strong>Cadena de Custodia</strong><br>Es el registro cronológico ininterrumpido de todos los actos de recolección, embalaje, traslado, almacenamiento y análisis de una evidencia. Cada transferencia debe documentarse en el FOCAD-07 con hora, identificación del entregador y receptor, y estado del embalaje. Un eslabón roto no invalida automáticamente la evidencia, pero obliga a presentar documentación complementaria (bitácoras electrónicas, affidávits) para acreditar su integridad.',
  'cadena custodia': '📋 <strong>Cadena de Custodia</strong><br>Es el registro cronológico ininterrumpido de todos los actos sobre una evidencia. Cada transferencia debe documentarse en el FOCAD-07. Un eslabón roto puede ser saneado con affidávits y registros electrónicos.',
  'papel': '🛍️ <strong>Papel vs. Plástico en Embalaje</strong><br><strong>Bolsas de papel kraft:</strong> para toda evidencia biológica húmeda o seca (sangre, saliva, pelo, huesos). El papel permite que la humedad residual transpire, evitando la proliferación de hongos que degradan el ADN.<br><strong>Bolsas de plástico:</strong> solo para evidencia inorgánica seca (fragmentos metálicos, proyectiles, vidrios) o cuando se requiere sellado hermético para volátiles (acelerantes de incendio en lata metálica).',
  'bolsa plástico': '🛍️ <strong>Papel vs. Plástico</strong><br>Papel kraft para evidencia biológica (previene degradación de ADN). Plástico solo para inorgánica seca o volátiles en contenedor específico.',
  'embalaje': '🛍️ <strong>Embalaje Forense por Tipo de Evidencia</strong><br>• Biológica (sangre, pelo): papel kraft o sobre de papel<br>• Vidrios: papel kraft individual + caja rígida<br>• Arma blanca: caja rígida con bridas plásticas<br>• Proyectil: caja rígida con espuma de alta densidad<br>• Drogas/volátiles: frasco de vidrio ámbar hermético',
  'daubert': '⚖️ <strong>Estándar Daubert</strong><br>Es el criterio adoptado por la Corte Suprema de EE.UU. (Daubert v. Merrell Dow, 1993) para evaluar la admisibilidad de la prueba científica en juicio. El juez actúa como "guardián" (gatekeeper) y evalúa: (1) ¿La teoría puede ser y ha sido probada? (2) ¿Ha sido sometida a revisión por pares y publicada? (3) ¿Tiene tasa de error conocida? (4) ¿Es generalmente aceptada en la comunidad científica? Muchos sistemas latinoamericanos adoptan criterios similares.',
  'afis': '🔍 <strong>AFIS (Automated Fingerprint Identification System)</strong><br>Sistema biométrico que digitaliza huellas dactilares, extrae automáticamente las minucias (bifurcaciones, extremos de cresta, puntos, crestas interrumpidas) y las compara contra bases de datos de millones de registros. El AFIS proporciona un ranking de candidatos; el dictamen definitivo lo emite siempre un perito dactiloscopista mediante el proceso ACE-V. No reemplaza al perito humano.',
  'gsr': '💥 <strong>GSR (Gunshot Residue - Residuos de Disparo)</strong><br>Son las partículas esferoidales generadas por la deflagración de la pólvora y el fulminante a temperaturas > 2000°C. Se depositan en mano, cara y ropa del tirador. Composición diagnóstica: sistema ternario Pb+Ba+Sb en la misma partícula esferoidal. Análisis: SEM-EDS. Morfología esferoidal + composición ternaria = diagnóstico de GSR con alta especificidad. La transferencia secundaria es posible pero cuantitativamente menor (< 5 partículas vs. decenas en tirador).',
  'adn': '🧬 <strong>Análisis de ADN Forense</strong><br>Técnica principal: STR (Short Tandem Repeats) en 20-24 loci. El resultado se expresa como LR (Likelihood Ratio). Una RMP de 1 en 10 billones significa que la probabilidad de que un individuo no relacionado comparta el perfil es 1:10¹³. El perito reporta LR, no culpabilidad. Para ADN degradado: kit MiniFiler (amplicons < 200 pb). Para mezclas complejas: software STRmix o TrueAllele.',
  'doble hisopo': '🩸 <strong>Técnica del Doble Hisopo</strong><br>(1) Hisopo N°1 humedecido con agua estéril bidestilada: rehidrata las células de la mancha seca, facilitando su disolución. (2) Hisopo N°2 seco: absorbe inmediatamente la solución celular rehidratada. Esta secuencia maximiza la recuperación de ADN en superficies no porosas. Ambos se embalan en sobres de papel individuales para transpiración.',
  'acm': '📏 <strong>Reconstrucción de Accidente de Tránsito</strong><br>Los parámetros clave son: longitud de huellas de frenada, coeficiente de fricción µ (medido con decelerómetro), tipo de pavimento, clima. La fórmula básica es V = √(2×µ×g×d). El coeficiente µ varía: asfalto seco ≈0.75, asfalto húmedo ≈0.45. El EDR (Event Data Recorder) de los vehículos modernos registra velocidad, aceleración y frenada en los 5 segundos previos al impacto.',
  'luminol': '🔬 <strong>Luminol en Detección de Sangre</strong><br>El Luminol reacciona con el hierro del grupo hemo de la hemoglobina en presencia de H₂O₂ (generado en la reacción). La quimioluminiscencia azul-verde indica sangre, pero también reacciona con otros oxidantes (lejía, ciertos metales). Es altamente sensible (1:10.000.000) pero no específico. Debe confirmarse con Kastle-Meyer o Hexagon-OBTI. No destruye el ADN si se aplica con precaución, pero puede degradarlo si el área es inundada.',
  'cianoacrilato': '🧪 <strong>Vapores de Cianocrilato para Huellas</strong><br>El cianocrilato (super glue) polimeriza al contacto con los aminoácidos, ácidos grasos y sales de la huella dactilar, dejando un residuo blanco visible. Se usa en cámara sellada a 70°C con humedad controlada. Técnica excelente para superficies no porosas (plástico, vidrio, metal). Puede seguirse de Rodamina 6G para fluorescencia bajo luz ALS. Desventaja: proceso irreversible que destruye la muestra para análisis posteriores de ADN en la huella.',
};

function getChatResponse(input) {
  const q = input.toLowerCase().trim();
  for (const [key, val] of Object.entries(CHAT_KB)) {
    if (q.includes(key)) return val;
  }
  // Generic responses
  const generic = [
    '🔍 Pregunta interesante, Detective. En el procedimiento forense estándar, siempre se prioriza la protección de la escena antes de la recolección. ¿Tienes una pregunta más específica sobre la cadena de custodia, el AFIS, el ADN o las técnicas de embalaje?',
    '🧬 En criminalística, la máxima es "cada contacto deja una huella" (principio de Locard). ¿Quieres que profundice en alguna técnica específica como el SEM-EDS, la balística o el análisis de ADN?',
    '⚖️ El éxito de una investigación no depende solo de encontrar la evidencia, sino de que esa evidencia sea admisible en juicio. La cadena de custodia y el protocolo de recolección son la diferencia entre condenar a un culpable o verlo libre. ¿Tienes alguna duda sobre los protocolos de este caso?',
    '📋 Como Detective Jefe, tu decisión en campo tiene consecuencias en el tribunal. Recuerda: sin cadena de custodia ininterrumpida, la mejor evidencia puede ser excluida. ¿En qué fase del procesamiento de la escena necesitas orientación?',
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

// ──────────────────────────────────────────────
//  AUDIO ENGINE (Web Audio API)
// ──────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, gainVal) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}
function playSuccess() { playTone(880, 'sine', 0.15, 0.3); setTimeout(() => playTone(1320, 'sine', 0.25, 0.25), 100); }
function playError()   { playTone(200, 'sawtooth', 0.18, 0.25); setTimeout(() => playTone(160, 'sawtooth', 0.22, 0.2), 80); }
function playClick()   { playTone(600, 'square', 0.06, 0.12); }
function playTick()    { playTone(1200, 'sine', 0.04, 0.1); }

// ──────────────────────────────────────────────
//  DOM HELPERS
// ──────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function setHidden(el, hide) { if (!el) return; el.classList.toggle('hidden', hide); }

// ──────────────────────────────────────────────
//  SCREEN NAVIGATION
// ──────────────────────────────────────────────
const SCREENS = ['portada','escena','dificultad','preguntas','resultado','dictamen'];
const NAV_MAP  = { portada:'nav-portada', escena:'nav-escena', dificultad:'nav-dificultad', preguntas:'nav-preguntas', dictamen:'nav-dictamen' };

function goToScreen(name) {
  SCREENS.forEach(s => {
    const el = $(`view-${s}`);
    if (el) { el.classList.remove('active'); }
  });
  const target = $(`view-${name}`);
  if (target) {
    requestAnimationFrame(() => {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  // Update stage nav
  Object.entries(NAV_MAP).forEach(([k, v]) => {
    const el = $(v);
    if (!el) return;
    el.classList.toggle('active', k === name || k === (name === 'resultado' ? 'preguntas' : name));
  });
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
      <img class="scene-select-img" src="${s.img}" alt="${s.title}" loading="lazy">
      <div class="scene-select-body">
        <span class="scene-num-tag">CASO ${s.num}</span>
        <div class="scene-select-title">${s.title}</div>
        <div class="scene-select-desc">${s.subtitle}</div>
      </div>
    </div>
  `).join('');

  $('btn-select-all-scenes').addEventListener('click', () => {
    if (STATE.selectedScenes.length === SCENES.length) {
      STATE.selectedScenes = [];
      document.querySelectorAll('.scene-select-card').forEach(c => c.classList.remove('selected'));
    } else {
      STATE.selectedScenes = SCENES.map((_, i) => i);
      document.querySelectorAll('.scene-select-card').forEach(c => c.classList.add('selected'));
    }
    updateScenesCounter();
    playTick();
  });
}

function toggleScene(idx) {
  const card = $(`scene-card-${idx}`);
  const pos = STATE.selectedScenes.indexOf(idx);
  if (pos === -1) {
    STATE.selectedScenes.push(idx);
    card.classList.add('selected');
  } else {
    STATE.selectedScenes.splice(pos, 1);
    card.classList.remove('selected');
  }
  updateScenesCounter();
  playTick();
}

function updateScenesCounter() {
  const n = STATE.selectedScenes.length;
  $('scenes-counter').textContent = `${n} de 4 seleccionadas`;
  const btn = $('btn-proceed-to-difficulty');
  if (n > 0) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
}

function proceedToDifficulty() {
  if (STATE.selectedScenes.length === 0) return;
  // Sort selected scenes in order
  STATE.selectedScenes.sort((a, b) => a - b);
  goToScreen('dificultad');
}

// ──────────────────────────────────────────────
//  DIFFICULTY SELECTION
// ──────────────────────────────────────────────
function selectDifficulty(diff) {
  STATE.difficulty = diff;
  // Show diff badge in header
  const badge = $('diff-badge-header');
  badge.className = `diff-badge-header ${diff}`;
  badge.textContent = diff === 'dificil' ? '🔥 DIFÍCIL' : '💀 EXPERTO';
  badge.style.display = 'inline-flex';

  // Start mission!
  STATE.sceneQueueIdx = 0;
  STATE.questionIdx = 0;
  STATE.score = 0;
  STATE.scenesResults = [];
  STATE.custodyLog = [];
  STATE.questionsAnswered = [];
  $('score-display').textContent = '0';
  loadCurrentScene();
  goToScreen('preguntas');
  playSuccess();
}

// ──────────────────────────────────────────────
//  SCENE & QUESTION LOADING
// ──────────────────────────────────────────────
function loadCurrentScene() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  STATE.sceneScore = 0;
  STATE.questionIdx = 0;

  // Update scene header
  $('scene-case-badge').textContent = `CASO ${scene.num}`;
  $('scene-title-display').textContent = scene.title;
  $('scene-subtitle-display').textContent = scene.subtitle;
  $('active-case-label').textContent = `CASO ${scene.num} · ACTIVO`;

  // Update total questions counter
  const questions = getQuestions(sceneIdx);
  $('q-total-num').textContent = questions.length;

  renderQuestion();
}

function getQuestions(sceneIdx) {
  const scene = SCENES[sceneIdx];
  return STATE.difficulty === 'experto' ? scene.experto : scene.dificil;
}

function renderQuestion() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  const questions = getQuestions(sceneIdx);
  const q = questions[STATE.questionIdx];

  // Update progress
  $('q-current-num').textContent = STATE.questionIdx + 1;
  $('q-total-num').textContent = questions.length;

  // Update phase badge
  $('question-phase-badge').textContent = q.phase;

  // Update question text
  $('question-text').textContent = q.text;

  // Update question card difficulty border
  const qcard = $('question-card');
  qcard.className = 'question-card';
  qcard.classList.add(STATE.difficulty === 'experto' ? 'expert-mode' : 'hard-mode');

  // Draw canvas image for this question
  const sceneKeys = ['burglary', 'homicide', 'traffic', 'lab'];
  const sceneKey = sceneKeys[sceneIdx] || 'lab';
  $('hud-scene-name').textContent = scene.title.toUpperCase();
  $('hud-diff-pill').textContent = STATE.difficulty === 'experto' ? '💀 EXPERTO' : '🔥 DIFÍCIL';
  $('hud-diff-pill').className = `hud-pill ${STATE.difficulty === 'experto' ? 'expert-hud' : 'hard-hud'}`;
  $('hud-evidence-tag').textContent = q.img.label || 'EVIDENCIA FORENSE';
  $('hud-q-counter').textContent = `P.${STATE.questionIdx + 1}/${questions.length}`;

  drawQuestionCanvas('question-canvas', {
    scene: sceneKey,
    focus: q.img.focus,
    label: q.img.label,
    sublabel: q.img.sublabel
  });

  // Render options
  const optsContainer = $('options-container');
  optsContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = `opt-${i}`;
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i));
    optsContainer.appendChild(btn);
  });

  // Hide feedback and continue button
  const fb = $('feedback-box');
  fb.className = 'feedback-box hidden';
  $('btn-next-question').classList.add('hidden');
}

function selectAnswer(chosenIdx) {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const questions = getQuestions(sceneIdx);
  const q = questions[STATE.questionIdx];

  // Disable all options
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'default';
  });

  const isCorrect = chosenIdx === q.correct;
  const pts = isCorrect ? q.pts : 0;

  // Style the chosen option
  const chosenBtn = $(`opt-${chosenIdx}`);
  if (isCorrect) {
    chosenBtn.classList.add('selected-correct');
    playSuccess();
  } else {
    chosenBtn.classList.add('selected-wrong');
    // Reveal correct answer
    $(`opt-${q.correct}`).classList.add('revealed-correct');
    playError();
  }

  // Update score
  if (isCorrect) {
    STATE.score += pts;
    STATE.sceneScore += pts;
    $('score-display').textContent = STATE.score;
    // Score pop animation
    $('score-display').style.transform = 'scale(1.3) translateY(-2px)';
    setTimeout(() => $('score-display').style.transform = 'scale(1)', 350);
  }

  // Show feedback
  const fb = $('feedback-box');
  fb.className = `feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}`;
  $('feedback-status').textContent = isCorrect ? '✓ CORRECTO' : '✗ INCORRECTO';
  $('feedback-points').textContent = isCorrect ? `+${pts} PTS` : '+0 PTS';
  $('feedback-points').style.color = isCorrect ? 'var(--color-success)' : 'var(--color-danger)';
  $('feedback-body').innerHTML = q.fb;

  const custodyNotice = $('custody-notice');
  if (q.custody) {
    custodyNotice.textContent = q.custody;
    custodyNotice.style.display = 'block';
    // Log custody entry
    STATE.custodyLog.push({
      scene: SCENES[sceneIdx].title,
      phase: q.phase,
      text: q.custody,
      correct: isCorrect,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour12: false })
    });
  } else {
    custodyNotice.style.display = 'none';
  }

  // Log answer
  STATE.questionsAnswered.push({
    scene: SCENES[sceneIdx].title,
    phase: q.phase,
    question: q.text,
    chosen: q.opts[chosenIdx],
    correct: q.opts[q.correct],
    isCorrect,
    pts
  });

  $('btn-next-question').classList.remove('hidden');
}

function nextQuestion() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const questions = getQuestions(sceneIdx);
  STATE.questionIdx++;
  if (STATE.questionIdx >= questions.length) {
    // Scene complete
    showSceneResult();
  } else {
    renderQuestion();
  }
}

// ──────────────────────────────────────────────
//  SCENE RESULT
// ──────────────────────────────────────────────
function showSceneResult() {
  const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
  const scene = SCENES[sceneIdx];
  const questions = getQuestions(sceneIdx);
  const maxPts = questions.length * (STATE.difficulty === 'experto' ? 20 : 10);
  const correct = STATE.questionsAnswered.filter(q => q.scene === scene.title && q.isCorrect).length;

  STATE.scenesResults.push({
    sceneId: scene.id,
    sceneNum: scene.num,
    sceneTitle: scene.title,
    correct,
    pts: STATE.sceneScore,
    maxPts,
    diff: STATE.difficulty
  });

  $('result-scene-title').textContent = `📋 Resultado — ${scene.title}`;
  $('result-scene-score').textContent = STATE.sceneScore;
  $('result-scene-max').textContent = maxPts;
  $('result-total-score').textContent = STATE.score;

  // Checklist
  const area = $('result-checklist-area');
  const sceneAnswers = STATE.questionsAnswered.filter(q => q.scene === scene.title);
  area.innerHTML = `
    <h3 style="font-family:var(--font-mono); color:var(--color-cyan-bright); font-size:0.88rem; text-transform:uppercase; margin-bottom:0.85rem;">Resumen de Respuestas</h3>
    <div class="checklist-items-grid">
      ${sceneAnswers.map((a, i) => `
        <div class="check-item">
          <span style="font-size:1.2rem;">${a.isCorrect ? '✅' : '❌'}</span>
          <div>
            <div style="font-weight:700; font-size:0.88rem; color:#fff;">${a.phase}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${a.isCorrect ? `+${a.pts} pts` : 'Sin puntuación'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Check if more scenes to go
  const hasMore = STATE.sceneQueueIdx < STATE.selectedScenes.length - 1;
  const nextBtn = $('btn-next-scene');
  if (hasMore) {
    nextBtn.textContent = 'Siguiente Caso →';
    nextBtn.style.display = 'inline-flex';
  } else {
    nextBtn.textContent = 'Ver Dictamen Final →';
    nextBtn.onclick = () => showFinalReport();
  }

  goToScreen('resultado');
}

function loadNextScene() {
  STATE.sceneQueueIdx++;
  if (STATE.sceneQueueIdx < STATE.selectedScenes.length) {
    loadCurrentScene();
    goToScreen('preguntas');
  } else {
    showFinalReport();
  }
}

// ──────────────────────────────────────────────
//  FINAL REPORT
// ──────────────────────────────────────────────
function showFinalReport() {
  const totalPts = STATE.score;
  const totalPossible = STATE.scenesResults.reduce((acc, r) => acc + r.maxPts, 0);
  const pct = totalPossible > 0 ? Math.round((totalPts / totalPossible) * 100) : 0;

  $('final-total-pts').textContent = totalPts;
  $('final-max-pts').textContent = totalPossible;
  $('dictamen-date').textContent = new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' });
  $('dictamen-expediente').textContent = `DET-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Percentage bar (animate after transition)
  setTimeout(() => {
    $('final-pct-bar').style.width = pct + '%';
    $('final-pct-label').textContent = pct + '%';
  }, 400);

  // Rank
  const ranks = [
    { min:0,  icon:'🔰', name:'Agente en Formación',        desc:'Necesitas reforzar los fundamentos del protocolo forense y la cadena de custodia. Revisa el manual de procedimientos de la unidad antes de tu próxima misión.' },
    { min:40, icon:'🥉', name:'Detective de Homicidios',     desc:'Dominas los procedimientos básicos pero cometes errores en situaciones complejas. Profundiza en las técnicas de laboratorio y la admisibilidad de la evidencia.' },
    { min:60, icon:'🥈', name:'Detective Senior',            desc:'Sólido conocimiento procedimental y técnico. Con práctica adicional en escenarios experto, podrías alcanzar el nivel Jefe de Unidad.' },
    { min:75, icon:'🥇', name:'Jefe de Unidad Forense',      desc:'Excelente desempeño. Tu manejo de la cadena de custodia y los protocolos técnicos demuestra un nivel de competencia digno de supervisar investigaciones complejas.' },
    { min:90, icon:'🏆', name:'Inspector Jefe · Élite',      desc:'Rendimiento sobresaliente en todos los casos. Tu criterio forense, rigor científico y control de la cadena de custodia representan el más alto estándar de la unidad especial.' },
  ];
  const rank = ranks.reverse().find(r => pct >= r.min) || ranks[0];
  ranks.reverse();
  $('final-rank-icon').textContent = rank.icon;
  $('final-rank-name').textContent = rank.name;
  $('final-rank-desc').textContent = rank.desc;

  // Scene table
  const tbody = $('final-scene-tbody');
  tbody.innerHTML = STATE.scenesResults.map(r => `
    <tr>
      <td style="font-family:var(--font-mono); color:var(--color-cyan);">CASO ${r.sceneNum}</td>
      <td style="font-weight:700; color:#fff;">${r.sceneTitle}</td>
      <td><span style="font-family:var(--font-mono); font-size:0.8rem; padding:0.2rem 0.5rem; border-radius:4px; background:${r.diff === 'experto' ? 'rgba(168,85,247,0.2)' : 'rgba(249,115,22,0.2)'}; color:${r.diff === 'experto' ? '#a855f7' : '#f97316'};">${r.diff.toUpperCase()}</span></td>
      <td style="font-family:var(--font-mono); color:${r.correct === 5 ? 'var(--color-success)' : r.correct >= 3 ? 'var(--color-yellow)' : 'var(--color-danger)'};">${r.correct}/5</td>
      <td style="font-family:var(--font-mono); font-weight:800; color:var(--color-yellow-bright);">${r.pts}/${r.maxPts}</td>
    </tr>
  `).join('');

  // Instruments grid
  const ig = $('instruments-grid');
  const instruments = [
    { phase:'Fotografía', icon:'📷', title:'Fotografía Forense 3-Planos', desc:'Sistema DSLR con escala ABFO, trípode rígido y luz oblicua. Registro métrico estándar.' },
    { phase:'Dactiloscopia', icon:'🔍', title:'AFIS + ACE-V', desc:'Sistema biométrico automatizado con verificación humana por dactiloscopista certificado.' },
    { phase:'Biología', icon:'🧬', title:'STR Multiplex 20 loci', desc:'Kit PowerPlex Fusion / MiniFiler para ADN degradado. Software STRmix para mezclas.' },
    { phase:'Química', icon:'🧪', title:'SEM-EDS / GC-MS', desc:'Microscopía electrónica de barrido para GSR. Cromatografía para volátiles y toxicología.' },
    { phase:'Balística', icon:'🔫', title:'Microscopio Comparador AFTE', desc:'Comparación de estrías y marcas de herramientas. Nivel de conclusión según estándar AFTE.' },
    { phase:'Toxicología', icon:'🩸', title:'GC-Headspace + Tubo gris NaF', desc:'Análisis de etanol en sangre. Tubo con fluoruro de sodio como antifermentativo.' },
  ];
  ig.innerHTML = instruments.map(inst => `
    <div class="inst-card">
      <div class="inst-top">
        <span style="font-size:1.5rem;">${inst.icon}</span>
        <span class="inst-phase-tag">${inst.phase}</span>
      </div>
      <div style="font-weight:700; color:#fff; font-size:0.92rem;">${inst.title}</div>
      <div style="font-size:0.82rem; color:var(--text-muted);">${inst.desc}</div>
    </div>
  `).join('');

  goToScreen('dictamen');
  playSuccess();
}

// ──────────────────────────────────────────────
//  RESET
// ──────────────────────────────────────────────
function resetSimulator() {
  STATE.selectedScenes = [];
  STATE.difficulty = null;
  STATE.sceneQueueIdx = 0;
  STATE.questionIdx = 0;
  STATE.score = 0;
  STATE.sceneScore = 0;
  STATE.scenesResults = [];
  STATE.custodyLog = [];
  STATE.questionsAnswered = [];
  $('score-display').textContent = '0';
  $('diff-badge-header').style.display = 'none';
  $('active-case-label').textContent = 'SISTEMA ACTIVO';
  // Reset scene selection
  document.querySelectorAll('.scene-select-card').forEach(c => c.classList.remove('selected'));
  updateScenesCounter();
  goToScreen('portada');
  playClick();
}

// ──────────────────────────────────────────────
//  CUSTODY MODAL
// ──────────────────────────────────────────────
function openCustodyModal() {
  $('custody-modal').classList.remove('hidden');
  $('custody-folio-label').textContent = `Folio: FOCAD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
  $('custody-timestamp-label').textContent = `Fecha: ${new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`;

  const list = $('custody-entries-list');
  if (STATE.custodyLog.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-family:var(--font-mono); font-size:0.88rem;">📋 Sin registros aún. Las entradas aparecerán a medida que respondas preguntas.</div>`;
    return;
  }
  list.innerHTML = STATE.custodyLog.map((entry, i) => `
    <div class="custody-entry-card ${entry.correct ? 'sealed' : ''}">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <span style="font-family:var(--font-mono); font-weight:800; font-size:0.88rem; color:${entry.correct ? 'var(--color-success)' : 'var(--color-danger)'};">${entry.correct ? '✅' : '⚠️'} ENTRADA N° ${String(i+1).padStart(3,'0')}</span>
        <span class="tamper-tape-graphic" style="${entry.correct ? 'background:repeating-linear-gradient(45deg,#10b981 0,#10b981 10px,#18181b 10px,#18181b 20px);' : ''}">${entry.correct ? '🟢 CORRECTO' : '🔴 ERROR PROTOCOLARIO'}</span>
      </div>
      <div class="custody-meta-grid">
        <span>🏷️ <strong>Escena:</strong> ${entry.scene}</span>
        <span>📋 <strong>Fase:</strong> ${entry.phase}</span>
        <span>⏰ <strong>Hora:</strong> ${entry.timestamp}</span>
      </div>
      <div style="font-size:0.88rem; color:var(--text-sub); font-family:var(--font-mono);">${entry.text}</div>
    </div>
  `).join('');
}
function closeCustodyModal() { $('custody-modal').classList.add('hidden'); }

// ──────────────────────────────────────────────
//  TOOLS MODAL
// ──────────────────────────────────────────────
function openToolsModal() {
  const grid = $('tools-kit-grid');
  grid.innerHTML = DETECTIVE_KIT.map(tool => `
    <div style="background:#060d1a; border:1px solid var(--border-tactical); border-radius:8px; padding:0.95rem; display:flex; gap:0.75rem;">
      <span style="font-size:1.8rem; flex-shrink:0;">${tool.icon}</span>
      <div>
        <div style="font-weight:800; color:#fff; font-size:0.9rem; margin-bottom:0.2rem;">${tool.name}</div>
        <div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--color-cyan); margin-bottom:0.3rem;">FASE: ${tool.phase}</div>
        <div style="font-size:0.82rem; color:var(--text-muted);">${tool.desc}</div>
      </div>
    </div>
  `).join('');
  $('tools-modal').classList.remove('hidden');
}
function closeToolsModal() { $('tools-modal').classList.add('hidden'); }

// ──────────────────────────────────────────────
//  CHATBOT
// ──────────────────────────────────────────────
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  $('chat-window').classList.toggle('open', chatOpen);
  if (chatOpen && $('chat-body').children.length === 0) {
    addChatMsg('bot', '🤖 <strong>Inspector Detective IA en línea.</strong><br>Soy tu asistente táctico forense. Puedo resolver dudas sobre cadena de custodia, técnicas de laboratorio, protocolos de campo, estadística forense y admisibilidad de evidencia. ¿En qué te asesoro, Detective?');
    addChatMsg('tip', '💡 <strong>Tip inicial:</strong> Recuerda que la cadena de custodia NO es solo el formulario. Es toda la trazabilidad de la evidencia desde su hallazgo hasta su presentación en juicio.');
  }
  playTick();
}

function addChatMsg(type, html) {
  const body = $('chat-body');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = html;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function askChat(question) {
  if (!chatOpen) toggleChat();
  addChatMsg('user', question);
  setTimeout(() => addChatMsg('bot', getChatResponse(question)), 500);
}

function openChatWithMessage(msg) {
  if (!chatOpen) toggleChat();
  setTimeout(() => {
    addChatMsg('user', msg);
    setTimeout(() => addChatMsg('bot', getChatResponse(msg)), 600);
  }, 300);
}

function sendChatMessage() {
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  addChatMsg('user', text);
  input.value = '';
  playTick();
  setTimeout(() => {
    addChatMsg('bot', getChatResponse(text));
    $('chat-body').scrollTop = $('chat-body').scrollHeight;
  }, 600);
}

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSceneSelectGrid();

  // Header buttons
  $('btn-custody-open').addEventListener('click', openCustodyModal);
  $('btn-tools-open').addEventListener('click', openToolsModal);
  $('btn-print').addEventListener('click', () => window.print());

  // Modal overlay click to close
  $('custody-modal').addEventListener('click', e => { if (e.target === $('custody-modal')) closeCustodyModal(); });
  $('tools-modal').addEventListener('click', e => { if (e.target === $('tools-modal')) closeToolsModal(); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCustodyModal(); closeToolsModal(); }
    if (e.key === 'Enter' && !$('view-preguntas').classList.contains('active')) return;
    if (['1','2','3','4'].includes(e.key) && $('view-preguntas').classList.contains('active')) {
      const idx = parseInt(e.key) - 1;
      const btn = $(`opt-${idx}`);
      if (btn && !btn.disabled) btn.click();
    }
  });

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    if ($('view-preguntas').classList.contains('active')) {
      const sceneIdx = STATE.selectedScenes[STATE.sceneQueueIdx];
      if (sceneIdx !== undefined) {
        const questions = getQuestions(sceneIdx);
        const q = questions[STATE.questionIdx];
        if (q) {
          const sceneKeys = ['burglary', 'homicide', 'traffic', 'lab'];
          drawQuestionCanvas('question-canvas', {
            scene: sceneKeys[sceneIdx] || 'lab',
            focus: q.img.focus,
            label: q.img.label,
            sublabel: q.img.sublabel
          });
        }
      }
    }
  });
});
