'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function PaymentsTableClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState<any[]>(initialPayments);

  useEffect(() => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CAPTURED':
        return <Badge variant="success">Captured</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (payments.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No payments processed yet. Once a customer makes a purchase on Hosted Checkout, it will appear here immediately.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payment ID</TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment: any) => (
          <TableRow key={payment.id}>
            <TableCell className="font-mono text-xs font-medium text-cyan-400">{payment.id}</TableCell>
            <TableCell className="font-mono text-xs text-gray-400">{payment.orderId || '-'}</TableCell>
            <TableCell className="font-bold text-white">
              ₹{((payment.amount || 0) / 100).toFixed(2)}
            </TableCell>
            <TableCell className="text-gray-400">{payment.currency || 'INR'}</TableCell>
            <TableCell className="uppercase text-xs font-semibold text-gray-300">{payment.method || 'card'}</TableCell>
            <TableCell>{getStatusBadge(payment.status)}</TableCell>
            <TableCell className="text-right text-xs text-gray-500">
              {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
