import { z } from 'zod';

export const PaymentLinkCreateSchema = z.object({
  amount: z.number().positive({ message: 'Transaction nominal ledger must be positive value' }).min(10000, { message: 'Minimum transaction allocation is IDR 10.000' }),
  orderId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Alphanumeric structural regex syntax constraint mismatch' }),
  description: z.string().min(5).max(255),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email({ message: 'Invalid secure communication customer channel address' }),
  expiryDate: z.string().datetime()
});

export const QrisDynamicCreateSchema = z.object({
  amount: z.number().positive().min(1000),
  orderId: z.string().min(8).max(64),
  expiryPeriod: z.number().int().min(60).max(86400) // seconds constraint boundaries
});

export type PaymentLinkCreateInput = z.infer<typeof PaymentLinkCreateSchema>;
export type QrisDynamicCreateInput = z.infer<typeof QrisDynamicCreateSchema>;
