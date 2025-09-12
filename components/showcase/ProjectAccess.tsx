import React from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';

interface Access {
  requirements?: string[];
  target_audience?: string;
  capacity?: number;
  registration_required?: boolean;
}

interface ProjectAccessProps {
  access?: Access;
}

export const ProjectAccess: React.FC<ProjectAccessProps> = ({ access }) => {
  if (!access || (!access.requirements && !access.target_audience && !access.capacity && access.registration_required === undefined)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Tillgång & Deltagande</h3>
      
      <div className="space-y-3">
        {access.target_audience && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Målgrupp</h4>
              <p className="text-gray-700">{access.target_audience}</p>
            </div>
          </div>
        )}

        {access.capacity && (
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4" />
            <span>Max {access.capacity} deltagare</span>
          </div>
        )}

        {access.registration_required !== undefined && (
          <div className="flex items-center gap-2">
            {access.registration_required ? (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700">Förregistrering krävs</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Ingen förregistrering krävs</span>
              </>
            )}
          </div>
        )}

        {access.requirements && access.requirements.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Krav & förutsättningar</h4>
            <ul className="space-y-1">
              {access.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};