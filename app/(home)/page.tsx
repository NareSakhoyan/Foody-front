'use client';
import Header from '@/components/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import React from 'react';

const HomePage = () => {
  const { user, loading } = useCurrentUser();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <Header />
      {user?.name}
    </div>
  );
};

export default HomePage;
