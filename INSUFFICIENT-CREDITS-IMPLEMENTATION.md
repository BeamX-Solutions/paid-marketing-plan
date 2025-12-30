# Insufficient Credits Modal - Implementation Summary

## Changes Made

### File: `src/app/questionnaire/page.tsx`

#### 1. Imports Added
```typescript
import InsufficientCreditsModal from '@/components/credits/InsufficientCreditsModal';
```

#### 2. State Variables Added
```typescript
const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
const [creditInfo, setCreditInfo] = useState({ required: 50, available: 0 });
```

#### 3. Error Handling Updated
```typescript
// In generateMarketingPlan function
const generateResponse = await fetch(`/api/plans/${plan.id}/generate`, {
  method: 'POST'
});

// Handle insufficient credits (HTTP 402)
if (generateResponse.status === 402) {
  const errorData = await generateResponse.json();
  setCreditInfo({
    required: errorData.creditsRequired || 50,
    available: errorData.creditsAvailable || 0
  });
  setShowInsufficientCreditsModal(true);
  setIsGenerating(false);
  return; // Stop generation
}
```

#### 4. Modal Component Added to JSX
```typescript
<InsufficientCreditsModal
  isOpen={showInsufficientCreditsModal}
  onClose={() => setShowInsufficientCreditsModal(false)}
  creditsRequired={creditInfo.required}
  creditsAvailable={creditInfo.available}
/>
```

---

## User Flow

### Before (Without Modal)
1. User completes questionnaire
2. Clicks "Generate Plan"
3. If insufficient credits:
   - Generic error: "Failed to generate plan"
   - No information about credits
   - No clear path to purchase

### After (With Modal)
1. User completes questionnaire
2. Clicks "Generate Plan"
3. If insufficient credits (< 50):
   - ✅ Loading spinner stops
   - ✅ Professional modal appears
   - ✅ Shows exact credit breakdown:
     - Required: 50 credits
     - Available: [X] credits
     - Need: [X] more credits
   - ✅ Shows pricing info
   - ✅ "Purchase Credits" button → redirects to /dashboard
   - ✅ "Cancel" button → closes modal, stays on questionnaire

---

## Complete Flow Diagram

```
User Journey: Generate Marketing Plan
═══════════════════════════════════════

START: User on last question
    │
    ├─> Click "Generate My Marketing Plan"
    │
    ├─> Loading spinner appears
    │   "Generating Your Marketing Plan..."
    │
    ├─> POST /api/plans/create (Creates plan record)
    │   └─> Success: Plan created with ID
    │
    ├─> POST /api/plans/[id]/generate
    │   │
    │   ├─> Server checks credits
    │   │   └─> hasSufficientCredits(userId, 50)
    │   │
    │   ├─> CASE 1: Sufficient Credits (≥50)
    │   │   ├─> Deduct 50 credits
    │   │   ├─> Generate plan with Claude AI
    │   │   ├─> Save to database
    │   │   └─> Redirect to /plan/[id]
    │   │       └─> ✅ SUCCESS
    │   │
    │   └─> CASE 2: Insufficient Credits (<50)
    │       ├─> NO credits deducted
    │       ├─> Return HTTP 402 with:
    │       │   {
    │       │     error: "Insufficient credits",
    │       │     creditsRequired: 50,
    │       │     creditsAvailable: [X],
    │       │     purchaseUrl: "/dashboard"
    │       │   }
    │       │
    │       ├─> Frontend receives 402
    │       ├─> Stop loading spinner
    │       ├─> Show InsufficientCreditsModal
    │       │   ┌────────────────────────────┐
    │       │   │  ⚠️  Insufficient Credits  │
    │       │   │                            │
    │       │   │  Required:  50 credits     │
    │       │   │  Available: [X] credits    │
    │       │   │  Need:      [X] credits    │
    │       │   │                            │
    │       │   │  💰 100 credits for $100   │
    │       │   │                            │
    │       │   │  [Cancel] [Purchase]       │
    │       │   └────────────────────────────┘
    │       │
    │       └─> User Options:
    │           ├─> Click "Cancel"
    │           │   └─> Close modal
    │           │       └─> Stay on questionnaire
    │           │           └─> Can update answers
    │           │               └─> Try again later
    │           │
    │           └─> Click "Purchase Credits"
    │               └─> Redirect to /dashboard
    │                   └─> See credit purchase options
    │                       └─> Complete purchase
    │                           └─> Return to questionnaire
    │                               └─> Generate plan ✅

END
```

---

## Testing Instructions

### Test Setup
```bash
# 1. Set test user to have insufficient credits
node scripts/set-test-credits.js chimaobi@beamxsolutions.com 25

# 2. Start dev server (if not running)
npm run dev
```

### Manual Test Steps

1. **Login** at http://localhost:3002
   - Email: chimaobi@beamxsolutions.com
   - Password: [your password]

2. **Start New Plan**
   - Click "Create New Marketing Plan"
   - Or navigate to /questionnaire

3. **Answer Questions**
   - Fill out the questionnaire
   - Answer all questions through all 9 squares

4. **Generate Plan** (Last Question)
   - Click "Generate My Marketing Plan"
   - Watch for loading spinner

5. **Expected Result**
   - ✅ Loading spinner appears briefly
   - ✅ Modal pops up with:
     ```
     Insufficient Credits

     You need 50 credits to generate this marketing plan,
     but you only have 25 credits available.

     Required:  50 credits
     Available: 25 credits
     ────────────────────
     Need:      25 more credits

     💰 Credit Package
     100 credits for $100
     Generate 2 marketing plans
     Valid for 12 months

     [Cancel] [Purchase Credits]
     ```

6. **Test Actions**
   - **Test Cancel**: Click "Cancel"
     - ✅ Modal closes
     - ✅ Returns to questionnaire
     - ✅ Can still navigate/edit answers

   - **Test Purchase**: Click "Purchase Credits"
     - ✅ Redirects to /dashboard
     - ✅ Shows credit purchase options

---

## Verification Checklist

- [ ] Modal appears when user has < 50 credits
- [ ] Modal does NOT appear when user has ≥ 50 credits
- [ ] Modal shows correct credit amounts
- [ ] Modal shows correct shortfall calculation
- [ ] "Cancel" button closes modal
- [ ] "Purchase Credits" button redirects to /dashboard
- [ ] Loading spinner stops when modal appears
- [ ] No credits are deducted when insufficient
- [ ] User can return to questionnaire after canceling
- [ ] User's questionnaire answers are preserved

---

## Error Scenarios

### Scenario 1: User with 0 Credits
```
Required:  50 credits
Available: 0 credits
Need:      50 more credits
```

### Scenario 2: User with Partial Credits
```
Required:  50 credits
Available: 25 credits
Need:      25 more credits
```

### Scenario 3: User with Almost Enough
```
Required:  50 credits
Available: 49 credits
Need:      1 more credit
```

### Scenario 4: User with Exact Amount
```
✅ Generates successfully
No modal shown
Credits deducted: 50
```

---

## API Response Examples

### Success (200 OK)
```json
{
  "success": true,
  "plan": { ... },
  "processingTime": 12345,
  "creditsCharged": 50
}
```

### Insufficient Credits (402 Payment Required)
```json
{
  "error": "Insufficient credits",
  "message": "You need 50 credits to generate a plan. You have 25 credits.",
  "creditsRequired": 50,
  "creditsAvailable": 25,
  "purchaseUrl": "/dashboard"
}
```

### Other Errors (500 Internal Server Error)
```json
{
  "error": "Failed to generate plan",
  "details": "Error message here"
}
```

---

## Code Location Reference

**Frontend Logic:**
- File: `src/app/questionnaire/page.tsx`
- Function: `generateMarketingPlan()`
- Lines: 159-169 (402 handling)

**Backend Logic:**
- File: `src/app/api/plans/[id]/generate/route.ts`
- Lines: 47-61 (credit check)

**Modal Component:**
- File: `src/components/credits/InsufficientCreditsModal.tsx`

**Credit Service:**
- File: `src/lib/credits/creditService.ts`
- Function: `hasSufficientCredits()`

---

## Related Features

### Auto-Save
- Questionnaire answers are auto-saved to localStorage
- Users can return and continue later
- No data loss on insufficient credits error

### Progress Preservation
- All answered questions remain saved
- Modal doesn't reset questionnaire state
- User can cancel and continue answering

### Return to Dashboard Button
- Added to questionnaire header
- Allows users to leave and return
- Confirms before leaving if progress made

---

## Future Enhancements

### Possible Improvements:
1. Show credit balance in questionnaire header
2. Pre-check credits before starting questionnaire
3. Show credit estimate before final question
4. Add "Buy Credits" link in questionnaire header
5. Show notification if credits are low

---

## Security Features

✅ **Credit Check Before Deduction**
- Credits checked BEFORE any deduction
- No charge if insufficient

✅ **Transaction Safety**
- All credit operations atomic
- Automatic refund if generation fails

✅ **Validation**
- Zod schema validation
- Amount limits enforced (-10,000 to +10,000)

✅ **Rate Limiting**
- Credit operations: 10 per minute
- Prevents abuse

---

## Summary

The insufficient credits modal is now fully integrated into the questionnaire flow. Users with insufficient credits will see a professional, informative modal that:

1. ✅ Prevents frustration (clear messaging)
2. ✅ Provides transparency (exact amounts shown)
3. ✅ Enables action (easy purchase path)
4. ✅ Protects users (no credits deducted)
5. ✅ Maintains context (questionnaire preserved)

**Status:** ✅ READY FOR TESTING
