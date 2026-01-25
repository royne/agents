import { ProductData, CreativePath, LandingSection, AdConcept } from '../../types/image-pro';

export interface Launch {
  id: string;
  user_id: string;
  name: string;
  product_dna: ProductData;
  creative_strategy: CreativePath | null;
  landing_structure: {
    sections: {
      sectionId: string;
      title: string;
      reasoning: string;
    }[];
  } | null;
  ad_concepts: AdConcept[];
  status: 'draft' | 'active' | 'archived';
  thumbnail_url?: string; // New: original product image
  created_at: string;
  updated_at: string;
  is_virtual?: boolean; // New: virtual project for V1/Legacy
  orphan_count?: number; // New: count of orphan assets
}

export interface ILaunchService {
  create(userId: string, data: Partial<Launch>): Promise<Launch>;
  getById(id: string): Promise<Launch | null>;
  getByUser(userId: string): Promise<Launch[]>;
  update(id: string, data: Partial<Launch>): Promise<Launch>;
  delete(id: string): Promise<void>;
  uploadImageFromBase64(userId: string, imageBase64: string): Promise<string>;
}
