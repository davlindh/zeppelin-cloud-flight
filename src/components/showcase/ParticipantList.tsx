import React from 'react';
import { Link } from 'react-router-dom';

// Simple slugify function
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

interface Participant {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
}

interface ParticipantListProps {
  participants: Participant[];
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  if (!participants.length) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-800">
        Deltagare
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {participants.map((participant, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 text-lg font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/participants/${slugify(participant.name)}`}
                  className="font-semibold text-lg text-gray-800 mb-1 hover:text-amber-600 transition-colors duration-200 inline-block"
                >
                  {participant.name}
                </Link>

                <p className="text-amber-600 font-medium text-sm mb-3">
                  {participant.role}
                </p>

                {participant.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {participant.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
