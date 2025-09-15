import React from 'react';

interface ProjectDescriptionProps {
  title?: string;
  content: string;
  highlights?: string[];
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  title = 'Om projektet',
  content,
  highlights = []
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-800">
        {title}
      </h2>

      {/* Main description */}
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed">
          {content}
        </p>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Särskilt framträdande
          </h3>
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start text-gray-700"
              >
                <span className="text-amber-500 mr-3 mt-1">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
