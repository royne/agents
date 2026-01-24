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
  created_at: string;
  updated_at: string;
}

export interface ILaunchService {
  create(userId: string, data: Partial<Launch>): Promise<Launch>;
  getById(id: string): Promise<Launch | null>;
  getByUser(userId: string): Promise<Launch[]>;
  update(id: string, data: Partial<Launch>): Promise<Launch>;
  delete(id: string): Promise<void>;
}
