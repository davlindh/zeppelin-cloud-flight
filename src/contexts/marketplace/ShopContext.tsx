import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Shop state interface
interface ShopState {
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
  filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
    rating: number;
  };
  view: 'browse' | 'search' | 'filtered';
  isLoading: boolean;
}

// Action types
type ShopAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<ShopState['filters']> }
  | { type: 'SET_VIEW'; payload: ShopState['view'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ALL_FILTERS' }
  | { type: 'REMOVE_FILTER'; payload: { type: string; value?: string } }
  | { type: 'INITIALIZE_FROM_URL'; payload: Partial<ShopState> };

// Initial state
const initialState: ShopState = {
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'newest',
  filters: {
    priceRange: [0, 10000],
    brands: [],
    inStockOnly: false,
    rating: 0,
  },
  view: 'browse',
  isLoading: false,
};

// Reducer
const shopReducer = (state: ShopState, action: ShopAction): ShopState => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        view: action.payload ? 'search' : 'browse',
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        view: action.payload === 'all' ? 'browse' : 'filtered',
      };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    case 'SET_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      const hasActiveFilters = 
        newFilters.brands.length > 0 ||
        newFilters.inStockOnly ||
        newFilters.rating > 0 ||
        newFilters.priceRange[0] > 0 ||
        newFilters.priceRange[1] < 10000;
      
      return {
        ...state,
        filters: newFilters,
        view: hasActiveFilters || state.selectedCategory !== 'all' || state.searchTerm ? 'filtered' : 'browse',
      };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_ALL_FILTERS':
      return {
        ...initialState,
        view: 'browse',
      };
    case 'REMOVE_FILTER':
      const { type, value } = action.payload;
      const updatedState = { ...state };
      
      switch (type) {
        case 'search':
          updatedState.searchTerm = '';
          break;
        case 'category':
          updatedState.selectedCategory = 'all';
          break;
        case 'brands':
          updatedState.filters.brands = value ? state.filters.brands.filter(brand => brand !== value) : [];
          break;
        case 'priceRange':
          updatedState.filters.priceRange = [0, 10000];
          break;
        case 'inStockOnly':
          updatedState.filters.inStockOnly = false;
          break;
        case 'rating':
          updatedState.filters.rating = 0;
          break;
      }
      
      // Update view based on remaining filters
      const hasRemaining = 
        updatedState.searchTerm ||
        updatedState.selectedCategory !== 'all' ||
        updatedState.filters.brands.length > 0 ||
        updatedState.filters.inStockOnly ||
        updatedState.filters.rating > 0 ||
        updatedState.filters.priceRange[0] > 0 ||
        updatedState.filters.priceRange[1] < 10000;
      
      updatedState.view = hasRemaining ? 'filtered' : 'browse';
      return updatedState;
    case 'INITIALIZE_FROM_URL':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context
interface ShopContextType {
  state: ShopState;
  dispatch: React.Dispatch<ShopAction>;
  hasActiveFilters: boolean;
  updateURL: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Provider
interface ShopProviderProps {
  children: React.ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(shopReducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Track if we're updating from URL to prevent loops
  const isUpdatingFromURL = React.useRef(false);

  // Initialize from URL and listen to URL changes
  useEffect(() => {
    isUpdatingFromURL.current = true;
    
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = decodeURIComponent(searchParams.get('category') || 'all');
    const urlBrand = searchParams.get('brand');
    
    console.log('URL changed:', { urlSearch, urlCategory, urlBrand });
    
    const urlState: Partial<ShopState> = {
      searchTerm: urlSearch,
      selectedCategory: urlCategory,
      view: urlSearch ? 'search' : urlCategory !== 'all' ? 'filtered' : 'browse',
    };
    
    if (urlBrand) {
      urlState.filters = {
        ...initialState.filters,
        brands: [urlBrand]
      };
      urlState.view = 'filtered';
    }
    
    console.log('Dispatching URL state:', urlState);
    dispatch({ type: 'INITIALIZE_FROM_URL', payload: urlState });
    
    // Reset flag after state update
    setTimeout(() => {
      isUpdatingFromURL.current = false;
    }, 0);
  }, [searchParams]); // Listen to URL changes

  // Update URL when state changes (debounced)
  const updateURL = React.useCallback(() => {
    const newSearchParams = new URLSearchParams();
    
    if (state.selectedCategory !== 'all') {
      newSearchParams.set('category', encodeURIComponent(state.selectedCategory));
    }
    
    if (state.searchTerm) {
      newSearchParams.set('search', state.searchTerm);
    }
    
    if (state.filters.brands.length > 0) {
      const firstBrand = state.filters.brands[0];
      if (firstBrand) {
        newSearchParams.set('brand', firstBrand);
      }
    }
    
    const newParams = newSearchParams.toString();
    const currentParams = searchParams.toString();
    
    if (currentParams !== newParams) {
      if (newParams) {
        setSearchParams(newSearchParams, { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    }
  }, [state, searchParams, setSearchParams, navigate]);

  // Auto-update URL when state changes (debounced) - but not when updating from URL
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      console.log('Skipping URL update - currently updating from URL');
      return;
    }
    
    console.log('State changed, updating URL:', state);
    const timeoutId = setTimeout(updateURL, 100);
    return () => clearTimeout(timeoutId);
  }, [updateURL, state]);

  // Calculate if filters are active
  const hasActiveFilters = React.useMemo(() => {
    return state.searchTerm.trim() !== '' || 
           state.selectedCategory !== 'all' ||
           state.filters.brands.length > 0 || 
           state.filters.inStockOnly || 
           state.filters.rating > 0 ||
           (state.filters.priceRange[0] > 0 || state.filters.priceRange[1] < 10000);
  }, [state]);

  return (
    <ShopContext.Provider value={{ state, dispatch, hasActiveFilters, updateURL }}>
      {children}
    </ShopContext.Provider>
  );
};

// Hook
export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};