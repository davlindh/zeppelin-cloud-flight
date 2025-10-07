// Product variant types
export interface ProductVariant {
  size?: string;
  color?: string;
  material?: string;
  stock: number;
}

// Re-export in case needed elsewhere
export default ProductVariant;