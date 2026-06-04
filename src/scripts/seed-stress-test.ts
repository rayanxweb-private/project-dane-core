import { connectDB, Merchant, Transaction, Customer } from '../config/database';
import mongoose from 'mongoose';
import { winstonLogger } from '../lib/logger';

export async function executeEnterpriseStressSeed(recordVolume: number = 5000) {
  try {
    winstonLogger.info(`Initializing enterprise structural seed engine for ${recordVolume} records.`);
    await connectDB();

    // 1. Create or fetch high-volume test mock entities
    let testMerchant = await Merchant.findOne({ code: 'STRESS_TEST_NODE_01' });
    if (!testMerchant) {
      testMerchant = await Merchant.create({
        name: 'PT Digital Commerce Scale Stress Test Node',
        code: 'STRESS_TEST_NODE_01',
        status: 'VERIFIED',
        balance: 1500000000, // Pre-seeded initial corporate balance validation
        config: {
          danaPartnerId: 'PARTNER_STRESS_999',
          danaMerchantId: 'MERCH_STRESS_999',
          webhookUrl: 'https://api.test-target.internal/v1/callback'
        }
      });
    }

    let testCustomer = await Customer.findOne({ email: 'load.tester@dana.id' });
    if (!testCustomer) {
      testCustomer = new mongoose.model('Customer', new mongoose.Schema({
        name: String,
        email: String
      })).create({
        name: 'Load Tester Agent 01',
        email: 'load.tester@dana.id'
      }) as any;
    }

    winstonLogger.info('Wiping old structural testing historical ledgers...');
    await Transaction.deleteMany({ merchantId: testMerchant._id });

    // 2. Batch Transaction Allocation Generator Matrix
    const transactionBatchArray = [];
    const statusPool: ('SUCCESS' | 'PENDING' | 'FAILED')[] = ['SUCCESS', 'SUCCESS', 'PENDING', 'FAILED'];
    const paymentTypePool = ['QRIS_DYNAMIC', 'DANA_BALANCE', 'DANA_CARD_BINDING'];

    for (let i = 0; i < recordVolume; i++) {
      const randomAmount = Math.floor(Math.random() * 2000000) + 10000; // Value span IDR 10,000 - IDR 2,010,000
      const calculatedFee = randomAmount * 0.007; // 0.7% Standard BI QRIS MDR Flat Allocation Mapping
      const statusValue = statusPool[Math.floor(Math.random() * statusPool.length)];

      transactionBatchArray.push({
        orderId: `TXN-STRESS-${Date.now()}-${i.toString().padStart(5, '0')}`,
        merchantId: testMerchant._id,
        customerId: new mongoose.Types.ObjectId(),
        amount: randomAmount,
        settlementAmount: statusValue === 'SUCCESS' ? randomAmount - calculatedFee : 0,
        feeAmount: calculatedFee,
        paymentType: paymentTypePool[Math.floor(Math.random() * paymentTypePool.length)],
        status: statusValue,
        description: `Automated Simulation Load Runner Core Cluster Test Entry: ${i}`,
        paidAt: statusValue === 'SUCCESS' ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null,
        expiryDate: new Date(Date.now() + 86400000)
      });
    }

    winstonLogger.info('Pushing database array payload into cluster matrix collections...');
    await Transaction.insertMany(transactionBatchArray, { ordered: false });

    winstonLogger.info(`Successfully injected ${recordVolume} strict isolated transactional blocks into cluster node collections safely.`);
    process.exit(0);

  } catch (error: any) {
    winstonLogger.error('Catastrophic failure processing internal enterprise simulation seeder:', error);
    process.exit(1);
  }
}

// Execute command if triggered explicitly via terminal runtime orchestration context
if (process.argv[2] === '--run') {
  executeEnterpriseStressSeed(5000);
                                                              }
