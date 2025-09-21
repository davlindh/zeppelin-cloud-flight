import React from 'react';
import { useParticipantContext } from '@/contexts/ParticipantContext';

/**
 * Example component demonstrating the use of ParticipantContext
 * This shows how components can now consume participant data without prop drilling
 */
export const ParticipantListExample: React.FC = () => {
  const {
    participants,
    isLoading,
    error,
    availableFilters,
    filterParticipants,
    getParticipantStats
  } = useParticipantContext();

  // Example filter state
  const [filters, setFilters] = React.useState({
    searchTerm: '',
    roles: [],
    skills: []
  });

  // Apply filters
  const filteredParticipants = React.useMemo(() => {
    return filterParticipants(filters);
  }, [filterParticipants, filters]);

  // Get statistics
  const stats = React.useMemo(() => {
    return getParticipantStats();
  }, [getParticipantStats]);

  if (isLoading) {
    return <div className="p-4">Loading participants...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">
      Error loading participants: {error instanceof Error ? error.message : 'Unknown error'}
    </div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Participants</h2>

      {/* Statistics */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Statistics</h3>
        <p>Total Participants: {stats.totalParticipants}</p>
        <p>Total Projects: {stats.totalProjects}</p>
        <p>Total Media: {stats.totalMedia}</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Filters</h3>
        <input
          type="text"
          placeholder="Search by name, bio, or skills..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="border rounded px-2 py-1 mr-4"
        />

        <select
          value={filters.roles[0] || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            roles: e.target.value ? [e.target.value] : []
          }))}
          className="border rounded px-2 py-1 mr-4"
        >
          <option value="">All Roles</option>
          {availableFilters.roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          value={filters.skills[0] || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            skills: e.target.value ? [e.target.value] : []
          }))}
          className="border rounded px-2 py-1"
        >
          <option value="">All Skills</option>
          {availableFilters.skills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        {filteredParticipants.map(participant => (
          <div key={participant.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              {participant.avatar && (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{participant.name}</h3>
                <p className="text-gray-600">{participant.bio}</p>
                {participant.roles.length > 0 && (
                  <p className="text-sm text-blue-600">
                    Roles: {participant.roles.join(', ')}
                  </p>
                )}
                {participant.skills.length > 0 && (
                  <p className="text-sm text-green-600">
                    Skills: {participant.skills.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {participant.projects.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Projects:</h4>
                <div className="flex flex-wrap gap-2">
                  {participant.projects.map(project => (
                    <span key={project.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {project.title} ({project.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No participants match the current filters.
        </div>
      )}
    </div>
  );
};
