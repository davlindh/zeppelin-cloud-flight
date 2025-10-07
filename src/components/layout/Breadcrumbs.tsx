import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useProject } from '@/hooks/useApi';

const breadcrumbNameMap: { [key: string]: string } = {
  'showcase': 'Showcase',
  'participants': 'Deltagare',
  'partners': 'Partners',
  'admin': 'Admin',
  'media': 'Media',
  // Add other mappings here if needed for future routes
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  // Create pathnames array, but exclude 'home' from the trail itself.
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'home');

  // Do not show breadcrumbs on the homepage
  if (location.pathname === '/home' || location.pathname === '/') {
    return null;
  }

  // Check if we're on a project detail page
  const isProjectDetail = pathnames.length >= 2 && pathnames[0] === 'showcase' && pathnames[1];
  const projectSlug = isProjectDetail ? pathnames[1] : null;

  // Always call the hook, but only use the data when needed
  const { data: projectData } = useProject(projectSlug || '');

  return (
    <nav aria-label="breadcrumb" className="bg-white/90 backdrop-blur-md border-b border-t border-gray-200">
      <div className="container mx-auto px-6 py-3">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/home" className="hover:text-amber-500 transition-colors">
              Hem
            </Link>
          </li>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            // Re-join with only the current path segments to build the correct link
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            // Special handling for project detail pages
            if (isProjectDetail && index === 1 && projectData) {
              const displayName = projectData.title;

              return (
                <li key={to} className="flex items-center space-x-2">
                  <span>/</span>
                  {last ? (
                    <span className="text-gray-800 font-semibold" aria-current="page">{displayName}</span>
                  ) : (
                    <Link to={to} className="hover:text-amber-500 transition-colors">
                      {displayName}
                    </Link>
                  )}
                </li>
              );
            }

            // Regular breadcrumb handling
            const displayName = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return (
              <li key={to} className="flex items-center space-x-2">
                <span>/</span>
                {last ? (
                  <span className="text-gray-800 font-semibold" aria-current="page">{displayName}</span>
                ) : (
                  <Link to={to} className="hover:text-amber-500 transition-colors">
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
