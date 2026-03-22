# RENDER DEPLOYMENT ENVIRONMENT VARIABLES

## Copy these environment variables into Render Dashboard:

```
APP_NAME=BVRIT Canteen API
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:7pIskuZ2q1q5DGYDBn/PlYo3mhEUg3H6Ty8dP4Y/hbg=
APP_URL=https://canteen-api.onrender.com

DB_CONNECTION=mysql
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=20015
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=OJvKSKpyqipJOsoeKyzHRVQVrbysCuON

JWT_SECRET=8811b4c952a086a434ec7b772a37b9dfa4d6ecb747a732044d996f4949caf56b
JWT_ALGORITHM=HS256
JWT_TTL=60

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=<YOUR_MAILTRAP_USERNAME>
MAIL_PASSWORD=<YOUR_MAILTRAP_PASSWORD>
MAIL_FROM_ADDRESS=noreply@bvritcanteen.com
MAIL_FROM_NAME=BVRIT Canteen

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie
APP_TIMEZONE=UTC
```

## Steps:
1. Create a MySQL database (Railway, AWS RDS, or Render's partner services)
2. Get database credentials (HOST, USERNAME, PASSWORD)
3. Add ALL variables above to Render Service → Environment
4. Replace placeholders with actual values
5. Deploy!

## Notes:
- APP_KEY is already generated and secure
- JWT_SECRET is already generated and secure
- Mailtrap credentials are optional (for email notifications)
- Update APP_URL after Render assigns your domain
