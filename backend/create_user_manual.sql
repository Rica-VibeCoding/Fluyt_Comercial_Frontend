
-- Supabase User Creation Script
-- Execute this in the Supabase SQL Editor or via CLI

-- Step 1: Check if usuarios table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        -- Create usuarios table if it doesn't exist
        CREATE TABLE usuarios (
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
        
        -- Enable RLS
        ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for authenticated users
        CREATE POLICY "Enable read access for authenticated users" ON usuarios
            FOR SELECT USING (auth.role() = 'authenticated');
            
        CREATE POLICY "Enable insert for authenticated users" ON usuarios
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
        CREATE POLICY "Enable update for own record" ON usuarios
            FOR UPDATE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'usuarios table created successfully';
    ELSE
        RAISE NOTICE 'usuarios table already exists';
    END IF;
END $$;

-- Step 2: Create a placeholder record for the user
-- Note: The actual auth user must be created via Supabase Auth API or Dashboard
-- This creates the database record that will be linked once the auth user exists

-- Generate a UUID for the user (replace this with actual auth user ID)
WITH new_user AS (
    SELECT gen_random_uuid() as temp_user_id
)
INSERT INTO usuarios (
    user_id,
    email,
    nome,
    perfil,
    ativo,
    created_at
)
SELECT 
    temp_user_id,
    'ricardo.nilton@hotmail.com',
    'Ricardo Nilton',
    'SUPER_ADMIN',
    true,
    NOW()
FROM new_user
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    perfil = EXCLUDED.perfil,
    updated_at = NOW()
RETURNING id, user_id, email, nome, perfil;

-- Step 3: Show instructions for completing user creation
DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'USER CREATION INSTRUCTIONS';  
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Database record created for: ricardo.nilton@hotmail.com';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" or "Invite User"';
    RAISE NOTICE '3. Enter email: ricardo.nilton@hotmail.com';
    RAISE NOTICE '4. Set password: 1478953';
    RAISE NOTICE '5. Copy the generated User ID';
    RAISE NOTICE '6. Update the usuarios table with the real User ID:';
    RAISE NOTICE '   UPDATE usuarios SET user_id = ''[REAL_USER_ID]'' WHERE email = ''ricardo.nilton@hotmail.com'';';
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFICATION:';
    RAISE NOTICE '- Test login with email/password';
    RAISE NOTICE '- Verify database record has correct user_id';
    RAISE NOTICE '======================================';
END $$;
