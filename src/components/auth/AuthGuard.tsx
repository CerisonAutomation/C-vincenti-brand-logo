import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SignedInProps {
  children: React.ReactNode;
}

export const SignedIn: React.FC<SignedInProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>;
  }

  return user ? <>{children}</> : null;
};

interface SignedOutProps {
  children: React.ReactNode;
}

export const SignedOut: React.FC<SignedOutProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>;
  }

  return !user ? <>{children}</> : null;
};
