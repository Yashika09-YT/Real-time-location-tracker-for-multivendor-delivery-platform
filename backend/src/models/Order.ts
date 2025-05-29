import mongoose, { Document, Schema } from 'mongoose';
export interface IOrder extends Document {
  vendorId: mongoose.Types.ObjectId;
  items: string[]; // Simplified: array of item descriptions
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryPartnerId?: mongoose.Types.ObjectId | null;
  pickupAddress: string;
  dropoffAddress: string;
  // For denormalizing the latest location for easier querying by customer
  currentDeliveryLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  customerDetails: { // Simplified customer info
    name: string;
    phone: string;
  };
}

const OrderSchema = new Schema<IOrder>({
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryPartnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  pickupAddress: { type: String, required: true, default: 'Default Pickup Address' },
  dropoffAddress: { type: String, required: true, default: 'Default Dropoff Address' },
  currentDeliveryLocation: {
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date }
  },
  customerDetails: {
    name: { type: String, default: "Test Customer"},
    phone: { type: String, default: "123-456-7890"}
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
export default OrderModel;