export type ColorKey = 'black' | 'white' | 'lilac' | 'pink';

export interface ColorOption {
  id: ColorKey;
  name: string;
  hex: string;
  borderClass?: string;
  image: string;
  deskImage: string;
}

export interface SwitchOption {
  id: string;
  name: string;
  type: 'linear' | 'tactile' | 'clicky';
  color: string;
  actuationForce: string;
  soundType: 'thock' | 'clack' | 'click';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  tags: string[];
  description: string;
  colors: ColorOption[];
  switches: SwitchOption[];
  specs: {
    label: string;
    value: string;
  }[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  inTheBox: string[];
  reviews: {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
  }[];
}

export interface CartItem {
  productId: string;
  name: string;
  color: ColorOption;
  switchOption: SwitchOption;
  price: number;
  quantity: number;
  image: string;
}

export type Currency = 'USD' | 'EUR' | 'THB' | 'GBP' | 'JPY';
