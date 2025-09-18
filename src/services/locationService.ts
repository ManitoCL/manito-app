import { supabase } from './supabase';

export interface LocationSuggestion {
  id: string;
  address: string;
  commune: string;
  region: string;
  coordinates?: [number, number];
}

export class LocationService {
  // Search for Chilean locations (communes, regions, addresses)
  static async searchLocations(query: string): Promise<LocationSuggestion[]> {
    try {
      console.log('🔍 Searching locations for:', query);

      // For now, return comprehensive Chilean location data
      // In production, this would integrate with Chilean postal/address APIs
      const chileanLocations = LocationService.getChileanLocations();

      const filtered = chileanLocations.filter(location =>
        location.address.toLowerCase().includes(query.toLowerCase()) ||
        location.commune.toLowerCase().includes(query.toLowerCase()) ||
        location.region.toLowerCase().includes(query.toLowerCase())
      );

      console.log(`✅ Found ${filtered.length} location matches`);
      return filtered.slice(0, 20); // Limit to 20 results

    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }

  // Get user's current location (with permission)
  static async getCurrentLocation(): Promise<LocationSuggestion | null> {
    try {
      // This would integrate with React Native's Geolocation API
      // For now, return Santiago as default
      return {
        id: 'current',
        address: 'Mi ubicación actual',
        commune: 'Santiago',
        region: 'Metropolitana',
        coordinates: [-70.6506, -33.4372] // Santiago coordinates
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Calculate distance between two coordinates
  static calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Comprehensive Chilean locations database
  private static getChileanLocations(): LocationSuggestion[] {
    return [
      // Región Metropolitana
      { id: 'santiago', address: 'Santiago Centro', commune: 'Santiago', region: 'Metropolitana', coordinates: [-70.6506, -33.4372] },
      { id: 'las-condes', address: 'Las Condes', commune: 'Las Condes', region: 'Metropolitana', coordinates: [-70.5045, -33.4105] },
      { id: 'providencia', address: 'Providencia', commune: 'Providencia', region: 'Metropolitana', coordinates: [-70.6156, -33.4372] },
      { id: 'vitacura', address: 'Vitacura', commune: 'Vitacura', region: 'Metropolitana', coordinates: [-70.5547, -33.3847] },
      { id: 'nunoa', address: 'Ñuñoa', commune: 'Ñuñoa', region: 'Metropolitana', coordinates: [-70.5985, -33.4569] },
      { id: 'la-reina', address: 'La Reina', commune: 'La Reina', region: 'Metropolitana', coordinates: [-70.5401, -33.4447] },
      { id: 'peñalolen', address: 'Peñalolén', commune: 'Peñalolén', region: 'Metropolitana', coordinates: [-70.5183, -33.4881] },
      { id: 'macul', address: 'Macul', commune: 'Macul', region: 'Metropolitana', coordinates: [-70.5939, -33.4881] },
      { id: 'san-joaquin', address: 'San Joaquín', commune: 'San Joaquín', region: 'Metropolitana', coordinates: [-70.6322, -33.4975] },
      { id: 'la-florida', address: 'La Florida', commune: 'La Florida', region: 'Metropolitana', coordinates: [-70.5942, -33.5181] },
      { id: 'puente-alto', address: 'Puente Alto', commune: 'Puente Alto', region: 'Metropolitana', coordinates: [-70.5756, -33.6114] },
      { id: 'maipu', address: 'Maipú', commune: 'Maipú', region: 'Metropolitana', coordinates: [-70.7508, -33.5106] },
      { id: 'la-cisterna', address: 'La Cisterna', commune: 'La Cisterna', region: 'Metropolitana', coordinates: [-70.6661, -33.5383] },
      { id: 'san-miguel', address: 'San Miguel', commune: 'San Miguel', region: 'Metropolitana', coordinates: [-70.6495, -33.4975] },
      { id: 'pedro-aguirre-cerda', address: 'Pedro Aguirre Cerda', commune: 'Pedro Aguirre Cerda', region: 'Metropolitana', coordinates: [-70.6661, -33.4881] },
      { id: 'lo-espejo', address: 'Lo Espejo', commune: 'Lo Espejo', region: 'Metropolitana', coordinates: [-70.6828, -33.5181] },
      { id: 'estacion-central', address: 'Estación Central', commune: 'Estación Central', region: 'Metropolitana', coordinates: [-70.6828, -33.4569] },
      { id: 'cerrillos', address: 'Cerrillos', commune: 'Cerrillos', region: 'Metropolitana', coordinates: [-70.7161, -33.4975] },
      { id: 'quinta-normal', address: 'Quinta Normal', commune: 'Quinta Normal', region: 'Metropolitana', coordinates: [-70.6994, -33.4258] },
      { id: 'pudahuel', address: 'Pudahuel', commune: 'Pudahuel', region: 'Metropolitana', coordinates: [-70.7994, -33.4569] },
      { id: 'renca', address: 'Renca', commune: 'Renca', region: 'Metropolitana', coordinates: [-70.6994, -33.3853] },
      { id: 'quilicura', address: 'Quilicura', commune: 'Quilicura', region: 'Metropolitana', coordinates: [-70.7328, -33.3597] },
      { id: 'lampa', address: 'Lampa', commune: 'Lampa', region: 'Metropolitana', coordinates: [-70.8828, -33.2839] },
      { id: 'colina', address: 'Colina', commune: 'Colina', region: 'Metropolitana', coordinates: [-70.6828, -33.1997] },
      { id: 'lo-barnechea', address: 'Lo Barnechea', commune: 'Lo Barnechea', region: 'Metropolitana', coordinates: [-70.4681, -33.3497] },
      { id: 'huechuraba', address: 'Huechuraba', commune: 'Huechuraba', region: 'Metropolitana', coordinates: [-70.6328, -33.3697] },
      { id: 'recoleta', address: 'Recoleta', commune: 'Recoleta', region: 'Metropolitana', coordinates: [-70.6328, -33.4158] },
      { id: 'independencia', address: 'Independencia', commune: 'Independencia', region: 'Metropolitana', coordinates: [-70.6661, -33.4158] },
      { id: 'conchali', address: 'Conchalí', commune: 'Conchalí', region: 'Metropolitana', coordinates: [-70.6661, -33.3897] },

      // Región de Valparaíso
      { id: 'valparaiso', address: 'Valparaíso', commune: 'Valparaíso', region: 'Valparaíso', coordinates: [-71.6275, -33.0458] },
      { id: 'vina-del-mar', address: 'Viña del Mar', commune: 'Viña del Mar', region: 'Valparaíso', coordinates: [-71.5519, -33.0244] },
      { id: 'san-antonio', address: 'San Antonio', commune: 'San Antonio', region: 'Valparaíso', coordinates: [-71.6139, -33.5942] },
      { id: 'quillota', address: 'Quillota', commune: 'Quillota', region: 'Valparaíso', coordinates: [-71.2458, -32.8781] },
      { id: 'quilpue', address: 'Quilpué', commune: 'Quilpué', region: 'Valparaíso', coordinates: [-71.4428, -33.0478] },
      { id: 'villa-alemana', address: 'Villa Alemana', commune: 'Villa Alemana', region: 'Valparaíso', coordinates: [-71.3761, -33.0458] },

      // Región del Biobío
      { id: 'concepcion', address: 'Concepción', commune: 'Concepción', region: 'Biobío', coordinates: [-73.0444, -36.8269] },
      { id: 'talcahuano', address: 'Talcahuano', commune: 'Talcahuano', region: 'Biobío', coordinates: [-73.1161, -36.7244] },
      { id: 'chiguayante', address: 'Chiguayante', commune: 'Chiguayante', region: 'Biobío', coordinates: [-73.0294, -36.9244] },
      { id: 'san-pedro-de-la-paz', address: 'San Pedro de la Paz', commune: 'San Pedro de la Paz', region: 'Biobío', coordinates: [-73.0961, -36.8469] },
      { id: 'hualpen', address: 'Hualpén', commune: 'Hualpén', region: 'Biobío', coordinates: [-73.1594, -36.7844] },
      { id: 'los-angeles', address: 'Los Ángeles', commune: 'Los Ángeles', region: 'Biobío', coordinates: [-72.3544, -37.4694] },
      { id: 'chillan', address: 'Chillán', commune: 'Chillán', region: 'Biobío', coordinates: [-72.1028, -36.6061] },

      // Región de La Araucanía
      { id: 'temuco', address: 'Temuco', commune: 'Temuco', region: 'La Araucanía', coordinates: [-72.5904, -38.7336] },
      { id: 'padre-las-casas', address: 'Padre Las Casas', commune: 'Padre Las Casas', region: 'La Araucanía', coordinates: [-72.6094, -38.7586] },
      { id: 'villarrica', address: 'Villarrica', commune: 'Villarrica', region: 'La Araucanía', coordinates: [-72.2311, -39.2836] },
      { id: 'pucon', address: 'Pucón', commune: 'Pucón', region: 'La Araucanía', coordinates: [-71.9536, -39.2711] },

      // Región de Los Lagos
      { id: 'puerto-montt', address: 'Puerto Montt', commune: 'Puerto Montt', region: 'Los Lagos', coordinates: [-72.9394, -41.4693] },
      { id: 'puerto-varas', address: 'Puerto Varas', commune: 'Puerto Varas', region: 'Los Lagos', coordinates: [-72.9844, -41.3193] },
      { id: 'osorno', address: 'Osorno', commune: 'Osorno', region: 'Los Lagos', coordinates: [-73.1344, -40.5744] },
      { id: 'valdivia', address: 'Valdivia', commune: 'Valdivia', region: 'Los Ríos', coordinates: [-73.2461, -39.8139] },

      // Región de Antofagasta
      { id: 'antofagasta', address: 'Antofagasta', commune: 'Antofagasta', region: 'Antofagasta', coordinates: [-70.4011, -23.6509] },
      { id: 'calama', address: 'Calama', commune: 'Calama', region: 'Antofagasta', coordinates: [-68.9325, -22.4569] },

      // Región de Atacama
      { id: 'copiapo', address: 'Copiapó', commune: 'Copiapó', region: 'Atacama', coordinates: [-70.3311, -27.3669] },
      { id: 'caldera', address: 'Caldera', commune: 'Caldera', region: 'Atacama', coordinates: [-70.8261, -27.0669] },

      // Región de Coquimbo
      { id: 'la-serena', address: 'La Serena', commune: 'La Serena', region: 'Coquimbo', coordinates: [-71.2494, -29.9027] },
      { id: 'coquimbo', address: 'Coquimbo', commune: 'Coquimbo', region: 'Coquimbo', coordinates: [-71.3394, -29.9527] },
      { id: 'ovalle', address: 'Ovalle', commune: 'Ovalle', region: 'Coquimbo', coordinates: [-71.2011, -30.5994] },

      // Región del Maule
      { id: 'talca', address: 'Talca', commune: 'Talca', region: 'Maule', coordinates: [-71.6661, -35.4264] },
      { id: 'curico', address: 'Curicó', commune: 'Curicó', region: 'Maule', coordinates: [-71.2394, -34.9819] },
      { id: 'linares', address: 'Linares', commune: 'Linares', region: 'Maule', coordinates: [-71.5994, -35.8519] },

      // Región del Libertador General Bernardo O'Higgins
      { id: 'rancagua', address: 'Rancagua', commune: 'Rancagua', region: 'O\'Higgins', coordinates: [-70.7494, -34.1706] },
      { id: 'san-fernando', address: 'San Fernando', commune: 'San Fernando', region: 'O\'Higgins', coordinates: [-70.9861, -34.5889] },
      { id: 'rengo', address: 'Rengo', commune: 'Rengo', region: 'O\'Higgins', coordinates: [-70.8594, -34.4089] },

      // Región de Aysén
      { id: 'coyhaique', address: 'Coyhaique', commune: 'Coyhaique', region: 'Aysén', coordinates: [-72.0661, -45.5752] },
      { id: 'puerto-aysen', address: 'Puerto Aysén', commune: 'Puerto Aysén', region: 'Aysén', coordinates: [-72.6961, -45.4019] },

      // Región de Magallanes
      { id: 'punta-arenas', address: 'Punta Arenas', commune: 'Punta Arenas', region: 'Magallanes', coordinates: [-70.9161, -53.1556] },
      { id: 'puerto-natales', address: 'Puerto Natales', commune: 'Puerto Natales', region: 'Magallanes', coordinates: [-72.5086, -51.7236] },

      // Región de Tarapacá
      { id: 'iquique', address: 'Iquique', commune: 'Iquique', region: 'Tarapacá', coordinates: [-70.1394, -20.2136] },
      { id: 'alto-hospicio', address: 'Alto Hospicio', commune: 'Alto Hospicio', region: 'Tarapacá', coordinates: [-70.1094, -20.2636] },

      // Región de Arica y Parinacota
      { id: 'arica', address: 'Arica', commune: 'Arica', region: 'Arica y Parinacota', coordinates: [-70.3161, -18.4789] },
      { id: 'putre', address: 'Putre', commune: 'Putre', region: 'Arica y Parinacota', coordinates: [-69.5661, -18.1956] },
    ];
  }

  // Get popular communes for quick selection
  static getPopularCommunes(): LocationSuggestion[] {
    const popular = [
      'santiago', 'las-condes', 'providencia', 'vitacura', 'nunoa',
      'la-reina', 'maipu', 'puente-alto', 'valparaiso', 'vina-del-mar',
      'concepcion', 'temuco', 'puerto-montt', 'antofagasta', 'la-serena'
    ];

    const allLocations = LocationService.getChileanLocations();
    return allLocations.filter(location => popular.includes(location.id));
  }

  // Validate Chilean postal codes
  static validatePostalCode(code: string): boolean {
    // Chilean postal codes are 7 digits (NNNNNNN)
    const chileanPostalRegex = /^\d{7}$/;
    return chileanPostalRegex.test(code);
  }

  // Get location by postal code
  static async getLocationByPostalCode(postalCode: string): Promise<LocationSuggestion | null> {
    if (!LocationService.validatePostalCode(postalCode)) {
      return null;
    }

    try {
      // In production, this would query Chilean postal service API
      // For now, return a mock result based on postal code patterns
      const code = parseInt(postalCode);

      // Santiago area codes (typically 7500000-8500000)
      if (code >= 7500000 && code <= 8500000) {
        return {
          id: `postal-${postalCode}`,
          address: `Código Postal ${postalCode}`,
          commune: 'Santiago',
          region: 'Metropolitana',
          coordinates: [-70.6506, -33.4372]
        };
      }

      // Other regions would have different ranges
      return {
        id: `postal-${postalCode}`,
        address: `Código Postal ${postalCode}`,
        commune: 'Comuna Desconocida',
        region: 'Región Desconocida'
      };

    } catch (error) {
      console.error('Error getting location by postal code:', error);
      return null;
    }
  }
}