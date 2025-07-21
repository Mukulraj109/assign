import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiService from '../services/api';

export interface QCItem {
  id: string;
  name: string;
  sku: string;
  expectedQuantity: number;
  actualQuantity?: number;
  status: 'pending' | 'pass' | 'fail' | 'in-progress';
  issues?: string[];
  photos?: string[];
  inspectedBy?: string;
  inspectedAt?: Date;
}

export interface Shipment {
  id: string;
  supplierName: string;
  poNumber: string;
  receivedDate: Date;
  expectedItems: number;
  level1Status: 'pending' | 'pass' | 'fail' | 'in-progress';
  level2Status: 'pending' | 'pass' | 'fail' | 'in-progress';
  items: QCItem[];
  level1Notes?: string;
  level1Inspector?: string;
  level1CompletedAt?: Date;
}

interface QCContextType {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  user: any;
  isAuthenticated: boolean;
  updateShipment: (shipmentId: string, updates: Partial<Shipment>) => void;
  updateItem: (shipmentId: string, itemId: string, updates: Partial<QCItem>) => void;
  completeLevel1: (shipmentId: string, notes: string, inspector: string) => void;
  completeLevel2: (shipmentId: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchShipments: () => Promise<void>;
  refreshShipment: (shipmentId: string) => Promise<void>;
}

const QCContext = createContext<QCContextType | undefined>(undefined);

const mockShipments: Shipment[] = [
  {
    id: 'SH001',
    supplierName: 'TechCorp Industries',
    poNumber: 'PO-2024-001',
    receivedDate: new Date(),
    expectedItems: 50,
    level1Status: 'pending',
    level2Status: 'pending',
    items: [
      {
        id: 'ITM001',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        expectedQuantity: 20,
        status: 'pending'
      },
      {
        id: 'ITM002',
        name: 'USB-C Charging Cable',
        sku: 'UCC-002',
        expectedQuantity: 30,
        status: 'pending'
      }
    ]
  },
  {
    id: 'SH002',
    supplierName: 'GlobalSupply Co.',
    poNumber: 'PO-2024-002',
    receivedDate: new Date(Date.now() - 86400000),
    expectedItems: 75,
    level1Status: 'pass',
    level2Status: 'in-progress',
    items: [
      {
        id: 'ITM003',
        name: 'Smartphone Case',
        sku: 'SPC-003',
        expectedQuantity: 25,
        status: 'pass'
      },
      {
        id: 'ITM004',
        name: 'Screen Protector',
        sku: 'SPR-004',
        expectedQuantity: 50,
        status: 'in-progress'
      }
    ]
  },
  {
    id: 'SH003',
    supplierName: 'QuickTech Solutions',
    poNumber: 'PO-2024-003',
    receivedDate: new Date(Date.now() - 172800000),
    expectedItems: 100,
    level1Status: 'pass',
    level2Status: 'pass',
    items: [
      {
        id: 'ITM005',
        name: 'Power Bank',
        sku: 'PWB-005',
        expectedQuantity: 40,
        status: 'pass'
      },
      {
        id: 'ITM006',
        name: 'Car Charger',
        sku: 'CCH-006',
        expectedQuantity: 60,
        status: 'pass'
      }
    ]
  }
];

export function QCProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        await fetchShipments();
      } catch (error) {
        // User not authenticated, that's fine
        apiService.logout();
      }
    };
    
    if (apiService.token) {
      checkAuth();
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(username, password);
      setUser(response.user);
      setIsAuthenticated(true);
      
      await fetchShipments();
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setShipments([]);
  };

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getShipments();
      setShipments(response.shipments.map(convertShipmentDates));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch shipments');
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshShipment = async (shipmentId: string) => {
    try {
      const shipment = await apiService.getShipment(shipmentId);
      const convertedShipment = convertShipmentDates(shipment);
      
      setShipments(prev =>
        prev.map(s => s.id === shipmentId ? convertedShipment : s)
      );
    } catch (error) {
      console.error('Failed to refresh shipment:', error);
    }
  };

  // Helper function to convert date strings to Date objects
  const convertShipmentDates = (shipment: any): Shipment => {
    return {
      ...shipment,
      receivedDate: new Date(shipment.receivedDate),
      level1CompletedAt: shipment.level1CompletedAt ? new Date(shipment.level1CompletedAt) : undefined,
      items: shipment.items.map((item: any) => ({
        ...item,
        inspectedAt: item.inspectedAt ? new Date(item.inspectedAt) : undefined
      }))
    };
  };
  const updateShipment = (shipmentId: string, updates: Partial<Shipment>) => {
    // Update local state immediately for better UX
    setShipments(prev =>
      prev.map(shipment =>
        shipment.id === shipmentId ? { ...shipment, ...updates } : shipment
      )
    );
    
    // Sync with backend
    apiService.updateShipment(shipmentId, updates).catch(error => {
      console.error('Failed to update shipment:', error);
      // Optionally revert local changes or show error
    });
  };

  const updateItem = (shipmentId: string, itemId: string, updates: Partial<QCItem>) => {
    setShipments(prev =>
      prev.map(shipment =>
        shipment.id === shipmentId
          ? {
              ...shipment,
              items: shipment.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : shipment
      )
    );
  };

  const completeLevel1 = (shipmentId: string, notes: string, inspector: string) => {
    const updates = {
      level1Status: 'pass',
      level1Notes: notes,
      level1Inspector: inspector,
      level1CompletedAt: new Date()
    };
    
    updateShipment(shipmentId, updates);
    
    // Send to backend
    apiService.completeLevel1QC(shipmentId, {
      notes,
      checks: {} // Add actual check results here
    }).catch(error => {
      console.error('Failed to complete Level 1 QC:', error);
    });
  };

  const completeLevel2 = (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (shipment) {
      const allItemsPassed = shipment.items.every(item => item.status === 'pass');
      updateShipment(shipmentId, {
        level2Status: allItemsPassed ? 'pass' : 'fail'
      });
    }
  };

  return (
    <QCContext.Provider value={{
      shipments,
      loading,
      error,
      user,
      isAuthenticated,
      updateShipment,
      updateItem,
      completeLevel1,
      completeLevel2,
      login,
      logout,
      fetchShipments,
      refreshShipment
    }}>
      {children}
    </QCContext.Provider>
  );
}

export const useQC = () => {
  const context = useContext(QCContext);
  if (context === undefined) {
    throw new Error('useQC must be used within a QCProvider');
  }
  return context;
};