import React from 'react';
import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function StudentLayout() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (session.role !== 'student') {
    if (session.role === 'guard') {
      return <Redirect href={'/(guard)/scan' as never} />;
    }

    return <Redirect href={'/(faculty)/(tabs)/home' as never} />;
  }

  return <Slot />;
}
