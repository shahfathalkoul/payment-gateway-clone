import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchPayments } from '@/lib/api';
import { PaymentsTableClient } from '@/components/PaymentsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const { data: payments = [] } = await fetchPayments();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--midnight-navy)]">Payments</h1>
        <p className="mt-1 text-sm text-[var(--secondary-text)]">View and monitor all payment transactions</p>
      </div>

      <Card className="border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--midnight-navy)]">All Transactions</CardTitle>
          <CardDescription>A complete log of incoming payments for your merchant account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentsTableClient initialPayments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
