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

export interface CreativePackage {
  id: string;
  name: string;
  description: string;
  category: 'landing' | 'image' | 'both';
  style: string;
  tone: string;
}

export interface CreativePath {
  package: CreativePackage;
  justification: string;
}

export interface LandingLayoutProposal {
  sections: {
    sectionId: string;
    title: string;
    reasoning: string;
  }[];
}

export interface SectionGeneration {
  copy: {
    headline: string;
    body: string;
    cta?: string;
  };
  imageUrl: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface LandingGenerationState {
  proposedStructure: LandingLayoutProposal | null;
  selectedSectionId: string | null;
  selectedReferenceUrl: string | null;
  generations: Record<string, SectionGeneration>; // sectionId -> result
  baseImageUrl?: string;
}

export interface LandingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  prompt: string;
}
