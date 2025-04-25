# Blog

## Setup Instructions

### Database Configuration
1. Add a `.env` file in the api folder
2. Add your Database connection string in the `.env` file
   - You can use the free database from www.elephantsql.com
3. Add the following environment variables:
   ```
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_secure_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## Authentication Features
- Standard email/password authentication
- Google OAuth2 authentication
- JWT token-based authentication

## Branch Information
Switch to branch `develop` to get the latest changes

## YouTube Tutorial Series
### Video 1: Set up the Blog Project (API)
https://www.youtube.com/watch?v=Z6kw_aJHJLU&list=PLVfq1luIZbSnytbsm2i8Ocf_hyUHTsqbZ&index=2

## Troubleshooting
If you encounter authentication errors:
- Ensure your JWT_SECRET is properly set in the .env file
- Check that your Google OAuth credentials are correctly configured
- Verify the callback URL matches your application setup