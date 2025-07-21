import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQC } from '../context/QCContext';
import { Package, CheckCircle, AlertCircle, Clock, BarChart3, Users, LogOut, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Dashboard() {
  const { shipments, loading, user, logout, fetchShipments } = useQC();
  const navigate = useNavigate();

  const stats = {
    totalShipments: shipments.length,
    pendingLevel1: shipments.filter(s => s.level1Status === 'pending').length,
    pendingLevel2: shipments.filter(s => s.level2Status === 'pending' && s.level1Status === 'pass').length,
    completed: shipments.filter(s => s.level1Status === 'pass' && s.level2Status === 'pass').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Warehouse QC Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchShipments}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{user?.name || user?.username}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalShipments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Level 1</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingLevel1}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Level 2</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingLevel2}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Active Shipments
              </h2>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {shipments.length === 0 && !loading && (
              <div className="p-6 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No shipments found</p>
              </div>
            )}
            {shipments.map((shipment) => (
              <div key={shipment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {shipment.supplierName}
                      </h3>
                      <div className="flex space-x-2">
                        <StatusBadge status={shipment.level1Status} label="Level 1" />
                        <StatusBadge status={shipment.level2Status} label="Level 2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">PO Number:</span> {shipment.poNumber}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {shipment.expectedItems}
                      </div>
                      <div>
                        <span className="font-medium">Received:</span>{' '}
                        {shipment.receivedDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {shipment.level1Status === 'pending' && (
                    <button
                      onClick={() => navigate(`/level1/${shipment.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Start Level 1 QC
                    </button>
                  )}
                  
                  {shipment.level1Status === 'pass' && shipment.level2Status === 'pending' && (
                    <button
                      onClick={() => navigate(`/level2/${shipment.id}`)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Start Level 2 QC
                    </button>
                  )}
                  
                  {shipment.level2Status === 'in-progress' && (
                    <button
                      onClick={() => navigate(`/level2/${shipment.id}`)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      Continue Level 2 QC
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate(`/shipment/${shipment.id}`)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}