// Utilidades de autenticación
export const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en el login');
  }

  return data;
};

export const logout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
};

export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (response.ok) {
    return response.json();
  }
  
  return null;
};

