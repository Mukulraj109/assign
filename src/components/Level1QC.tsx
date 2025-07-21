import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQC } from '../context/QCContext';
import { ArrowLeft, Package, CheckCircle, XCircle, Camera, Scan } from 'lucide-react';

export default function Level1QC() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { shipments, completeLevel1 } = useQC();
  const navigate = useNavigate();
  
  const shipment = shipments.find(s => s.id === shipmentId);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkResults, setCheckResults] = useState<{[key: string]: boolean}>({});
  const [notes, setNotes] = useState('');
  const [inspector, setInspector] = useState('');

  const level1Checks = [
    {
      id: 'packaging',
      title: 'Packaging Condition',
      description: 'Check for any damage to outer packaging, boxes, or protective materials',
      critical: true
    },
    {
      id: 'documentation',
      title: 'Documentation Verification',
      description: 'Verify PO number, delivery note, and required certificates are present',
      critical: true
    },
    {
      id: 'quantity',
      title: 'Quantity Count',
      description: 'Count total packages/boxes and verify against expected quantity',
      critical: true
    },
    {
      id: 'temperature',
      title: 'Temperature Requirements',
      description: 'Check if temperature-sensitive items were stored correctly during transport',
      critical: false
    },
    {
      id: 'labeling',
      title: 'Labeling & Identification',
      description: 'Verify all items have proper labels and barcodes are readable',
      critical: false
    }
  ];

  if (!shipment) {
    return <div>Shipment not found</div>;
  }

  const handleCheckResult = (checkId: string, passed: boolean) => {
    setCheckResults(prev => ({ ...prev, [checkId]: passed }));
  };

  const handleComplete = () => {
    const criticalChecks = level1Checks.filter(check => check.critical);
    const allCriticalPassed = criticalChecks.every(check => checkResults[check.id] === true);
    
    if (allCriticalPassed && inspector.trim()) {
      completeLevel1(shipmentId!, notes, inspector);
      navigate('/');
    }
  };

  const isComplete = level1Checks.every(check => checkResults.hasOwnProperty(check.id)) && inspector.trim();
  const criticalFailed = level1Checks.some(check => check.critical && checkResults[check.id] === false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Level 1 QC - Initial Receiving</h1>
              <p className="text-gray-600">{shipment.supplierName} - {shipment.poNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Object.keys(checkResults).length} of {level1Checks.length} checks completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(checkResults).length / level1Checks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* QC Checks */}
        <div className="space-y-6 mb-8">
          {level1Checks.map((check, index) => (
            <div key={check.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{check.title}</h3>
                    {check.critical && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{check.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCheckResult(check.id, true)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      checkResults[check.id] === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pass
                  </button>
                  <button
                    onClick={() => handleCheckResult(check.id, false)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      checkResults[check.id] === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Fail
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <Camera className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <Scan className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes and Inspector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Name *
              </label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes or observations..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>

          <button
            onClick={handleComplete}
            disabled={!isComplete || criticalFailed}
            className={`px-8 py-3 rounded-md font-medium transition-colors ${
              isComplete && !criticalFailed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {criticalFailed ? 'Cannot Complete - Critical Failures' : 'Complete Level 1 QC'}
          </button>
        </div>

        {criticalFailed && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              ⚠️ One or more critical checks have failed. Please address these issues before proceeding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}