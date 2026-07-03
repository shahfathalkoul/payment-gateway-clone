import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchSettlements } from '@/lib/api';

export default async function SettlementsPage() {
  const { data: settlements = [] } = await fetchSettlements();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PENDING':
      case 'PROCESSING':
        return <Badge variant="warning">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col p-8 w-full max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settlements</h1>
        <p className="text-gray-500 mt-1">View bank payouts, fee deductions, and GST breakdowns</p>
      </div>

      <Card className="bg-slate-950 border-cyan-900/50 text-white p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
            <span>⚡ Automated Double-Entry Ledger Engine (:3004)</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-xs text-cyan-300 font-mono">
            BullMQ Background Worker Active
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Unlike basic apps that store flat numbers, this engine isolates transactional float. At daily close, the worker sweeps uncommitted CAPTURED transactions, calculates exact 2.00% Gateway processing fees and 18.00% GST taxes in integer paise, and creates immutable double-entry ledger records ready for bank ACH transfer.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Ledger</CardTitle>
          <CardDescription>Daily automated settlements transferred to your registered bank account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {settlements.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No settlements generated yet. Settlements run daily at 2:00 AM UTC for captured payments.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settlement ID</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Gateway Fee (2%)</TableHead>
                  <TableHead>GST (18%)</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement: any) => {
                  const fee = settlement.gatewayFee ?? settlement.feeAmount ?? 0;
                  const tax = settlement.gst ?? settlement.taxAmount ?? 0;
                  return (
                    <TableRow key={settlement.id}>
                      <TableCell className="font-mono text-xs font-medium">{settlement.id}</TableCell>
                      <TableCell>₹{(settlement.grossAmount / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">-₹{(fee / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">-₹{(tax / 100).toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-green-600">₹{(settlement.netAmount / 100).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                      <TableCell className="text-right text-xs text-gray-500">
                        {new Date(settlement.createdAt || settlement.settledAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
