import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import OrderModel from '../models/Order';
import UserModel from '../models/User';

let io: SocketIOServer;

export const initSocketIO = (httpServer: http.Server) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('joinOrderRoom', (orderId: string) => {
            socket.join(`order_${orderId}`);
            console.log(`Client ${socket.id} joined room order_${orderId}`);
        });

        socket.on('joinUserRoom', (userId: string) => {
                socket.join(`user_${userId}`);
                console.log(`Client ${socket.id} joined room user_${userId}`);
        });

        socket.on('updateLocation', async (data: { orderId: string; userId: string; lat: number; lng: number }) => {
            const { orderId, userId, lat, lng } = data;
            console.log(`Location update for order ${orderId}: ${lat}, ${lng} by user ${userId}`);

            try {
                const order = await OrderModel.findById(orderId);
                if (order && order.deliveryPartnerId?.toString() === userId && order.status === 'in_transit') {
                    order.currentDeliveryLocation = { lat, lng, timestamp: new Date() };
                    await order.save();
                } else if (order && order.deliveryPartnerId?.toString() !== userId) {
                        console.warn(`User ${userId} tried to update location for order ${orderId} not assigned to them.`);
                        socket.emit('error', { message: 'Not authorized to update this order.'});
                        return;
                } else if (order && order.status !== 'in_transit') {
                        console.warn(`Location update for order ${orderId} but status is ${order.status}`);
                }
                
                const deliveryPartner = await UserModel.findById(userId);
                if (deliveryPartner && deliveryPartner.role === 'deliveryPartner') {
                        deliveryPartner.currentLocation = { lat, lng };
                        await deliveryPartner.save();
                }

                io.to(`order_${orderId}`).emit('locationUpdated', { orderId, lat, lng });
            } catch (error) {
                console.error('Error updating location:', error);
                socket.emit('error', { message: 'Failed to update location on server.' });
            }
        });

        socket.on('startDelivery', async (data: { orderId: string; userId: string }) => {
                const { orderId, userId } = data;
                console.log(`Delivery started for order ${orderId} by user ${userId}`);
                const order = await OrderModel.findById(orderId);
                if(order && order.status === 'in_transit') {
                        io.to(`order_${orderId}`).emit('orderStatusChanged', { orderId, status: 'in_transit' });
                }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};
