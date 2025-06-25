export interface AttributeOption {
    displayValue: string;
    value: string;
    id: string;
  }
  
  export interface Attribute {
    id: string;
    name: string;
    type: string; // 'text' | 'swatch'
    items: AttributeOption[];
  }
  
  export interface Product {
    id: string;
    name: string;
    brand: string;
    inStock: boolean;
    gallery: string[];
    attributes: Attribute[];
    prices: { currency: { label: string; symbol: string }; amount: number }[];
    description: string;
  }
  