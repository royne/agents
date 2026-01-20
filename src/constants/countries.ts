export interface Country {
  name: string;
  code: string;
  currency: string;
  symbol: string;
  locale: string;
  defaultFreight: number;
  defaultCPABase: number;
  flag: string;
}

export const COUNTRIES: Country[] = [
  {
    name: 'Colombia',
    code: 'CO',
    currency: 'COP',
    symbol: '$',
    locale: 'es-CO',
    defaultFreight: 20000,
    defaultCPABase: 15000,
    flag: '🇨🇴'
  },
  {
    name: 'México',
    code: 'MX',
    currency: 'MXN',
    symbol: '$',
    locale: 'es-MX',
    defaultFreight: 145,
    defaultCPABase: 90,
    flag: '🇲🇽'
  },
  {
    name: 'Ecuador',
    code: 'EC',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    defaultFreight: 7,
    defaultCPABase: 4.5,
    flag: '🇪🇨'
  },
  {
    name: 'Chile',
    code: 'CL',
    currency: 'CLP',
    symbol: '$',
    locale: 'es-CL',
    defaultFreight: 8000,
    defaultCPABase: 4000,
    flag: '🇨🇱'
  },
  {
    name: 'Perú',
    code: 'PE',
    currency: 'PEN',
    symbol: 'S/',
    locale: 'es-PE',
    defaultFreight: 15,
    defaultCPABase: 17,
    flag: '🇵🇪'
  },
  {
    name: 'Guatemala',
    code: 'GT',
    currency: 'GTQ',
    symbol: 'Q',
    locale: 'es-GT',
    defaultFreight: 32,
    defaultCPABase: 30,
    flag: '🇬🇹'
  },
  {
    name: 'Argentina',
    code: 'AR',
    currency: 'ARS',
    symbol: '$',
    locale: 'es-AR',
    defaultFreight: 7030,
    defaultCPABase: 5550,
    flag: '🇦🇷'
  }
];

export const getCountryByCode = (code: string): Country => {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
};

export const getCountryByName = (name: string): Country => {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || COUNTRIES[0];
};
