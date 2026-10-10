"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Save, ShieldCheck } from 'lucide-react';

const MERCHANT_SERVICE_URL = process.env.NEXT_PUBLIC_MERCHANT_SERVICE_URL || 'http://localhost:3001';
const DEMO_EMAIL = 'merchant1@acme-electronics.com';
const DEMO_PASSWORD = 'Merchant@123';

const EMPTY_PROFILE = {
  businessName: '',
  businessUrl: '',
  webhookUrl: '',
  webhookSecret: '',
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

export default function ProfilePage() {
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const accessToken = await getAccessToken();
        const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/dashboard/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        const payload = await res.json();
        if (!res.ok || !payload?.success) {
          throw new Error(payload?.error?.message || 'Failed to load profile');
        }

        const profile = payload.data;
        setForm({
          businessName: profile.businessName || '',
          businessUrl: profile.businessUrl || '',
          webhookUrl: profile.webhookUrl || '',
          webhookSecret: profile.webhookSecret || '',
        });
      } catch (error) {
        console.error('Error loading merchant profile:', error);
        setMessage(error instanceof Error ? error.message : 'Unable to load merchant profile');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const onChange = (field: keyof typeof EMPTY_PROFILE, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          businessName: form.businessName,
          businessUrl: form.businessUrl,
          webhookUrl: form.webhookUrl,
          webhookSecret: form.webhookSecret,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Unable to save merchant profile');
      }

      setMessage('Profile updated successfully.');
    } catch (error) {
      console.error('Error saving merchant profile:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to save merchant profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col p-8 w-full max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--midnight-navy)]">Merchant Profile</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Update your merchant identity and webhook configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--royal-blue)]" />
            <CardTitle>Business Details</CardTitle>
          </div>
          <CardDescription>
            This information appears on checkout, settlement reports, and webhook delivery metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(event) => onChange('businessName', event.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--midnight-navy)] shadow-sm focus:border-[var(--royal-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Business Website</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 shadow-sm focus-within:border-[var(--royal-blue)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="url"
                value={form.businessUrl}
                onChange={(event) => onChange('businessUrl', event.target.value)}
                disabled={loading}
                placeholder="https://www.acme-electronics.com"
                className="w-full bg-transparent text-sm text-[var(--midnight-navy)] placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Webhook URL</label>
            <input
              type="url"
              value={form.webhookUrl}
              onChange={(event) => onChange('webhookUrl', event.target.value)}
              disabled={loading}
              placeholder="https://your-app.example.com/webhooks/payments"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--midnight-navy)] shadow-sm focus:border-[var(--royal-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Webhook Secret</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 shadow-sm focus-within:border-[var(--royal-blue)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <ShieldCheck className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="password"
                value={form.webhookSecret}
                onChange={(event) => onChange('webhookSecret', event.target.value)}
                disabled={loading}
                placeholder="Paste or rotate a webhook signing secret"
                className="w-full bg-transparent text-sm text-[var(--midnight-navy)] placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>Webhook delivery and signature verification are enabled when a valid URL and secret are saved.</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="min-h-6 text-sm text-[var(--midnight-navy)]">{message}</div>
            <Button onClick={onSave} disabled={loading || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
