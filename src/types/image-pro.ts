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
    extraInstructions?: string; // New: instructions from chat
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
  aspectRatio?: AspectRatio; // New: selected aspect ratio
  extraInstructions?: string; // Persisted instructions
}

export interface AdConcept {
  id: string; // Added id for tracking
  title: string;
  hook: string;
  body: string;
  adCta?: string;
  visualPrompt: string;
}

export interface AdGeneration {
  imageUrl: string;
  status: 'pending' | 'completed' | 'failed';
  aspectRatio: AspectRatio;
}

export interface LandingGenerationState {
  phase: 'landing' | 'ads';
  proposedStructure: LandingLayoutProposal | null;
  selectedSectionId: string | null;
  selectedReferenceUrl: string | null;
  generations: Record<string, SectionGeneration>; // sectionId -> result
  adGenerations: Record<string, AdGeneration>; // New: conceptId -> result
  baseImageUrl?: string;
  adConcepts?: AdConcept[];
}

export interface LandingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  prompt: string;
}

export interface ChatProtocol {
  action: 'UPDATE_DNA' | 'UPDATE_SECTION' | 'REGENERATE_STRUCTURE';
  data: any;
}

export interface ChatResponse {
  text: string;
  protocol?: ChatProtocol;
}
