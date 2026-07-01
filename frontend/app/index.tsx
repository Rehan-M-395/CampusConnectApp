import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (session.role === 'guard') {
    return <Redirect href={'/(guard)/scan' as never} />;
  }

  if (session.role === 'student') {
    return <Redirect href={'/(student)/home' as never} />;
  }

  return <Redirect href={'/(faculty)/(tabs)/home' as never} />;
}
