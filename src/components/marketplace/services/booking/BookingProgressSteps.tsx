
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BookingProgressStepsProps {
  currentStep: number;
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export const BookingProgressSteps: React.FC<BookingProgressStepsProps> = ({
  currentStep,
  steps
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.number 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : step.number}
            </div>
            <div className="text-xs text-center mt-1">
              <div className="font-medium">{step.title}</div>
              <div className="text-slate-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${
              currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
