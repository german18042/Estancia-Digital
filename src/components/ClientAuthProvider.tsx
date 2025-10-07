'use client';

import { AuthProvider } from '@/providers/AuthProvider';

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
