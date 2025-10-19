import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BudgetItem {
  item: string;
  cost: number;
}

interface BudgetValue {
  amount?: number;
  currency?: string;
  breakdown?: BudgetItem[];
}

interface BudgetEditorProps {
  value?: BudgetValue;
  onChange: (value: BudgetValue) => void;
}

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ value = {}, onChange }) => {
  const [newItem, setNewItem] = useState<BudgetItem>({ item: '', cost: 0 });

  const handleAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    onChange({ ...value, amount: numAmount });
  };

  const handleCurrencyChange = (currency: string) => {
    onChange({ ...value, currency });
  };

  const handleAddItem = () => {
    if (!newItem.item || newItem.cost <= 0) return;
    
    const breakdown = [...(value.breakdown || []), newItem];
    onChange({ ...value, breakdown });
    
    setNewItem({ item: '', cost: 0 });
  };

  const handleDeleteItem = (index: number) => {
    const breakdown = [...(value.breakdown || [])];
    breakdown.splice(index, 1);
    onChange({ ...value, breakdown });
  };

  const handleUpdateItem = (index: number, field: keyof BudgetItem, newValue: string | number) => {
    const breakdown = [...(value.breakdown || [])];
    breakdown[index] = { ...breakdown[index], [field]: newValue };
    onChange({ ...value, breakdown });
  };

  const calculateTotal = () => {
    return (value.breakdown || []).reduce((sum, item) => sum + item.cost, 0);
  };

  const getPercentage = (cost: number) => {
    const total = value.amount || calculateTotal();
    if (total === 0) return 0;
    return (cost / total) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const breakdownTotal = calculateTotal();
  const hasAmount = value.amount && value.amount > 0;
  const isOverBudget = hasAmount && breakdownTotal > value.amount!;

  return (
    <div className="space-y-6">
      {/* Total Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total budget
          </CardTitle>
          <CardDescription>
            Ange den totala budgeten för projektet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="amount">Belopp</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1000"
                value={value.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Valuta</Label>
              <Select
                value={value.currency || 'SEK'}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Välj valuta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEK">SEK (kr)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasAmount && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total budget:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(value.amount!)} {value.currency || 'SEK'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Kostnadsfördelning</CardTitle>
          <CardDescription>
            Dela upp budgeten i olika poster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="flex gap-2">
            <Input
              placeholder="T.ex. Material"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              placeholder="Kostnad"
              value={newItem.cost || ''}
              onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
              className="w-32"
            />
            <Button onClick={handleAddItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Budget Items List */}
          {!value.breakdown || value.breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inga kostnadsposter tillagda ännu. Lägg till poster ovan.
            </p>
          ) : (
            <div className="space-y-3">
              {value.breakdown.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.item}
                          onChange={(e) => handleUpdateItem(index, 'item', e.target.value)}
                          placeholder="Postens namn"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={item.cost}
                          onChange={(e) => handleUpdateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {getPercentage(item.cost).toFixed(1)}% av total
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.cost)} {value.currency || 'SEK'}
                          </span>
                        </div>
                        <Progress value={getPercentage(item.cost)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary */}
          {value.breakdown && value.breakdown.length > 0 && (
            <Card className={isOverBudget ? 'border-destructive' : 'border-primary'}>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Summa poster:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(breakdownTotal)} {value.currency || 'SEK'}
                    </span>
                  </div>
                  
                  {hasAmount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kvar av budget:</span>
                        <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {formatCurrency(value.amount! - breakdownTotal)} {value.currency || 'SEK'}
                        </span>
                      </div>
                      
                      {isOverBudget && (
                        <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Över budget med {formatCurrency(breakdownTotal - value.amount!)} {value.currency || 'SEK'}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {(hasAmount || (value.breakdown && value.breakdown.length > 0)) && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Förhandsgranskning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {hasAmount && (
              <p>
                <strong>Total budget:</strong> {formatCurrency(value.amount!)} {value.currency || 'SEK'}
              </p>
            )}
            {value.breakdown && value.breakdown.length > 0 && (
              <div>
                <strong>Fördelning:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  {value.breakdown.map((item, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>{item.item}</span>
                      <span className="font-medium ml-4">
                        {formatCurrency(item.cost)} {value.currency || 'SEK'} ({getPercentage(item.cost).toFixed(0)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
