import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SearchErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Search component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Search Temporarily Unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're experiencing issues with the search functionality. Please try refreshing the page.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
