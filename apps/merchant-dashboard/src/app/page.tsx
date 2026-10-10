import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CreditCard, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchPayments, fetchSettlements } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const { data: payments = [] } = await fetchPayments();
  const { data: settlements = [] } = await fetchSettlements();

  const successfulPayments = payments.filter((p: any) => p.status === 'CAPTURED');
  const failedPayments = payments.filter((p: any) => p.status === 'FAILED');
  
  const totalVolume = successfulPayments.reduce((acc: number, p: any) => acc + p.amount, 0) / 100;
  const successRate = payments.length > 0 
    ? Math.round((successfulPayments.length / payments.length) * 100) 
    : 0;
    
  const totalSettled = settlements
    .filter((s: any) => s.status === 'COMPLETED')
    .reduce((acc: number, s: any) => acc + s.netAmount, 0) / 100;

  const recentPayments = payments.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CAPTURED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col p-8 w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Payment overview</p>
        </div>
        <Button asChild>
          <Link href="/checkout" className="gap-2">
            New Payment <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalVolume.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{successRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Settled Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalSettled.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Payments */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No payments yet</p>
              <Button asChild variant="outline">
                <Link href="/checkout">Create your first payment</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-600">ID</TableHead>
                  <TableHead className="font-medium text-gray-600">Amount</TableHead>
                  <TableHead className="font-medium text-gray-600">Method</TableHead>
                  <TableHead className="font-medium text-gray-600">Status</TableHead>
                  <TableHead className="font-medium text-gray-600 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment: any) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell className="font-medium">₹{(payment.amount / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-gray-600 capitalize">{payment.method?.toLowerCase()}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/payments">View All Payments</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/settlements">Settlements</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/api-keys">API Keys</Link>
        </Button>
      </div>
    </div>
  );
}
