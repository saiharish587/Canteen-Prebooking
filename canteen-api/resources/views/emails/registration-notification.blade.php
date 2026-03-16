<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: white; padding: 30px; }
        .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
        .button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        h1 { color: #667eea; margin-top: 0; }
        .info { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to BVRIT Canteen!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $username }}</strong>,</p>
            
            <p>Congratulations! Your account has been successfully created.</p>
            
            <div class="info">
                <strong>Account Details:</strong><br>
                📧 Email: {{ $email }}<br>
                👤 Username: {{ $username }}<br>
                🏷️ Type: {{ ucfirst($userType) }}
            </div>
            
            <p>You can now log in to the BVRIT Canteen system and start ordering delicious food!</p>
            
            <a href="http://localhost/canteen/index.html" class="button">Login to Canteen</a>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>Log in with your credentials</li>
                <li>Choose your order type (Takeaway or Eat In)</li>
                <li>Browse our menu and place your order</li>
                <li>Track your order status in real-time</li>
            </ul>
            
            <p>If you did not create this account, please ignore this email.</p>
            
            <p>Best regards,<br><strong>BVRIT Canteen Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 BVRIT Canteen. All rights reserved.</p>
            <p>For support, contact: 📞 Ext. 9587461230</p>
        </div>
    </div>
</body>
</html>
