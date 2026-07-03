import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, ShieldCheck, Copy } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <div className="flex flex-col p-8 w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">API Keys & Webhooks</h1>
        <p className="text-gray-500 mt-1">Manage credentials for integrating with our payment gateway</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle>Live API Credentials</CardTitle>
          </div>
          <CardDescription>
            Use these keys to authenticate requests from your backend server to our payment API. Never share secret keys on the client side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Publishable Key (Client Side)</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="text" 
                readOnly 
                value="pk_test_mock_51M092aL92k3901naA9201" 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-800"
              />
              <Button variant="outline" size="icon">
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Secret Key (Server Side Only)</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="password" 
                readOnly 
                value="sk_test_mock_99A029104819204810294810" 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-800"
              />
              <Button variant="outline" size="icon">
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="destructive" size="sm">Roll Secret Key</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure where we should send real-time POST notifications when payment states change (e.g., payment.captured, payment.failed).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Webhook Endpoint URL</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="text" 
                defaultValue="https://your-merchant-app.com/api/webhooks/payment" 
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
              />
              <Button>Save</Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Webhook Signing Secret</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="password" 
                readOnly 
                value="whsec_819204810294810294810294810" 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-800"
              />
              <Button variant="outline" size="icon">
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Verify HMAC signature header `x-signature` using this secret.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
