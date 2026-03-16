# 🔍 Diagnosis Steps for Cart Add Issue

## Step 1: Make sure MySQL is running
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL/MariaDB
3. Wait for it to show as running (green)

##  Step 2: Access the Diagnosis Page
1. Open your browser and go to: `http://localhost/canteen-api/public/diagnosis.html`
2. Check if it shows:
   - ✅ Token exists in localStorage
   - ✅ Token starts with "session_"
   - ✅ Test API Request succeeds

## Step 3: Test Adding to Cart
1. Go to the canteen menu: `http://localhost/canteen/menu.html`
2. Try to add an item to cart
3. Open browser Developer Tools (F12 or Right-click → Inspect)
4. Go to the "Console" tab
5. Add an item to cart and check the logs

## What to Look For

### In the Console:
- Look for messages starting with "🛒 addToCart called:"
- Check if "Token exists? true" appears
- Look for "Sending request with:" details
- Check the "Fallback fetch response: {status: ..., data: ...}"

### In Browser Network Tab:
- Look for the POST request to `http://localhost/canteen-api/api/cart/add`
- Check the "Request Headers" - should include:
  - `Authorization: Bearer session_...`
  - `X-Auth-Token: session_...`
- Check the Response - should show status 200 with success message

## If Still Failing:

If the response shows status 401 with "Missing authorization token", please share:
1. The token preview from the diagnosis page
2. The Network tab screenshot showing request headers
3. The console logs from adding to cart

This will help identify if the token isn't being sent or if it's invalid.
