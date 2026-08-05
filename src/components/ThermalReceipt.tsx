'use client';

import React from 'react';

export interface PrintableOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PrintableOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: string;
  address?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: PrintableOrderItem[];
}

interface ThermalReceiptProps {
  orders: PrintableOrder[];
  restaurantName?: string;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  orders,
  restaurantName = 'Burger & Co. Artisan',
}) => {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="hidden print:block print:w-full print:m-0 print:p-0 text-black font-mono text-[12px] leading-tight">
      {orders.map((order, index) => {
        const isPaid = order.status === 'PAID';
        const formattedDate = new Date(order.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={order.id}
            className="w-[78mm] max-w-[80mm] mx-auto p-2 border-b border-dashed border-black break-after-page page-break"
            style={{ pageBreakAfter: index < orders.length - 1 ? 'always' : 'auto' }}
          >
            {/* Header */}
            <div className="text-center space-y-0.5 mb-2">
              <h1 className="text-[15px] font-black uppercase tracking-tight">{restaurantName}</h1>
              <p className="text-[11px] font-bold">COMPROVANTE DE PEDIDO / COBRANÇA</p>
              <p className="text-[10px]">----------------------------------------</p>
            </div>

            {/* Meta Order */}
            <div className="mb-2 space-y-0.5">
              <div className="flex justify-between font-black text-[14px]">
                <span>PEDIDO: #{order.orderNumber}</span>
                <span>{order.deliveryType === 'DELIVERY' ? '[DELIVERY]' : '[RETIRADA]'}</span>
              </div>
              <p className="text-[11px]">DATA: {formattedDate}</p>
            </div>

            <p className="text-[10px]">----------------------------------------</p>

            {/* Customer info */}
            <div className="my-2 space-y-1">
              <p><strong>CLIENTE:</strong> {order.customerName}</p>
              <p><strong>TEL/WA:</strong> {order.customerPhone}</p>
              {order.deliveryType === 'DELIVERY' ? (
                <p className="font-bold">
                  <strong>ENDEREÇO:</strong> {order.address}
                </p>
              ) : (
                <div className="p-1.5 border-2 border-black text-center font-black text-[13px] my-1">
                  *** RETIRADA NO BALCÃO ***
                </div>
              )}
            </div>

            <p className="text-[10px]">----------------------------------------</p>

            {/* Payment & Charging highlight for Delivery Driver */}
            <div className="my-2 p-1.5 border-2 border-black text-center space-y-1">
              <p className="font-black text-[11px] uppercase">PAGAMENTO: {order.paymentMethod}</p>
              {isPaid ? (
                <p className="font-black text-[13px] tracking-wider uppercase bg-black text-white px-1">
                  {">>> PAGO ONLINE (NÃO COBRAR) <<<"}
                </p>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-black text-[12px] uppercase">
                    {">>> COBRAR NA ENTREGA <<<"}
                  </p>
                  <p className="font-black text-[14px]">TOTAL A COBRAR: R$ {order.total.toFixed(2).replace('.', ',')}</p>
                </div>
              )}
            </div>

            <p className="text-[10px]">----------------------------------------</p>

            {/* Itemized List */}
            <div className="my-2 space-y-1.5">
              <div className="flex justify-between font-bold text-[11px] border-b border-black pb-0.5">
                <span>QTD ITEM</span>
                <span>TOTAL</span>
              </div>

              {order.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span className="max-w-[180px] break-words">
                      {item.quantity}x {item.name}
                    </span>
                    <span>R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] pl-3 italic font-semibold">
                      * Obs: {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <>
                <p className="text-[10px]">----------------------------------------</p>
                <div className="my-1">
                  <p className="font-bold text-[10px]">OBSERVAÇÕES DO PEDIDO:</p>
                  <p className="text-[11px] italic font-semibold">{order.notes}</p>
                </div>
              </>
            )}

            <p className="text-[10px]">----------------------------------------</p>

            {/* Order Totals */}
            <div className="my-2 space-y-0.5 text-right font-bold">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>TAXA DE ENTREGA:</span>
                  <span>R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] font-black border-t border-black pt-1">
                <span>TOTAL DO PEDIDO:</span>
                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-3 pt-1 border-t border-dashed border-black space-y-0.5">
              <p className="font-bold text-[11px]">OBRIGADO PELA PREFERÊNCIA!</p>
              <p className="text-[9px]">SISTEMA CARDÁPIO DIGITAL</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
