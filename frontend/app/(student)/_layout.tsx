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
    return <Redirect href="/login" />;
  }

  return <Slot />;
}