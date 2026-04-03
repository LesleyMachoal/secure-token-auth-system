# Postman Testing Guide - Secure Token Auth API

## Prerequisites
- Postman installed ([Download](https://www.postman.com/downloads/))
- Server running on `http://localhost:3000`
- Postman collection file: `Secure-Token-Auth-API.postman_collection.json`

## Importing the Collection

### Method 1: Import from File
1. Open Postman
2. Click **Import** (top-left)
3. Select **File** tab
4. Browse to `Secure-Token-Auth-API.postman_collection.json`
5. Click **Open**
6. Click **Import**

### Method 2: Drag & Drop
1. Open Postman
2. Drag `Secure-Token-Auth-API.postman_collection.json` into Postman window
3. Click **Import**

## Environment Setup

### Create Environment Variable for Token
1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name: `Development`
4. Add variable:
   - **Key:** `token`
   - **Value:** (leave empty for now)
   - **Type:** `string`
5. Click **Save**
6. Select `Development` environment (top-right dropdown)

## Testing Workflows

### 1. Health Check
**Purpose:** Verify server is running

**Steps:**
1. Go to **Health & Status** → **Health Check**
2. Click **Send**
3. Expected Response (200 OK):
```json
{
  "message": "Secure Token Authentication System"
}
```

---

### 2. Check Auth Service Status
**Purpose:** Confirm auth service is operational

**Steps:**
1. Go to **Health & Status** → **Auth Service Status**
2. Click **Send**
3. Expected Response (200 OK):
```json
{
  "message": "Auth service is running"
}
```

---

### 3. Complete Authentication Flow

#### Step 1: Register a New User
1. Go to **Authentication** → **Register User**
2. Modify the request body (optional):
```json
{
  "email": "user@example.com",
  "password": "YourPassword123",
  "firstName": "Your Name",
  "lastName": "Your Last Name"
}
```
3. Click **Send**
4. Expected Response (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "Your Name",
    "lastName": "Your Last Name",
    "createdAt": "2026-04-02T..."
  }
}
```

#### Step 2: Login User
1. Go to **Authentication** → **Login User**
2. Use the same email/password from registration
3. Click **Send**
4. Expected Response (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "user@example.com",
    "id": "uuid-here"
  }
}
```
5. **Copy the token value** from the response

#### Step 3: Save Token to Environment
1. Click the **Environment** icon (top-right area)
2. In the environment panel, find the `token` variable
3. Paste the token in the **Current value** field
4. Click **Save**

#### Step 4: Validate Token
1. Go to **Authentication** → **Validate Token**
2. Notice the Authorization header uses `{{token}}` (environment variable)
3. Click **Send**
4. Expected Response (200 OK):
```json
{
  "message": "Token is valid",
  "user": { ... }
}
```

#### Step 5: Get User Profile
1. Go to **Authentication** → **Get User Profile**
2. Click **Send**
3. Expected Response (200 OK):
```json
{
  "message": "User profile retrieved",
  "user": { ... }
}
```

---

### 4. Error Testing

#### Test Case 1: Missing Email on Register
1. Go to **Error Cases** → **Register - Missing Email**
2. Click **Send**
3. Expected Response (400 Bad Request):
```json
{
  "error": "Email and password are required"
}
```

#### Test Case 2: Missing Password on Register
1. Go to **Error Cases** → **Register - Missing Password**
2. Click **Send**
3. Expected Response (400 Bad Request):
```json
{
  "error": "Email and password are required"
}
```

#### Test Case 3: Missing Credentials on Login
1. Go to **Error Cases** → **Login - Missing Credentials**
2. Click **Send**
3. Expected Response (400 Bad Request):
```json
{
  "error": "Email and password are required"
}
```

#### Test Case 4: Invalid Route (404)
1. Go to **Error Cases** → **Not Found - Invalid Route**
2. Click **Send**
3. Expected Response (404 Not Found):
```json
{
  "error": "Route not found"
}
```

---

## Postman Features to Use

### 1. Save Responses
- Click **Save Response** after any request
- Useful for comparing expected vs actual responses

### 2. Run Collection
1. Click the play icon (▶) next to collection name
2. Select **Run** 
3. All tests execute in sequence
4. View results in Collection Runner

### 3. Set Pre-request Scripts
To automatically extract token and save to environment:
1. Go to **Authentication** → **Login User**
2. Click **Tests** tab
3. Add script:
```javascript
if (pm.response.code === 200) {
    var token = pm.response.json().token;
    pm.environment.set("token", token);
}
```
4. Now token auto-saves after login

### 4. Write Test Assertions
1. Click **Tests** tab on any request
2. Add assertions:
```javascript
pm.test("Response status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    pm.expect(pm.response.json()).to.have.property('token');
});
```

---

## Troubleshooting

### Issue: Connection Refused
- **Cause:** Server not running
- **Solution:** Run `npm start` in project directory

### Issue: 401 Unauthorized
- **Cause:** Invalid or missing token
- **Solution:** 
  - Login again to get fresh token
  - Update environment variable with new token

### Issue: CORS Error
- **Cause:** Cross-origin request blocked
- **Solution:** Verify CORS is enabled in Express (should be configured)

### Issue: 400 Bad Request
- **Cause:** Invalid JSON or missing required fields
- **Solution:** Check request body format matches expected schema

---

## API Request Reference

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| GET | `/` | None | No |
| GET | `/api/auth/status` | None | No |
| POST | `/api/auth/register` | {email, password, firstName?, lastName?} | No |
| POST | `/api/auth/login` | {email, password} | No |
| GET | `/api/auth/validate` | None | Yes |
| GET | `/api/auth/profile` | None | Yes |

**Auth = Yes:** Requires `Authorization: Bearer {token}` header

---

## Tips & Best Practices

1. **Use Environments** - Store base URL and tokens in environment variables
2. **Save Responses** - Compare responses to identify issues
3. **Use Collections** - Group related requests together
4. **Add Tests** - Write assertions to validate responses
5. **Document Requests** - Add descriptions for team reference
6. **Use Pre-request Scripts** - Auto-populate variables before requests
7. **Monitor Network** - Check response times and payloads

---

## Contact & Support

For issues or questions:
- Check TEST_REPORT.md for test results
- Review server logs in terminal
- Verify .env configuration
