
// Enhanced cart types with proper interfaces

export interface CartVariants {
  size?: string;
  color?: string;
  material?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedVariants: CartVariants;
  image?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: RemoveItemPayload }
  | { type: 'UPDATE_QUANTITY'; payload: UpdateQuantityPayload }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface AddItemPayload {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedVariants: CartVariants;
  image?: string;
  maxQuantity?: number;
}

export interface RemoveItemPayload {
  productId: string;
  selectedVariants: CartVariants;
}

export interface UpdateQuantityPayload {
  productId: string;
  selectedVariants: CartVariants;
  quantity: number;
}

export interface CartContextType {
  state: CartState;
  addItem: (
    productId: string,
    title: string,
    price: number,
    quantity: number,
    selectedVariants: CartVariants,
    image?: string,
    maxQuantity?: number
  ) => void;
  removeItem: (productId: string, selectedVariants: CartVariants) => void;
  updateQuantity: (productId: string, selectedVariants: CartVariants, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  hasItems: () => boolean;
}
