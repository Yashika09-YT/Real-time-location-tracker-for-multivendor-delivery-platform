"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import IsAuth from '@/components/IsAuth';
import { useAuth } from '@/hooks/useAuth';
import { Order, User as DeliveryPartner } from '@/types';
import { 
    createOrderApi, 
    getVendorOrdersApi, 
    getAvailableDeliveryPartnersApi, 
    assignDeliveryPartnerApi 
} from '@/services/api';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [availablePartners, setAvailablePartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For creating new order
  const [itemDescription, setItemDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('123 Vendor St');
  const [dropoffAddress, setDropoffAddress] = useState('789 Customer Ave');

  // For assigning order
  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState<string | null>(null);
  const [selectedPartnerToAssign, setSelectedPartnerToAssign] = useState<string | null>(null);

  const socketRef = React.useRef<Socket | null>(null);


  const fetchVendorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersResponse, partnersResponse] = await Promise.all([
        getVendorOrdersApi(),
        getAvailableDeliveryPartnersApi()
      ]);
      setOrders(ordersResponse.data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setAvailablePartners(partnersResponse.data);
    } catch (err: any) {
      console.error("Error fetching vendor data:", err);
      setError(err.response?.data?.message || "Failed to load vendor data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'vendor') {
      fetchVendorData();

      socketRef.current = getSocket();
      
      // Listen for order status updates if needed for vendor dashboard
      socketRef.current.on('orderStatusChanged', (data: { orderId: string, status: string, deliveryPartnerId?: string }) => {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === data.orderId 
            ? { ...o, status: data.status as Order['status'], deliveryPartnerId: data.deliveryPartnerId || o.deliveryPartnerId } 
            : o
          )
        );
        // If an order gets assigned, that partner might no longer be "available"
        if(data.status === 'assigned' && data.deliveryPartnerId) {
            setAvailablePartners(prev => prev.filter(p => p.id !== data.deliveryPartnerId));
        }
      });
      
      // If a new partner becomes available (e.g. completes an order)
      // This would require a backend event `partnerBecameAvailable`
      // For now, we rely on manual refresh or periodic refetch for available partners.

      return () => {
        if (socketRef.current) {
          socketRef.current.off('orderStatusChanged');
          // socketRef.current.disconnect(); // Or manage connection more globally
        }
      };
    }
  }, [user]);

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemDescription || !pickupAddress || !dropoffAddress) {
      setError("Please fill all fields for the new order.");
      return;
    }
    setError(null);
    try {
      const newOrderData = { 
        items: [itemDescription], 
        pickupAddress, 
        dropoffAddress,
        customerDetails: { name: "Demo Customer", phone: "555-1234" } // Simplified
      };
      await createOrderApi(newOrderData);
      setItemDescription(''); // Reset form
      // setPickupAddress('');
      // setDropoffAddress('');
      alert("Order created successfully!");
      fetchVendorData(); // Refresh data
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.response?.data?.message || "Failed to create order.");
    }
  };

  const handleAssignOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToAssign || !selectedPartnerToAssign) {
      setError("Please select an order and a delivery partner to assign.");
      return;
    }
    setError(null);
    try {
      await assignDeliveryPartnerApi(selectedOrderToAssign, selectedPartnerToAssign);
      alert("Order assigned successfully!");
      setSelectedOrderToAssign(null); // Reset form
      setSelectedPartnerToAssign(null);
      fetchVendorData(); // Refresh data
    } catch (err: any) {
      console.error("Error assigning order:", err);
      setError(err.response?.data?.message || "Failed to assign order.");
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading vendor dashboard...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error} <button onClick={fetchVendorData} className="ml-2 p-1 bg-blue-500 text-white rounded">Retry</button></div>;

  return (
    <IsAuth allowedRoles={['vendor']}>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        <p className="mb-4">Welcome, {user?.name}!</p>

        {/* Create New Order Form */}
        <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Create New Order</h2>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700">Item Description:</label>
              <input
                type="text"
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">Pickup Address:</label>
              <input
                type="text"
                id="pickupAddress"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700">Dropoff Address:</label>
              <input
                type="text"
                id="dropoffAddress"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">
              Create Order
            </button>
          </form>
        </div>

        {/* Assign Order Form */}
        {orders.filter(o => o.status === 'pending').length > 0 && availablePartners.length > 0 && (
            <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Assign Order to Delivery Partner</h2>
            <form onSubmit={handleAssignOrder} className="space-y-4">
                <div>
                <label htmlFor="orderToAssign" className="block text-sm font-medium text-gray-700">Select Order (Pending):</label>
                <select
                    id="orderToAssign"
                    value={selectedOrderToAssign || ''}
                    onChange={(e) => setSelectedOrderToAssign(e.target.value)}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select an order</option>
                    {orders.filter(o => o.status === 'pending').map(order => (
                    <option key={order.id} value={order.id}>
                        Order ID: {order.id.slice(-6)} - Items: {order.items.join(', ')}
                    </option>
                    ))}
                </select>
                </div>
                <div>
                <label htmlFor="partnerToAssign" className="block text-sm font-medium text-gray-700">Select Available Delivery Partner:</label>
                <select
                    id="partnerToAssign"
                    value={selectedPartnerToAssign || ''}
                    onChange={(e) => setSelectedPartnerToAssign(e.target.value)}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select a partner</option>
                    {availablePartners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                        {partner.name} ({partner.email})
                    </option>
                    ))}
                </select>
                </div>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">
                Assign Order
                </button>
            </form>
            </div>
        )}
        {orders.filter(o => o.status === 'pending').length === 0 && <p className="text-gray-600">No pending orders to assign.</p>}
        {availablePartners.length === 0 && <p className="text-gray-600">No delivery partners currently available.</p>}


        {/* List of Orders */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Partner</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">...{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'in_transit' ? 'bg-green-100 text-green-800' :
                          order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof order.deliveryPartnerId === 'object' && order.deliveryPartnerId?.name ? order.deliveryPartnerId.name : order.deliveryPartnerId ? 'Assigned (ID: ...'+String(order.deliveryPartnerId).slice(-6)+')' : 'N/A'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {(order.status === 'assigned' || order.status === 'in_transit') && order.deliveryPartnerId && (
                           <a href={`/track/${order.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                            Track Live
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">You have no orders yet.</p>
          )}
        </div>
         <button onClick={fetchVendorData} className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">
            Refresh Data
        </button>
      </div>
    </IsAuth>
  );
};

export default VendorDashboard;