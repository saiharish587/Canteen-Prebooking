# Test Users for Canteen Prebooking System

These test users have been automatically created in the database via the UserSeeder.

## Admin User
- **Email:** `admin@bvrit.ac.in`
- **Username:** `admin`
- **Password:** `admin@123`
- **Role:** Admin (Can access KDS - Kitchen Display System)

## Student User
- **Email:** `21bd001@bvrit.ac.in`
- **Username:** `rajesh_kumar`
- **Password:** `password123`
- **Role:** Student (Can place orders)

## Faculty User
- **Email:** `faculty@bvrit.ac.in`
- **Username:** `prof_sharma`
- **Password:** `faculty@123`
- **Role:** Faculty (Can place orders)

## How to Test Login

### Using Email:
```
Email/Username: admin@bvrit.ac.in
Password: admin@123
```

### Using Username:
```
Email/Username: admin
Password: admin@123
```

## Debugging Steps

1. Open your browser's **Developer Console** (Press F12)
2. Go to **Console** tab
3. Clear localStorage: `localStorage.clear()`
4. Try logging in with one of the test users above
5. Look for logs with 🔐 emoji in the console
6. Check if the token appears in localStorage after successful login:
   ```javascript
   localStorage.getItem('bvrit_access_token')
   ```

## Expected Console Output on Success

You should see:
```
🔐 [LOGIN START] Username/Email: admin@bvrit.ac.in
🔐 [API URL] Using: https://canteen-prebooking.onrender.com/api
🔐 [LOGIN REQUEST] ...
🔐 [LOGIN RESPONSE] {status: 200, statusText: "OK", ok: true}
🔐 [LOGIN DATA] {success: true, hasToken: true, ...}
✅ [LOGIN SUCCESS] Valid token received
✅ [STORAGE SUCCESS] Items stored in localStorage
✅ Redirecting to order-type.html
```

If you see errors instead, note the error message and share the console output for debugging.
