"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Key, Plus, RefreshCcw, ShieldCheck, Trash2 } from 'lucide-react';

const MERCHANT_SERVICE_URL = process.env.NEXT_PUBLIC_MERCHANT_SERVICE_URL || 'http://localhost:3001';
const DEMO_EMAIL = 'merchant1@acme-electronics.com';
const DEMO_PASSWORD = 'Merchant@123';

type ApiKeyRecord = {
  id: string;
  name: string;
  mode: 'test' | 'live';
  prefix: string;
  isActive: boolean;
  createdAt: string;
};

async function getAccessToken() {
  const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    cache: 'no-store',
  });

  const payload = await res.json();
  if (!res.ok || !payload?.success || !payload?.data?.accessToken) {
    throw new Error(payload?.error?.message || 'Unable to authenticate merchant dashboard');
  }

  return payload.data.accessToken as string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generatingMode, setGeneratingMode] = useState<'test' | 'live'>('test');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/api-keys`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Failed to load API keys');
      }

      setKeys(payload.data ?? []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKeys();
  }, []);

  const createKey = async () => {
    setCreating(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ mode: generatingMode, name: `${generatingMode.toUpperCase()} dashboard key` }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Unable to generate API key');
      }

      setNewKeyValue(payload.data?.rawKey ?? null);
      await loadKeys();
      setMessage('A new API key was generated. Copy it now because it is only displayed once.');
    } catch (error) {
      console.error('Error creating API key:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to generate API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/api-keys/${id}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Unable to revoke API key');
      }

      setMessage('API key has been revoked.');
      await loadKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to revoke API key');
    }
  };

  const copyText = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard.');
  };

  return (
    <div className="flex flex-col p-8 w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--midnight-navy)]">API Keys & Webhooks</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Manage secure credentials for your payment integrations and webhook delivery.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-[var(--royal-blue)]" />
            <CardTitle>API Credentials</CardTitle>
          </div>
          <CardDescription>
            Generate keys for backend requests. Secret keys are never returned again after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--midnight-navy)]">Generate</label>
              <select
                value={generatingMode}
                onChange={(event) => setGeneratingMode(event.target.value as 'test' | 'live')}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--midnight-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </div>
            <Button onClick={createKey} disabled={creating}>
              <Plus className="mr-2 h-4 w-4" />
              {creating ? 'Generating…' : 'Generate new key'}
            </Button>
          </div>

          {newKeyValue ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">New Secret Key</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newKeyValue}
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-mono text-slate-800"
                />
                <Button variant="outline" size="icon" onClick={() => void copyText(newKeyValue)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading API keys…</div>
            ) : keys.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-500">No API keys created yet.</div>
            ) : (
              keys.map((key) => (
                <div key={key.id} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--midnight-navy)]">{key.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">{key.mode}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-500">{key.prefix}••••••••</div>
                    <div className="mt-1 text-xs text-slate-500">{key.isActive ? 'Active' : 'Revoked'} • created {new Date(key.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copyText(key.prefix)}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy prefix
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void revokeKey(key.id)} disabled={!key.isActive}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="min-h-6 text-sm text-[var(--midnight-navy)]">{message}</div>
            <Button variant="outline" onClick={() => void loadKeys()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure where payment lifecycle events are sent and how the signature is verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Webhook Endpoint URL</label>
            <input
              type="url"
              placeholder="https://your-app.example.com/webhooks/payments"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--midnight-navy)] shadow-sm focus:border-[var(--royal-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Webhook Signing Secret</label>
            <input
              type="password"
              placeholder="whsec_..."
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--midnight-navy)] shadow-sm focus:border-[var(--royal-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
