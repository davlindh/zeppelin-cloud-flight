import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  stock: number;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange
}) => {
  // Group variants by type
  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color))];
  const materials = [...new Set(variants.filter(v => v.material).map(v => v.material))];

  const [selectedSize, setSelectedSize] = useState<string | undefined>(selectedVariant?.size);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(selectedVariant?.color);
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(selectedVariant?.material);

  // Find matching variant based on selections
  React.useEffect(() => {
    const matchingVariant = variants.find(variant => 
      (!selectedSize || variant.size === selectedSize) &&
      (!selectedColor || variant.color === selectedColor) &&
      (!selectedMaterial || variant.material === selectedMaterial)
    );

    if (matchingVariant && matchingVariant !== selectedVariant) {
      onVariantChange(matchingVariant);
    }
  }, [selectedSize, selectedColor, selectedMaterial, variants, selectedVariant, onVariantChange]);

  const getVariantStock = (size?: string, color?: string, material?: string) => {
    const variant = variants.find(v => 
      (!size || v.size === size) &&
      (!color || v.color === color) &&
      (!material || v.material === material)
    );
    return variant?.stock ?? 0;
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size {selectedSize && <span className="text-gray-500">({selectedSize})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const stock = getVariantStock(size, selectedColor, selectedMaterial);
              const isSelected = selectedSize === size;
              const isAvailable = stock > 0;
              
              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={`relative ${!isAvailable ? 'opacity-50' : ''}`}
                >
                  {size}
                  {isSelected && <Check className="h-3 w-3 ml-1" />}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-red-500 transform rotate-45" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color {selectedColor && <span className="text-gray-500">({selectedColor})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const stock = getVariantStock(selectedSize, color, selectedMaterial);
              const isSelected = selectedColor === color;
              const isAvailable = stock > 0;
              
              return (
                <div key={color} className="relative">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => setSelectedColor(color)}
                    className={`${!isAvailable ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-4 h-4 rounded-full border border-gray-300`}
                        style={{ 
                          backgroundColor: color?.toLowerCase() === 'white' ? '#fff' : 
                                           color?.toLowerCase() === 'black' ? '#000' :
                                           color?.toLowerCase() === 'red' ? '#ef4444' :
                                           color?.toLowerCase() === 'blue' ? '#3b82f6' :
                                           color?.toLowerCase() === 'green' ? '#10b981' :
                                           color?.toLowerCase() === 'yellow' ? '#f59e0b' :
                                           color?.toLowerCase() === 'purple' ? '#8b5cf6' :
                                           color?.toLowerCase() === 'pink' ? '#ec4899' :
                                           color?.toLowerCase() === 'gray' || color?.toLowerCase() === 'grey' ? '#6b7280' :
                                           color?.toLowerCase() === 'navy' ? '#1e40af' :
                                           color?.toLowerCase() === 'silver' ? '#d1d5db' :
                                           '#94a3b8'
                        }}
                      />
                      <span>{color}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </Button>
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-red-500 transform rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Selection */}
      {materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material {selectedMaterial && <span className="text-gray-500">({selectedMaterial})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {materials.map((material) => {
              const stock = getVariantStock(selectedSize, selectedColor, material);
              const isSelected = selectedMaterial === material;
              const isAvailable = stock > 0;
              
              return (
                <Badge
                  key={material}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                  onClick={() => isAvailable && setSelectedMaterial(material)}
                >
                  {material}
                  {isSelected && <Check className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Information */}
      {selectedVariant && (
        <div className="text-sm text-gray-600">
          {selectedVariant.stock > 0 ? (
            <span className="text-green-600">
              {selectedVariant.stock} in stock
            </span>
          ) : (
            <span className="text-red-600">
              Out of stock
            </span>
          )}
        </div>
      )}
    </div>
  );
};