import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, ACTIVE_VEHICLE_KEY } from '../lib/api';
import { useAuth } from './AuthContext';
import type { Vehicle } from '../types';

interface VehicleContextValue {
  vehicles: Vehicle[];
  loading: boolean;
  activeVehicleId: string;
  activeVehicle: Vehicle | null;
  setActiveVehicleId: (id: string) => void;
  refreshVehicles: () => Promise<Vehicle[]>;
}

const VehicleContext = createContext<VehicleContextValue | null>(null);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string>(
    () => localStorage.getItem(ACTIVE_VEHICLE_KEY) || ''
  );

  const setActiveVehicleId = useCallback((id: string) => {
    setActiveVehicleIdState(id);
    if (id) localStorage.setItem(ACTIVE_VEHICLE_KEY, id);
    else localStorage.removeItem(ACTIVE_VEHICLE_KEY);
  }, []);

  const refreshVehicles = useCallback(async () => {
    if (!localStorage.getItem('myveel_token')) {
      setVehicles([]);
      return [];
    }
    const data = await api.get<Vehicle[]>('/vehicles');
    setVehicles(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setVehicles([]);
      return;
    }
    setLoading(true);
    refreshVehicles()
      .catch(() => {
        if (active) setVehicles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, refreshVehicles]);

  useEffect(() => {
    if (vehicles.length === 0) {
      if (activeVehicleId) setActiveVehicleId('');
      return;
    }
    const exists = vehicles.some((vehicle) => vehicle.id === activeVehicleId);
    if (!exists) setActiveVehicleId(vehicles[0].id);
  }, [vehicles, activeVehicleId, setActiveVehicleId]);

  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeVehicleId) || null,
    [vehicles, activeVehicleId]
  );

  const value = useMemo<VehicleContextValue>(
    () => ({
      vehicles,
      loading,
      activeVehicleId,
      activeVehicle,
      setActiveVehicleId,
      refreshVehicles,
    }),
    [vehicles, loading, activeVehicleId, activeVehicle, setActiveVehicleId, refreshVehicles]
  );

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicles(): VehicleContextValue {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicles must be used within VehicleProvider');
  return context;
}
