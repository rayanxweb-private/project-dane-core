import { connectDB, Merchant, IMerchant } from '@/config/database';
import mongoose from 'mongoose';

export class MerchantRepository {
  async create(data: Partial<IMerchant>): Promise<IMerchant> {
    await connectDB();
    const merchant = new Merchant(data);
    return await merchant.save();
  }

  async findById(id: string): Promise<IMerchant | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Merchant.findById(id).exec();
  }

  async findByCode(code: string): Promise<IMerchant | null> {
    await connectDB();
    return await Merchant.findOne({ code }).exec();
  }

  async updateStatus(id: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'): Promise<IMerchant | null> {
    await connectDB();
    return await Merchant.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).exec();
  }

  async incrementBalance(id: string, amount: number, session?: mongoose.ClientSession): Promise<IMerchant | null> {
    await connectDB();
    return await Merchant.findByIdAndUpdate(
      id,
      { $inc: { balance: amount } },
      { new: true, session }
    ).exec();
  }

  async getMerchantsWithPerformance(query: any, skip: number, limit: number): Promise<{ data: IMerchant[]; total: number }> {
    await connectDB();
    const total = await Merchant.countDocuments(query);
    const data = await Merchant.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return { data, total };
  }
  }
