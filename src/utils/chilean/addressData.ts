/**
 * Chilean Address Data - Regions, Provinces, and Comunas
 *
 * Complete dataset of Chilean administrative divisions for address collection
 * Based on official INE (Instituto Nacional de Estadísticas) data
 */

export interface Comuna {
  code: string;
  name: string;
  provinceCode: string;
  regionCode: string;
}

export interface Province {
  code: string;
  name: string;
  regionCode: string;
}

export interface Region {
  code: string;
  name: string;
  number: string;
}

/**
 * Chilean Regions (15 regions)
 */
export const CHILEAN_REGIONS: Region[] = [
  { code: '15', name: 'Arica y Parinacota', number: 'XV' },
  { code: '01', name: 'Tarapacá', number: 'I' },
  { code: '02', name: 'Antofagasta', number: 'II' },
  { code: '03', name: 'Atacama', number: 'III' },
  { code: '04', name: 'Coquimbo', number: 'IV' },
  { code: '05', name: 'Valparaíso', number: 'V' },
  { code: '13', name: 'Metropolitana de Santiago', number: 'RM' },
  { code: '06', name: 'Libertador General Bernardo O\'Higgins', number: 'VI' },
  { code: '07', name: 'Maule', number: 'VII' },
  { code: '16', name: 'Ñuble', number: 'XVI' },
  { code: '08', name: 'Biobío', number: 'VIII' },
  { code: '09', name: 'La Araucanía', number: 'IX' },
  { code: '14', name: 'Los Ríos', number: 'XIV' },
  { code: '10', name: 'Los Lagos', number: 'X' },
  { code: '11', name: 'Aysén del General Carlos Ibáñez del Campo', number: 'XI' },
  { code: '12', name: 'Magallanes y de la Antártica Chilena', number: 'XII' },
];

/**
 * Major Chilean Provinces (most relevant for marketplace)
 */
export const CHILEAN_PROVINCES: Province[] = [
  // Region Metropolitana (RM) - Most important for MVP
  { code: '131', name: 'Santiago', regionCode: '13' },
  { code: '132', name: 'Cordillera', regionCode: '13' },
  { code: '133', name: 'Chacabuco', regionCode: '13' },
  { code: '134', name: 'Maipo', regionCode: '13' },
  { code: '135', name: 'Melipilla', regionCode: '13' },
  { code: '136', name: 'Talagante', regionCode: '13' },

  // Valparaíso Region (V) - Second priority
  { code: '051', name: 'Valparaíso', regionCode: '05' },
  { code: '052', name: 'Isla de Pascua', regionCode: '05' },
  { code: '053', name: 'Los Andes', regionCode: '05' },
  { code: '054', name: 'Petorca', regionCode: '05' },
  { code: '055', name: 'Quillota', regionCode: '05' },
  { code: '056', name: 'San Antonio', regionCode: '05' },
  { code: '057', name: 'San Felipe de Aconcagua', regionCode: '05' },
  { code: '058', name: 'Marga Marga', regionCode: '05' },

  // Other major provinces (can be expanded)
  { code: '021', name: 'Antofagasta', regionCode: '02' },
  { code: '041', name: 'Elqui', regionCode: '04' },
  { code: '081', name: 'Concepción', regionCode: '08' },
  { code: '101', name: 'Llanquihue', regionCode: '10' },
];

/**
 * Chilean Comunas - Focus on Santiago Metropolitan Area for MVP
 * This includes the most important comunas for the marketplace launch
 */
export const CHILEAN_COMUNAS: Comuna[] = [
  // Santiago Province - High-income areas (priority for MVP)
  { code: '13101', name: 'Santiago', provinceCode: '131', regionCode: '13' },
  { code: '13102', name: 'Cerrillos', provinceCode: '131', regionCode: '13' },
  { code: '13103', name: 'Cerro Navia', provinceCode: '131', regionCode: '13' },
  { code: '13104', name: 'Conchalí', provinceCode: '131', regionCode: '13' },
  { code: '13105', name: 'El Bosque', provinceCode: '131', regionCode: '13' },
  { code: '13106', name: 'Estación Central', provinceCode: '131', regionCode: '13' },
  { code: '13107', name: 'Huechuraba', provinceCode: '131', regionCode: '13' },
  { code: '13108', name: 'Independencia', provinceCode: '131', regionCode: '13' },
  { code: '13109', name: 'La Cisterna', provinceCode: '131', regionCode: '13' },
  { code: '13110', name: 'La Florida', provinceCode: '131', regionCode: '13' },
  { code: '13111', name: 'La Granja', provinceCode: '131', regionCode: '13' },
  { code: '13112', name: 'La Pintana', provinceCode: '131', regionCode: '13' },
  { code: '13113', name: 'La Reina', provinceCode: '131', regionCode: '13' },
  { code: '13114', name: 'Las Condes', provinceCode: '131', regionCode: '13' },
  { code: '13115', name: 'Lo Barnechea', provinceCode: '131', regionCode: '13' },
  { code: '13116', name: 'Lo Espejo', provinceCode: '131', regionCode: '13' },
  { code: '13117', name: 'Lo Prado', provinceCode: '131', regionCode: '13' },
  { code: '13118', name: 'Macul', provinceCode: '131', regionCode: '13' },
  { code: '13119', name: 'Maipú', provinceCode: '131', regionCode: '13' },
  { code: '13120', name: 'Ñuñoa', provinceCode: '131', regionCode: '13' },
  { code: '13121', name: 'Pedro Aguirre Cerda', provinceCode: '131', regionCode: '13' },
  { code: '13122', name: 'Peñalolén', provinceCode: '131', regionCode: '13' },
  { code: '13123', name: 'Providencia', provinceCode: '131', regionCode: '13' },
  { code: '13124', name: 'Pudahuel', provinceCode: '131', regionCode: '13' },
  { code: '13125', name: 'Quilicura', provinceCode: '131', regionCode: '13' },
  { code: '13126', name: 'Quinta Normal', provinceCode: '131', regionCode: '13' },
  { code: '13127', name: 'Recoleta', provinceCode: '131', regionCode: '13' },
  { code: '13128', name: 'Renca', provinceCode: '131', regionCode: '13' },
  { code: '13129', name: 'San Joaquín', provinceCode: '131', regionCode: '13' },
  { code: '13130', name: 'San Miguel', provinceCode: '131', regionCode: '13' },
  { code: '13131', name: 'San Ramón', provinceCode: '131', regionCode: '13' },
  { code: '13132', name: 'Vitacura', provinceCode: '131', regionCode: '13' },

  // Cordillera Province
  { code: '13201', name: 'Puente Alto', provinceCode: '132', regionCode: '13' },
  { code: '13202', name: 'Pirque', provinceCode: '132', regionCode: '13' },
  { code: '13203', name: 'San José de Maipo', provinceCode: '132', regionCode: '13' },

  // Chacabuco Province
  { code: '13301', name: 'Colina', provinceCode: '133', regionCode: '13' },
  { code: '13302', name: 'Lampa', provinceCode: '133', regionCode: '13' },
  { code: '13303', name: 'Tiltil', provinceCode: '133', regionCode: '13' },

  // Maipo Province
  { code: '13401', name: 'San Bernardo', provinceCode: '134', regionCode: '13' },
  { code: '13402', name: 'Buin', provinceCode: '134', regionCode: '13' },
  { code: '13403', name: 'Calera de Tango', provinceCode: '134', regionCode: '13' },
  { code: '13404', name: 'Paine', provinceCode: '134', regionCode: '13' },

  // Melipilla Province
  { code: '13501', name: 'Melipilla', provinceCode: '135', regionCode: '13' },
  { code: '13502', name: 'Alhué', provinceCode: '135', regionCode: '13' },
  { code: '13503', name: 'Curacaví', provinceCode: '135', regionCode: '13' },
  { code: '13504', name: 'María Pinto', provinceCode: '135', regionCode: '13' },
  { code: '13505', name: 'San Pedro', provinceCode: '135', regionCode: '13' },

  // Talagante Province
  { code: '13601', name: 'Talagante', provinceCode: '136', regionCode: '13' },
  { code: '13602', name: 'El Monte', provinceCode: '136', regionCode: '13' },
  { code: '13603', name: 'Isla de Maipo', provinceCode: '136', regionCode: '13' },
  { code: '13604', name: 'Padre Hurtado', provinceCode: '136', regionCode: '13' },
  { code: '13605', name: 'Peñaflor', provinceCode: '136', regionCode: '13' },

  // Valparaíso Region - Major comunas
  { code: '05101', name: 'Valparaíso', provinceCode: '051', regionCode: '05' },
  { code: '05102', name: 'Casablanca', provinceCode: '051', regionCode: '05' },
  { code: '05103', name: 'Concón', provinceCode: '051', regionCode: '05' },
  { code: '05104', name: 'Juan Fernández', provinceCode: '051', regionCode: '05' },
  { code: '05105', name: 'Puchuncaví', provinceCode: '051', regionCode: '05' },
  { code: '05107', name: 'Quintero', provinceCode: '051', regionCode: '05' },
  { code: '05109', name: 'Viña del Mar', provinceCode: '051', regionCode: '05' },

  // Other major cities (can be expanded for nationwide rollout)
  { code: '02101', name: 'Antofagasta', provinceCode: '021', regionCode: '02' },
  { code: '04101', name: 'La Serena', provinceCode: '041', regionCode: '04' },
  { code: '04102', name: 'Coquimbo', provinceCode: '041', regionCode: '04' },
  { code: '08101', name: 'Concepción', provinceCode: '081', regionCode: '08' },
  { code: '10101', name: 'Puerto Montt', provinceCode: '101', regionCode: '10' },
];

/**
 * Premium/High-value comunas for priority targeting
 * These areas have higher disposable income and are priority for marketplace launch
 */
export const PREMIUM_COMUNAS = [
  'Las Condes',
  'Providencia',
  'Vitacura',
  'Lo Barnechea',
  'La Reina',
  'Ñuñoa',
  'Viña del Mar',
];

/**
 * Popular service areas for initial provider targeting
 */
export const POPULAR_SERVICE_AREAS = [
  'Las Condes',
  'Providencia',
  'Vitacura',
  'Ñuñoa',
  'La Reina',
  'Maipú',
  'Puente Alto',
  'San Bernardo',
  'Viña del Mar',
  'Valparaíso',
];

/**
 * Utility functions for address data
 */

export function getRegionByCode(code: string): Region | undefined {
  return CHILEAN_REGIONS.find(region => region.code === code);
}

export function getProvincesByRegion(regionCode: string): Province[] {
  return CHILEAN_PROVINCES.filter(province => province.regionCode === regionCode);
}

export function getComunasByProvince(provinceCode: string): Comuna[] {
  return CHILEAN_COMUNAS.filter(comuna => comuna.provinceCode === provinceCode);
}

export function getComunasByRegion(regionCode: string): Comuna[] {
  return CHILEAN_COMUNAS.filter(comuna => comuna.regionCode === regionCode);
}

export function getComunaByCode(code: string): Comuna | undefined {
  return CHILEAN_COMUNAS.find(comuna => comuna.code === code);
}

export function getProvinceByCode(code: string): Province | undefined {
  return CHILEAN_PROVINCES.find(province => province.code === code);
}

export function searchComunas(query: string): Comuna[] {
  const lowerQuery = query.toLowerCase();
  return CHILEAN_COMUNAS.filter(comuna =>
    comuna.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit results for performance
}

export function getFullAddress(comunaCode: string): {
  comuna: Comuna;
  province: Province;
  region: Region;
} | null {
  const comuna = getComunaByCode(comunaCode);
  if (!comuna) return null;

  const province = getProvinceByCode(comuna.provinceCode);
  const region = getRegionByCode(comuna.regionCode);

  if (!province || !region) return null;

  return { comuna, province, region };
}

/**
 * Get formatted address string
 */
export function formatAddress(comunaCode: string, includeRegion = true): string {
  const address = getFullAddress(comunaCode);
  if (!address) return '';

  const { comuna, province, region } = address;

  if (includeRegion) {
    return `${comuna.name}, ${province.name}, ${region.name}`;
  } else {
    return `${comuna.name}, ${province.name}`;
  }
}

/**
 * Check if comuna is in premium list
 */
export function isPremiumComuna(comunaName: string): boolean {
  return PREMIUM_COMUNAS.includes(comunaName);
}

/**
 * Check if comuna is in popular service areas
 */
export function isPopularServiceArea(comunaName: string): boolean {
  return POPULAR_SERVICE_AREAS.includes(comunaName);
}