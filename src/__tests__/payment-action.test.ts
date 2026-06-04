import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPaymentLinkAction } from '@/actions/payment';
import { adminAuth } from '@/config/firebase-admin';

vi.mock('@/config/firebase-admin', () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
  }
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn().mockReturnValue({ value: 'mocked-illegal-session-cookie' })
  })
}));

describe('Payment Server Action Security Bounds Verification Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should explicitly reject operation and return unauthenticated block metadata when role is unauthorized', async () => {
    // Inject invalid operational claims credentials inside mock session handler
    (adminAuth.verifySessionCookie as any).mockResolvedValue({
      uid: 'attacker_uid',
      role: 'Viewer', // Viewer does not possess action privileges to alter financial states inside matrix
      email: 'malicious@agent.id'
    });

    const mockPayload = {
      amount: 500000,
      orderId: 'INV-ATTACK-001',
      description: 'Breach Attempt Injection Payload',
      customerName: 'Target Entity',
      customerEmail: 'target@corporate.id',
      expiryDate: new Date().toISOString()
    };

    const clientData = { ip: '192.168.1.50', ua: 'Malicious-Script-Client' };

    const actionResponse = await createPaymentLinkAction(mockPayload, clientData);

    expect(actionResponse.success).toBe(false);
    expect(actionResponse.error).toBe('UNAUTHORIZED_ACCESS');
  });
});
