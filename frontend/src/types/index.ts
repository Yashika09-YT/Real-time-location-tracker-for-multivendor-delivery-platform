export interface User {
  id: string;
  email: string;
  name: string;
  role: 'vendor' | 'deliveryPartner';
  currentLocation?: { lat: number; lng: number };
  isOnline?: boolean;
  activeOrderId?: string | null;
}

export interface Order {
  id: string;
  vendorId: string | { id: string, name: string };
  items: string[];
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryPartnerId?: string | { id: string, name: string, currentLocation?: {lat: number, lng: number} } | null;
  pickupAddress: string;
  dropoffAddress: string;
  currentDeliveryLocation?: {
    lat: number;
    lng: number;
    timestamp?: Date;
  };
  customerDetails: {
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DecodedToken {
  id: string;
  role: 'vendor' | 'deliveryPartner';
  email: string;
  exp: number;
  iat: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void; 
}

export interface LocationUpdate {
  orderId: string;
  lat: number;
  lng: number;
}