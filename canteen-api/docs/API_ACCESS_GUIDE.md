# API Access Guide - BVRIT Canteen

## ⚠️ IMPORTANT: Correct API URLs

**Your API is running at:** `http://localhost/canteen-api/api/`

**NOT** at `/api/v1/` - the correct base URLs are below:

---

## 📡 Test These Endpoints

### 1. Health Check (No Auth Needed)
```
GET http://localhost/canteen-api/api/health
```
**Expected Response:**
```json
{"status":"API is running"}
```

### 2. Get Menu Items (No Auth Needed)
```
GET http://localhost/canteen-api/api/menu
```

### 3. Login to Get JWT Token
```
POST http://localhost/canteen-api/api/auth/login
Content-Type: application/json

{
  "email": "21bd001@bvrit.ac.in",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | `21bd001@bvrit.ac.in` | `password123` |
| **Faculty** | `faculty@bvrit.ac.in` | `faculty@123` |
| **Admin** | `admin@bvrit.ac.in` | `admin@123` |

---

## 📝 All Available Endpoints

### Public Endpoints (No Authentication)
```
GET    /api/health                    - Health check
GET    /api/menu                      - List all menu items
GET    /api/menu/{id}                 - Get menu item by ID
GET    /api/menu/search?query=...     - Search menu items
GET    /api/menu/categories           - Get all categories
POST   /api/auth/register             - Register new user
POST   /api/auth/login                - Login user
```

### Protected Endpoints (Requires JWT Token)
```
Headers: Authorization: Bearer {your_token_here}

POST   /api/auth/logout               - Logout
GET    /api/auth/me                   - Get current user
POST   /api/auth/refresh              - Refresh JWT token

GET    /api/cart                      - Get cart
POST   /api/cart/add                  - Add item to cart
PUT    /api/cart/item/{id}            - Update cart item
DELETE /api/cart/item/{id}            - Remove cart item
DELETE /api/cart                      - Clear cart

GET    /api/orders                    - Get my orders
GET    /api/orders/{id}               - Get order details
POST   /api/orders                    - Create order
POST   /api/orders/{id}/payment       - Process payment
POST   /api/orders/{id}/cancel        - Cancel order
```

### Admin Endpoints (Requires JWT Token + Admin Role)
```
GET    /api/admin/menu                - Get all menu items
POST   /api/admin/menu                - Create menu item
PUT    /api/admin/menu/{id}           - Update menu item
DELETE /api/admin/menu/{id}           - Delete menu item
PATCH  /api/admin/menu/{id}/availability - Toggle availability
PATCH  /api/admin/menu/{id}/price     - Update menu item price
```

---

## 🧪 Testing with cURL (Windows PowerShell)

### Test Health Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost/canteen-api/api/health" -Method GET
```

### Test Menu Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost/canteen-api/api/menu" -Method GET | ConvertFrom-Json
```

### Test Login
```powershell
$body = @{
    email = "21bd001@bvrit.ac.in"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost/canteen-api/api/auth/login" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body

$response.Content | ConvertFrom-Json
```

---

## 🔧 Troubleshooting 404 Errors

### If you get 404 error:

**1. Check the URL is correct:**
- ✅ **CORRECT:** `http://localhost/canteen-api/api/menu`
- ❌ **WRONG:** `http://localhost/canteen-api/api/v1/menu`

**2. Make sure Apache mod_rewrite is enabled:**
```bash
# In XAMPP Control Panel, click Apache Config > Apache (httpd.conf)
# Check if this line is NOT commented:
LoadModule rewrite_module modules/mod_rewrite.so
```

**3. Verify FastCGI is enabled in XAMPP:**
- XAMPP Control Panel > Apache > Config > PHP (php.ini)
- Or enable FastCGI in Apache configuration

**4. Clear application cache:**
```bash
cd C:\xamppp\htdocs\canteen-api
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**5. Check logs:**
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Or on Windows:
Get-Content storage/logs/laravel.log -Tail 50
```

---

## ✅ Verification Checklist

- [ ] Can access health check: `http://localhost/canteen-api/api/health`
- [ ] Can get menu items: `http://localhost/canteen-api/api/menu`
- [ ] Can login with student credentials
- [ ] Can view JWT token in login response
- [ ] Frontend can load from `http://localhost/canteen/index.html`

If all above work, your API is correctly configured! ✅

---

## 🚀 Next Steps

1. Update frontend API URL in `canteen/js/config.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost/canteen-api/api';
   ```

2. Open browser and test: `http://localhost/canteen/index.html`

3. Login with student account: `21bd001@bvrit.ac.in` / `password123`

That's it! Your BVRIT Canteen system is now fully operational! 🎉
