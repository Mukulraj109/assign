import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQC } from '../context/QCContext';
import { ArrowLeft, Package, CheckCircle, XCircle, Camera, AlertTriangle, Scan } from 'lucide-react';

export default function Level2QC() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { shipments, updateItem, completeLevel2 } = useQC();
  const navigate = useNavigate();
  
  const shipment = shipments.find(s => s.id === shipmentId);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [itemChecks, setItemChecks] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [issues, setIssues] = useState<{[key: string]: string[]}>({});

  const level2Checks = [
    { id: 'visual', title: 'Visual Inspection', description: 'Check for scratches, dents, or visible defects' },
    { id: 'functionality', title: 'Functionality Test', description: 'Test basic functionality if applicable' },
    { id: 'packaging', title: 'Individual Packaging', description: 'Check individual item packaging condition' },
    { id: 'specifications', title: 'Specifications Match', description: 'Verify item matches expected specifications' },
    { id: 'labeling', title: 'Product Labeling', description: 'Check product labels and serial numbers' }
  ];

  if (!shipment) {
    return <div>Shipment not found</div>;
  }

  const currentItem = shipment.items[currentItemIndex];
  const totalItems = shipment.items.length;

  const handleItemCheck = (itemId: string, checkId: string, passed: boolean) => {
    setItemChecks(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [checkId]: passed }
    }));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const addIssue = (itemId: string, issue: string) => {
    if (issue.trim()) {
      setIssues(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), issue.trim()]
      }));
    }
  };

  const completeCurrentItem = () => {
    const itemId = currentItem.id;
    const checks = itemChecks[itemId] || {};
    const allChecksPassed = level2Checks.every(check => checks[check.id] === true);
    const actualQuantity = quantities[itemId] || 0;
    const quantityMatch = actualQuantity === currentItem.expectedQuantity;
    
    const status = allChecksPassed && quantityMatch ? 'pass' : 'fail';
    
    updateItem(shipmentId!, itemId, {
      status,
      actualQuantity,
      issues: issues[itemId] || [],
      inspectedAt: new Date(),
      inspectedBy: 'Current Inspector'
    });

    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      completeLevel2(shipmentId!);
      navigate('/');
    }
  };

  const isCurrentItemComplete = () => {
    const itemId = currentItem.id;
    const checks = itemChecks[itemId] || {};
    const hasQuantity = quantities.hasOwnProperty(itemId);
    const allChecksCompleted = level2Checks.every(check => checks.hasOwnProperty(check.id));
    
    return allChecksCompleted && hasQuantity;
  };

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
            <Package className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Level 2 QC - Unit Inspection</h1>
              <p className="text-gray-600">{shipment.supplierName} - {shipment.poNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Item Progress</span>
            <span>{currentItemIndex + 1} of {totalItems} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentItemIndex + 1) / totalItems) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Item Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{currentItem.name}</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <Scan className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <Camera className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">SKU:</span>
              <p className="text-gray-900">{currentItem.sku}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expected Quantity:</span>
              <p className="text-gray-900">{currentItem.expectedQuantity}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Actual Quantity:</span>
              <input
                type="number"
                value={quantities[currentItem.id] || ''}
                onChange={(e) => handleQuantityChange(currentItem.id, parseInt(e.target.value))}
                className="w-full px-3 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Count actual"
              />
            </div>
          </div>
        </div>

        {/* QC Checks */}
        <div className="space-y-6 mb-8">
          {level2Checks.map((check) => (
            <div key={check.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{check.title}</h3>
                  <p className="text-gray-600">{check.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleItemCheck(currentItem.id, check.id, true)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      itemChecks[currentItem.id]?.[check.id] === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pass
                  </button>
                  <button
                    onClick={() => handleItemCheck(currentItem.id, check.id, false)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      itemChecks[currentItem.id]?.[check.id] === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Fail
                  </button>
                </div>

                {itemChecks[currentItem.id]?.[check.id] === false && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Issue detected</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Issue Reporting */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Reporting</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Describe any issues found..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addIssue(currentItem.id, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addIssue(currentItem.id, input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Add Issue
            </button>
          </div>
          
          {issues[currentItem.id] && issues[currentItem.id].length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Reported Issues:</h4>
              <ul className="space-y-1">
                {issues[currentItem.id].map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {currentItemIndex > 0 && (
              <button
                onClick={() => setCurrentItemIndex(prev => prev - 1)}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous Item
              </button>
            )}
          </div>

          <button
            onClick={completeCurrentItem}
            disabled={!isCurrentItemComplete()}
            className={`px-8 py-3 rounded-md font-medium transition-colors ${
              isCurrentItemComplete()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentItemIndex === totalItems - 1 ? 'Complete QC' : 'Next Item'}
          </button>
        </div>
      </div>
    </div>
  );
}