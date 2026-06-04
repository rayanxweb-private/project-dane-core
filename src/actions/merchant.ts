'use server';

import { MerchantRepository } from '@/repositories/merchant.repository';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { adminAuth } from '@/config/firebase-admin';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { winstonLogger } from '@/lib/logger';

const merchantRepository = new MerchantRepository();
const auditLogRepository = new AuditLogRepository();

const MerchantRegisterSchema = z.object({
  name: z.string().min(3).max(100),
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/, { message: 'Must be uppercase alphanumeric characters only' }),
  danaPartnerId: z.string().min(5),
  danaMerchantId: z.string().min(5),
  webhookUrl: z.string().url(),
});

export async function registerMerchantAction(input: z.infer<typeof MerchantRegisterSchema>, clientInfo: { ip: string; ua: string }) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return { success: false, error: 'UNAUTHENTICATED', message: 'No active terminal session.' };
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Validate request parameter schema
    const validatedData = MerchantRegisterSchema.parse(input);

    const existingMerchant = await merchantRepository.findByCode(validatedData.code);
    if (existingMerchant) {
      return { success: false, error: 'DUPLICATE_CODE', message: 'Merchant code already registered within nationwide clearing framework.' };
    }

    const newMerchant = await merchantRepository.create({
      name: validatedData.name,
      code: validatedData.code,
      status: 'PENDING',
      balance: 0,
      config: {
        danaPartnerId: validatedData.danaPartnerId,
        danaMerchantId: validatedData.danaMerchantId,
        webhookUrl: validatedData.webhookUrl,
      }
    });

    // Cascade role update into user claims inside Firebase Core Management Auth
    await adminAuth.setCustomUserClaims(decodedToken.uid, {
      role: 'Merchant Owner',
      merchantId: newMerchant._id.toString()
    });

    await auditLogRepository.create({
      userId: decodedToken.uid,
      userEmail: decodedToken.email || 'agent@dana.id',
      ipAddress: clientInfo.ip,
      device: 'Server Orchestrator',
      browser: 'Next.js 15 Server Node',
      action: 'MERCHANT_REGISTRATION',
      details: `Registered merchant entity ${validatedData.name} with unique identifier: ${newMerchant._id.toString()}`,
    });

    return { success: true, data: { merchantId: newMerchant._id.toString(), status: 'PENDING' } };

  } catch (error: any) {
    winstonLogger.error('Critical Error in [registerMerchantAction]:', error);
    return { success: false, error: 'REGISTRATION_FAILURE', message: error.message };
  }
}

export async function approveMerchantAction(merchantId: string, approvalStatus: 'VERIFIED' | 'REJECTED', clientInfo: { ip: string; ua: string }) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) return { success: false, error: 'UNAUTHENTICATED' };

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!['Super Admin', 'Admin'].includes(decodedToken.role as string)) {
      return { success: false, error: 'UNAUTHORIZED_PRIVILEGE' };
    }

    const updatedMerchant = await merchantRepository.updateStatus(merchantId, approvalStatus);
    if (!updatedMerchant) return { success: false, error: 'NOT_FOUND', message: 'Target merchant entity missing' };

    await auditLogRepository.create({
      userId: decodedToken.uid,
      userEmail: decodedToken.email || 'admin@dana.id',
      ipAddress: clientInfo.ip,
      device: 'Admin Console',
      browser: 'Secure Admin Engine',
      action: 'MERCHANT_APPROVAL_DECISION',
      details: `Merchant entity status updated to ${approvalStatus} for: ${merchantId}`,
    });

    return { success: true, data: { status: updatedMerchant.status } };

  } catch (error: any) {
    winstonLogger.error('Critical Error in [approveMerchantAction]:', error);
    return { success: false, error: 'APPROVAL_FAILURE', message: error.message };
  }
}
