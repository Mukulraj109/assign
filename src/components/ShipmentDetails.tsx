import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQC } from '../context/QCContext';
import { ArrowLeft, Package, User, Calendar, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ShipmentDetails() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { shipments } = useQC();
  const navigate = useNavigate();
  
  const shipment = shipments.find(s => s.id === shipmentId);

  if (!shipment) {
    return <div>Shipment not found</div>;
  }

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
              <p className="text-gray-600">{shipment.supplierName} - {shipment.poNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipment Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Supplier</span>
                  </div>
                  <p className="text-gray-900">{shipment.supplierName}</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">PO Number</span>
                  </div>
                  <p className="text-gray-900">{shipment.poNumber}</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Received Date</span>
                  </div>
                  <p className="text-gray-900">{shipment.receivedDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Expected Items</span>
                  </div>
                  <p className="text-gray-900">{shipment.expectedItems}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">QC Status</h3>
              <div className="space-y-3">
                <StatusBadge status={shipment.level1Status} label="Level 1" />
                <StatusBadge status={shipment.level2Status} label="Level 2" />
              </div>
            </div>

            {shipment.level1Inspector && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Level 1 Inspector</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{shipment.level1Inspector}</span>
                </div>
                {shipment.level1CompletedAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    Completed: {shipment.level1CompletedAt.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Level 1 Notes */}
        {shipment.level1Notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Level 1 QC Notes</h3>
            <p className="text-gray-700">{shipment.level1Notes}</p>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Items in Shipment</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {shipment.items.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getItemStatusIcon(item.status)}
                    <h4 className="text-lg font-medium text-gray-900 ml-3">{item.name}</h4>
                  </div>
                  <StatusBadge status={item.status} label="Status" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">SKU:</span>
                    <p className="text-gray-900">{item.sku}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expected:</span>
                    <p className="text-gray-900">{item.expectedQuantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Actual:</span>
                    <p className="text-gray-900">{item.actualQuantity || 'Not counted'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Inspector:</span>
                    <p className="text-gray-900">{item.inspectedBy || 'Not assigned'}</p>
                  </div>
                </div>

                {item.issues && item.issues.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h5 className="text-sm font-medium text-red-800 mb-2">Issues Found:</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {item.issues.map((issue, index) => (
                        <li key={index} className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-2" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.inspectedAt && (
                  <p className="text-xs text-gray-500 mt-3">
                    Inspected: {item.inspectedAt.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}