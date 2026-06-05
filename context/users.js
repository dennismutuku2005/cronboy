"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from '@/lib/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    const data = await api.fetchUsers();
    if (data && data.length > 0) setUsers(data);
  }, []);

  const createUser = (newUser) => setUsers(prev => [...prev, newUser]);
  const deleteUser = (userId) => setUsers(prev => prev.filter(u => u.id !== userId));
  const updateUser = (updatedUser) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

  return (
    <UserContext.Provider value={{ users, setUsers, loadUsers, createUser, deleteUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsers must be used within UserProvider");
  return ctx;
}
