'use server';

import { PaymentLinkCreateSchema, PaymentLinkCreateInput } from '@/validations/schemas';
import { TransactionRepository } from '@/repositories/transaction.repository';
import { DanaService } from '@/services/dana.service';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { adminAuth } from '@/config/firebase-admin';
import { cookies } from 'next/headers';
import { winstonLogger } from '@/lib/logger';
import mongoose from 'mongoose';

const txnRepository = new TransactionRepository();
const danaService = new DanaService();
const auditLogRepository = new AuditLogRepository();

export async function createPaymentLinkAction(input: PaymentLinkCreateInput, clientInfo: { ip: string; ua: string }) {
  try {
    // 1. Enforce Authentication & Role Validation (RBAC) via Server Context
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return { success: false, error: 'UNAUTHENTICATED_REQUEST', message: 'Missing operational active session.' };
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userRole = decodedToken.role as string;
    
    if (!['Super Admin', 'Admin', 'Finance', 'Merchant Owner'].includes(userRole)) {
      return { success: false, error: 'UNAUTHORIZED_ACCESS', message: 'Privilege escalation rejected.' };
    }

    // 2. Validate Input Schema against Parameter Tampering
    const validatedData = PaymentLinkCreateSchema.parse(input);

    // 3. Populate Default Enterprise Object Identifiers
    const merchantObjectId = decodedToken.merchantId 
      ? new mongoose.Types.ObjectId(decodedToken.merchantId as string)
      : new mongoose.Types.ObjectId(); // Fallback cluster scope system routing

    const customerObjectId = new mongoose.Types.ObjectId(); // Create new operational ledger anchor

    // 4. Persistence into MongoDB Atlas Engine (State: PENDING)
    const transactionRecord = await txnRepository.create({
      orderId: validatedData.orderId,
      merchantId: merchantObjectId,
      customerId: customerObjectId,
      amount: validatedData.amount,
      settlementAmount: 0,
      feeAmount: validatedData.amount * 0.007, // 0.7% Standard Indonesian National Bank QRIS/Payment Link Fee Mapping
      paymentType: 'PAYMENT_LINK',
      status: 'PENDING',
      description: validatedData.description,
      expiryDate: new Date(validatedData.expiryDate),
    });

    // 5. Trigger Secure Core DANA API Gateways Channel
    const danaGatewayResponse = await danaService.createPaymentLink({
      orderId: validatedData.orderId,
      amount: validatedData.amount,
      description: validatedData.description,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
    });

    // 6. Record Non-Repudiation Audit Logs Trail
    const parser = require('ua-parser-js');
    const ua = parser(clientInfo.ua);
    
    await auditLogRepository.create({
      userId: decodedToken.uid,
      userEmail: decodedToken.email || 'unknown@dana.id',
      ipAddress: clientInfo.ip,
      device: ua.device.model || 'Server Infrastructure Platform',
      browser: ua.browser.name || 'Next.js Runtime Core',
      action: 'PAYMENT_LINK_CREATION',
      details: `Generated payment invoice ${validatedData.orderId} worth IDR ${validatedData.amount.toLocaleString()}`,
    });

    return {
      success: true,
      data: {
        orderId: transactionRecord.orderId,
        redirectUrl: danaGatewayResponse.paymentUrl || danaGatewayResponse.redirectUrl,
        internalId: transactionRecord._id.toString()
      }
    };

  } catch (error: any) {
    winstonLogger.error('Action Level Failure [createPaymentLinkAction]:', error);
    return {
      success: false,
      error: 'EXECUTION_FAILURE',
      message: error.message || 'An unhandled exception blocked financial pipeline processing.'
    };
  }
      }
