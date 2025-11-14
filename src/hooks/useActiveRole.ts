import { useState, useEffect } from 'react';

const ACTIVE_ROLE_KEY = 'active-role';

export const useActiveRole = () => {
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_ROLE_KEY) || 'customer';
  });

  useEffect(() => {
    localStorage.setItem(ACTIVE_ROLE_KEY, activeRole);
  }, [activeRole]);

  return [activeRole, setActiveRole] as const;
};
