import { Request, Response } from 'express';
import UserModel from '../models/User';
import OrderModel from '../models/Order';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getIo } from '../services/socketManager';

export const updateLocationApi = async (req: AuthRequest, res: Response) => {
    const { lat, lng, orderId } = req.body;

    if (!req.user || req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ message: 'Forbidden: Only delivery partners can update location' });
    }
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: 'Invalid location data' });
    }

    try {
        req.user.currentLocation = { lat, lng };
        await req.user.save();

        if (orderId) {
            const order = await OrderModel.findById(orderId);
            if (order && order.deliveryPartnerId?.toString() === req.user.id.toString()) {
                order.currentDeliveryLocation = { lat, lng, timestamp: new Date() };
                await order.save();

                const io = getIo();
                io.to(`order_${orderId}`).emit('locationUpdated', { orderId, lat, lng });
            }
        }
        
        res.status(200).json({ message: 'Location updated successfully via API', location: req.user.currentLocation });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error updating location', error: error.message });
    }
};

export const getCurrentLocation = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.deliveryPartnerId || order.status !== 'in_transit') {
            return res.status(400).json({ message: 'Delivery not active for this order' });
        }

        if (order.currentDeliveryLocation) {
            return res.status(200).json(order.currentDeliveryLocation);
        }

        const deliveryPartner = await UserModel.findById(order.deliveryPartnerId);
        if (deliveryPartner && deliveryPartner.currentLocation) {
            return res.status(200).json(deliveryPartner.currentLocation);
        }

        res.status(404).json({ message: 'Location not available' });

    } catch (error: any) {
        res.status(500).json({ message: 'Server error retrieving location', error: error.message });
    }
};
