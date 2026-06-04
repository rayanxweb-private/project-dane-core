import { connectDB, Transaction } from '@/config/database';
import mongoose from 'mongoose';

export class CustomerAnalyticsService {
  async computeCustomerSegmentation(merchantId: string) {
    await connectDB();
    const merchantMongooseId = new mongoose.Types.ObjectId(merchantId);

    // Dynamic RFM Analysis Evaluation Pipeline Execution (Recency, Frequency, Monetary)
    return await Transaction.aggregate([
      { $match: { merchantId: merchantMongooseId, status: 'SUCCESS' } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          lastTransactionDate: { $max: '$paidAt' }
        }
      },
      {
        $project: {
          customerId: '$_id',
          totalSpent: 1,
          transactionCount: 1,
          daysSinceLastPurchase: {
            $dateDiff: {
              startDate: '$lastTransactionDate',
              endDate: new Date(),
              unit: 'day'
            }
          }
        }
      },
      {
        $project: {
          customerId: 1,
          totalSpent: 1,
          transactionCount: 1,
          segment: {
            $cond: [
              { $and: [{ $gte: ['$totalSpent', 50000000] }, { $gte: ['$transactionCount', 10] }] },
              'VIP Whale Client',
              {
                $cond: [
                  { $and: [{ $lt: ['$daysSinceLastPurchase', 14] }, { $gte: ['$transactionCount', 3] }] },
                  'Loyal Core High-Frequency',
                  {
                    $cond: [
                      { $gt: ['$daysSinceLastPurchase', 60] },
                      'At-Risk Inactive Churn Profile',
                      'Standard Regular Spender'
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    ]);
  }
}
