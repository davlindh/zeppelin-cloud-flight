import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProductMutations } from '@/hooks/useProductMutations';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportProduct {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryName: string;
  brand: string;
  features: string[];
  tags: string[];
  image?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export const BulkImportDialog = ({ isOpen, onClose }: BulkImportDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createProduct } = useProductMutations();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const data: ImportProduct[] = [];

      // Validate required headers
      const requiredHeaders = ['title', 'description', 'price', 'category', 'brand'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const values = line.split(',').map(v => v.trim());
        
        if (values.length < headers.length) continue;

        const titleIndex = headers.indexOf('title');
        const descIndex = headers.indexOf('description');
        const priceIndex = headers.indexOf('price');
        const origPriceIndex = headers.indexOf('originalprice');
        const categoryIndex = headers.indexOf('category');
        const brandIndex = headers.indexOf('brand');
        const featuresIndex = headers.indexOf('features');
        const tagsIndex = headers.indexOf('tags');
        const imageIndex = headers.indexOf('image');

        const title = (titleIndex >= 0 && values[titleIndex]) ? values[titleIndex] : '';
        const description = (descIndex >= 0 && values[descIndex]) ? values[descIndex] : '';
        const price = priceIndex >= 0 && values[priceIndex] ? (parseFloat(values[priceIndex]) || 0) : 0;
        const categoryName = (categoryIndex >= 0 && values[categoryIndex]) ? values[categoryIndex] : 'general';
        const brand = (brandIndex >= 0 && values[brandIndex]) ? values[brandIndex] : '';
        const featuresStr = featuresIndex >= 0 ? values[featuresIndex] : '';
        const tagsStr = tagsIndex >= 0 ? values[tagsIndex] : '';

        const product: ImportProduct = {
          title,
          description,
          price,
          originalPrice: origPriceIndex >= 0 && values[origPriceIndex] ? parseFloat(values[origPriceIndex]) : undefined,
          categoryName,
          brand,
          features: featuresStr ? featuresStr.split(';') : [],
          tags: tagsStr ? tagsStr.split(';') : [],
          image: imageIndex >= 0 ? values[imageIndex] : undefined,
          status: 'pending'
        };

        // Basic validation
        if (!product.title || !product.description || product.price <= 0 || !product.brand) {
          product.status = 'error';
          product.error = 'Missing required fields or invalid price';
        }

        data.push(product);
      }

      setImportData(data);
      setShowPreview(true);
      
      toast({
        title: "File parsed successfully",
        description: `Found ${data.length} products to import.`,
      });
      
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: error instanceof Error ? error.message : "Failed to parse the file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    const validProducts = importData.filter(p => p.status !== 'error');
    
    if (validProducts.length === 0) {
      toast({
        title: "No valid products to import",
        description: "Please fix the errors or select a different file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);

    const updatedData = [...importData];
    
    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      if (!product) continue;
      
      const dataIndex = importData.findIndex(p => p === product);
      if (dataIndex === -1) continue;
      
      try {
        await createProduct({
          title: product.title,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.categoryName,
          brand: product.brand,
          features: product.features,
          tags: product.tags,
          image: product.image,
          variants: [{ color: '', size: '', stock: 0 }]
        });
        
        updatedData[dataIndex] = { ...product, status: 'success' as const };
      } catch (error) {
        updatedData[dataIndex] = { 
          ...product, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Import failed' 
        };
      }
      
      setImportProgress(((i + 1) / validProducts.length) * 100);
      setImportData([...updatedData]);
    }

    setIsProcessing(false);
    
    const successCount = updatedData.filter(p => p.status === 'success').length;
    const errorCount = updatedData.filter(p => p.status === 'error').length;
    
    toast({
      title: "Import completed",
      description: `${successCount} products imported successfully. ${errorCount} errors.`,
    });
  };

  const downloadTemplate = () => {
    const template = 'title,description,price,originalprice,category,brand,features,tags,image\n' +
      'Sample Product,A sample product description,99.99,129.99,electronics,SampleBrand,"Feature 1;Feature 2","tag1;tag2",https://example.com/image.jpg';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImportData([]);
    setShowPreview(false);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload File
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {selectedFile ? selectedFile.name : 'Select a CSV or Excel file'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      File should contain product data with required columns
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Choose File'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Template Download */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a CSV template with the correct format and required columns.
                  </p>
                  <Button variant="outline" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Import Progress */}
              {isProcessing && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Importing products...</span>
                        <span>{Math.round(importProgress)}%</span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {importData.length}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importData.filter(p => p.status === 'success').length}
                      </div>
                      <div className="text-sm text-gray-500">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importData.filter(p => p.status === 'error').length}
                      </div>
                      <div className="text-sm text-gray-500">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {importData.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-500">
                            {product.brand} • ${product.price} • {product.categoryName}
                          </div>
                          {product.error && (
                            <div className="text-sm text-red-600 mt-1">{product.error}</div>
                          )}
                        </div>
                        <div className="ml-4">
                          {product.status === 'pending' && (
                            <Badge variant="secondary">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {product.status === 'success' && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          )}
                          {product.status === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator />
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {showPreview && (
              <Button variant="outline" onClick={resetDialog}>
                Start Over
              </Button>
            )}
            {showPreview && (
              <Button 
                onClick={handleImport}
                disabled={isProcessing || importData.filter(p => p.status !== 'error').length === 0}
              >
                {isProcessing ? 'Importing...' : 'Import Products'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};