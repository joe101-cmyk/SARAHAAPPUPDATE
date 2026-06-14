# Assignment 12 - Testing Guide & cURL Examples

## Prerequisites

Before testing, ensure:

- ✅ MongoDB is running
- ✅ Server is started (`npm start`)
- ✅ You have a valid JWT access token
- ✅ Set up Postman or use cURL commands

---

## 🔑 Getting Access Token

### Method 1: Register a New User

**cURL:**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "message": "...",
  "data": {
    "user": { "_id": "userId", ... },
    "token": "eyJhbGc..."
  }
}
```

### Method 2: Login

**cURL:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token:**

```bash
export TOKEN="eyJhbGc..."
export USER_ID="507f1f77bcf86cd799439011"
export BASE_URL="http://localhost:3000"
```

---

## 📋 Test Scenarios

### Test 1: Upload Profile Picture (No Existing Picture)

**Scenario:** User has no profile picture. Upload one.

**cURL:**

```bash
curl -X PATCH ${BASE_URL}/user/profile-picture \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "profilePic=@/path/to/image.jpg"
```

**Expected Response (200):**

```json
{
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePic": "uploads/users/507f1f77bcf86cd799439011/1234567890-123456789.jpg"
  }
}
```

**Verification:**

```bash
# Get profile to verify
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### Test 2: Upload Profile Picture (Existing Picture)

**Scenario:** User already has a profile picture. Upload a new one. Old one should move to gallery.

**Prerequisites:** Complete Test 1 first

**cURL:**

```bash
curl -X PATCH ${BASE_URL}/user/profile-picture \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "profilePic=@/path/to/new-image.jpg"
```

**Expected Response (200):**

```json
{
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePic": "uploads/users/507f1f77bcf86cd799439011/9876543210-987654321.jpg"
  }
}
```

**Verification:**

```bash
# Get profile to verify old pic is in gallery
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.user.gallery'

# Should show: ["uploads/users/507f1f77bcf86cd799439011/1234567890-123456789.jpg"]
```

---

### Test 3: Delete Profile Picture

**Scenario:** User deletes their profile picture.

**Prerequisites:** Complete Test 1 or 2 first

**cURL:**

```bash
curl -X DELETE ${BASE_URL}/user/profile-picture \
  -H "Authorization: Bearer ${TOKEN}"
```

**Expected Response (200):**

```json
{
  "message": "Profile picture deleted successfully",
  "data": {}
}
```

**Verification:**

```bash
# Get profile - profilePic should be null
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.user.profilePic'

# Should show: null
```

**Error Case (If Already Deleted):**

```bash
curl -X DELETE ${BASE_URL}/user/profile-picture \
  -H "Authorization: Bearer ${TOKEN}"

# Expected Error (400):
# {
#   "message": "No profile picture to delete",
#   "status": 400
# }
```

---

### Test 4: Upload 2 Cover Pictures (No Existing)

**Scenario:** User has 0 cover pictures. Upload 2. Should succeed.

**cURL:**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "coverPic=@/path/to/cover1.jpg" \
  -F "coverPic=@/path/to/cover2.jpg"
```

**Expected Response (200):**

```json
{
  "message": "Cover pictures uploaded successfully",
  "data": {
    "coverPic": [
      "uploads/users/507f1f77bcf86cd799439011/1111111111-111111111.jpg",
      "uploads/users/507f1f77bcf86cd799439011/2222222222-222222222.jpg"
    ],
    "count": 2
  }
}
```

**Verification:**

```bash
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.user.coverPic | length'

# Should show: 2
```

---

### Test 5: Upload 1 Cover Picture (When 1 Exists)

**Scenario:** User has 1 cover picture. Upload 1 more. Total = 2. Should succeed.

**Prerequisites:**

1. Create a new user (User B)
2. Upload 1 cover picture to User B

**Step 1 - Upload First Cover Picture:**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_B}" \
  -F "coverPic=@/path/to/cover1.jpg"

# This will FAIL because total = 1 (not 2)
# Expected Error (400):
# {
#   "message": "Invalid cover picture count. Existing: 0, Uploaded: 1, Total: 1. Total must equal 2.",
#   "status": 400
# }
```

**Step 2 - Upload 2 Cover Pictures:**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_B}" \
  -F "coverPic=@/path/to/cover1.jpg" \
  -F "coverPic=@/path/to/cover2.jpg"

# This will SUCCESS because total = 2
```

**Step 3 - Upload 1 More (Now 1 Exists):**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_B}" \
  -F "coverPic=@/path/to/cover3.jpg"

# Expected Response (200):
# {
#   "message": "Cover pictures uploaded successfully",
#   "data": {
#     "coverPic": [
#       "uploads/users/.../cover1.jpg",
#       "uploads/users/.../cover2.jpg",
#       "uploads/users/.../cover3.jpg"
#     ],
#     "count": 3
#   }
# }

# Wait! This should be 2, not 3. Let me reconsider...
# Actually, we'd have 2 existing + 1 uploaded = 3, which would fail!
```

**Correct Scenario:**

```bash
# User A uploads 2 covers successfully
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_A}" \
  -F "coverPic=@/path/to/cover1.jpg" \
  -F "coverPic=@/path/to/cover2.jpg"

# User B uploads 1 cover to make total = 2 (0 existing + 1 uploaded = 1) → FAILS
# User B uploads 2 covers → SUCCEEDS (0 existing + 2 uploaded = 2)
# Then User B uploads 1 cover → FAILS (2 existing + 1 uploaded = 3)
```

---

### Test 6: Cover Picture Validation - All Cases

**Setup:** Create 3 test users

**Case 1: 0 existing + 2 uploaded = 2 ✅**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_USER1}" \
  -F "coverPic=@/path/to/cover1.jpg" \
  -F "coverPic=@/path/to/cover2.jpg"

# Expected: SUCCESS (200)
```

**Case 2: 0 existing + 1 uploaded = 1 ❌**

```bash
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_USER2}" \
  -F "coverPic=@/path/to/cover1.jpg"

# Expected: ERROR (400)
# Message: "Invalid cover picture count. Existing: 0, Uploaded: 1, Total: 1..."
```

**Case 3: 1 existing + 1 uploaded = 2 ✅**

```bash
# First, upload 2 to get 1 (requires special handling - this is a limitation)
# Or create scenario where user deletes 1 of 2, leaving 1

# For now, let's create this differently:
# User3: upload 2 covers successfully first

# Then simulate deletion by updating directly (not via API)
# Then upload 1 more

# Actually, let's test with User4 differently:
# Use cover pictures array manipulation

# Best approach: Use raw MongoDB to set coverPic to 1 item, then upload 1 more

# For demonstration, assume user already has 1 cover picture
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_USER3}" \
  -F "coverPic=@/path/to/cover2.jpg"

# Expected: SUCCESS (200)
# Result: coverPic array has 2 items
```

**Case 4: 2 existing + 1 uploaded = 3 ❌**

```bash
# User1 already has 2 cover pictures from Case 1
curl -X PATCH ${BASE_URL}/user/cover-pictures \
  -H "Authorization: Bearer ${TOKEN_USER1}" \
  -F "coverPic=@/path/to/cover3.jpg"

# Expected: ERROR (400)
# Message: "Invalid cover picture count. Existing: 2, Uploaded: 1, Total: 3..."
```

---

### Test 7: Profile Visit Count - Increment

**Scenario:** User A visits User B's profile. User B's visitCount increments.

**Setup:**

- User A token: `TOKEN_A`
- User B ID: `USER_B_ID`
- User B token: `TOKEN_B`

**Step 1 - User B checks own profile (visitCount not shown for non-admin):**

```bash
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN_B}" | jq '.data.user.visitCount'

# Response: null or undefined (not included for regular users)
```

**Step 2 - User A visits User B's profile:**

```bash
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${TOKEN_A}"

# Response includes User B's data, but User A won't see visitCount
```

**Step 3 - Admin checks User B's profile (Should see visitCount = 1):**

```bash
# Use Admin token
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '.data.user.visitCount'

# Response: 1
```

**Step 4 - User A visits User B's profile again:**

```bash
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${TOKEN_A}"
```

**Step 5 - Admin checks again (Should see visitCount = 2):**

```bash
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '.data.user.visitCount'

# Response: 2
```

---

### Test 8: Profile Visit Count - Only Admin Can See

**Scenario:** Regular users get profile without visitCount. Admin gets profile with visitCount.

**User A (Regular User) Gets User B Profile:**

```bash
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${TOKEN_A}"

# Expected Response:
# {
#   "message": "done",
#   "data": {
#     "user": {
#       "_id": "...",
#       "firstname": "...",
#       // ... other fields ...
#       // NO visitCount field
#     }
#   }
# }
```

**Admin Gets User B Profile:**

```bash
curl -X GET ${BASE_URL}/user/${USER_B_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Expected Response:
# {
#   "message": "done",
#   "data": {
#     "user": {
#       "_id": "...",
#       "firstname": "...",
#       // ... other fields ...
#       "visitCount": 2  // ← Visible to admin
#     }
#   }
# }
```

---

## 📊 Complete Test Execution Order

```
1. Setup: Get tokens for User A (regular), User B (regular), Admin
   └─ Save: TOKEN_A, TOKEN_B, ADMIN_TOKEN, USER_B_ID

2. Profile Picture Tests:
   ├─ Test 1: Upload profile picture (no existing)
   ├─ Test 2: Upload new profile picture (existing → gallery)
   └─ Test 3: Delete profile picture

3. Cover Picture Tests:
   ├─ Test 4: Upload 2 covers (0 existing) ✅
   ├─ Test 5: Upload 1 cover (0 existing) ❌ Expected failure
   ├─ Test 6: Upload 1 cover (1 existing) ✅ Expected success
   └─ Test 7: Upload 1 cover (2 existing) ❌ Expected failure

4. Visit Count Tests:
   ├─ Test 8: User A visits User B's profile
   ├─ Test 9: Admin views User B (visitCount visible)
   ├─ Test 10: User A views own profile (no visitCount)
   └─ Test 11: User A visits User B again (visitCount increments)
```

---

## 🔧 Troubleshooting

### Issue: "Authorization header missing"

**Solution:**

```bash
# Ensure token is passed correctly
curl -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Issue: "File not found" error

**Solution:**

```bash
# Verify image files exist at the specified paths
# Use absolute paths:
-F "profilePic=@/absolute/path/to/image.jpg"

# Or relative from current directory:
-F "profilePic=@./images/test.jpg"
```

### Issue: "Invalid cover picture count" when uploading valid count

**Solution:**

```bash
# Check existing count first
curl -X GET ${BASE_URL}/user \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.user.coverPic | length'

# Calculate: existing + uploaded must = 2
# If existing = 0, upload 2
# If existing = 1, upload 1
# If existing = 2, cannot upload more
```

### Issue: "Unauthorized Access"

**Solution:**

```bash
# Verify user has correct role
# Admin role = 0, User role = 1
# Most endpoints require User or Admin role

# Create an admin user first (if needed)
curl -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Admin",
    "lastname": "User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": 0
  }'
```

---

## ✅ Test Results Checklist

- [ ] Profile picture upload (no existing) - SUCCESS
- [ ] Profile picture upload (with existing) - SUCCESS + gallery updated
- [ ] Profile picture delete - SUCCESS
- [ ] Cover picture upload 2 files - SUCCESS
- [ ] Cover picture upload 1 file (when 0 exist) - FAIL (expected)
- [ ] Cover picture upload 1 file (when 1 exists) - SUCCESS
- [ ] Cover picture upload 1 file (when 2 exist) - FAIL (expected)
- [ ] Visit count visible to admin - YES
- [ ] Visit count hidden from regular user - YES
- [ ] Visit count increments on profile view - YES
- [ ] All existing endpoints still work - YES

---

## 📱 Using Postman

1. **Import Collection:**
   - Open Postman
   - File → Import
   - Select `Assignment12_Postman.json`

2. **Set Variables:**
   - In Postman, go to Variables tab
   - Set `base_url` = `http://localhost:3000`
   - Set `access_token` = Your token from login

3. **Run Tests:**
   - Each endpoint has pre-configured request
   - Click Send to execute
   - View response and verify results

---

## 📝 Notes

- All timestamps are UTC
- File paths are relative to project root
- Files are stored in `uploads/users/{userId}/`
- Database operations are atomic
- No data is lost (old pictures → gallery)

---

## 🎉 Completion

Once all tests pass, Assignment 12 is complete and ready for submission!
