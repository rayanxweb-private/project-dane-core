import { connectDB, Transaction, Merchant } from '@/config/database';
import { winstonLogger } from '@/lib/logger';
import mongoose from 'mongoose';

export class EnterpriseSettlementService {
  /**
   * Processes all pending cleared success transactions and accumulates balances into the merchant ledger.
   * Leverages multi-document atomic sessions to block race conditions across concurrent execution cycles.
   */
  async executeAutomatedMerchantSettlementCycle(): Promise<{ processedCount: number; combinedSettledValue: number }> {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    let processedCount = 0;
    let combinedSettledValue = 0;

    try {
      winstonLogger.info('Locating valid un-settled corporate financial successful blocks...');
      
      const transactionsToSettle = await Transaction.find({
        status: 'SUCCESS',
        isSettled: { $ne: true }
      }).session(session).exec();

      if (transactionsToSettle.length === 0) {
        winstonLogger.info('Zero actionable cleared settlement ledger targets discovered.');
        await session.abortTransaction();
        session.endSession();
        return { processedCount: 0, combinedSettledValue: 0 };
      }

      // Aggregate internal accumulation map matrix
      const merchantAllocationAccumulator: Record<string, { totalNet: number; txIds: string[] }> = {};

      for (const txn of transactionsToSettle) {
        const mIdStr = txn.merchantId.toString();
        if (!merchantAllocationAccumulator[mIdStr]) {
          merchantAllocationAccumulator[mIdStr] = { totalNet: 0, txIds: [] };
        }
        merchantAllocationAccumulator[mIdStr].totalNet += txn.settlementAmount;
        merchantAllocationAccumulator[mIdStr].txIds.push((txn._id as any).toString());
        
        combinedSettledValue += txn.settlementAmount;
        processedCount++;
      }

      // Disburse balances across specific target nodes with strict lock constraints
      for (const [merchantId, dataBlock] of Object.entries(merchantAllocationAccumulator)) {
        const updateResult = await Merchant.findByIdAndUpdate(
          merchantId,
          { $inc: { balance: dataBlock.totalNet } },
          { session, new: true, runValidators: true }
        ).exec();

        if (!updateResult) {
          throw new Error(`Target structural merchant entity ${merchantId} vanished during calculation cycle processing context.`);
        }

        // Flag aggregated core transaction indexes as settled completely
        await Transaction.updateMany(
          { _id: { $in: dataBlock.txIds.map(id => new mongoose.Types.ObjectId(id)) } },
          { $set: { isSettled: true, settledAt: new Date() } },
          { session }
        ).exec();
      }

      await session.commitTransaction();
      session.endSession();

      winstonLogger.info(`Successfully resolved clearing accounting cycle. Settled IDR ${combinedSettledValue.toLocaleString()} across ${processedCount} transactions.`);
      return { processedCount, combinedSettledValue };

    } catch (error: any) {
      winstonLogger.error('Critical accounting anomaly detected. Executing rollback operations on active ledger rows:', error);
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
                   }
