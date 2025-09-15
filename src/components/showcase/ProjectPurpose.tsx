import React from 'react';

interface ProjectPurposeProps {
  purpose?: string;
  expectedImpact?: string;
  associations?: string[];
}

export const ProjectPurpose: React.FC<ProjectPurposeProps> = ({
  purpose,
  expectedImpact,
  associations = []
}) => {
  if (!purpose && !expectedImpact && associations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-800">
        Syfte & Vision
      </h2>

      {purpose && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Projektets syfte</h3>
          <p className="text-gray-700 leading-relaxed">{purpose}</p>
        </div>
      )}

      {expectedImpact && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Förväntad påverkan</h3>
          <p className="text-gray-700 leading-relaxed">{expectedImpact}</p>
        </div>
      )}

      {associations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Kopplingar & associationer</h3>
          <div className="flex flex-wrap gap-2">
            {associations.map((association, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
              >
                {association}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};