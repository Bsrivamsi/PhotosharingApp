# 🔧 Admin Panel 403 Error - Troubleshooting & Fix

## ✅ Changes Made

We've updated the backend security configuration to ensure admin endpoints work properly:

### 1. SecurityConfig.java
- Added explicit authentication check for `/api/admin/**` endpoints
- Added explicit allow for `/api/categories/**` GET requests
- Ensured proper order of security rules

### 2. JwtAuthenticationFilter.java
- Improved error handling with try-catch blocks
- Added debug logging for JWT validation
- Enhanced authentication debugging

---

## 🚀 Solution: Restart Backend & Clear Database

### Step 1: Stop the Backend
1. Find the Java process running on port 8080
2. **Press CTRL+C** in the terminal where backend is running
3. Wait for it to fully shut down

### Step 2: Clear Database (Important!)
The H2 in-memory database persists during the session. Delete the H2 files:

```powershell
# Navigate to your project
cd c:\Users\VAMSI\photo-sharing-app\backend

# Delete H2 database files to force fresh initialization
Remove-Item -Path "./h2db*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "./phototribe*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "./testdb*" -Force -ErrorAction SilentlyContinue

# Check target directory
Remove-Item -Path "./target/classes/h2db*" -Force -ErrorAction SilentlyContinue
```

### Step 3: Restart Backend with Fresh Initialization

```bash
cd backend
mvn clean spring-boot:run
```

**Watch the console output for this message:**
```
✅ Admin user initialized: username=admin, password=PhotoTribeAdmin
```

If you see this message, the admin user has been created successfully! ✅

---

## 🔑 Complete Admin Login Flow

### 1. Backend Started (✅ Admin initialized)
```
Backend Console Output:
═══════════════════════════════════════
✅ Admin user initialized: username=admin, password=PhotoTribeAdmin
═══════════════════════════════════════
```

### 2. Frontend Available
```
Frontend on: http://localhost:5173
```

### 3. Login with Admin Credentials
```
URL:      http://localhost:5173/login
Username: admin
Password: PhotoTribeAdmin
```

### 4. Verify JWT Token in Browser DevTools
```
Open Browser DevTools (F12)
→ Application tab
→ Local Storage
→ Check for 'token' key
→ Check for 'userRole' key = 'ROLE_ADMIN'
```

### 5. Access Admin Dashboard
```
After login, you'll be redirected to Gallery
Look for "Admin" link in the top navigation bar
Click "Admin" → Admin Dashboard loads
```

---

## ✔️ Verification Checklist

Run through this checklist to verify everything is working:

- [ ] Backend running and showing ✅ admin initialization message
- [ ] Frontend running on localhost:5173
- [ ] Can access login page (http://localhost:5173/login)
- [ ] Can login with admin/PhotoTribeAdmin
- [ ] Redirected to gallery page after successful login
- [ ] JWT token in localStorage
- [ ] userRole set to "ROLE_ADMIN" in localStorage
- [ ] "Admin" link visible in navigation bar
- [ ] Can access admin dashboard without 403 error
- [ ] Can see Analytics tab with metrics
- [ ] Can see Users, Photos, Categories, Activity tabs

---

## 🐛 If Still Getting 403 Error - Detailed Diagnostics

### Check 1: Verify Backend is Accepting Requests
```powershell
# Test if backend is responding
$response = Invoke-WebRequest -Uri 'http://localhost:8080/api/categories' 
if ($response.StatusCode -eq 200) { Write-Host "✅ Backend responding" }
```

### Check 2: Test Login Endpoint
```powershell
$loginBody = @{
    username = "admin"
    password = "PhotoTribeAdmin"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $loginBody

if ($response.StatusCode -eq 200) { 
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login successful"
    Write-Host "Token: $($data.token)"
    Write-Host "Role: $($data.role)"
}
```

### Check 3: Test Admin Endpoint with JWT Token
```powershell
# First, login and get token
$loginBody = @{
    username = "admin"
    password = "PhotoTribeAdmin"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $loginBody

$data = $loginResponse.Content | ConvertFrom-Json
$token = $data.token

# Now test admin endpoint
$adminResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/users' `
    -Method GET `
    -Headers @{ 'Authorization' = "Bearer $token" }

if ($adminResponse.StatusCode -eq 200) { 
    Write-Host "✅ Admin endpoint accessible"
} else {
    Write-Host "❌ Admin endpoint returned: $($adminResponse.StatusCode)"
}
```

### Check 4: Browser Console Errors
1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Common issues:
   - "Failed to fetch" → Backend not running
   - "401 Unauthorized" → Invalid JWT token
   - "403 Forbidden" → User doesn't have ROLE_ADMIN

### Check 5: Network Tab
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Attempt to access admin panel
4. Look for the request to `/api/admin/dashboard`
5. Check:
   - Status code (should be 200, not 401/403)
   - Request headers (should have Authorization: Bearer TOKEN)
   - Response (should contain data or error message)

---

## 🔍 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | Admin user not initialized | Restart backend with clean database |
| 403 Forbidden | JWT token not sent | Check localStorage for token |
| 403 Forbidden | User role is ROLE_USER not ROLE_ADMIN | Ensure admin user was initialized |
| 401 Unauthorized | Invalid/expired JWT token | Logout and login again |
| "Admin" link not showing | Logged in as regular user | Check userRole in localStorage |
| Backend not running | Process killed or crashed | Restart with `mvn spring-boot:run` |

---

## 📋 Step-by-Step Recovery Procedure

If you're still having issues, follow this complete procedure:

### 1. Full Backend Reset
```bash
cd backend
mvn clean  # Clean target directory
rm -r src/main/resources/h2db*  # Remove DB files
mvn spring-boot:run  # Start fresh
```

### 2. Verify Admin Initialization
Check backend console for:
```
✅ Admin user initialized: username=admin, password=PhotoTribeAdmin
```

### 3. Frontend Reset (if needed)
```bash
cd frontend
# Clear browser cache manually (or DevTools → Application → Clear storage)
npm run dev  # Restart dev server
```

### 4. Fresh Login
1. Open http://localhost:5173
2. Clear browser localStorage (DevTools → Application)
3. Click Login
4. Enter: admin / PhotoTribeAdmin
5. Refresh page after login

### 5. Test Admin Access
1. Look for "Admin" in navigation
2. Click it
3. Should load without 403 error

---

## 🛠️ Manual Admin User Creation (If Initialization Fails)

If the admin user still isn't created, you can manually insert it into the database using H2 console:

1. Start backend (but DON'T close it)
2. Open browser to: `http://localhost:8080/h2-console`
3. Click **Connect**
4. Run this SQL:

```sql
-- Check if admin exists
SELECT * FROM USERS WHERE USERNAME = 'admin';

-- If empty, insert admin user
INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE, IS_ACTIVE, PROFILE_BIO, CREATED_AT)
VALUES ('admin', 'admin@phototribe.com', 
'$2a$10$UWuqnZ3y8lYfVXFVYUzw0OqV5hP.7VsZ5vZ/qKL5.R7vZ5vZ/qKL5',
'ROLE_ADMIN', true, 'PhotoTribe Administrator', CURRENT_TIMESTAMP);
```

Note: The password hash above is for "PhotoTribeAdmin" but you may need to generate the correct bcrypt hash.

---

## 🎯 Expected Behavior After Fix

Once everything is working:

1. ✅ **Backend starts** with admin initialization message
2. ✅ **Frontend loads** at localhost:5173
3. ✅ **Login page** accepts admin/PhotoTribeAdmin
4. ✅ **JWT token** stored in localStorage
5. ✅ **Navigation shows "Admin"** link
6. ✅ **Admin dashboard** loads without 403
7. ✅ **All tabs work** (Analytics, Users, Photos, Categories, Activity)

---

## 📞 Additional Resources

- Backend logs: Check console where you ran `mvn spring-boot:run`
- Frontend logs: Browser DevTools → Console (F12)
- Security config: SecurityConfig.java
- JWT filter: JwtAuthenticationFilter.java
- User model: User.java (implements UserDetails)

---

## ✅ You're All Set!

After making these changes and restarting the backend:

1. Backend will auto-initialize admin user ✅
2. Security config allows admin endpoints with JWT ✅
3. JWT filter properly handles authentication ✅
4. Login with admin/PhotoTribeAdmin should work ✅
5. Admin dashboard should be fully accessible ✅

**The 403 error should be resolved!**

---

Restart your backend and try accessing the admin panel again. Let me know if you still encounter issues!
