import React from 'react';
import { HomePage } from './HomePage';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  return <HomePage user={user} />;
};

export default DashboardPage;
