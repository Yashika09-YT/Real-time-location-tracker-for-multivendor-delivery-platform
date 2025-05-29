import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    role: 'vendor' | 'deliveryPartner';
    name: string;
    currentLocation?: { lat: number; lng: number };
    isOnline?: boolean;
    activeOrderId?: mongoose.Types.ObjectId | null;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['vendor', 'deliveryPartner'], required: true },
    name: { type: String, required: true },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
    },
    isOnline: { type: Boolean, default: false },
    activeOrderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null }
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const user = await UserModel.findById(this._id).select('+password').exec();
    if (!user || !user.password) return false;
    return bcrypt.compare(candidatePassword, user.password);
};

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
