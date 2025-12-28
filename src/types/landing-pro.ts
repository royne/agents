import { IconType } from 'react-icons';

export interface LandingSection {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  prompt: string;
}

export interface ProductData {
  name: string;
  angle: string;
  buyer: string;
  details: string;
}

export type LandingMode = 'full' | 'flash' | 'section';

export interface MarketingLayout {
  id: string;
  name: string;
  desc: string;
  prompt: string;
}
