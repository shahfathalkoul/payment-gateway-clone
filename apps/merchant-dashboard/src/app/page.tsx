import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Wallet, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchPayments, fetchSettlements } from '@/lib/api';

export default async function Home() {
  const { data: payments = [] } = await fetchPayments();
  const { data: settlements = [] } = await fetchSettlements();

  const totalPaymentsCount = payments.length;
  const successfulPayments = payments.filter((p: any) => p.status === 'CAPTURED');
  const failedPayments = payments.filter((p: any) => p.status === 'FAILED');
  
  const totalVolume = successfulPayments.reduce((acc: number, p: any) => acc + p.amount, 0) / 100;
  
  const successRate = totalPaymentsCount > 0 
    ? Math.round((successfulPayments.length / totalPaymentsCount) * 100) 
    : 0;
    
  const totalSettled = settlements
    .filter((s: any) => s.status === 'COMPLETED')
    .reduce((acc: number, s: any) => acc + s.netAmount, 0) / 100;

  const recentPayments = payments.slice(0, 5);

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
    <div className="flex flex-col p-8 w-full max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your payment processing</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/settlements">View Settlements</Link>
          </Button>
          <Button asChild>
            <Link href="/payments" className="gap-2">
              All Payments <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalVolume.toFixed(2)}</div>
            <p className="text-xs text-gray-500">All time processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settled</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalSettled.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Transferred to bank</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-gray-500">{successfulPayments.length} successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
             {recentPayments.length === 0 ? (
               <div className="p-8 text-center text-gray-500">
                  No payments found yet.
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Payment ID</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Method</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Date</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentPayments.map((payment: any) => (
                     <TableRow key={payment.id}>
                       <TableCell className="font-medium text-xs font-mono">{payment.id}</TableCell>
                       <TableCell>₹{(payment.amount / 100).toFixed(2)}</TableCell>
                       <TableCell className="uppercase text-xs">{payment.method}</TableCell>
                       <TableCell>{getStatusBadge(payment.status)}</TableCell>
                       <TableCell className="text-right text-gray-500 text-xs">
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
    </div>
  );
}
