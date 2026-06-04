import { connectDB, Transaction, ITransaction } from '@/config/database';
import mongoose from 'mongoose';

export class TransactionRepository {
  async create(data: Partial<ITransaction>): Promise<ITransaction> {
    await connectDB();
    const txn = new Transaction(data);
    return await txn.save();
  }

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    await connectDB();
    return await Transaction.findOne({ orderId }).populate('merchantId').exec();
  }

  async updateStatus(orderId: string, status: string, danaTxnId?: string): Promise<ITransaction | null> {
    await connectDB();
    const updateData: any = { status };
    if (danaTxnId) updateData.danaTxnId = danaTxnId;
    if (status === 'SUCCESS') updateData.paidAt = new Date();
    
    return await Transaction.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async getPaginated(query: any, skip: number, limit: number): Promise<{ data: ITransaction[], total: number }> {
    await connectDB();
    const total = await Transaction.countDocuments(query);
    const data = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('merchantId')
      .exec();
    return { data, total };
  }

  async getAggregatedMetrics(matchQuery: any) {
    await connectDB();
    return await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
  }
      }
