"use client";
import React, { useState, useEffect, useRef } from 'react';
import IsAuth from '@/components/IsAuth';
import { useAuth } from '@/hooks/useAuth';
import { Order, LocationUpdate } from '@/types';
import { getDeliveryPartnerOrderApi, startDeliveryApi } from '@/services/api';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import dynamic from 'next/dynamic'; // For Leaflet map

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });


const DeliveryPartnerDashboard = () => {
  const { user } = useAuth();
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const locationWatchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const fetchAssignedOrder = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDeliveryPartnerOrderApi();
      const orderData = response.data;
      setAssignedOrder(orderData);
      if (orderData && orderData.status === 'in_transit') {
        setIsDelivering(true);
         // If already in transit, attempt to start location updates
        if (orderData.currentDeliveryLocation) {
            setCurrentLocation({ lat: orderData.currentDeliveryLocation.lat, lng: orderData.currentDeliveryLocation.lng });
        }
        handleStartDeliveryAction(orderData.id, true); // true to indicate it's resuming
      } else {
        setIsDelivering(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAssignedOrder(null); // No active order
      } else {
        console.error("Error fetching assigned order:", err);
        setError(err.response?.data?.message || "Failed to load assigned order.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'deliveryPartner') {
        socketRef.current = getSocket();
        // Join user-specific room to listen for new assignments
        socketRef.current.emit('joinUserRoom', user.id);

        socketRef.current.on('newOrderAssigned', (order: Order) => {
            console.log("New order assigned via socket:", order);
            setAssignedOrder(order);
            setIsDelivering(false); // New assignment, not delivering yet
            setError(null); // Clear previous errors
        });
        
        fetchAssignedOrder(); // Initial fetch

        return () => {
            if (socketRef.current) {
                socketRef.current.off('newOrderAssigned');
                // socketRef.current.disconnect(); // Or manage connection more globally
            }
            stopLocationUpdates(); // Clean up location tracking
        };
    }
  }, [user]);


  const sendLocationUpdate = (lat: number, lng: number) => {
    if (socketRef.current && assignedOrder && user) {
      const updateData: LocationUpdate = {
        orderId: assignedOrder.id,
        // @ts-ignore // userId might not be strictly in LocationUpdate but backend socket handler uses it
        userId: user.id, 
        lat,
        lng,
      };
      socketRef.current.emit('updateLocation', updateData);
      setCurrentLocation({ lat, lng });
      console.log("Sent location: ", lat, lng);
    }
  };

  const startRealGeolocation = () => {
    if (navigator.geolocation) {
      locationWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocationUpdate(latitude, longitude);
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError(`Geolocation error: ${geoError.message}. Falling back to simulation.`);
          startSimulatedLocation(); // Fallback
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser. Starting simulation.");
      startSimulatedLocation();
    }
  };

  const startSimulatedLocation = () => {
    // Start with a default location or last known, then simulate movement
    let lat = currentLocation?.lat || 37.7749; // Default San Francisco
    let lng = currentLocation?.lng || -122.4194; 
    
    if(!currentLocation) setCurrentLocation({lat, lng}); // Set initial if not set

    simulationIntervalRef.current = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001; // Simulate small movements
      lng += (Math.random() - 0.5) * 0.001;
      sendLocationUpdate(lat, lng);
    }, 3000); // Update every 3 seconds
  };

  const stopLocationUpdates = () => {
    if (locationWatchIdRef.current) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    console.log("Location updates stopped.");
  };

  const handleStartDeliveryAction = async (orderId: string, isResuming = false) => {
    setError(null);
    try {
        if (!isResuming) { // Only call API if not just resuming listening for an already in-transit order
            await startDeliveryApi(orderId);
            socketRef.current?.emit('startDelivery', { orderId, userId: user?.id });
        }
        setIsDelivering(true);
        
        // Attempt to get initial real location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    sendLocationUpdate(latitude, longitude); // Send initial immediately
                    startRealGeolocation(); // Then start watching
                },
                (geoError) => {
                    console.warn("Could not get initial geolocation:", geoError, "Starting simulation.");
                    startSimulatedLocation(); // Fallback to simulation
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
            );
        } else {
            startSimulatedLocation(); // No geolocation API
        }

    } catch (err: any) {
        console.error("Error starting delivery:", err);
        setError(err.response?.data?.message || "Failed to start delivery.");
        setIsDelivering(false);
    }
  };

  const handleStopDelivery = () => { // Placeholder for actual "Mark as Delivered" functionality
    stopLocationUpdates();
    setIsDelivering(false);
    // Here you would typically call an API to mark order as delivered
    // For now, just stop tracking.
    alert("Delivery stopped. (Implement 'Mark as Delivered' API call next)");
    // After marking as delivered, refetch orders or clear current order.
    fetchAssignedOrder(); // To see if a new order is available or current is gone
  };


  if (isLoading && !assignedOrder) return <div className="text-center p-10">Loading delivery partner dashboard...</div>;
  
  // Display error prominently if it occurs
  if (error && !assignedOrder) return ( // Only show full page error if no order data at all
    <div className="text-center p-10 text-red-500">
        {error}
        <button onClick={fetchAssignedOrder} className="ml-2 mt-2 p-2 bg-blue-500 text-white rounded">Retry</button>
    </div>
  );

  return (
    <IsAuth allowedRoles={['deliveryPartner']}>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Delivery Partner Dashboard</h1>
        <p className="mb-4">Welcome, {user?.name}!</p>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

        {!assignedOrder && !isLoading && (
          <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700">
            <p className="font-semibold">No active order assigned to you currently.</p>
            <p>Please wait for a vendor to assign you an order. This page will update automatically.</p>
             <button onClick={fetchAssignedOrder} className="mt-2 p-2 bg-blue-500 text-white rounded">Check for Orders Manually</button>
          </div>
        )}

        {assignedOrder && (
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Your Assigned Order</h2>
            <p><strong>Order ID:</strong> ...{assignedOrder.id.slice(-6)}</p>
            <p><strong>Items:</strong> {assignedOrder.items.join(', ')}</p>
            <p><strong>Pickup:</strong> {assignedOrder.pickupAddress}</p>
            <p><strong>Dropoff:</strong> {assignedOrder.dropoffAddress}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${assignedOrder.status === 'in_transit' ? 'text-green-600' : 'text-blue-600'}`}>{assignedOrder.status}</span></p>
            
            {currentLocation && (
                <div className="my-4">
                    <h3 className="text-lg font-semibold">Your Current Location (for tracking):</h3>
                    <p>Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}</p>
                    <div className="mt-2" style={{height: '250px'}}>
                         <MapDisplay center={[currentLocation.lat, currentLocation.lng]} markerPosition={[currentLocation.lat, currentLocation.lng]} zoom={15} />
                    </div>
                </div>
            )}

            {!isDelivering && assignedOrder.status === 'assigned' && (
              <button
                onClick={() => handleStartDeliveryAction(assignedOrder.id)}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Start Delivery & Begin Tracking
              </button>
            )}
            {isDelivering && (
              <button
                onClick={handleStopDelivery} // Placeholder for marking as delivered
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Stop Delivery (Mark as Delivered - Placeholder)
              </button>
            )}
            {assignedOrder.status === 'in_transit' && !isDelivering && (
                 <p className="mt-4 p-3 bg-orange-100 text-orange-700 rounded-md">
                    Order is in transit. If you reloaded the page, location updates might have stopped.
                    Click "Resume Tracking" if needed.
                    <button
                        onClick={() => handleStartDeliveryAction(assignedOrder.id, true)}
                        className="ml-2 mt-1 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Resume Tracking
                    </button>
                </p>
            )}
          </div>
        )}
      </div>
    </IsAuth>
  );
};

export default DeliveryPartnerDashboard;