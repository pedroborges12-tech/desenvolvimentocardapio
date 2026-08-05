'use client';

import React, { useState, useEffect } from 'react';
import { Check, Copy, Clock, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PixModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  total: number;
  pixQrCode?: string;
  pixCopyPaste?: string;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  orderId,
  orderNumber,
  total,
  pixQrCode,
  pixCopyPaste,
  onClose,
  onPaymentConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos
  const [isPaid, setIsPaid] = useState(false);

  // Copiar chave Pix
  const handleCopy = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Timer de Expiração
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Polling automático de verificação de status do pagamento Pix
  useEffect(() => {
    if (!isOpen || !orderId || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            setIsPaid(true);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
            setTimeout(() => {
              onPaymentConfirmed();
            }, 1500);
          }
        }
      } catch (err) {
        console.error('Erro ao polling de status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, orderId, isPaid, onPaymentConfirmed]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-5">
        {isPaid ? (
          <div className="space-y-4 py-8 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-black text-white">Pagamento Aprovado!</h2>
            <p className="text-xs text-zinc-400">
              Seu pagamento Pix foi confirmado com sucesso. Seu pedido já entrou na fila de preparo!
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <QrCode className="w-4 h-4" />
                <span>Pagamento via Pix</span>
              </div>
              <h2 className="text-xl font-black text-white">Escaneie o QR Code</h2>
              <p className="text-xs text-zinc-400">
                Pedido <strong className="text-amber-400">#{orderNumber}</strong> • Total:{' '}
                <strong className="text-amber-400">R$ {total.toFixed(2).replace('.', ',')}</strong>
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center border-4 border-amber-500/30">
              {pixQrCode ? (
                <img src={pixQrCode} alt="QR Code Pix" className="w-full h-full object-contain" />
              ) : (
                <div className="text-zinc-800 text-xs font-bold">Carregando QR Code...</div>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 py-1.5 px-4 rounded-xl border border-amber-500/20 w-max mx-auto">
              <Clock className="w-4 h-4 animate-spin" />
              <span>
                Expira em {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Pix Copy and Paste Button */}
            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Chave Pix Copiada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código Pix (Copia e Cola)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-500">
                Abra o app do seu banco, escolha &quot;Pix Copia e Cola&quot; e cole o código acima.
              </p>
            </div>

            {/* Manual Confirmation Fallback */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-medium"
              >
                Fechar janela
              </button>

              <button
                onClick={() => {
                  setIsPaid(true);
                  setTimeout(onPaymentConfirmed, 1000);
                }}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold hover:underline"
              >
                <span>Já Paguei</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
