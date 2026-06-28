import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AuthScreen } from './AuthScreen';

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * AuthGate — wraps the entire app.
 * Shows AuthScreen if the user is not authenticated.
 * Renders children (the main app) once authenticated.
 */
export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <>{children}</>;
};

export default AuthGate;
