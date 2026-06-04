'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LucideDownload, LucideShare2, LucideClock, LucideRefreshCw } from 'lucide-react';

interface QrisDisplayProps {
  qrisString: string;
  orderId: string;
  amount: number;
  expiryTimestamp: number;
  onTimeout: () => void;
}

export function QrisDisplay({ qrisString, orderId, amount, expiryTimestamp, onTimeout }: QrisDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryTimestamp - Date.now();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qris-svg-element');
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = blobURL;
    downloadLink.download = `QRIS_DANA_${orderId}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-2xl">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Dynamic National QRIS</h4>
        <p className="text-xl font-black text-blue-500 mt-1">IDR {amount.toLocaleString()}</p>
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Ref ID: {orderId}</p>
      </div>

      <div className="bg-white p-4 rounded-xl inline-block shadow-inner border border-slate-200">
        {timeLeft > 0 ? (
          <QRCodeSVG 
            id="qris-svg-element"
            value={qrisString} 
            size={220}
            level="H"
            includeMargin={false}
          />
        ) : (
          <div className="w-[220px] h-[220px] bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-400">
            <LucideRefreshCw className="h-8 w-8 text-rose-500 mb-2 animate-spin" />
            <p className="text-xs font-bold text-slate-700">QRIS Code Expired</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2 bg-slate-950/60 border border-slate-800/80 rounded-lg py-2 px-3 text-xs">
        <LucideClock className={`h-4 w-4 ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
        <span className="font-mono font-bold text-slate-300">Validity Realtime Countdown:</span>
        <span className="font-mono font-black text-slate-100">{formatTime(timeLeft)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={handleDownloadQR}
          disabled={timeLeft <= 0}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 transition-all"
        >
          <LucideDownload className="h-3.5 w-3.5 text-blue-400" />
          <span>Download SVG</span>
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(qrisString)}
          disabled={timeLeft <= 0}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 transition-all"
        >
          <LucideShare2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Copy QR Payload</span>
        </button>
      </div>
    </div>
  );
                                       }
