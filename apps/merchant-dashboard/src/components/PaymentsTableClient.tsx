'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function PaymentsTableClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const local = JSON.parse(localStorage.getItem('demo_checkout_history') || '[]');
      if (local && local.length > 0) {
        // Merge local checkouts at the top, avoiding duplicates by ID
        const existingIds = new Set(initialPayments.map(p => p.id));
        const merged = [
          ...local.filter((p: any) => !existingIds.has(p.id)),
          ...initialPayments
        ];
        setPayments(merged);
      }
    } catch (e) {
      console.error('Failed to read local checkout history:', e);
    }
  }, [initialPayments]);

  const getStatusBadge = (status: string, isReplay?: boolean) => {
    if (isReplay) {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">Replay (Cached)</Badge>;
    }
    
    switch (status) {
      case 'CAPTURED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">Captured</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (payments.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--secondary-text)]">
        No payments processed yet. Once a customer makes a purchase on Hosted Checkout, it will appear here immediately.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[var(--secondary-text)]">Payment ID</TableHead>
          <TableHead className="text-[var(--secondary-text)]">Order ID</TableHead>
          <TableHead className="text-[var(--secondary-text)]">Amount</TableHead>
          <TableHead className="text-[var(--secondary-text)]">Currency</TableHead>
          <TableHead className="text-[var(--secondary-text)]">Method</TableHead>
          <TableHead className="text-[var(--secondary-text)]">Status</TableHead>
          <TableHead className="text-right text-[var(--secondary-text)]">Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment: any) => (
          <TableRow key={payment.id} className={payment.isReplay ? 'bg-[rgba(37,99,235,0.04)]' : 'bg-white'}>
            <TableCell className="font-mono text-xs font-medium text-[var(--royal-blue)]">
              {payment.id}
              {payment.isReplay && <span className="ml-2 text-[var(--royal-blue)]" title="Replay (Cached)">↻</span>}
            </TableCell>
            <TableCell className="font-mono text-xs text-[var(--secondary-text)]">{payment.orderId || '-'}</TableCell>
            <TableCell className="font-bold text-[var(--midnight-navy)]">
              ₹{((payment.amount || 0) / 100).toFixed(2)}
            </TableCell>
            <TableCell className="text-[var(--secondary-text)]">{payment.currency || 'INR'}</TableCell>
            <TableCell className="text-xs font-semibold uppercase text-[var(--midnight-navy)]">{payment.method || 'card'}</TableCell>
            <TableCell>{getStatusBadge(payment.status, payment.isReplay)}</TableCell>
            <TableCell className="text-right text-xs text-[var(--secondary-text)]">
              {mounted && payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
