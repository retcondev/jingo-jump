export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  gradient: string;
  badge?: "NEW" | "POPULAR" | "SALE";
  size?: string;
  ageRange?: string;
}

export interface FilterOptions {
  categories: Array<{ id: string; label: string; count: number }>;
  sizes: Array<{ id: string; label: string; count: number }>;
  ageRanges: Array<{ id: string; label: string; count: number }>;
  priceRange: {
    min: number;
    max: number;
  };
}
