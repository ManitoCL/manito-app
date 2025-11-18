/**
 * Care Instruction Templates for Job Completion
 *
 * Comprehensive templates covering all 26 project categories and 300+ service types
 * in the Manito marketplace. Each category has specific, actionable care instructions
 * that providers can quickly select when completing jobs.
 */

export interface CareInstruction {
  id: string;
  text: string;
  category: string;
}

export interface CategoryInstructions {
  categoryName: string;
  instructions: CareInstruction[];
}

/**
 * Complete care instruction templates for all Manito service categories
 */
export const CARE_INSTRUCTION_TEMPLATES: Record<string, CategoryInstructions> = {
  // ============================================================================
  // GASFITERIA_AGUA (Water Plumbing)
  // ============================================================================
  gasfiteria_agua: {
    categoryName: 'Gasfitería - Agua',
    instructions: [
      { id: 'agua_01', text: 'No usar instalación por 2 horas mientras sella', category: 'gasfiteria_agua' },
      { id: 'agua_02', text: 'Verificar fugas cada 24 horas durante primera semana', category: 'gasfiteria_agua' },
      { id: 'agua_03', text: 'Cerrar llave de paso ante cualquier goteo', category: 'gasfiteria_agua' },
      { id: 'agua_04', text: 'Revisar presión de agua en primeras 48 horas', category: 'gasfiteria_agua' },
      { id: 'agua_05', text: 'Ajustar termostato de termo eléctrico a 60-65°C', category: 'gasfiteria_agua' },
      { id: 'agua_06', text: 'Silicona necesita 24h para secar - no mojar', category: 'gasfiteria_agua' },
      { id: 'agua_07', text: 'Revisar nivel de sal del ablandador mensualmente', category: 'gasfiteria_agua' },
      { id: 'agua_08', text: 'Cambiar filtro de agua cada 3-6 meses según uso', category: 'gasfiteria_agua' },
      { id: 'agua_09', text: 'No usar químicos abrasivos en grifería cromada', category: 'gasfiteria_agua' },
      { id: 'agua_10', text: 'Limpiar sifón cada 3 meses para evitar obstrucciones', category: 'gasfiteria_agua' },
    ],
  },

  // ============================================================================
  // GASFITERIA_GAS (Gas Plumbing & Appliances)
  // ============================================================================
  gasfiteria_gas: {
    categoryName: 'Gasfitería - Gas',
    instructions: [
      { id: 'gas_01', text: 'Ventilar ambiente por 30 minutos después del trabajo', category: 'gasfiteria_gas' },
      { id: 'gas_02', text: 'Verificar diariamente que no haya olor a gas', category: 'gasfiteria_gas' },
      { id: 'gas_03', text: 'Programar mantención preventiva en 6 meses', category: 'gasfiteria_gas' },
      { id: 'gas_04', text: 'Llamar inmediatamente ante olor extraño o sospecha de fuga', category: 'gasfiteria_gas' },
      { id: 'gas_05', text: 'Llama debe ser azul - si es amarilla/naranja, llamar', category: 'gasfiteria_gas' },
      { id: 'gas_06', text: 'Si piloto se apaga frecuentemente, programar revisión', category: 'gasfiteria_gas' },
      { id: 'gas_07', text: 'Trabajo certificado SEC - mantener certificado disponible', category: 'gasfiteria_gas' },
      { id: 'gas_08', text: 'Mantención anual obligatoria para caldera/calefón', category: 'gasfiteria_gas' },
      { id: 'gas_09', text: 'Purgar radiadores al inicio de temporada de invierno', category: 'gasfiteria_gas' },
      { id: 'gas_10', text: 'No manipular instalación de gas sin autorización SEC', category: 'gasfiteria_gas' },
    ],
  },

  // ============================================================================
  // ELECTRICIDAD (Electrical Work)
  // ============================================================================
  electricidad: {
    categoryName: 'Electricidad e Iluminación',
    instructions: [
      { id: 'elec_01', text: 'No sobrecargar circuito instalado', category: 'electricidad' },
      { id: 'elec_02', text: 'Probar interruptores y enchufes regularmente', category: 'electricidad' },
      { id: 'elec_03', text: 'Reportar inmediatamente chispas o calentamiento', category: 'electricidad' },
      { id: 'elec_04', text: 'Mantener tablero eléctrico accesible y señalizado', category: 'electricidad' },
      { id: 'elec_05', text: 'No manipular con manos mojadas o pies descalzos', category: 'electricidad' },
      { id: 'elec_06', text: 'Instalación certificada SEC - mantener certificado', category: 'electricidad' },
      { id: 'elec_07', text: 'Probar interruptor diferencial mensualmente', category: 'electricidad' },
      { id: 'elec_08', text: 'Paneles solares: limpieza cada 3-6 meses', category: 'electricidad' },
      { id: 'elec_09', text: 'Revisar baterías de generador mensualmente', category: 'electricidad' },
      { id: 'elec_10', text: 'No perforar muros sin detector de cables', category: 'electricidad' },
    ],
  },

  // ============================================================================
  // PINTURA_TERMINACIONES (Painting & Finishes)
  // ============================================================================
  pintura_terminaciones: {
    categoryName: 'Pintura y Terminaciones',
    instructions: [
      { id: 'pint_01', text: 'No tocar superficies pintadas por 24-48 horas', category: 'pintura_terminaciones' },
      { id: 'pint_02', text: 'Ventilar ambiente por 2-3 días', category: 'pintura_terminaciones' },
      { id: 'pint_03', text: 'Evitar humedad en zona pintada por 1 semana', category: 'pintura_terminaciones' },
      { id: 'pint_04', text: 'Limpiar solo con paño seco por 15 días', category: 'pintura_terminaciones' },
      { id: 'pint_05', text: 'Curado completo de pintura toma 30 días', category: 'pintura_terminaciones' },
      { id: 'pint_06', text: 'Color de pintura guardado para futuros retoques', category: 'pintura_terminaciones' },
      { id: 'pint_07', text: 'No apoyar muebles contra muros por 72 horas', category: 'pintura_terminaciones' },
      { id: 'pint_08', text: 'Papel mural: evitar vapor y humedad por 5 días', category: 'pintura_terminaciones' },
    ],
  },

  // ============================================================================
  // CERAMICA_PISOS (Flooring & Tiles)
  // ============================================================================
  ceramica_pisos: {
    categoryName: 'Cerámica y Pisos',
    instructions: [
      { id: 'piso_01', text: 'No aplicar carga pesada por 24-48 horas', category: 'ceramica_pisos' },
      { id: 'piso_02', text: 'Evitar agua en fragüe por 48 horas', category: 'ceramica_pisos' },
      { id: 'piso_03', text: 'Limpiar solo con paño húmedo por 1 semana', category: 'ceramica_pisos' },
      { id: 'piso_04', text: 'Sellar fragüe después de 30 días para protección', category: 'ceramica_pisos' },
      { id: 'piso_05', text: 'Parquet: mantener humedad ambiente 45-65%', category: 'ceramica_pisos' },
      { id: 'piso_06', text: 'Laminado: no lavar con agua en exceso', category: 'ceramica_pisos' },
      { id: 'piso_07', text: 'Epóxico: curado completo a las 72 horas', category: 'ceramica_pisos' },
      { id: 'piso_08', text: 'Vinílico: evitar arrastrar muebles pesados', category: 'ceramica_pisos' },
      { id: 'piso_09', text: 'No usar cera o abrillantador por 1 mes', category: 'ceramica_pisos' },
    ],
  },

  // ============================================================================
  // CONSTRUCCION_OBRAS (Construction)
  // ============================================================================
  construccion_obras: {
    categoryName: 'Construcción y Obras',
    instructions: [
      { id: 'const_01', text: 'No aplicar carga estructural por 7 días', category: 'construccion_obras' },
      { id: 'const_02', text: 'Hormigón: curado completo a los 28 días', category: 'construccion_obras' },
      { id: 'const_03', text: 'Regar hormigón 2-3 veces al día por 7 días', category: 'construccion_obras' },
      { id: 'const_04', text: 'Proteger de lluvia intensa durante primeros 3 días', category: 'construccion_obras' },
      { id: 'const_05', text: 'Revisar grietas o asentamiento después de 30 días', category: 'construccion_obras' },
      { id: 'const_06', text: 'No perforar hasta curado completo', category: 'construccion_obras' },
      { id: 'const_07', text: 'Verificar drenaje después de primera lluvia', category: 'construccion_obras' },
      { id: 'const_08', text: 'Radier: esperar 5 días antes de transitar', category: 'construccion_obras' },
      { id: 'const_09', text: 'Impermeabilización: revisar anualmente', category: 'construccion_obras' },
      { id: 'const_10', text: 'Salitre tratado: mantener zona seca y ventilada', category: 'construccion_obras' },
    ],
  },

  // ============================================================================
  // JARDIN_EXTERIOR (Garden & Exterior)
  // ============================================================================
  jardin_exterior: {
    categoryName: 'Jardín y Exterior',
    instructions: [
      { id: 'jard_01', text: 'Regar diariamente durante primeras 2 semanas', category: 'jardin_exterior' },
      { id: 'jard_02', text: 'Césped nuevo: no pisar por 3-4 semanas', category: 'jardin_exterior' },
      { id: 'jard_03', text: 'Revisar drenaje después de primera lluvia', category: 'jardin_exterior' },
      { id: 'jard_04', text: 'Poda de mantención cada 6 meses', category: 'jardin_exterior' },
      { id: 'jard_05', text: 'Fertilizar cada 2-3 meses para mejor crecimiento', category: 'jardin_exterior' },
      { id: 'jard_06', text: 'Sistema de riego: revisar filtros mensualmente', category: 'jardin_exterior' },
      { id: 'jard_07', text: 'Piscina: mantener pH entre 7.2-7.6', category: 'jardin_exterior' },
      { id: 'jard_08', text: 'Jacuzzi: cambiar agua cada 3-4 meses', category: 'jardin_exterior' },
      { id: 'jard_09', text: 'Deck madera: aplicar protector cada 6-12 meses', category: 'jardin_exterior' },
      { id: 'jard_10', text: 'Quincho: limpiar parrilla después de cada uso', category: 'jardin_exterior' },
    ],
  },

  // ============================================================================
  // CARPINTERIA_MUEBLES (Carpentry & Furniture)
  // ============================================================================
  carpinteria_muebles: {
    categoryName: 'Carpintería y Muebles',
    instructions: [
      { id: 'carp_01', text: 'Muebles nuevos: ventilar por 48h (olor a barniz)', category: 'carpinteria_muebles' },
      { id: 'carp_02', text: 'No aplicar peso máximo inmediatamente', category: 'carpinteria_muebles' },
      { id: 'carp_03', text: 'Revisar ajuste de bisagras después de 1 mes', category: 'carpinteria_muebles' },
      { id: 'carp_04', text: 'Madera: evitar exposición directa al sol', category: 'carpinteria_muebles' },
      { id: 'carp_05', text: 'Clóset: no sobrecargar estantes superiores', category: 'carpinteria_muebles' },
      { id: 'carp_06', text: 'Puertas ajustadas: verificar cierre después de 1 semana', category: 'carpinteria_muebles' },
      { id: 'carp_07', text: 'Barniz fresco: no tocar por 24-48 horas', category: 'carpinteria_muebles' },
      { id: 'carp_08', text: 'Lubricar rieles de puertas correderas cada 6 meses', category: 'carpinteria_muebles' },
      { id: 'carp_09', text: 'No usar limpiadores abrasivos en madera', category: 'carpinteria_muebles' },
    ],
  },

  // ============================================================================
  // SEGURIDAD_PORTONES (Security & Gates)
  // ============================================================================
  seguridad_portones: {
    categoryName: 'Seguridad y Portones',
    instructions: [
      { id: 'seg_01', text: 'Probar sistema diariamente durante primera semana', category: 'seguridad_portones' },
      { id: 'seg_02', text: 'Guardar códigos y contraseñas en lugar seguro', category: 'seguridad_portones' },
      { id: 'seg_03', text: 'Mantener baterías de respaldo cargadas', category: 'seguridad_portones' },
      { id: 'seg_04', text: 'Probar alarma mensualmente para verificar funcionamiento', category: 'seguridad_portones' },
      { id: 'seg_05', text: 'Cámaras: revisar almacenamiento mensualmente', category: 'seguridad_portones' },
      { id: 'seg_06', text: 'Portón automático: no forzar manualmente', category: 'seguridad_portones' },
      { id: 'seg_07', text: 'Lubricar mecanismos de portón cada 3 meses', category: 'seguridad_portones' },
      { id: 'seg_08', text: 'Cerraduras: lubricar con grafito (no aceite)', category: 'seguridad_portones' },
      { id: 'seg_09', text: 'Interfón: limpiar lente de cámara mensualmente', category: 'seguridad_portones' },
    ],
  },

  // ============================================================================
  // LIMPIEZA_MANTENIMIENTO (Cleaning & Maintenance)
  // ============================================================================
  limpieza_mantenimiento: {
    categoryName: 'Limpieza y Mantenimiento',
    instructions: [
      { id: 'limp_01', text: 'Ventilar por 2 horas después de limpieza profunda', category: 'limpieza_mantenimiento' },
      { id: 'limp_02', text: 'Productos utilizados son aptos para mascotas y niños', category: 'limpieza_mantenimiento' },
      { id: 'limp_03', text: 'Superficies listas para uso inmediato', category: 'limpieza_mantenimiento' },
      { id: 'limp_04', text: 'Programar próxima limpieza en 2-4 semanas', category: 'limpieza_mantenimiento' },
      { id: 'limp_05', text: 'Fumigación: no entrar por 4 horas', category: 'limpieza_mantenimiento' },
      { id: 'limp_06', text: 'Post-fumigación: ventilar completamente antes de entrar', category: 'limpieza_mantenimiento' },
      { id: 'limp_07', text: 'Hidrolavado: superficie se seca completamente en 2-4 horas', category: 'limpieza_mantenimiento' },
      { id: 'limp_08', text: 'Alfombras: evitar pisar hasta que sequen (6-8 horas)', category: 'limpieza_mantenimiento' },
      { id: 'limp_09', text: 'Canaletas limpias: revisar después de primeras lluvias', category: 'limpieza_mantenimiento' },
    ],
  },

  // ============================================================================
  // MUDANZAS_TRANSPORTE (Moving & Transport)
  // ============================================================================
  mudanzas_transporte: {
    categoryName: 'Mudanzas y Transporte',
    instructions: [
      { id: 'mud_01', text: 'Revisar inventario de artículos transportados', category: 'mudanzas_transporte' },
      { id: 'mud_02', text: 'Verificar estado de muebles al desempacar', category: 'mudanzas_transporte' },
      { id: 'mud_03', text: 'Reportar daños dentro de 24 horas', category: 'mudanzas_transporte' },
      { id: 'mud_04', text: 'Guardar comprobante de entrega', category: 'mudanzas_transporte' },
      { id: 'mud_05', text: 'Electrodomésticos: esperar 2 horas antes de enchufar', category: 'mudanzas_transporte' },
      { id: 'mud_06', text: 'Desarmar embalaje con cuidado (piezas pequeñas)', category: 'mudanzas_transporte' },
    ],
  },

  // ============================================================================
  // LINEA_BLANCA (Major Appliances)
  // ============================================================================
  linea_blanca: {
    categoryName: 'Línea Blanca',
    instructions: [
      { id: 'eldom_01', text: 'Leer manual de usuario antes del primer uso', category: 'linea_blanca' },
      { id: 'eldom_02', text: 'No usar por 2 horas después de instalación (asentamiento)', category: 'linea_blanca' },
      { id: 'eldom_03', text: 'Refrigerador: esperar 4 horas antes de enchufar', category: 'linea_blanca' },
      { id: 'eldom_04', text: 'Lavavajillas: hacer ciclo de prueba sin vajilla', category: 'linea_blanca' },
      { id: 'eldom_05', text: 'Lavadora: verificar nivelación (no vibrar excesivamente)', category: 'linea_blanca' },
      { id: 'eldom_06', text: 'Limpieza de filtros según manual (cada 1-3 meses)', category: 'linea_blanca' },
      { id: 'eldom_07', text: 'Garantía del fabricante: conservar ticket y certificado', category: 'linea_blanca' },
      { id: 'eldom_08', text: 'Mantención preventiva anual recomendada', category: 'linea_blanca' },
    ],
  },

  // ============================================================================
  // CALEFACCION_CLIMA (Heating & Climate)
  // ============================================================================
  calefaccion_clima: {
    categoryName: 'Calefacción y Climatización',
    instructions: [
      { id: 'clim_01', text: 'Aire acondicionado: limpiar filtros cada mes', category: 'calefaccion_clima' },
      { id: 'clim_02', text: 'Mantención profesional antes de cada temporada', category: 'calefaccion_clima' },
      { id: 'clim_03', text: 'No obstruir salidas de aire', category: 'calefaccion_clima' },
      { id: 'clim_04', text: 'Chimenea: limpiar antes de temporada de invierno', category: 'calefaccion_clima' },
      { id: 'clim_05', text: 'Deshumidificador: vaciar depósito regularmente', category: 'calefaccion_clima' },
      { id: 'clim_06', text: 'Ventiladores: lubricar motor anualmente', category: 'calefaccion_clima' },
      { id: 'clim_07', text: 'Temperatura recomendada: 20-22°C invierno, 24-26°C verano', category: 'calefaccion_clima' },
      { id: 'clim_08', text: 'Toallero calefaccionado: no colgar ropa mojada', category: 'calefaccion_clima' },
    ],
  },

  // ============================================================================
  // REMODELACION (Remodeling)
  // ============================================================================
  remodelacion: {
    categoryName: 'Remodelación',
    instructions: [
      { id: 'remo_01', text: 'Ventilar ambiente por 24-48 horas', category: 'remodelacion' },
      { id: 'remo_02', text: 'No usar instalaciones sanitarias nuevas por 12 horas', category: 'remodelacion' },
      { id: 'remo_03', text: 'Revisar funcionamiento de todos los sistemas instalados', category: 'remodelacion' },
      { id: 'remo_04', text: 'Reportar problemas dentro de 7 días', category: 'remodelacion' },
      { id: 'remo_05', text: 'Mantener zona limpia durante período de asentamiento', category: 'remodelacion' },
      { id: 'remo_06', text: 'Lavandería: probar conexiones de agua antes de primer uso', category: 'remodelacion' },
      { id: 'remo_07', text: 'Bajo escalera: no exceder peso máximo de estantes', category: 'remodelacion' },
    ],
  },

  // ============================================================================
  // OTROS_SERVICIOS (Other Services)
  // ============================================================================
  otros_servicios: {
    categoryName: 'Otros Servicios',
    instructions: [
      { id: 'otro_01', text: 'Trabajo completado según especificaciones acordadas', category: 'otros_servicios' },
      { id: 'otro_02', text: 'Verificar funcionamiento en primeras 24 horas', category: 'otros_servicios' },
      { id: 'otro_03', text: 'TV montada: verificar firmeza de soporte mensualmente', category: 'otros_servicios' },
      { id: 'otro_04', text: 'Cortinas: probar mecanismo suavemente al inicio', category: 'otros_servicios' },
      { id: 'otro_05', text: 'Smart Home: guardar configuraciones y contraseñas', category: 'otros_servicios' },
      { id: 'otro_06', text: 'Red doméstica: reiniciar router si hay problemas', category: 'otros_servicios' },
      { id: 'otro_07', text: 'Antena: orientación puede cambiar con viento fuerte', category: 'otros_servicios' },
      { id: 'otro_08', text: 'Caja fuerte: anotar combinación en lugar seguro', category: 'otros_servicios' },
    ],
  },

  // ============================================================================
  // VIDRIOS_VENTANAS (Glass & Windows)
  // ============================================================================
  vidrios_ventanas: {
    categoryName: 'Vidrios y Ventanas',
    instructions: [
      { id: 'vidr_01', text: 'Silicona perimetral: no tocar por 24 horas', category: 'vidrios_ventanas' },
      { id: 'vidr_02', text: 'Limpiar vidrios solo después de 48 horas', category: 'vidrios_ventanas' },
      { id: 'vidr_03', text: 'DVH (doble vidriado): condensación interna indica falla', category: 'vidrios_ventanas' },
      { id: 'vidr_04', text: 'Mampara ducha: secar después de cada uso', category: 'vidrios_ventanas' },
      { id: 'vidr_05', text: 'Ventanas PVC/aluminio: lubricar mecanismos anualmente', category: 'vidrios_ventanas' },
      { id: 'vidr_06', text: 'No golpear vidrios templados en bordes', category: 'vidrios_ventanas' },
      { id: 'vidr_07', text: 'Mosquiteros: limpiar con agua y jabón suave', category: 'vidrios_ventanas' },
      { id: 'vidr_08', text: 'Espejos pegados: curado adhesivo en 72 horas', category: 'vidrios_ventanas' },
    ],
  },

  // ============================================================================
  // HERRERIA_SOLDADURA (Metalwork & Welding)
  // ============================================================================
  herreria_soldadura: {
    categoryName: 'Herrería y Soldadura',
    instructions: [
      { id: 'herr_01', text: 'Pintura recién aplicada: no tocar por 48 horas', category: 'herreria_soldadura' },
      { id: 'herr_02', text: 'Soldaduras: evitar golpes durante primeras 24 horas', category: 'herreria_soldadura' },
      { id: 'herr_03', text: 'Lubricar bisagras y cerrojos cada 6 meses', category: 'herreria_soldadura' },
      { id: 'herr_04', text: 'Rejas: verificar firmeza de anclajes anualmente', category: 'herreria_soldadura' },
      { id: 'herr_05', text: 'Portones: no forzar si hay resistencia', category: 'herreria_soldadura' },
      { id: 'herr_06', text: 'Estructuras exteriores: revisar óxido cada 6 meses', category: 'herreria_soldadura' },
      { id: 'herr_07', text: 'Barandas: verificar firmeza antes de apoyar peso', category: 'herreria_soldadura' },
      { id: 'herr_08', text: 'Escalera metálica: no exceder carga máxima de diseño', category: 'herreria_soldadura' },
      { id: 'herr_09', text: 'Cerco metálico: retocar pintura en zonas con óxido', category: 'herreria_soldadura' },
    ],
  },

  // ============================================================================
  // CIELOS_MOLDURAS (Ceilings & Moldings)
  // ============================================================================
  cielos_molduras: {
    categoryName: 'Cielos y Molduras',
    instructions: [
      { id: 'ciel_01', text: 'Yeso cartón: esperar 48h antes de pintar', category: 'cielos_molduras' },
      { id: 'ciel_02', text: 'No colgar peso excesivo sin refuerzo', category: 'cielos_molduras' },
      { id: 'ciel_03', text: 'Cielo falso: acceder solo por registros designados', category: 'cielos_molduras' },
      { id: 'ciel_04', text: 'Molduras: pasta de instalación seca en 24 horas', category: 'cielos_molduras' },
      { id: 'ciel_05', text: 'Grietas mínimas son normales durante primer mes', category: 'cielos_molduras' },
      { id: 'ciel_06', text: 'Aislación: no remover ni comprimir material', category: 'cielos_molduras' },
      { id: 'ciel_07', text: 'Cornisas decorativas: limpiar solo con paño seco', category: 'cielos_molduras' },
    ],
  },

  // ============================================================================
  // AISLACION_TERMICA (Thermal Insulation)
  // ============================================================================
  aislacion_termica: {
    categoryName: 'Aislación Térmica',
    instructions: [
      { id: 'aisl_01', text: 'No comprimir material aislante (pierde efectividad)', category: 'aislacion_termica' },
      { id: 'aisl_02', text: 'Mantener aislación seca (humedad reduce eficiencia)', category: 'aislacion_termica' },
      { id: 'aisl_03', text: 'DVH: limpiar vidrios con productos no abrasivos', category: 'aislacion_termica' },
      { id: 'aisl_04', text: 'Burletes: revisar estado anualmente', category: 'aislacion_termica' },
      { id: 'aisl_05', text: 'Espuma expansiva: curado completo en 24 horas', category: 'aislacion_termica' },
      { id: 'aisl_06', text: 'Aislación acústica: efectividad al 100% tras instalación', category: 'aislacion_termica' },
      { id: 'aisl_07', text: 'Reducción de ruido: esperar 2-3 días para evaluar', category: 'aislacion_termica' },
    ],
  },

  // ============================================================================
  // BOMBAS_AGUA (Water Pumps)
  // ============================================================================
  bombas_agua: {
    categoryName: 'Bombas de Agua',
    instructions: [
      { id: 'bomb_01', text: 'Revisar presión de estanque cada 3 meses', category: 'bombas_agua' },
      { id: 'bomb_02', text: 'Mantención preventiva cada 6-12 meses', category: 'bombas_agua' },
      { id: 'bomb_03', text: 'Verificar que bomba no trabaje en seco (sin agua)', category: 'bombas_agua' },
      { id: 'bomb_04', text: 'Limpiar filtro de succión mensualmente', category: 'bombas_agua' },
      { id: 'bomb_05', text: 'Presostato: ajuste realizado a presión óptima', category: 'bombas_agua' },
      { id: 'bomb_06', text: 'Llamar si bomba arranca/para constantemente', category: 'bombas_agua' },
      { id: 'bomb_07', text: 'Proteger bomba de heladas en invierno', category: 'bombas_agua' },
    ],
  },

  // ============================================================================
  // DRENAJE (Drainage)
  // ============================================================================
  drenaje: {
    categoryName: 'Drenaje',
    instructions: [
      { id: 'dren_01', text: 'Verificar funcionamiento después de primera lluvia', category: 'drenaje' },
      { id: 'dren_02', text: 'Limpiar rejillas y canales cada 3 meses', category: 'drenaje' },
      { id: 'dren_03', text: 'Drenaje francés: no plantar árboles cerca', category: 'drenaje' },
      { id: 'dren_04', text: 'Revisar pendientes de evacuación anualmente', category: 'drenaje' },
      { id: 'dren_05', text: 'Llamar si hay acumulación de agua', category: 'drenaje' },
      { id: 'dren_06', text: 'Mantener libre de hojas y escombros', category: 'drenaje' },
    ],
  },

  // ============================================================================
  // TECHUMBRES (Roofing)
  // ============================================================================
  techumbres: {
    categoryName: 'Techumbres',
    instructions: [
      { id: 'tech_01', text: 'Revisar techo anualmente antes de temporada lluvias', category: 'techumbres' },
      { id: 'tech_02', text: 'Limpiar canaletas antes de invierno', category: 'techumbres' },
      { id: 'tech_03', text: 'Verificar estado de tejas después de temporales', category: 'techumbres' },
      { id: 'tech_04', text: 'Impermeabilización: revisar cada 2-3 años', category: 'techumbres' },
      { id: 'tech_05', text: 'Claraboyas: limpiar vidrio semestralmente', category: 'techumbres' },
      { id: 'tech_06', text: 'No pisar directamente sobre planchas de zinc', category: 'techumbres' },
      { id: 'tech_07', text: 'Planchas nuevas: revisar ajuste tras primer viento fuerte', category: 'techumbres' },
      { id: 'tech_08', text: 'Llamar si hay goteras o filtraciones', category: 'techumbres' },
    ],
  },

  // ============================================================================
  // POZOS_SEPTICOS (Septic Tanks)
  // ============================================================================
  pozos_septicos: {
    categoryName: 'Pozos Sépticos',
    instructions: [
      { id: 'pozo_01', text: 'Limpieza profesional cada 1-2 años', category: 'pozos_septicos' },
      { id: 'pozo_02', text: 'No arrojar grasas, aceites ni químicos fuertes', category: 'pozos_septicos' },
      { id: 'pozo_03', text: 'No descargar toallas higiénicas ni pañales', category: 'pozos_septicos' },
      { id: 'pozo_04', text: 'Mantención realizada: próxima revisión en 6-12 meses', category: 'pozos_septicos' },
      { id: 'pozo_05', text: 'Llamar si hay malos olores persistentes', category: 'pozos_septicos' },
      { id: 'pozo_06', text: 'No plantar árboles cerca (raíces dañan sistema)', category: 'pozos_septicos' },
      { id: 'pozo_07', text: 'Fosa nueva: usar gradualmente primeras 2 semanas', category: 'pozos_septicos' },
    ],
  },

  // ============================================================================
  // ASCENSORES (Elevators)
  // ============================================================================
  ascensores: {
    categoryName: 'Ascensores',
    instructions: [
      { id: 'asc_01', text: 'Mantención obligatoria cada 1-2 meses según normativa', category: 'ascensores' },
      { id: 'asc_02', text: 'Reportar ruidos o vibraciones anormales', category: 'ascensores' },
      { id: 'asc_03', text: 'No forzar puertas si no abren/cierran correctamente', category: 'ascensores' },
      { id: 'asc_04', text: 'Verificar certificación SEC vigente', category: 'ascensores' },
      { id: 'asc_05', text: 'Próxima revisión técnica programada en registro', category: 'ascensores' },
      { id: 'asc_06', text: 'Botón de emergencia: probar mensualmente', category: 'ascensores' },
    ],
  },

  // ============================================================================
  // TAPICERIA_MUEBLES (Furniture Upholstery)
  // ============================================================================
  tapiceria_muebles: {
    categoryName: 'Tapicería de Muebles',
    instructions: [
      { id: 'tap_01', text: 'No usar por 24 horas (secado de pegamentos)', category: 'tapiceria_muebles' },
      { id: 'tap_02', text: 'Ventilar ambiente (olor a pegamento)', category: 'tapiceria_muebles' },
      { id: 'tap_03', text: 'Limpiar solo con aspiradora primeras 2 semanas', category: 'tapiceria_muebles' },
      { id: 'tap_04', text: 'Tela nueva: puede soltar pelusa inicialmente', category: 'tapiceria_muebles' },
      { id: 'tap_05', text: 'Evitar exposición directa al sol (decolora tela)', category: 'tapiceria_muebles' },
      { id: 'tap_06', text: 'Aspirar semanalmente para mantener limpieza', category: 'tapiceria_muebles' },
      { id: 'tap_07', text: 'Limpieza profesional anual recomendada', category: 'tapiceria_muebles' },
    ],
  },

  // ============================================================================
  // TOLDOS_COBERTURAS (Awnings & Covers)
  // ============================================================================
  toldos_coberturas: {
    categoryName: 'Toldos y Coberturas',
    instructions: [
      { id: 'told_01', text: 'Recoger toldo en caso de viento fuerte (>40 km/h)', category: 'toldos_coberturas' },
      { id: 'told_02', text: 'No dejar extendido con lluvia prolongada (peso agua)', category: 'toldos_coberturas' },
      { id: 'told_03', text: 'Limpiar tela con agua y jabón suave semestralmente', category: 'toldos_coberturas' },
      { id: 'told_04', text: 'Lubricar mecanismo cada 6 meses', category: 'toldos_coberturas' },
      { id: 'told_05', text: 'Toldo motorizado: probar sensor de viento mensualmente', category: 'toldos_coberturas' },
      { id: 'told_06', text: 'No forzar mecanismo si hay resistencia', category: 'toldos_coberturas' },
      { id: 'told_07', text: 'Revisar anclajes y estructura cada año', category: 'toldos_coberturas' },
    ],
  },
};

/**
 * Get care instructions for a specific project category
 */
export function getCareInstructionsForProjectType(
  projectTypeId: string,
  category: string
): CareInstruction[] {
  const categoryInstructions = CARE_INSTRUCTION_TEMPLATES[category];

  if (!categoryInstructions) {
    return getGenericCareInstructions();
  }

  return categoryInstructions.instructions;
}

/**
 * Generic care instructions for unknown categories
 */
export function getGenericCareInstructions(): CareInstruction[] {
  return [
    { id: 'gen_01', text: 'Verificar trabajo realizado en próximas 24 horas', category: 'generic' },
    { id: 'gen_02', text: 'Llamar si nota algún problema o imperfección', category: 'generic' },
    { id: 'gen_03', text: 'Mantener área limpia y seca', category: 'generic' },
    { id: 'gen_04', text: 'Seguir instrucciones específicas del fabricante', category: 'generic' },
  ];
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  return Object.keys(CARE_INSTRUCTION_TEMPLATES);
}
