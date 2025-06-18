-- =====================================================
-- Manual User Creation Script for Ricardo Nilton
-- =====================================================
-- This script creates the necessary database structure and user records
-- Execute this in the Supabase SQL Editor after creating the auth user

-- Step 1: Ensure usuarios table exists with proper structure
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'USER',
    loja_id UUID,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies if they don't exist
DO $$
BEGIN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.usuarios;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.usuarios;
    DROP POLICY IF EXISTS "Enable update for own record" ON public.usuarios;
    DROP POLICY IF EXISTS "Enable delete for super admin" ON public.usuarios;
    
    -- Create new policies
    CREATE POLICY "Enable read access for authenticated users" ON public.usuarios
        FOR SELECT USING (auth.role() = 'authenticated');
        
    CREATE POLICY "Enable insert for authenticated users" ON public.usuarios
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
    CREATE POLICY "Enable update for own record" ON public.usuarios
        FOR UPDATE USING (auth.uid() = user_id OR perfil = 'SUPER_ADMIN');
        
    CREATE POLICY "Enable delete for super admin" ON public.usuarios
        FOR DELETE USING (perfil = 'SUPER_ADMIN');
END $$;

-- Step 4: Create or update the user record
-- NOTE: Replace 'YOUR_AUTH_USER_ID_HERE' with the actual auth.users ID after creating the user
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'ricardo.nilton@hotmail.com';
    v_nome TEXT := 'Ricardo Nilton';
    v_perfil TEXT := 'SUPER_ADMIN';
BEGIN
    -- First, try to get the user_id from auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- User exists in auth.users, create or update the usuarios record
        INSERT INTO public.usuarios (user_id, email, nome, perfil, ativo)
        VALUES (v_user_id, v_email, v_nome, v_perfil, true)
        ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            nome = EXCLUDED.nome,
            perfil = EXCLUDED.perfil,
            ativo = EXCLUDED.ativo,
            updated_at = NOW();
            
        RAISE NOTICE 'Usuario record created/updated successfully for %', v_email;
        RAISE NOTICE 'User ID: %', v_user_id;
    ELSE
        -- User doesn't exist in auth.users yet
        RAISE NOTICE '======================================';
        RAISE NOTICE 'AUTH USER NOT FOUND!';
        RAISE NOTICE '======================================';
        RAISE NOTICE 'Please create the auth user first:';
        RAISE NOTICE '1. Go to Authentication > Users in Supabase Dashboard';
        RAISE NOTICE '2. Click "Add User" or "Invite User"';
        RAISE NOTICE '3. Enter:';
        RAISE NOTICE '   Email: %', v_email;
        RAISE NOTICE '   Password: 1478953';
        RAISE NOTICE '4. After creating, run this script again';
        RAISE NOTICE '======================================';
    END IF;
END $$;

-- Step 5: Verify the user was created
SELECT 
    u.id,
    u.user_id,
    u.email,
    u.nome,
    u.perfil,
    u.ativo,
    u.created_at,
    u.updated_at,
    CASE 
        WHEN au.id IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as auth_user_exists
FROM public.usuarios u
LEFT JOIN auth.users au ON u.user_id = au.id
WHERE u.email = 'ricardo.nilton@hotmail.com';

-- Step 6: Show instructions if needed
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.usuarios u
    JOIN auth.users au ON u.user_id = au.id
    WHERE u.email = 'ricardo.nilton@hotmail.com';
    
    IF v_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  USER CREATION INCOMPLETE!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next Steps:';
        RAISE NOTICE '1. Create auth user in Supabase Dashboard';
        RAISE NOTICE '2. Run this script again to link the records';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ USER CREATION SUCCESSFUL!';
        RAISE NOTICE '';
        RAISE NOTICE 'User Details:';
        RAISE NOTICE '- Email: ricardo.nilton@hotmail.com';
        RAISE NOTICE '- Name: Ricardo Nilton';
        RAISE NOTICE '- Profile: SUPER_ADMIN';
        RAISE NOTICE '- Password: 1478953';
        RAISE NOTICE '';
        RAISE NOTICE 'You can now login with these credentials.';
    END IF;
END $$;