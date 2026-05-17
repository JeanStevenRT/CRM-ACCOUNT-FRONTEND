import { useEffect, useState } from 'react';
import { loginRequest, logoutRequest, refreshRequest } from '../services/auth.service';
import { AuthContext } from './auth.context';

const getStoredUser = () => {
  const savedUser = localStorage.getItem('crm_user');
  return savedUser ? JSON.parse(savedUser) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loadingAuth, setLoadingAuth] = useState(() => Boolean(getStoredUser()));

  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    setUser(data.user);
    localStorage.setItem('crm_user', JSON.stringify(data.user));

    return data;
  };

  const logout = async () => {
    await logoutRequest();

    setUser(null);
    localStorage.removeItem('crm_user');
  };

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const verifySession = async () => {
      try {
        await refreshRequest();
      } catch {
        if (!isMounted) return;

        setUser(null);
        localStorage.removeItem('crm_user');
      } finally {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loadingAuth,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};