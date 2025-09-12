import React from 'react';

interface Budget {
  amount?: number;
  currency?: string;
  breakdown?: Array<{ item: string; cost: number; }>;
}

interface ProjectBudgetProps {
  budget?: Budget;
}

export const ProjectBudget: React.FC<ProjectBudgetProps> = ({ budget }) => {
  if (!budget || (!budget.amount && !budget.breakdown)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Budget & Kostnad</h3>
      
      {budget.amount && (
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-amber-800">
            {budget.amount.toLocaleString()} {budget.currency || 'SEK'}
          </div>
          <p className="text-sm text-amber-700">Total projektbudget</p>
        </div>
      )}

      {budget.breakdown && budget.breakdown.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Kostnadsfördelning</h4>
          <div className="space-y-1">
            {budget.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-700">{item.item}</span>
                <span className="font-semibold text-gray-800">
                  {item.cost.toLocaleString()} {budget.currency || 'SEK'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};