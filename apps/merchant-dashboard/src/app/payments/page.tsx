import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchPayments } from '@/lib/api';
import { PaymentsTableClient } from '@/components/PaymentsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const { data: payments = [] } = await fetchPayments();

  return (
    <div className="flex flex-col p-8 w-full max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">View and monitor all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A complete log of incoming payments for your merchant account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentsTableClient initialPayments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
