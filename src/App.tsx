import React, { useState } from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { useQC } from './context/QCContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Level1QC from './components/Level1QC';
import Level2QC from './components/Level2QC';
import ShipmentDetails from './components/ShipmentDetails';
import { QCProvider } from './context/QCContext';

function AppContent() {
  const { isAuthenticated, loading } = useQC();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/level1/:shipmentId" element={<Level1QC />} />
          <Route path="/level2/:shipmentId" element={<Level2QC />} />
          <Route path="/shipment/:shipmentId" element={<ShipmentDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QCProvider>
      <AppContent />
    </QCProvider>
  );
}

export default App;