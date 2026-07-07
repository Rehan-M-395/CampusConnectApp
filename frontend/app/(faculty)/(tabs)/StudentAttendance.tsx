// import StudentAttendance from '@/components/Home/StudentAttendance';
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

    



import StudentAttendanceComponent from '@/components/Home/StudentAttendanceComponent';
import HomeComponent from '../../../components/Home/HomeComponent';
import { useAuth } from '../../../context/AuthContext';

export default function StudentAttendance() {
  const { apiBaseUrl, session } = useAuth();

 
  return (
    <StudentAttendanceComponent />
  );
}


