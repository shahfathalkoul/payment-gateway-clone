import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col p-8 w-full max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Merchant Profile</h1>
        <p className="text-gray-500 mt-1">Manage business information and settlement details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-700" />
            <CardTitle>Business Details</CardTitle>
          </div>
          <CardDescription>
            Information displayed on customer checkout pages and transaction receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Business Name</label>
            <input 
              type="text" 
              defaultValue="Acme Fintech Corp" 
              className="w-full mt-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Support Email</label>
            <input 
              type="email" 
              defaultValue="support@acmefintech.com" 
              className="w-full mt-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Settlement Bank Account (Masked)</label>
            <input 
              type="text" 
              readOnly
              value="HDFC Bank — *******4910 (IFSC: HDFC0001234)" 
              className="w-full mt-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 font-mono"
            />
          </div>

          <div className="pt-2">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
