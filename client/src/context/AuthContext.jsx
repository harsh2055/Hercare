// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, firebaseAuthSync } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hercare_user');
    const savedToken = localStorage.getItem('hercare_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // client/src/context/AuthContext.jsx

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('hercare_token', data.token);
    // Ensure this line is exactly like this to save the WHOLE object (including role)
    localStorage.setItem('hercare_user', JSON.stringify(data)); 
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerUser(userData);
    localStorage.setItem('hercare_token', data.token);
    localStorage.setItem('hercare_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const loginWithFirebase = async (firebaseUser) => {
    const { data } = await firebaseAuthSync({
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
    });
    localStorage.setItem('hercare_token', data.token);
    localStorage.setItem('hercare_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hercare_token');
    localStorage.removeItem('hercare_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('hercare_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithFirebase, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
