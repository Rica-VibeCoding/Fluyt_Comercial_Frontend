#!/bin/bash

# Create Test User in Supabase using CLI
# This script creates a test user with specified credentials

echo "🚀 Creating test user in Supabase..."
echo "====================================="

# Load environment variables
source .env

# Export environment variables for Supabase CLI
export SUPABASE_ACCESS_TOKEN=""
export SUPABASE_PROJECT_REF="momwbpxqnvgehotfmvde"
export SUPABASE_DB_PASSWORD=""

# User credentials
EMAIL="ricardo.nilton@hotmail.com"
PASSWORD="1478953"
NOME="Ricardo Nilton"
PERFIL="SUPER_ADMIN"

echo "📧 Email: $EMAIL"
echo "👤 Name: $NOME"
echo "🎯 Profile: $PERFIL"
echo ""

# Try to login to Supabase CLI
echo "🔐 Attempting to authenticate with Supabase..."
npx supabase login

# Check if we're logged in
echo "🔍 Checking authentication status..."
npx supabase projects list

# Try to create user using SQL
echo "👥 Creating user via SQL..."
cat > create_user.sql << EOF
-- Create auth user (this would typically be done via Supabase Auth API)
-- For now, we'll create a record in the usuarios table directly

-- First, let's check if the table exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios';

-- If usuarios table exists, insert the user record
INSERT INTO usuarios (
    user_id,
    email,
    nome,
    perfil,
    ativo,
    created_at
) VALUES (
    gen_random_uuid(),
    '$EMAIL',
    '$NOME',
    '$PERFIL',
    true,
    NOW()
) 
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    perfil = EXCLUDED.perfil,
    updated_at = NOW();

-- Return the created/updated user
SELECT * FROM usuarios WHERE email = '$EMAIL';
EOF

echo "📝 SQL script created. Contents:"
cat create_user.sql

echo ""
echo "🎯 Executing SQL script..."
npx supabase db psql -f create_user.sql

echo ""
echo "✅ User creation process completed!"
echo "📊 Check the output above for results."