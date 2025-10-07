
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  backLink?: {
    href: string;
    label: string;
  };
  backgroundImage?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  backLink,
  backgroundImage,
  className = ""
}) => {
  return (
    <div className={`relative mb-8 ${className}`}>
      {/* Background Image with Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50" />
        </div>
      )}

      <div className={`${backgroundImage ? 'py-20 text-white' : 'py-8'}`}>
        {/* Enhanced Breadcrumbs */}
        {breadcrumbs && (
          <div className="flex items-center gap-2 mb-6">
            <Link 
              to="/" 
              className={`flex items-center gap-1 ${backgroundImage ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-700'} transition-colors group`}
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className={`${backgroundImage ? 'text-slate-300' : 'text-slate-400'}`}>/</span>
                {crumb.href ? (
                  <Link 
                    to={crumb.href} 
                    className={`${backgroundImage ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-700'} transition-colors hover:underline`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`font-medium ${backgroundImage ? 'text-white' : 'text-slate-900'}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Enhanced Back Link */}
        {backLink && (
          <div className="mb-6">
            <Link 
              to={backLink.href} 
              className={`flex items-center gap-2 ${backgroundImage ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-700'} transition-all duration-300 group hover:gap-3`}
            >
              <ArrowLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>{backLink.label}</span>
            </Link>
          </div>
        )}

        {/* Enhanced Title and Description */}
        <div className="space-y-4">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-slate-900'}`}>
            {title}
          </h1>
          {description && (
            <p className={`text-lg md:text-xl max-w-3xl leading-relaxed ${backgroundImage ? 'text-slate-200 drop-shadow' : 'text-slate-600'}`}>
              {description}
            </p>
          )}
        </div>

        {/* Decorative Elements */}
        {backgroundImage && (
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
