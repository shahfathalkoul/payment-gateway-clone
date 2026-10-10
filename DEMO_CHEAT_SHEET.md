# Demo Cheat Sheet

## Quick Test Cases

### ✅ Test 1: Normal Success
```
1. Go to /checkout
2. Set simulation: "Success"
3. Key: Auto-regen (unlocked)
4. Click Pay
→ Result: New payment, new Transaction ID
```

### ❌ Test 2: Payment Failure
```
1. Set simulation: "Insufficient Balance"
2. Click Pay
→ Result: Red failure screen, error code
```

### 🛡️ Test 3: Idempotency Replay (THE KEY FEATURE)
```
1. Lock key: Click 🔓 → 🔒
2. Click Pay (1st time)
   → Note Transaction ID: pay_abc123
3. Click Pay again (same key)
   → SAME Transaction ID: pay_abc123
   → Message: "Idempotency protection prevented double charge!"
```

### ⚡ Test 4: Rapid Clicks
```
1. Keep key locked
2. Click Pay 5 times rapidly
→ All show same Transaction ID
→ Only 1 charge
```

### 🔄 Test 5: New Payment
```
1. Click "Regen" button
2. Key changes to new value
3. Click Pay
→ NEW Transaction ID
```

---

## Script for Demo

### Opening
"This is a production-grade payment gateway that demonstrates idempotency protection, reliable webhooks, and automated settlements."

### Idempotency Demo
"The key feature is idempotency - preventing duplicate charges. Watch:

1. I make a normal payment → It succeeds with Transaction ID pay_abc123
2. Now I lock the idempotency key (simulates network retry)
3. I click Pay again with the SAME key
4. The system detects the replay and returns the cached result
5. **No double charge to the card**
6. Message says: 'Idempotency protection prevented double charge!'

This is what prevents accidental double-charges in production when networks retry requests."

---

## What Each Simulation Does

| Simulation | What It Tests | Expected Outcome |
|------------|---------------|------------------|
| Success | Normal flow | Payment succeeds |
| Failure | Generic decline | Payment fails |
| Insufficient Balance | Specific error | Payment fails with specific code |

---

## Key Indicators

- **⚠️ Demo Mode badge**: Backend offline, using simulation
- **🔒 Locked**: Key won't auto-regenerate (for testing replay)
- **🔓 Auto-regen**: Key changes after each payment (normal behavior)
- **"Idempotency protection prevented double charge!"**: Replay detected
- **Same Transaction ID**: Cached result returned

---

## Common Mistakes to Avoid

❌ Don't forget to lock the key before testing replay
❌ Don't expect different Transaction IDs with same locked key
❌ Don't be confused by "Demo Mode" - it's intentional for easy testing

✅ Always note the Transaction ID before testing replay
✅ Click "Regen" when you want a fresh payment
✅ Explain what each simulation does before clicking

---

## 30-Second Demo

```
1. "This payment gateway prevents double charges"
2. "Watch: I make a payment, it succeeds"
3. "Now I lock the idempotency key"
4. "I click Pay again with the same key"
5. "See? Same Transaction ID, no double charge"
6. "That's idempotency in action"
```
