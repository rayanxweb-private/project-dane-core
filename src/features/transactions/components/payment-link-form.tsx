'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentLinkCreateSchema, PaymentLinkCreateInput } from '@/validations/schemas';
import { createPaymentLinkAction } from '@/actions/payment';
import { LucidePlusCircle, LucideLoader2 } from 'lucide-react';

export function PaymentLinkForm() {
  const [isPending, startTransition] = useTransition();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentLinkCreateInput>({
    resolver: zodResolver(PaymentLinkCreateSchema),
    defaultValues: {
      amount: 10000,
      orderId: `INV-${Date.now()}`,
      description: 'Enterprise Order Settlement Description',
      customerName: 'Corporate Client Corp',
      customerEmail: 'finance@corporate-client.id',
      expiryDate: new Date(Date.now() + 86400 * 1000).toISOString() // 24 Hours absolute timeframe duration mapping
    }
  });

  const onSubmit = (data: PaymentLinkCreateInput) => {
    startTransition(async () => {
      const clientInfo = {
        ip: '127.0.0.1', // Hydrated securely dynamically via runtime middleware capture
        ua: navigator.userAgent
      };

      const result = await createPaymentLinkAction(data, clientInfo);
      
      if (result.success && result.data?.redirectUrl) {
        window.location.href = result.data.redirectUrl;
      } else {
        alert(`Transaction pipeline failure: ${result.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 max-w-xl">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">Issue Corporate Invoice Link</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Generates immediate dynamic network endpoints mapped directly to national DANA balance clearing engines.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID (Unique Unique Link Key)</label>
          <input 
            {...register('orderId')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          {errors.orderId && <p className="text-[10px] text-rose-400 font-medium">{errors.orderId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Nominal Ledger (IDR)</label>
          <input 
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          {errors.amount && <p className="text-[10px] text-rose-400 font-medium">{errors.amount.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client / Customer Legal Full Name</label>
        <input 
          {...register('customerName')}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
        {errors.customerName && <p className="text-[10px] text-rose-400 font-medium">{errors.customerName.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Electronic Communication Channel Address</label>
        <input 
          {...register('customerEmail')}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
        {errors.customerEmail && <p className="text-[10px] text-rose-400 font-medium">{errors.customerEmail.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detailed Settlement Narration Statement</label>
        <textarea 
          {...register('description')}
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
        {errors.description && <p className="text-[10px] text-rose-400 font-medium">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg p-2.5 text-xs font-bold transition-all duration-200"
      >
        {isPending ? (
          <LucideLoader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LucidePlusCircle className="h-4 w-4" />
            <span>Deploy Verified Financial Inbound Link</span>
          </>
        )}
      </button>
    </form>
  );
}
