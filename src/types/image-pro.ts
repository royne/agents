export type GenerationMode = 'libre' | 'ads' | 'personas';
export type AdsSubMode = 'sencillo' | 'completo';
export type PersonaOption = 'generar' | 'fondo' | 'cara' | 'producto';
export type FaceSwapOption = 'rostro' | 'completo';
export type AspectRatio = '1:1' | '9:16';

export interface ProductData {
  name: string;
  angle: string;
  buyer: string;
  details: string;
}

export interface AdStep {
  id: string;
  title: string;
  prompt: string;
}
