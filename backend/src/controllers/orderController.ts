import { Response } from 'express';
import OrderModel, { IOrder } from '../models/Order';
import UserModel from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getIo } from '../services/socketManager';
import mongoose from 'mongoose';

export const createOrder = async (req: AuthRequest, res: Response) => {
    const { items, pickupAddress, dropoffAddress, customerDetails } = req.body;
    if (!req.user || req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Forbidden: Only vendors can create orders' });
    }

    try {
        const order = new OrderModel({
            vendorId: req.user.id,
            items,
            pickupAddress,
            dropoffAddress,
            customerDetails,
            status: 'pending',
        });
        await order.save();
        res.status(201).json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error creating order', error: error.message });
    }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const orders = await OrderModel.find({ vendorId: req.user.id }).populate('deliveryPartnerId', 'name email');
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error fetching orders', error: error.message });
    }
};

export const getDeliveryPartnerOrder = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const order = await OrderModel.findOne({ 
            deliveryPartnerId: req.user.id, 
            status: { $in: ['assigned', 'in_transit'] } 
        }).populate('vendorId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'No active order assigned or order not in assignable state.' });
        }
        res.status(200).json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error fetching assigned order', error: error.message });
    }
};

export const assignDeliveryPartner = async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { deliveryPartnerId } = req.body;

    if (!req.user || req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Forbidden: Only vendors can assign orders' });
    }

    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.vendorId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Forbidden: Order does not belong to this vendor' });
        }
        if (order.status !== 'pending') {
                return res.status(400).json({ message: 'Order cannot be assigned, already processed.'})
        }

        const deliveryPartner = await UserModel.findById(deliveryPartnerId);
        if (!deliveryPartner || deliveryPartner.role !== 'deliveryPartner') {
            return res.status(404).json({ message: 'Delivery partner not found or invalid role' });
        }
        if (deliveryPartner.activeOrderId) {
                return res.status(400).json({ message: 'Delivery partner is already on an active delivery.'})
        }

        order.deliveryPartnerId = deliveryPartnerId as mongoose.Types.ObjectId;
        order.status = 'assigned';
        await order.save();

        deliveryPartner.activeOrderId = order._id;
        await deliveryPartner.save();
        
        const io = getIo();
        io.to(`order_${orderId}`).emit('orderStatusChanged', { orderId, status: 'assigned', deliveryPartnerId });
        io.to(`user_${deliveryPartnerId}`).emit('newOrderAssigned', order.toJSON());

        res.status(200).json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error assigning delivery partner', error: error.message });
    }
};

export const startDelivery = async (req: AuthRequest, res: Response) => {
        const { orderId } = req.params;
        if (!req.user || req.user.role !== 'deliveryPartner') {
                return res.status(403).json({ message: 'Forbidden' });
        }

        try {
                const order = await OrderModel.findById(orderId);
                if (!order) {
                        return res.status(404).json({ message: 'Order not found' });
                }
                if (order.deliveryPartnerId?.toString() !== req.user.id.toString()) {
                        return res.status(403).json({ message: 'Order not assigned to this delivery partner' });
                }
                if (order.status !== 'assigned') {
                        return res.status(400).json({ message: 'Order cannot be started. Invalid status.'})
                }

                order.status = 'in_transit';
                await order.save();
                
                req.user.isOnline = true;
                req.user.activeOrderId = order._id;
                await req.user.save();

                const io = getIo();
                io.to(`order_${orderId}`).emit('orderStatusChanged', { orderId, status: 'in_transit' });
                
                res.status(200).json({ message: 'Delivery started', order });
        } catch (error: any) {
                res.status(500).json({ message: 'Server error starting delivery', error: error.message });
        }
};

import { Request } from 'express';

export const trackOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const order = await OrderModel.findById(orderId)
            .populate('vendorId', 'name')
            .populate('deliveryPartnerId', 'name currentLocation');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.deliveryPartnerId || !['assigned', 'in_transit'].includes(order.status)) {
                return res.status(400).json({ message: 'Order is not yet out for delivery or not assigned.' });
        }

        res.status(200).json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error tracking order', error: error.message });
    }
};

export const getAvailableDeliveryPartners = async (req: AuthRequest, res: Response) => {
        if (!req.user || req.user.role !== 'vendor') {
                return res.status(403).json({ message: 'Forbidden' });
        }
        try {
                const partners = await UserModel.find({
                        role: 'deliveryPartner',
                        activeOrderId: null
                }).select('name email _id');
                res.status(200).json(partners);
        } catch (error: any) {
                res.status(500).json({ message: 'Error fetching available delivery partners', error: error.message });
        }
};
