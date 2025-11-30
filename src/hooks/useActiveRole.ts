import { useState, useEffect } from 'react';
import { AppRole, isValidRole } from '@/types/roles';

const ACTIVE_ROLE_KEY = 'active-role';

export const useActiveRole = () => {
  const [activeRole, setActiveRole] = useState<AppRole>(() => {
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
    return (stored && isValidRole(stored)) ? stored : 'customer';
  });

  useEffect(() => {
    if (isValidRole(activeRole)) {
      localStorage.setItem(ACTIVE_ROLE_KEY, activeRole);
    }
  }, [activeRole]);

  const setActiveRoleValidated = (role: AppRole) => {
    if (isValidRole(role)) {
      setActiveRole(role);
    }
  };

  return [activeRole, setActiveRoleValidated] as const;
};
