import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchPayments } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const { data: payments = [] } = await fetchPayments();

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
          {payments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No payments processed yet. Once a customer makes a purchase, it will appear here.
            </div>
          ) : (
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
                    <TableCell className="font-mono text-xs font-medium">{payment.id}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{payment.orderId || '-'}</TableCell>
                    <TableCell className="font-semibold">₹{(payment.amount / 100).toFixed(2)}</TableCell>
                    <TableCell className="uppercase">{payment.currency}</TableCell>
                    <TableCell className="uppercase text-xs">{payment.method}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
