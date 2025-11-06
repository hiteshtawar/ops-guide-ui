# Backend Integration - Quick Reference

## Test JWT Token (Valid Until 2035)

```javascript
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q'
```

**Token contains:**
```json
{
  "sub": "engineer@example.com",
  "name": "Test Engineer",
  "roles": ["production_support"],
  "iat": 1730948000,
  "exp": 2046308000
}
```

---

## API Request Format

### POST /api/v1/process

**Request:**
```json
{
  "query": "cancel case 2025123P6732",
  "userId": "ops-engineer-test"
}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response:**
```json
{
  "taskId": "CANCEL_CASE",
  "taskName": "Cancel Case",
  "extractedEntities": {
    "case_id": "2025123P6732"
  },
  "steps": [...],
  "warnings": [...]
}
```

---

### POST /api/v1/execute-step

**Request:**
```json
{
  "taskId": "CANCEL_CASE",
  "stepNumber": 1,
  "entities": {
    "case_id": "2025123P6732"
  },
  "userId": "ops-engineer-test",
  "authToken": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "success": true,
  "stepNumber": 1,
  "stepDescription": "Verify case exists",
  "statusCode": 200,
  "responseBody": "{\"id\": \"2025123P6732\", \"status\": \"active\"}",
  "errorMessage": null,
  "durationMs": 145
}
```

---

## Changes Made to UI

### Updated Files
- ✅ `src/App.tsx` - Fixed request format and JWT token
- ✅ `src/types.ts` - Updated to match backend API

### Request Format Changes

**Before (Wrong):**
```json
{
  "user_id": "ops-engineer-test",     // ❌ Wrong field name
  "query": "...",
  "context": {...},                   // ❌ Not needed
  "environment": "prod"               // ❌ Not needed
}
```

**After (Correct):**
```json
{
  "query": "cancel case 2025123P6732",
  "userId": "ops-engineer-test"       // ✅ Camel case
}
```

### JWT Token Updated

**Before:**
- Role: `ops_engineer` ❌
- Algorithm: RS256
- Expired

**After:**
- Role: `production_support` ✅
- Algorithm: HS256
- Expires: 2035 ✅

---

## Testing

**Restart backend:**
```bash
cd /Users/hiteshtawar/ops-guide-simple
./start-server.sh
```

**Restart frontend:**
```bash
cd /Users/hiteshtawar/ops-guide-ui
npm run dev
```

**Test query:**
```
"please cancel case 2025123P6732"
```

**Expected:**
- ✅ Classification: CANCEL_CASE
- ✅ Extracted: case_id = 2025123P6732
- ✅ Steps displayed
- ✅ Auto-execution works

---

**Last Updated:** November 6, 2025

