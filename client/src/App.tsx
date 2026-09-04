import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EnergyPage } from './pages/EnergyPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SellPage } from './pages/SellPage';
import { NeighbourhoodPage } from './pages/NeighbourhoodPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { UserProfile } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchCurrentUser = async () => {
    try {
      const meData = await api.getMe();
      setCurrentUser(meData.user);
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [refreshTrigger]);

  const handleUserSwitch = (userId: string) => {
    api.setUserId(userId);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSimulationChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppLayout
              currentUser={currentUser}
              onUserSwitch={handleUserSwitch}
              refreshTrigger={refreshTrigger}
              onSimulationStateChange={handleSimulationChange}
            />
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
                onRefresh={handleSimulationChange}
              />
            }
          />
          <Route
            path="/energy"
            element={
              <EnergyPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
                onSimulationStateChange={handleSimulationChange}
              />
            }
          />
          <Route
            path="/marketplace"
            element={
              <MarketplacePage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
                onRefresh={handleSimulationChange}
              />
            }
          />
          <Route
            path="/sell"
            element={
              <SellPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
                onRefresh={handleSimulationChange}
              />
            }
          />
          <Route
            path="/neighbourhood"
            element={
              <NeighbourhoodPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <TransactionsPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                currentUser={currentUser}
                refreshTrigger={refreshTrigger}
              />
            }
          />
        </Route>

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(user) => {
                setCurrentUser(user);
                handleUserSwitch(user.id);
              }}
            />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
