export interface ImageProProductData {
  name: string;
  angle?: string;
  buyer?: string;
  details?: string;
}

export type ImageProAspectRatio = '1:1' | '9:16' | '16:9';
export type ImageProReferenceType = 'style' | 'layout';

export interface ImageProRequest {
  mode: 'libre' | 'ads' | 'personas' | 'landing' | 'video';
  subMode?: string; // e.g., 'sencillo', 'completo', 'generar', 'cara', 'fondo', etc.
  prompt: string;
  referenceImage?: string;
  referenceType: ImageProReferenceType;
  productData: ImageProProductData;
  aspectRatio: ImageProAspectRatio;
  isCorrection: boolean;
  previousImageUrl?: string;
  continuityImage?: string;
  currentStep?: number;
  debug?: boolean;
}

export interface StrategicPromptResponse {
  strategicPrompt: string;
  parts: any[];
  instances?: any[];
  parameters?: any;
}
