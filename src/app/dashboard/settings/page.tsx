'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LucideSettings2, LucideShieldCheck, LucideSave, LucideLoader2 } from 'lucide-react';

const SystemSettingsSchema = z.object({
  siteName: z.string().min(4),
  sessionTimeoutMinutes: z.number().min(5).max(1440),
  enforceMfaAllStaff: z.boolean(),
  webhookSecretKey: z.string().min(32)
});

type SystemSettingsInput = z.infer<typeof SystemSettingsSchema>;

export default function EnterpriseSettingsModulePage() {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<SystemSettingsInput>({
    resolver: zodResolver(SystemSettingsSchema),
    defaultValues: {
      siteName: 'DANA Enterprise Payment Platform Core',
      sessionTimeoutMinutes: 60,
      enforceMfaAllStaff: true,
      webhookSecretKey: 'b7a3f9e8d2c56147a9e0f3b5c6d7e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7'
    }
  });

  const onSaveSettings = (data: SystemSettingsInput) => {
    startTransition(async () => {
      // Simulate microservice configuration propagation call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('System parameter configuration state committed safely across operational nodes.');
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-950 text-slate-50 min-h-screen">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <LucideSettings2 className="h-6 w-6 text-blue-500" />
            <span>Global System Matrix Controls</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure foundational network security postures, core identity session bounds, and crypto webhook tokens.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSaveSettings)} className="grid gap-6 md:grid-cols-2 max-w-5xl">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
            <LucideShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Identity & Security Enforcement Guardrails</span>
          </h3>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Deployment Cluster Identity Title</label>
            <input 
              {...register('siteName')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session Max Bounds Inactivity Expiration Time (Minutes)</label>
            <input 
              type="number"
              {...register('sessionTimeoutMinutes', { valueAsNumber: true })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg mt-4">
            <div>
              <p className="text-xs font-bold text-slate-300">Enforce Hard Mandatory MFA Controls</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Blocks console interaction access until standard multi-factor handshake flows validate.</p>
            </div>
            <input 
              type="checkbox"
              {...register('enforceMfaAllStaff')}
              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Cryptographic Outbound Integrity Configurations
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HMAC-SHA256 Secret Key Signpost Signature Token</label>
              <textarea 
                {...register('webhookSecretKey')}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 font-mono text-[11px] rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-blue-500 tracking-wider"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">This secure asymmetric generation variable authenticates ledger data delivery legitimacy between platform clusters and downstream nodes.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-40 text-white rounded-lg p-2.5 text-xs font-bold transition-all duration-200 shadow-md mt-6"
          >
            {isPending ? (
              <LucideLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LucideSave className="h-4 w-4" />
                <span>Commit System Parameter Configurations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
            }
