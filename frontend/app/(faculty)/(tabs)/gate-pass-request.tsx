import GatePassRequestComponent from '../../../components/GatePass/GatePassRequestComponent';
import { useAuth } from '../../../context/AuthContext';

export default function GatePassRequestScreen() {
  const { session } = useAuth();

  return (
    <GatePassRequestComponent
      teacherId={session?.user.erpId}
      teacherName={session?.user.name}
    />
  );
}
