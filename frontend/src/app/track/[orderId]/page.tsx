"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Order, LocationUpdate } from '@/types';
import { trackOrderApi } from '@/services/api';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

const CustomerTrackingPage = () => {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [deliveryLocation, setDeliveryLocation] = useState<LatLngExpression | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([20.5937, 78.9629]);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError("Order ID is missing.");
            setIsLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await trackOrderApi(orderId);
                const orderData = response.data;
                setOrder(orderData);
                if (orderData.status === 'in_transit' && orderData.currentDeliveryLocation) {
                    const initialLoc: LatLngExpression = [orderData.currentDeliveryLocation.lat, orderData.currentDeliveryLocation.lng];
                    setDeliveryLocation(initialLoc);
                    setMapCenter(initialLoc);
                } else if (orderData.deliveryPartnerId && typeof orderData.deliveryPartnerId === 'object' && orderData.deliveryPartnerId.currentLocation) {
                        const partnerLoc: LatLngExpression = [orderData.deliveryPartnerId.currentLocation.lat, orderData.deliveryPartnerId.currentLocation.lng];
                        setDeliveryLocation(partnerLoc);
                        setMapCenter(partnerLoc);
                }
            } catch (err: any) {
                console.error("Error fetching order details:", err);
                setError(err.response?.data?.message || "Failed to load order details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();

        socketRef.current = getSocket();
        socketRef.current.emit('joinOrderRoom', orderId);

        socketRef.current.on('locationUpdated', (data: LocationUpdate) => {
            if (data.orderId === orderId) {
                console.log('Received location update for this order:', data);
                const newLoc: LatLngExpression = [data.lat, data.lng];
                setDeliveryLocation(newLoc);
                setMapCenter(newLoc);
                if (order && order.status !== 'in_transit') {
                        setOrder(prev => prev ? {...prev, status: 'in_transit'} : null);
                }
            }
        });

        socketRef.current.on('orderStatusChanged', (data: { orderId: string, status: string }) => {
                if (data.orderId === orderId) {
                        console.log('Received status update for this order:', data);
                        setOrder(prev => prev ? {...prev, status: data.status as Order['status']} : null);
                        if (data.status !== 'in_transit' && data.status !== 'assigned') {
                                setDeliveryLocation(null);
                        }
                         if (data.status === 'delivered') {
                                alert("Order has been delivered!");
                        }
                }
        });
        
        socketRef.current.on('error', (socketError: {message: string}) => {
                console.error('Socket error on tracking page:', socketError.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveOrderRoom', orderId);
                socketRef.current.off('locationUpdated');
                socketRef.current.off('orderStatusChanged');
                socketRef.current.off('error');
            }
        };
    }, [orderId]);

    if (isLoading) return <div className="text-center p-10">Loading tracking information...</div>;
    if (error && !order) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="page-container">
            <h1 className="text-3xl font-bold mb-6">Track Your Order: ...{orderId?.slice(-8)}</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Notice: {error}</p>}
            
            {order ? (
                <div className="mb-6 p-4 bg-gray-50 shadow rounded-md">
                    <h2 className="text-xl font-semibold">Order Details</h2>
                    <p><strong>Status:</strong> <span className={`font-bold ${
                        order.status === 'in_transit' ? 'text-green-600' : 
                        order.status === 'pending' ? 'text-yellow-600' :
                        order.status === 'assigned' ? 'text-blue-600' :
                        order.status === 'delivered' ? 'text-purple-600' :
                        'text-gray-600'
                    }`}>{order.status.toUpperCase()}</span></p>
                    <p><strong>Items:</strong> {order.items.join(', ')}</p>
                    <p><strong>From:</strong> {order.pickupAddress}</p>
                    <p><strong>To:</strong> {order.dropoffAddress}</p>
                    {typeof order.vendorId === 'object' && <p><strong>Vendor:</strong> {order.vendorId.name}</p>}
                    {typeof order.deliveryPartnerId === 'object' && order.deliveryPartnerId?.name && <p><strong>Delivery Partner:</strong> {order.deliveryPartnerId.name}</p>}
                </div>
            ) : (
                 !isLoading && <p className="text-gray-600">Order details could not be loaded.</p>
            )}

            <div className="mt-4">
                <h2 className="text-2xl font-semibold mb-2">Live Location</h2>
                { (order?.status === 'in_transit' || order?.status === 'assigned') && deliveryLocation ? (
                    <MapDisplay 
                        center={mapCenter} 
                        markerPosition={deliveryLocation} 
                        zoom={15} 
                        markerPopupText="Rider's Location"
                    />
                ) : order?.status === 'delivered' ? (
                        <p className="text-green-600 font-semibold p-4 bg-green-50 rounded-md">This order has been delivered!</p>
                ) : (order?.status === 'pending' || !deliveryLocation) && !isLoading ? (
                        <p className="text-orange-600 font-semibold p-4 bg-orange-50 rounded-md">
                                {order?.status === 'pending' ? 'Order is pending and not yet out for delivery.' : 'Delivery partner location is not available yet or delivery has not started.'}
                        </p>
                ) : null }
                {(!order && !isLoading && !error) && <p>Waiting for order information...</p>}
            </div>
        </div>
    );
};

export default CustomerTrackingPage;
