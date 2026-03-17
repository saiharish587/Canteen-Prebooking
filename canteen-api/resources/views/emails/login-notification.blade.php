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
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .info { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        h1 { color: #667eea; margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Login Notification</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $username }}</strong>,</p>
            
            <p>We noticed that you recently logged in to your BVRIT Canteen account.</p>
            
            <div class="info">
                <strong>Login Details:</strong><br>
                📧 Email: {{ $email }}<br>
                🕐 Time: {{ $loginTime }}<br>
                🌐 Service: BVRIT Canteen
            </div>
            
            <p><strong>If this wasn't you:</strong></p>
            <div class="alert">
                ⚠️ If you did not log in, your account may have been compromised. Please change your password immediately and contact support.
            </div>
            
            <p><strong>Account Security Tips:</strong></p>
            <ul>
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Log out from untrusted devices</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
            
            <p>Best regards,<br><strong>BVRIT Canteen Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 BVRIT Canteen. All rights reserved.</p>
            <p>For support, contact: 📞 Ext. 9587461230</p>
        </div>
    </div>
</body>
</html>
