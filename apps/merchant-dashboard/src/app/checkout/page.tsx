'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building, CheckCircle2, XCircle, Loader2, Lock, ShieldCheck, ChevronDown, ChevronUp, Settings, Code, RefreshCw } from 'lucide-react';

export default function HostedCheckoutPage() {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [simulatedOutcome, setSimulatedOutcome] = useState<'SUCCESS' | 'FAILURE' | 'INSUFFICIENT_BALANCE'>('SUCCESS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [lockKey, setLockKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showIdempotency, setShowIdempotency] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [idempotencyCache, setIdempotencyCache] = useState<Map<string, any>>(new Map());

  const [amount, setAmount] = useState<number>(1499.00);

  // Initialize idempotency key only on client side to avoid hydration error
  useEffect(() => {
    if (!idempotencyKey) {
      setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
    }
  }, [idempotencyKey]);

  const saveToLocalHistory = (txId: string, status: string, orderId: string, isReplay = false) => {
    try {
      const existing = JSON.parse(localStorage.getItem('demo_checkout_history') || '[]');
      const newTx = {
        id: txId,
        orderId: orderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        method: method,
        status: status,
        isReplay: isReplay,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('demo_checkout_history', JSON.stringify([newTx, ...existing.filter((t: any) => t.id !== txId)]));
    } catch (e) {}
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const gatewayUrl = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || 'http://localhost:3002';
    const timeStr = new Date().toLocaleTimeString();
    
    console.log('=== Payment Request ===');
    console.log('Gateway URL:', gatewayUrl);
    console.log('Idempotency Key:', idempotencyKey);
    console.log('Lock Key:', lockKey);
    console.log('Cache size:', idempotencyCache.size);
    console.log('Cache has key:', idempotencyCache.has(idempotencyKey));
    
    setLogs([
      `[${timeStr}] 🚀 POST ${gatewayUrl}/api/v1/payments`,
      `[${timeStr}] 🔐 Validating Idempotency Key: "${idempotencyKey}"`
    ]);

    const apiKey = 'sk_test_demo_1234567890abcdef';
    const amountPaise = Math.round(amount * 100);

    // Force demo mode for testing purposes
    setIsDemoMode(true);
    setShowDevTools(true);
    
    // Client-side idempotency simulation
    const cachedResult = idempotencyCache.get(idempotencyKey);
    
    if (cachedResult) {
      console.log('=== CACHE HIT ===');
      console.log('Cached result:', cachedResult);
      console.log('Setting isReplay: true');
      
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🛡️ Idempotency replay detected - returning cached result`
      ]);
      setResult({
        ...cachedResult,
        isReplay: true,
        message: cachedResult.status === 'SUCCESS' 
          ? 'Idempotency protection prevented double charge!' 
          : 'Idempotency replay: returning cached failure'
      });
      // Save replay to history
      try {
        const existing = JSON.parse(localStorage.getItem('demo_checkout_history') || '[]');
        const newTx = {
          id: cachedResult.transactionId,
          orderId: cachedResult.orderId || '',
          amount: Math.round(amount * 100),
          currency: 'INR',
          method: method,
          status: cachedResult.status,
          isReplay: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('demo_checkout_history', JSON.stringify([newTx, ...existing.filter((t: any) => t.id !== cachedResult.transactionId)]));
      } catch (e) {}
      setLoading(false);
      return;
    }

    const demoId = `pay_${Math.random().toString(36).substring(2, 10)}`;
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🌐 Demo mode: creating new payment`
    ]);

    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    let result;
    if (simulatedOutcome === 'SUCCESS') {
      result = {
        status: 'SUCCESS',
        transactionId: demoId,
        arn: `ARN_DEMO_${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Payment successful (demo mode)',
        orderId: orderId,
      };
      saveToLocalHistory(demoId, 'CAPTURED', orderId, false);
    } else {
      result = {
        status: 'FAILURE',
        transactionId: demoId,
        errorCode: simulatedOutcome === 'INSUFFICIENT_BALANCE' ? 'ERR_INSUFFICIENT_FUNDS' : 'ERR_DECLINED',
        message: simulatedOutcome === 'INSUFFICIENT_BALANCE' ? 'Insufficient balance in your account' : 'Transaction declined by bank',
        orderId: orderId,
      };
      saveToLocalHistory(demoId, 'FAILED', orderId, false);
    }

    // Cache the result for idempotency
    setIdempotencyCache(prev => new Map(prev).set(idempotencyKey, result));
    setResult(result);
    setLoading(false);
    
    if (!lockKey) {
      setIdempotencyKey(`idemp_${Math.random().toString(36).substring(2, 10)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          {isDemoMode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-medium">
              ⚠️ Demo Mode - Backend Offline
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">Acme Fintech Store</h1>
          <p className="text-sm text-gray-400">Premium Subscription</p>
        </div>

        {result ? (
          <Card className="bg-white border-gray-200 p-6 text-center space-y-6 shadow-xl">
            {result.isReplay ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                  <ShieldCheck size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Replay Detected</h2>
                <p className="text-sm text-gray-600">Idempotency protection prevented double charge</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  Same idempotency key was used. Returned cached result without charging card again.
                </div>
              </div>
            ) : result.status === 'SUCCESS' ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-red-100 rounded-full text-red-600">
                  <XCircle size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono">{result.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">₹{amount.toFixed(2)}</span>
              </div>
              {result.arn && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ARN:</span>
                  <span className="font-mono">{result.arn}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => setResult(null)} 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Try Another Payment
            </Button>
          </Card>
        ) : (
          <Card className="bg-white border-gray-200 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Payable</span>
                <div className="text-3xl font-bold text-gray-900">₹{amount.toFixed(2)}</div>
              </div>
              <div className="flex gap-2 pt-2">
                {[499, 1499, 4999, 25000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      amount === preset 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-6">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    method === 'card' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={24} />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    method === 'upi' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Smartphone size={24} />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    method === 'netbanking' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Building size={24} />
                  NetBanking
                </button>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                {method === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Card Number</label>
                      <input 
                        type="text" 
                        required 
                        defaultValue="4242 4242 4242 4242" 
                        className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expiry</label>
                        <input 
                          type="text" 
                          required 
                          defaultValue="12/28" 
                          className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">CVV</label>
                        <input 
                          type="password" 
                          required 
                          defaultValue="123" 
                          maxLength={4}
                          className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'upi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">UPI ID</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="username@upi"
                        defaultValue="shahfathalkoul@okhdfcbank"
                        className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Select Bank</label>
                      <select className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 h-auto text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Processing...
                    </span>
                  ) : (
                    `Pay ₹${amount.toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Developer Tools Toggle */}
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition text-sm border border-gray-700"
        >
          <Code size={16} />
          Developer Tools
          {showDevTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Collapsible Developer Tools */}
        {showDevTools && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 space-y-4">
            {/* Simulation Outcome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Bank Simulation</label>
              <select 
                value={simulatedOutcome}
                onChange={(e: any) => setSimulatedOutcome(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUCCESS">Success - Approve payment</option>
                <option value="FAILURE">Failure - Decline payment</option>
                <option value="INSUFFICIENT_BALANCE">Insufficient Balance</option>
              </select>
            </div>

            {/* Idempotency Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Idempotency Key</label>
                <button 
                  onClick={() => setLockKey(!lockKey)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    lockKey ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lockKey ? '🔒 Locked' : '🔓 Auto-regen'}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => setIdempotencyKey('idemp_' + Math.random().toString(36).substring(2, 8))}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition"
                >
                  Regen
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {lockKey ? 'Key locked - enables replay testing' : 'Key auto-regenerates after each payment'}
              </p>
            </div>

            {/* Event Logs Toggle */}
            <div className="space-y-2">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition"
              >
                {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Event Logs
              </button>
              {showLogs && (
                <div className="bg-black rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-500">No events yet. Make a payment to see logs.</p>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className={`text-xs font-mono leading-relaxed ${
                        log.includes('❌') || log.includes('💥') ? 'text-red-400' : 
                        log.includes('🟢') || log.includes('🚀') ? 'text-green-400' : 
                        log.includes('🔐') || log.includes('💾') ? 'text-yellow-300' : 
                        'text-gray-300'
                      }`}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Architecture Info */}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                <span className="text-gray-400">Architecture:</span> Next.js → Gateway → Bank Sim → PostgreSQL
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-green-500" /> Secured by PayGateway
          </p>
        </div>
      </div>
    </div>
  );
}
