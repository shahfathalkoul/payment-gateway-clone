# PayGateway Project Demo Guide

## 📋 Table of Contents
1. [What This Project Does](#what-this-project-does)
2. [Demo Mode vs Real Backend](#demo-mode-vs-real-backend)
3. [Payment Success Scenarios](#payment-success-scenarios)
4. [Payment Failure Scenarios](#payment-failure-scenarios)
5. [Idempotency Scenarios](#idempotency-scenarios)
6. [How to Demonstrate Each Case](#how-to-demonstrate-each-case)
7. [Architecture Overview](#architecture-overview)

---

## What This Project Does

This is a **production-grade payment gateway ecosystem** that demonstrates:

- **Idempotency Protection**: Prevents duplicate charges when the same payment request is sent multiple times
- **Webhook Reliability**: Ensures merchants receive payment notifications reliably (transactional outbox pattern)
- **Automated Settlements**: Daily batch processing that calculates fees and transfers money to merchants
- **Double-Entry Accounting**: Audit-proof financial ledger tracking all money movements

---

## Demo Mode vs Real Backend

### Demo Mode (Current State)
- **What it is**: The frontend simulates payments without connecting to backend microservices
- **Why it exists**: For easy testing/demonstration without needing to run 5+ microservices, PostgreSQL, Redis
- **How it works**: Client-side JavaScript simulates the payment flow
- **Indicators**: Yellow badge "⚠️ Demo Mode - Backend Offline" at top of checkout page

### Real Backend Mode
- **What it is**: Frontend connects to actual microservices (payment gateway, bank simulator, etc.)
- **What it does**: Real database transactions, real API calls, real webhook dispatching
- **Requirements**: All 5 microservices running + PostgreSQL + Redis
- **How to enable**: Run `npm run dev` from root (starts all services)

---

## Payment Success Scenarios

### Scenario 1: Normal Successful Payment
**When it happens**: Customer has sufficient funds, bank approves transaction

**What you see**:
- Green checkmark "Payment Successful!"
- Transaction ID (e.g., `pay_abc123`)
- ARN (Acquirer Reference Number) from bank
- Message: "Payment successful (demo mode)"

**Behind the scenes**:
1. Payment created in database with status `CREATED`
2. Bank authorization requested
3. Payment status updated to `CAPTURED`
4. Webhook event queued for merchant notification
5. Ledger entry created (debit customer, credit merchant pending)

### Scenario 2: Idempotency Replay (Same Key, Second Attempt)
**When it happens**: Same payment request sent twice with same idempotency key

**What you see**:
- **Blue shield icon** "Payment Replay Detected" (different from green success)
- **Blue info box**: "Same idempotency key was used. Returned cached result without charging card again."
- **Same Transaction ID** as first attempt
- In dashboard: Blue "Replay (Cached)" badge, row highlighted in blue, ↻ symbol next to ID
- No new charge to customer's card

**Behind the scenes**:
1. System checks idempotency key in database
2. Finds existing payment with this key
3. Returns cached result immediately
4. **No new payment created**
5. **No charge to card**

---

## Payment Failure Scenarios

### Scenario 1: Insufficient Balance
**When it happens**: Customer doesn't have enough money in their account

**What you see**:
- Red X "Payment Failed"
- Error code: `ERR_INSUFFICIENT_FUNDS`
- Message: "Insufficient balance in your account"

**Behind the scenes**:
1. Bank rejects transaction due to low balance
2. Payment status set to `FAILED`
3. No charge to card
4. Webhook sent to merchant about failure

### Scenario 2: Generic Bank Decline
**When it happens**: Bank declines for other reasons (fraud, expired card, etc.)

**What you see**:
- Red X "Payment Failed"
- Error code: `ERR_DECLINED`
- Message: "Transaction declined by bank"

**Behind the scenes**:
1. Bank rejects transaction
2. Payment status set to `FAILED`
3. No charge to card
4. Webhook sent to merchant about failure

### Scenario 3: Idempotency Replay of Failed Payment
**When it happens**: Same failed payment request sent again with same idempotency key

**What you see**:
- Red X "Payment Failed"
- **Same Transaction ID** as first failed attempt
- Message: "Idempotency replay: returning cached failure"

**Behind the scenes**:
1. System checks idempotency key
2. Finds existing failed payment
3. Returns cached failure result
4. No new attempt to charge card

---

## Idempotency Scenarios

### What is Idempotency?
**Definition**: An operation is idempotent if making the same request multiple times produces the same result as making it once.

**In Payments**: If you accidentally send the same payment request twice (network retry, user double-click, etc.), the system should only charge the card once.

### Scenario 1: First Payment (New Key)
**Setup**:
- Idempotency key: `idemp_abc123` (auto-generated)
- Key status: 🔓 Auto-regen (unlocked)

**Action**: Click "Pay"

**Result**:
- ✅ New payment created
- ✅ Card charged
- ✅ Key auto-regenerated to `idemp_xyz789`
- ✅ Next payment will use new key

**Demonstration script**:
> "Watch as I make a payment. The system auto-generates a unique idempotency key. After the payment, the key automatically regenerates so the next payment gets a new key."

### Scenario 2: Replay Protection (Locked Key)
**Setup**:
- Lock the key: Click 🔓 → 🔒 Locked
- Key: `idemp_abc123` (now locked)

**Action**: Click "Pay" (first time with this key)

**Result**:
- ✅ New payment created: `pay_first123`
- ✅ Card charged
- ✅ Key stays `idemp_abc123` (doesn't regenerate)

**Action**: Click "Pay" again (same key)

**Result**:
- ✅ **NO new payment created**
- ✅ **NO charge to card**
- ✅ Returns cached result: `pay_first123`
- ✅ Message: "Idempotency protection prevented double charge!"

**Demonstration script**:
> "Now I'll lock the idempotency key. This simulates what happens if the same payment request is sent twice - maybe due to a network retry or user double-clicking. Watch: I make the payment once, it succeeds. Now I click Pay again with the SAME key. The system detects it's a replay and returns the cached result WITHOUT charging the card again. This is idempotency in action!"

### Scenario 3: Multiple Simultaneous Requests
**Setup**:
- Lock the key: 🔒 Locked
- Key: `idemp_abc123`

**Action**: Click "Pay" 3-4 times rapidly

**Result**:
- ✅ First click: Creates payment `pay_first123`
- ✅ Subsequent clicks: All return `pay_first123`
- ✅ Only 1 charge to card
- ✅ All show: "Idempotency protection prevented double charge!"

**Demonstration script**:
> "If the user clicks Pay multiple times rapidly, or if the system retries due to network issues, idempotency ensures only one charge. Watch me click Pay 5 times rapidly - only the first creates a payment, the rest return the cached result."

### Scenario 4: Fresh Payment After Replay
**Setup**:
- Key is locked from previous scenario
- Previous payment: `pay_first123`

**Action**: Click "Regen" button (or unlock and re-lock)

**Result**:
- ✅ New key generated: `idemp_new456`
- ✅ Next payment will create new transaction

**Action**: Click "Pay" with new key

**Result**:
- ✅ New payment created: `pay_second789`
- ✅ Card charged again

**Demonstration script**:
> "When we want to make a NEW payment, we need a NEW idempotency key. I'll regenerate the key, and now the next payment will create a new transaction."

---

## How to Demonstrate Each Case

### 🎯 Demo 1: Normal Payment Flow
```
1. Go to /checkout
2. Verify "Demo Mode" badge is visible
3. Select "Card" payment method
4. Set amount: ₹1499
5. Set simulation: "Success - Approve payment"
6. Click "Pay ₹1499"
7. Show: Green success screen with Transaction ID
8. Explain: "This is a normal successful payment"
```

### 🎯 Demo 2: Payment Failure
```
1. Click "Try Another Payment"
2. Set simulation: "Insufficient Balance"
3. Click "Pay ₹1499"
4. Show: Red failure screen with error code
5. Explain: "This simulates when customer has no money"
```

### 🎯 Demo 3: Idempotency Protection (The Key Feature)
```
1. Click "Try Another Payment"
2. Set simulation: "Success - Approve payment"
3. In Developer Tools, click "🔓 Auto-regen" → "🔒 Locked"
4. Explain: "Locking the key simulates replay scenario"
5. Click "Pay ₹1499" (first time)
6. Show: Success with Transaction ID: pay_abc123
7. Note the Transaction ID
8. Click "Pay ₹1499" again (same key)
9. Show: Same Transaction ID pay_abc123
10. Show message: "Idempotency protection prevented double charge!"
11. Explain: "Same key, same result, NO double charge"
```

### 🎯 Demo 4: Multiple Rapid Clicks
```
1. With key still locked
2. Click "Pay" 5 times rapidly
3. Show: All show same Transaction ID
4. Explain: "Even with rapid retries, only 1 charge"
```

### 🎯 Demo 5: New Payment After Replay
```
1. Click "Regen" button in Developer Tools
2. Key changes to new value
3. Click "Pay"
4. Show: NEW Transaction ID
5. Explain: "New key = new payment"
```

---

## Architecture Overview

### Microservices
```
┌─────────────────────────────────────────────────────────┐
│                    PayGateway Ecosystem                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Next.js    │    │  Express     │                  │
│  │  Dashboard   │    │  Merchant    │                  │
│  │   :3000      │◄──►│  Service    │                  │
│  └──────────────┘    │   :3001      │                  │
│                      └──────────────┘                  │
│                             │                           │
│                      ┌──────┴──────┐                  │
│                      │             │                   │
│               ┌──────▼─────┐  ┌───▼────────┐          │
│               │  Payment   │  │  Bank      │          │
│               │  Gateway   │  │ Simulator  │          │
│               │   :3002    │  │   :3003    │          │
│               └──────┬─────┘  └────────────┘          │
│                      │                                  │
│               ┌──────▼─────┐                          │
│               │ Settlement  │                          │
│               │  Service   │                          │
│               │   :3004    │                          │
│               └──────┬─────┘                          │
│                      │                                  │
│              ┌───────┴─────────┐                       │
│              │                 │                       │
│         ┌────▼────┐      ┌────▼────┐                 │
│         │PostgreSQL│      │  Redis  │                 │
│         │  :5432   │      │  :6379  │                 │
│         └──────────┘      └─────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow for a Payment
```
1. Customer clicks "Pay" on checkout page
   ↓
2. Next.js sends POST to Payment Gateway (:3002)
   ↓
3. Payment Gateway checks idempotency key in PostgreSQL
   ↓
4. If key exists → Return cached result (REPLAY)
   If key new → Create new payment
   ↓
5. Payment Gateway calls Bank Simulator (:3003)
   ↓
6. Bank Simulator returns (SUCCESS/FAILURE)
   ↓
7. Payment Gateway updates payment status
   ↓
8. Payment Gateway writes event to Outbox table
   ↓
9. BullMQ worker reads Outbox and sends webhook to merchant
   ↓
10. Settlement Service (:3004) runs daily batch job
    ↓
11. Calculates fees (2% gateway + 18% GST)
    ↓
12. Transfers net amount to merchant's bank account
```

### Key Tables in Database
- **payments**: All payment transactions
- **idempotency_keys**: Maps keys to payment results
- **transactions**: Double-entry ledger entries
- **webhooks**: Merchant webhook endpoints
- **webhook_events**: Individual webhook delivery attempts
- **settlements**: Daily batch settlement records
- **outbox_events**: Events pending delivery (reliability pattern)

---

## Quick Reference: Test Matrix

| Test Case | Key Status | Simulation | Expected Result | Transaction ID |
|-----------|------------|------------|----------------|----------------|
| Normal payment | Auto-regen | Success | New payment | New ID |
| Normal payment | Auto-regen | Failure | Failed | New ID |
| Replay (2nd attempt) | Locked | Success | Cached result | Same ID |
| Replay (2nd attempt) | Locked | Failure | Cached failure | Same ID |
| Multiple rapid clicks | Locked | Success | All cached | Same ID |
| New payment after replay | Regenerated | Success | New payment | New ID |

---

## Common Questions & Answers

**Q: Why do we need idempotency?**
A: In distributed systems, network failures can cause retries. Without idempotency, a retry could charge the customer twice. This protects against that.

**Q: How long does the idempotency key last?**
A: In this demo, it lasts until you regenerate it. In production, keys typically expire after 24-48 hours.

**Q: What if I accidentally lock the key and can't make new payments?**
A: Just click "Regen" or "🔒 Locked" to unlock it. A new key will be generated.

**Q: Does this work with real banks?**
A: The concept is the same. In production, instead of the Bank Simulator, you'd integrate with Stripe, Razorpay, or actual bank APIs.

**Q: What's the "Demo Mode" badge?**
A: It means the backend microservices aren't running, so the frontend is simulating the payment flow. This is for easy testing without needing to run the full stack.

---

## Summary for Your Audience

**"This project demonstrates a production-grade payment gateway with three key features:"**

1. **Idempotency Protection**: Prevents duplicate charges when the same payment request is sent multiple times (network retries, user double-clicks, etc.)

2. **Reliable Webhooks**: Ensures merchants always receive payment notifications using the transactional outbox pattern

3. **Automated Settlements**: Daily batch processing that calculates fees and transfers money to merchants

**"The key innovation is idempotency - watch as I lock the idempotency key and make the same payment request twice. The system detects the replay and returns the cached result WITHOUT charging the card again. This prevents accidental double-charges in production systems."**
