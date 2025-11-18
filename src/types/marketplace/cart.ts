// Enhanced cart types with discriminated union for products and tickets

export interface CartVariants {
  size?: string;
  color?: string;
  material?: string;
}

// Base cart item properties
interface BaseCartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
}

// Product cart item
export interface ProductCartItem extends BaseCartItem {
  kind: 'product';
  productId: string;
  selectedVariants: CartVariants;
}

// Event ticket cart item
export interface EventTicketCartItem extends BaseCartItem {
  kind: 'event_ticket';
  ticketTypeId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

// Union type
export type CartItem = ProductCartItem | EventTicketCartItem;

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'ADD_TICKET'; payload: AddTicketPayload }
  | { type: 'REMOVE_ITEM'; payload: RemoveItemPayload }
  | { type: 'REMOVE_TICKET'; payload: RemoveTicketPayload }
  | { type: 'UPDATE_QUANTITY'; payload: UpdateQuantityPayload }
  | { type: 'UPDATE_TICKET_QUANTITY'; payload: UpdateTicketQuantityPayload }
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

export interface AddTicketPayload {
  ticketTypeId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
}

export interface RemoveItemPayload {
  productId: string;
  selectedVariants: CartVariants;
}

export interface RemoveTicketPayload {
  ticketTypeId: string;
}

export interface UpdateQuantityPayload {
  productId: string;
  selectedVariants: CartVariants;
  quantity: number;
}

export interface UpdateTicketQuantityPayload {
  ticketTypeId: string;
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
  addTicket: (
    ticketTypeId: string,
    eventId: string,
    eventTitle: string,
    eventDate: string,
    title: string,
    price: number,
    quantity: number,
    image?: string,
    maxQuantity?: number
  ) => void;
  removeItem: (productId: string, selectedVariants: CartVariants) => void;
  removeTicket: (ticketTypeId: string) => void;
  updateQuantity: (productId: string, selectedVariants: CartVariants, quantity: number) => void;
  updateTicketQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  hasItems: () => boolean;
}
