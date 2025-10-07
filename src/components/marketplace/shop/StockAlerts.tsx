import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Check, X } from 'lucide-react';

interface StockAlertsProps {
  productId: string;
  productName: string;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ productId, productName }) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isAlertSet, setIsAlertSet] = useState(false);

  const validateEmail = (email: string) => {
    // Basic email validation regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleSetAlert = () => {
    if (isEmailValid) {
      // Here you would typically make an API call to set the stock alert
      console.log(`Setting stock alert for product ${productId} (${productName}) with email ${email}`);
      setIsAlertSet(true);
    }
  };

  const handleRemoveAlert = () => {
    // Here you would typically make an API call to remove the stock alert
    console.log(`Removing stock alert for product ${productId} (${productName}) with email ${email}`);
    setIsAlertSet(false);
    setEmail('');
    setIsEmailValid(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Bell className="mr-2 h-4 w-4" />
          Get Notified When {productName} is Back in Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAlertSet ? (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-2">
              <Check className="h-4 w-4" />
              Alert set for {email}
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleRemoveAlert}>
              <X className="mr-2 h-4 w-4" />
              Remove Alert
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                aria-invalid={!isEmailValid}
              />
              {!isEmailValid && email.length > 0 && (
                <p className="text-sm text-red-500">Please enter a valid email address.</p>
              )}
            </div>
            <Button disabled={!isEmailValid} onClick={handleSetAlert} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
