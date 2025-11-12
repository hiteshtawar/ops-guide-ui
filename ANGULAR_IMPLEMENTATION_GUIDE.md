# Angular Implementation Guide - Step Dependencies & Enhancements

This document outlines the changes made to the React implementation that need to be replicated in the Angular version.

## Overview

Three main enhancements were implemented:
1. **Step Dependencies**: Steps are disabled if any previous step fails
2. **Role Header Support**: Role name is extracted from JWT and passed to backend
3. **JSON Message Parsing**: Messages are parsed from JSON responses and displayed as readable strings

---

## 1. Step Dependencies

### Requirement
If any step fails, all subsequent steps (in the same group and later groups) should be disabled from execution.

### Implementation Details

#### Helper Function: `hasPreviousStepFailed()`

This function checks if any previous step has failed by:
- Checking all steps before the current step in the same group
- Checking all steps in previous groups (following order: prechecks → procedure → postchecks → rollback)

**TypeScript Interface:**
```typescript
hasPreviousStepFailed(
  stepIndex: number, 
  stepGroup: string, 
  response: ClassificationResponse
): boolean
```

**Logic:**
1. Check all steps in the same group before the current step index
2. If current group is not the first group, check all steps in all previous groups
3. Return `true` if any previous step has status `'FAILED'`

**Group Order:**
```typescript
const groupOrder = ['prechecks', 'procedure', 'postchecks', 'rollback']
```

#### UI Changes

In the step rendering component:
- Calculate `hasPreviousFailed` using the helper function
- Set `isDisabled = hasPreviousFailed && !stepExecution`
- Apply `disabled` attribute to buttons when `isDisabled` is true
- Add visual styling (opacity: 0.5, cursor: 'not-allowed') for disabled state
- Show "⏸ Blocked by previous failure" message when disabled

**Example:**
```typescript
const hasPreviousFailed = hasPreviousStepFailed(idx, stepGroup, response)
const isDisabled = hasPreviousFailed && !stepExecution

<button
  [disabled]="isDisabled"
  [style.opacity]="isDisabled ? 0.5 : 1"
  [style.cursor]="isDisabled ? 'not-allowed' : 'pointer'"
>
  Run
</button>
```

---

## 2. Role Header Support

### Requirement
Extract the role name from the JWT token and pass it as `roleName` in the step execution request. The backend will use this to set the "Role-Name" header when making API calls.

### Implementation Details

#### JWT Token Parsing

Extract role from JWT token payload:
1. Split the JWT token (format: `Bearer <token>`)
2. Decode the payload (second part of token, base64 decoded)
3. Extract the first role from the `roles` array
4. Convert snake_case to Title Case (e.g., `production_support` → `Production Support`)

**TypeScript Code:**
```typescript
const jwtToken = 'Bearer <your-token>'
const tokenParts = jwtToken.split(' ')
const token = tokenParts.length > 1 ? tokenParts[1] : jwtToken

let roleName = 'Production Support' // Default fallback
try {
  const payload = JSON.parse(atob(token.split('.')[1]))
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    const role = payload.roles[0]
    roleName = role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
} catch (e) {
  console.warn('Failed to parse JWT token for role extraction', e)
}
```

#### Request Body Update

Add `roleName` to the step execution request:

**Updated Interface:**
```typescript
interface StepExecutionRequest {
  taskId: string
  stepNumber: number
  entities: Record<string, string>
  userId: string
  authToken: string
  roleName?: string  // NEW FIELD
}
```

**Request Example:**
```typescript
const stepRequest = {
  taskId: response.taskId,
  stepNumber: step.stepNumber,
  entities: response.extractedEntities,
  userId: 'ops-engineer-test',
  authToken: jwtToken,
  roleName: roleName  // Include extracted role name
}
```

---

## 3. JSON Message Parsing

### Requirement
When step responses contain JSON strings (e.g., `{"message": "Case and it's materials will be canceled..."}`), parse them and display only the message string, not the raw JSON.

### Implementation Details

#### Helper Function: `parseMessage()`

This function parses JSON strings and extracts the message:

**TypeScript Code:**
```typescript
parseMessage(message: string | undefined): string {
  if (!message) return 'Completed'
  
  try {
    const parsed = JSON.parse(message)
    // If it's an object with a message property, return that
    if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
      return String(parsed.message)
    }
    // If it's already a string, return it
    return String(parsed)
  } catch {
    // If it's not JSON, return as is
    return message
  }
}
```

#### Usage in Step Execution

When processing step response:
```typescript
// Parse response body to extract message if it's JSON
let message = stepResponse.responseBody || 'Step completed'
if (stepResponse.responseBody) {
  try {
    const parsed = JSON.parse(stepResponse.responseBody)
    if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
      message = String(parsed.message)
    } else {
      message = stepResponse.responseBody
    }
  } catch {
    // Not JSON, use as is
    message = stepResponse.responseBody
  }
}
```

#### Usage in Display

When rendering step results:
```typescript
<div className="step-details">
  {parseMessage(stepExecution.result.message) || 
   stepExecution.result.data?.status || 
   'Completed'}
</div>
```

---

## File Changes Summary

### Modified Files

1. **`src/types.ts`**
   - Added `roleName?: string` to `StepExecutionRequest` interface

2. **`src/App.tsx`**
   - Added `hasPreviousStepFailed()` helper function
   - Added `parseMessage()` helper function
   - Updated `renderStepGroup()` to check dependencies and disable buttons
   - Updated `executeStep()` to extract role from JWT and parse JSON messages
   - Added disabled state styling and messaging

---

## Testing Checklist

- [ ] Step 1 fails → Step 2 and later steps are disabled
- [ ] Pre-check failure → Procedure and post-check steps are disabled
- [ ] Role name is correctly extracted from JWT token
- [ ] Role name is passed in step execution request
- [ ] JSON messages are parsed and displayed as strings
- [ ] Non-JSON messages are displayed as-is
- [ ] Disabled buttons have proper visual styling
- [ ] "Blocked by previous failure" message appears when appropriate

---

## Backend Integration Notes

The backend should:
1. Accept `roleName` in the step execution request body
2. Use `roleName` to set the `Role-Name` header when making API calls to external services
3. Return `responseBody` as JSON string when the API response contains a message object

---

## Example Scenarios

### Scenario 1: Step Failure Blocks Subsequent Steps
```
Step 1 (Pre-check): FAILED ❌
Step 2 (Pre-check): ⏸ Blocked (disabled)
Step 3 (Procedure): ⏸ Blocked (disabled)
Step 4 (Post-check): ⏸ Blocked (disabled)
```

### Scenario 2: Role Extraction
```
JWT Token: { "roles": ["production_support", "support_admin"] }
Extracted: "Production Support" (first role, Title Case)
Request: { ..., "roleName": "Production Support" }
```

### Scenario 3: Message Parsing
```
Response: '{"message": "Case will be canceled"}'
Displayed: "Case will be canceled"

Response: '{"status": "ok", "data": {...}}'
Displayed: '{"status": "ok", "data": {...}}' (no message property)

Response: 'Simple string message'
Displayed: 'Simple string message'
```

---

## Questions or Issues?

If you encounter any issues implementing these changes in Angular, please refer to:
- The React implementation in `src/App.tsx`
- The type definitions in `src/types.ts`
- This guide

For backend integration questions, refer to `BACKEND_INTEGRATION.md`.

