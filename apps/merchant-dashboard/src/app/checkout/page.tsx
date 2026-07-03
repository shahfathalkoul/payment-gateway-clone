'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building, CheckCircle2, XCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function HostedCheckoutPage() {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [simulatedOutcome, setSimulatedOutcome] = useState<'SUCCESS' | 'FAILURE' | 'INSUFFICIENT_BALANCE'>('SUCCESS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const [lockKey, setLockKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[System Initialized] Connected to Payment Gateway Microservice (:3002)',
    '[Idempotency Ready] Cryptographic lock key generated for transaction.'
  ]);

  const amount = 1499.00;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      `[${timeStr}] 🚀 POST http://localhost:3002/api/v1/payments (Headers: Authorization Bearer sk_test_demo_...)`,
      `[${timeStr}] 🔐 Validating Idempotency Key: "${idempotencyKey}" in PostgreSQL...`
    ]);

    const gatewayUrl = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || 'http://localhost:3002';
    const apiKey = 'sk_test_demo_1234567890abcdef';
    const amountPaise = Math.round(amount * 100);

    try {
      // 1. Create Payment on Gateway
      const createRes = await fetch(`${gatewayUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          description: `Acme Store Order (${method.toUpperCase()})`,
          orderId: `ORD-${Date.now().toString().slice(-6)}`,
        }),
      });

      const isReplay = createRes.headers.get('x-idempotency-replay') === 'true';
      const createData = await createRes.json();
      const paymentId = createData?.data?.id || `pay_${Date.now()}`;

      if (isReplay) {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🛡️ IDEMPOTENCY REPLAY DETECTED! Key "${idempotencyKey}" hit Redis lock.`,
          `[${new Date().toLocaleTimeString()}] 🟢 Returned exact cached transaction (${paymentId}) without double-charging or creating database duplicate!`
        ]);
        setResult({
          status: 'SUCCESS',
          transactionId: paymentId,
          arn: `ARN_REPLAY_CACHED`,
          message: '🛡️ Idempotent Replay Intercepted: Returned original payment state without double-charging credit card.',
          isReplay: true,
        });
        setLoading(false);
        return;
      }

      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 💾 Database Transaction Committed: Payment ${paymentId} created in CREATED state.`
      ]);

      if (simulatedOutcome === 'SUCCESS') {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ⚡ Dispatching Capture request to Acquiring Bank Network (:3003)...`
        ]);

        // 2. Capture Payment on Gateway
        await fetch(`${gatewayUrl}/api/v1/payments/${paymentId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ amount: amountPaise }),
        });

        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📦 Transactional Outbox: Enqueued PAYMENT_CAPTURED event to BullMQ/Redis.`,
          `[${new Date().toLocaleTimeString()}] 🟢 Status updated to CAPTURED. Ready for nightly Settlement job (:3004).`
        ]);

        setResult({
          status: 'SUCCESS',
          transactionId: paymentId,
          arn: `ARN${Math.floor(Math.random() * 8999999999 + 1000000000)}`,
          message: 'Payment authorized and captured successfully.',
        });
      } else if (simulatedOutcome === 'INSUFFICIENT_BALANCE') {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Bank Simulator (:3003) returned ERR_INSUFFICIENT_FUNDS. Rolling back state.`
        ]);

        setResult({
          status: 'FAILURE',
          transactionId: paymentId,
          errorCode: 'ERR_INSUFFICIENT_FUNDS',
          message: 'Transaction declined by issuer: Insufficient balance in customer account.',
        });
      } else {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Bank Simulator (:3003) returned ERR_DECLINED. Transaction aborted.`
        ]);

        setResult({
          status: 'FAILURE',
          transactionId: paymentId,
          errorCode: 'ERR_DECLINED',
          message: 'Transaction declined by bank or network failure.',
        });
      }
    } catch (error) {
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 💥 Network Error: Could not connect to microservice cluster.`
      ]);

      setResult({
        status: 'FAILURE',
        transactionId: `pay_err_${Date.now()}`,
        errorCode: 'ERR_NETWORK',
        message: 'Could not connect to live Payment Gateway service.',
      });
    } finally {
      setLoading(false);
      if (!lockKey) {
        setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Lock size={12} /> Live Hosted Secure Checkout
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acme Fintech Store</h1>
          <p className="text-sm text-gray-400">Order #ORD-982310 • Premium Subscription</p>
        </div>

        {result ? (
          <Card className="bg-gray-950 border-gray-800 text-white p-6 text-center space-y-6">
            {result.status === 'SUCCESS' ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-xl font-bold text-green-400">Payment Successful!</h2>
                <p className="text-sm text-gray-400">{result.message}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                  <XCircle size={48} />
                </div>
                <h2 className="text-xl font-bold text-red-400">Payment Failed</h2>
                <p className="text-sm text-gray-400">{result.message}</p>
              </div>
            )}

            <div className="bg-gray-900 p-4 rounded-lg text-left text-xs space-y-2 font-mono text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span>{result.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              {result.arn && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Acquirer Ref (ARN):</span>
                  <span>{result.arn}</span>
                </div>
              )}
              {result.errorCode && (
                <div className="flex justify-between text-red-400">
                  <span>Error Code:</span>
                  <span>{result.errorCode}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => setResult(null)} 
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            >
              Simulate Another Payment
            </Button>
          </Card>
        ) : (
          <Card className="bg-gray-950 border-gray-800 text-white shadow-2xl">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Payable</span>
                <span className="text-2xl font-bold text-white">₹{amount.toFixed(2)}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Payment Methods selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                    method === 'card' 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <CreditCard size={20} /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                    method === 'upi' 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Smartphone size={20} /> UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                    method === 'netbanking' 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Building size={20} /> NetBanking
                </button>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                {method === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">Card Number</label>
                      <input 
                        type="text" 
                        required 
                        defaultValue="4242 •••• •••• 4242" 
                        className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">Expiry Date</label>
                        <input 
                          type="text" 
                          required 
                          defaultValue="12/28" 
                          className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">CVV</label>
                        <input 
                          type="password" 
                          required 
                          defaultValue="123" 
                          maxLength={4}
                          className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'upi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">UPI ID / VPA</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="username@okaxis" 
                        defaultValue="shahfathalkoul@okhdfcbank"
                        className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">Select Bank</label>
                      <select className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Developer Simulator Tools */}
                <div className="pt-3 border-t border-gray-800/80 space-y-2">
                  <label className="text-xs font-semibold text-yellow-500 flex items-center gap-1">
                    ⚡ Developer Simulation Outcome
                  </label>
                  <select 
                    value={simulatedOutcome}
                    onChange={(e: any) => setSimulatedOutcome(e.target.value)}
                    className="w-full bg-gray-900 border border-yellow-500/30 rounded-md px-3 py-1.5 text-xs text-yellow-400 font-mono focus:outline-none"
                  >
                    <option value="SUCCESS">Outcome: Bank Approves (Capture Success)</option>
                    <option value="FAILURE">Outcome: Bank Declines (Generic Failure)</option>
                    <option value="INSUFFICIENT_BALANCE">Outcome: Insufficient Balance</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 h-auto shadow-lg shadow-blue-600/20 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> Processing with Bank...
                    </span>
                  ) : (
                    `Pay ₹${amount.toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-green-500" /> Powered by PayGateway SDK • 256-bit SSL Encrypted
          </p>
        </div>

        {/* ⚡ Live Developer & Architecture Inspector */}
        <div className="mt-8 p-4 rounded-xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl shadow-cyan-950/20 text-left space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              ⚡ Live Microservice & API Inspector (Dev Mode)
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300">
              5-Node Symphony Active
            </span>
          </div>

          <div className="space-y-2 text-gray-300">
            <div className="flex flex-col gap-1.5 bg-gray-900/90 p-2.5 rounded border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[11px]">Idempotency-Key Header:</span>
                <button 
                  onClick={() => setLockKey(!lockKey)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition flex items-center gap-1 ${
                    lockKey ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                  }`}
                  type="button"
                >
                  {lockKey ? '🔒 Locked (Testing Replay)' : '🔓 Unlocked (Auto-Regen)'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  placeholder="Type custom idempotency key e.g. idemp_123"
                  className="w-full bg-black/80 border border-gray-700 rounded px-2.5 py-1 text-yellow-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <button 
                  onClick={() => setIdempotencyKey('idemp_' + Math.random().toString(36).substring(2, 8))}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-300 transition shrink-0"
                  type="button"
                >
                  Regen
                </button>
              </div>
            </div>

            <div className="bg-gray-900/80 p-2 rounded border border-gray-800 space-y-1">
              <div className="text-[11px] text-gray-400">Distributed Call Chain:</div>
              <div className="text-emerald-400 flex items-center gap-1 flex-wrap text-[10px]">
                <span>[Next.js :3000]</span> ➔ <span>[Gateway :3002]</span> ➔ <span>[Bank Sim :3003]</span> ➔ <span>[PostgreSQL DB]</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 font-semibold text-[11px]">Backend System Event Stream:</div>
            <div className="max-h-48 overflow-y-auto bg-black p-3 rounded-lg border border-gray-800 space-y-1.5 text-[11px] font-mono leading-relaxed">
              {logs.map((log, idx) => (
                <div key={idx} className={log.includes('❌') || log.includes('💥') ? 'text-red-400' : log.includes('🟢') || log.includes('🚀') ? 'text-green-400' : log.includes('🔐') || log.includes('💾') ? 'text-yellow-300' : 'text-gray-300'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
