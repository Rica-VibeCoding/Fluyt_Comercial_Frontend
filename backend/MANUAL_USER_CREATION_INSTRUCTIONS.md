# Manual User Creation Instructions for Supabase

## User Details
- **Email**: ricardo.nilton@hotmail.com
- **Password**: 1478953
- **Name**: Ricardo Nilton
- **Profile**: SUPER_ADMIN

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://app.supabase.com
2. Log in to your Supabase account
3. Select the project "Fluyt" (momwbpxqnvgehotfmvde)

### Step 2: Create Auth User
1. In the left sidebar, navigate to **Authentication** > **Users**
2. Click the **"Add user"** or **"Create a new user"** button
3. Fill in the form:
   - Email: `ricardo.nilton@hotmail.com`
   - Password: `1478953`
   - Auto Confirm Email: ✓ (checked)
4. Click **"Create user"**
5. Copy the generated User ID (UUID) - you'll need this

### Step 3: Create Database Record
1. In the left sidebar, navigate to **SQL Editor**
2. Open the file `create_user_ricardo_manual.sql` that was created
3. Copy the entire SQL script
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`

### Step 4: Verify Creation
The SQL script will automatically:
- Create the `usuarios` table if it doesn't exist
- Set up proper Row Level Security policies
- Create the user record in the `usuarios` table
- Link it to the auth user
- Show verification results

### Step 5: Test Login
1. Test the login with:
   - Email: `ricardo.nilton@hotmail.com`
   - Password: `1478953`
2. The user should have SUPER_ADMIN privileges

## Alternative Method: Using Supabase CLI

If you have Supabase CLI installed and authenticated:

```bash
# 1. Create auth user
npx supabase users create \
  --email "ricardo.nilton@hotmail.com" \
  --password "1478953" \
  --confirm

# 2. Run the SQL script
npx supabase db execute --file create_user_ricardo_manual.sql
```

## Troubleshooting

### Issue: API Keys Invalid
If you're getting "Invalid API key" errors:
1. Go to **Settings** > **API** in Supabase Dashboard
2. Copy the new `anon` and `service_role` keys
3. Update the `.env` file with the new keys

### Issue: User Already Exists
If the user already exists:
1. Go to **Authentication** > **Users**
2. Find and delete the existing user
3. Follow the creation steps again

### Issue: Table Not Found
If you get "relation usuarios does not exist":
1. The SQL script will automatically create the table
2. Just run it in the SQL Editor

## Verification Checklist
- [ ] Auth user appears in Authentication > Users
- [ ] User record exists in usuarios table
- [ ] user_id in usuarios matches auth.users.id
- [ ] Login test succeeds
- [ ] User has SUPER_ADMIN profile

## Files Created
1. `create_user_ricardo_manual.sql` - SQL script for database setup
2. `MANUAL_USER_CREATION_INSTRUCTIONS.md` - This instruction file

## Support
If you encounter any issues:
1. Check the Supabase logs in **Logs** > **Postgres Logs**
2. Verify the project URL and keys are correct
3. Ensure RLS is properly configured on the usuarios table