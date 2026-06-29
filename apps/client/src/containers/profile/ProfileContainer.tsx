import { useEffect, type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileComponent } from './ProfileComponent';

export const ProfileContainer = (): ReactElement => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return <ProfileComponent />;
};
