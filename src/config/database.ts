import mongoose, { Schema, Document, Model } from 'mongoose';
import { winstonLogger } from '@/lib/logger';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('CRITICAL ERROR: MONGODB_URI environment variable is missing.');
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState >= 1) return mongoose;
  
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    winstonLogger.info('MongoDB Atlas connected and initialized successfully.');
    return conn;
  } catch (error) {
    winstonLogger.error('MongoDB initial connection error:', error);
    throw error;
  }
};

// --- USER & RBAC SCHEMA ---
export interface IUser extends Document {
  uid: string;
  email: string;
  role: string;
  name: string;
  merchantId?: mongoose.Types.ObjectId;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, required: true, enum: ['Super Admin', 'Admin', 'Finance', 'Customer Service', 'Viewer', 'Merchant Owner'] },
  name: { type: String, required: true },
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
  isActive: { type: Boolean, default: true },
  mfaEnabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now }
}, { timestamps: true });

// --- MERCHANT SCHEMA ---
export interface IMerchant extends Document {
  name: string;
  code: string;
  logoUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  balance: number;
  config: {
    danaPartnerId: string;
    danaMerchantId: string;
    webhookUrl: string;
  };
}

const MerchantSchema = new Schema<IMerchant>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, index: true },
  logoUrl: { type: String },
  status: { type: String, required: true, enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  balance: { type: Number, required: true, default: 0 },
  config: {
    danaPartnerId: { type: String, required: true },
    danaMerchantId: { type: String, required: true },
    webhookUrl: { type: String, required: true }
  }
}, { timestamps: true });

// --- TRANSACTION & PAYMENT SCHEMA ---
export interface ITransaction extends Document {
  orderId: string;
  danaTxnId?: string;
  merchantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  settlementAmount: number;
  feeAmount: number;
  paymentType: 'PAYMENT_LINK' | 'QRIS_DYNAMIC' | 'DIRECT_PAYMENT';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  description: string;
  expiryDate: Date;
  paidAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  orderId: { type: String, required: true, unique: true, index: true },
  danaTxnId: { type: String, index: true, sparse: true },
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  settlementAmount: { type: Number, required: true, default: 0 },
  feeAmount: { type: Number, required: true, default: 0 },
  paymentType: { type: String, required: true, enum: ['PAYMENT_LINK', 'QRIS_DYNAMIC', 'DIRECT_PAYMENT'] },
  status: { type: String, required: true, enum: ['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'], default: 'PENDING' },
  description: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  paidAt: { type: Date }
}, { timestamps: true });

// COMPOUND INDEXES FOR REALTIME ANALYTICS PERFORMANCE OPTIMIZATION
TransactionSchema.index({ merchantId: 1, status: 1, createdAt: -1 });
TransactionSchema.index({ createdAt: -1, status: 1 });

// --- AUDIT LOG SCHEMA ---
export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  ipAddress: string;
  device: string;
  browser: string;
  action: string;
  details: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  ipAddress: { type: String, required: true },
  device: { type: String, required: true },
  browser: { type: String, required: true },
  action: { type: String, required: true, index: true },
  details: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Merchant = mongoose.models.Merchant || mongoose.model<IMerchant>('Merchant', MerchantSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
