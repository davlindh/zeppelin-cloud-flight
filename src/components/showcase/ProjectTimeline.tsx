import React from 'react';

interface Timeline {
  startDate?: string;
  endDate?: string;
  milestones?: Array<{ date: string; title: string; description?: string; }>;
}

interface ProjectTimelineProps {
  timeline?: Timeline;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ timeline }) => {
  if (!timeline || (!timeline.startDate && !timeline.milestones)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Tidslinje</h3>
      
      {(timeline.startDate || timeline.endDate) && (
        <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
          {timeline.startDate && (
            <div>
              <p className="text-sm font-medium text-blue-800">Start</p>
              <p className="text-blue-700">{formatDate(timeline.startDate)}</p>
            </div>
          )}
          {timeline.endDate && (
            <div>
              <p className="text-sm font-medium text-blue-800">Slut</p>
              <p className="text-blue-700">{formatDate(timeline.endDate)}</p>
            </div>
          )}
        </div>
      )}

      {timeline.milestones && timeline.milestones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Viktiga datum</h4>
          <div className="space-y-3">
            {timeline.milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 p-3 border-l-4 border-blue-400 bg-gray-50">
                <div className="flex-shrink-0 w-20">
                  <p className="text-sm font-medium text-gray-600">
                    {formatDate(milestone.date).split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">{milestone.title}</h5>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};