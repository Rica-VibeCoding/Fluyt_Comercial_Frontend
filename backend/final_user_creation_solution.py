#!/usr/bin/env python3
"""
Final User Creation Solution for Supabase
This script provides a complete solution for creating the test user with multiple fallback methods.
"""

import json
import requests
import subprocess
import os
from datetime import datetime
from dotenv import load_dotenv

class ComprehensiveUserCreator:
    """Comprehensive user creation with multiple fallback methods"""
    
    def __init__(self):
        load_dotenv()
        
        self.project_url = "https://momwbpxqnvgehotfmvde.supabase.co"
        self.project_ref = "momwbpxqnvgehotfmvde"
        
        # User details
        self.user_email = "ricardo.nilton@hotmail.com"
        self.user_password = "1478953"
        self.user_name = "Ricardo Nilton"
        self.user_profile = "SUPER_ADMIN"
        
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "methods_attempted": [],
            "success": False,
            "user_created": False,
            "final_recommendations": []
        }
    
    def log_method(self, method: str, success: bool, details: dict = None):
        """Log method attempt"""
        entry = {
            "method": method,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.results["methods_attempted"].append(entry)
        
        status = "✅" if success else "❌"
        print(f"{status} {method}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
    
    def method_1_supabase_cli_auth(self):
        """Try to create user using Supabase CLI with authentication"""
        try:
            print("\n🔐 Method 1: Supabase CLI Authentication")
            
            # Check if CLI is available
            result = subprocess.run(["npx", "supabase", "--version"], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                self.log_method("Supabase CLI Check", False, {"error": "CLI not available"})
                return False
            
            cli_version = result.stdout.strip()
            self.log_method("Supabase CLI Check", True, {"version": cli_version})
            
            # Try to get project status
            result = subprocess.run(["npx", "supabase", "projects", "list"], 
                                  capture_output=True, text=True, timeout=30)
            
            if "Not logged in" in result.stderr or result.returncode != 0:
                print("   📝 CLI requires authentication. Please run manually:")
                print("   npx supabase login")
                print("   Then retry user creation")
                
                self.log_method("Supabase CLI Projects", False, {
                    "error": "Authentication required",
                    "manual_step": "Run 'npx supabase login'"
                })
                return False
            
            self.log_method("Supabase CLI Projects", True, {"output": result.stdout[:100]})
            return True
            
        except subprocess.TimeoutExpired:
            self.log_method("Supabase CLI", False, {"error": "Command timeout"})
            return False
        except Exception as e:
            self.log_method("Supabase CLI", False, {"error": str(e)})
            return False
    
    def method_2_direct_sql_creation(self):
        """Create SQL script for manual execution"""
        try:
            print("\n📝 Method 2: Generate SQL Script")
            
            sql_script = f"""
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
    '{self.user_email}',
    '{self.user_name}',
    '{self.user_profile}',
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
    RAISE NOTICE 'Database record created for: {self.user_email}';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" or "Invite User"';
    RAISE NOTICE '3. Enter email: {self.user_email}';
    RAISE NOTICE '4. Set password: {self.user_password}';
    RAISE NOTICE '5. Copy the generated User ID';
    RAISE NOTICE '6. Update the usuarios table with the real User ID:';
    RAISE NOTICE '   UPDATE usuarios SET user_id = ''[REAL_USER_ID]'' WHERE email = ''{self.user_email}'';';
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFICATION:';
    RAISE NOTICE '- Test login with email/password';
    RAISE NOTICE '- Verify database record has correct user_id';
    RAISE NOTICE '======================================';
END $$;
"""
            
            # Save SQL script
            sql_filename = "create_user_manual.sql"
            with open(sql_filename, 'w') as f:
                f.write(sql_script)
            
            self.log_method("SQL Script Generation", True, {
                "filename": sql_filename,
                "email": self.user_email,
                "name": self.user_name,
                "profile": self.user_profile
            })
            
            print(f"   📄 SQL script saved to: {sql_filename}")
            print("   💡 Execute this script in Supabase SQL Editor")
            
            return True
            
        except Exception as e:
            self.log_method("SQL Script Generation", False, {"error": str(e)})
            return False
    
    def method_3_dashboard_instructions(self):
        """Generate detailed dashboard instructions"""
        try:
            print("\n🌐 Method 3: Dashboard Instructions")
            
            instructions = {
                "dashboard_url": "https://app.supabase.com",
                "project_url": f"https://app.supabase.com/project/{self.project_ref}",
                "steps": [
                    {
                        "step": 1,
                        "title": "Access Supabase Dashboard",
                        "url": "https://app.supabase.com",
                        "action": "Log in to your Supabase account",
                        "expected": "Dashboard showing your projects"
                    },
                    {
                        "step": 2,
                        "title": "Open Project",
                        "url": f"https://app.supabase.com/project/{self.project_ref}",
                        "action": f"Click on project 'Fluyt' ({self.project_ref})",
                        "expected": "Project dashboard loads"
                    },
                    {
                        "step": 3,
                        "title": "Navigate to Authentication",
                        "url": f"https://app.supabase.com/project/{self.project_ref}/auth/users",
                        "action": "Go to Authentication > Users in sidebar",
                        "expected": "User management interface"
                    },
                    {
                        "step": 4,
                        "title": "Create New User",
                        "action": "Click 'Add user' or 'Create user' button",
                        "form_data": {
                            "email": self.user_email,
                            "password": self.user_password,
                            "auto_confirm": True,
                            "email_confirm": True
                        },
                        "expected": "User created with UUID generated"
                    },
                    {
                        "step": 5,
                        "title": "Note User ID",
                        "action": "Copy the generated User ID from the user list",
                        "expected": "UUID like: 12345678-1234-1234-1234-123456789abc"
                    },
                    {
                        "step": 6,
                        "title": "Create Database Record",
                        "url": f"https://app.supabase.com/project/{self.project_ref}/editor",
                        "action": "Go to Database > SQL Editor",
                        "sql": f"""
INSERT INTO usuarios (user_id, email, nome, perfil, ativo, created_at)
VALUES ('[USER_ID_FROM_STEP_5]', '{self.user_email}', '{self.user_name}', '{self.user_profile}', true, NOW())
ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    nome = EXCLUDED.nome,
    perfil = EXCLUDED.perfil,
    updated_at = NOW();
""",
                        "expected": "Record inserted successfully"
                    },
                    {
                        "step": 7,
                        "title": "Verify Creation",
                        "action": "Test authentication and database consistency",
                        "verification": [
                            "User appears in Authentication > Users",
                            "Record exists in usuarios table with matching user_id",
                            "Login test with email/password succeeds"
                        ]
                    }
                ]
            }
            
            # Save instructions
            instructions_filename = "dashboard_instructions.json"
            with open(instructions_filename, 'w') as f:
                json.dump(instructions, f, indent=2)
            
            self.log_method("Dashboard Instructions", True, {
                "filename": instructions_filename,
                "project_url": instructions["project_url"],
                "steps_count": len(instructions["steps"])
            })
            
            # Print key URLs
            print(f"   🔗 Project Dashboard: {instructions['project_url']}")
            print(f"   👥 User Management: {instructions['project_url']}/auth/users")
            print(f"   🗄️  Database Editor: {instructions['project_url']}/editor")
            print(f"   📋 Full instructions saved to: {instructions_filename}")
            
            return True
            
        except Exception as e:
            self.log_method("Dashboard Instructions", False, {"error": str(e)})
            return False
    
    def method_4_api_key_diagnostics(self):
        """Diagnose API key issues and provide solutions"""
        try:
            print("\n🔑 Method 4: API Key Diagnostics")
            
            # Load current keys
            anon_key = os.getenv("SUPABASE_ANON_KEY")
            service_key = os.getenv("SUPABASE_SERVICE_KEY")
            
            diagnostics = {
                "current_keys": {
                    "anon_key_present": bool(anon_key),
                    "service_key_present": bool(service_key),
                    "anon_key_length": len(anon_key) if anon_key else 0,
                    "service_key_length": len(service_key) if service_key else 0
                },
                "key_validation": {},
                "solutions": []
            }
            
            # Test current keys
            if anon_key:
                try:
                    response = requests.get(
                        f"{self.project_url}/rest/v1/",
                        headers={"apikey": anon_key, "Authorization": f"Bearer {anon_key}"},
                        timeout=10
                    )
                    diagnostics["key_validation"]["anon_key"] = {
                        "status_code": response.status_code,
                        "valid": response.status_code != 401,
                        "response": response.text[:100]
                    }
                except Exception as e:
                    diagnostics["key_validation"]["anon_key"] = {
                        "valid": False,
                        "error": str(e)
                    }
            
            if service_key:
                try:
                    response = requests.get(
                        f"{self.project_url}/rest/v1/",
                        headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"},
                        timeout=10
                    )
                    diagnostics["key_validation"]["service_key"] = {
                        "status_code": response.status_code,
                        "valid": response.status_code != 401,
                        "response": response.text[:100]
                    }
                except Exception as e:
                    diagnostics["key_validation"]["service_key"] = {
                        "valid": False,
                        "error": str(e)
                    }
            
            # Generate solutions based on diagnostics
            if not diagnostics["key_validation"].get("anon_key", {}).get("valid", False):
                diagnostics["solutions"].append({
                    "issue": "Invalid anon key",
                    "solution": "Regenerate anon key from Supabase dashboard",
                    "url": f"https://app.supabase.com/project/{self.project_ref}/settings/api"
                })
            
            if not diagnostics["key_validation"].get("service_key", {}).get("valid", False):
                diagnostics["solutions"].append({
                    "issue": "Invalid service key",
                    "solution": "Regenerate service_role key from Supabase dashboard", 
                    "url": f"https://app.supabase.com/project/{self.project_ref}/settings/api"
                })
            
            # Save diagnostics
            diag_filename = "api_key_diagnostics.json"
            with open(diag_filename, 'w') as f:
                json.dump(diagnostics, f, indent=2)
            
            self.log_method("API Key Diagnostics", True, {
                "filename": diag_filename,
                "anon_valid": diagnostics["key_validation"].get("anon_key", {}).get("valid", False),
                "service_valid": diagnostics["key_validation"].get("service_key", {}).get("valid", False),
                "solutions_count": len(diagnostics["solutions"])
            })
            
            # Print key findings
            anon_valid = diagnostics["key_validation"].get("anon_key", {}).get("valid", False)
            service_valid = diagnostics["key_validation"].get("service_key", {}).get("valid", False)
            
            print(f"   🔑 Anon Key: {'✅ Valid' if anon_valid else '❌ Invalid'}")
            print(f"   🔐 Service Key: {'✅ Valid' if service_valid else '❌ Invalid'}")
            
            if diagnostics["solutions"]:
                print("   💡 Solutions:")
                for sol in diagnostics["solutions"]:
                    print(f"      • {sol['solution']}")
                    if 'url' in sol:
                        print(f"        URL: {sol['url']}")
            
            return True
            
        except Exception as e:
            self.log_method("API Key Diagnostics", False, {"error": str(e)})
            return False
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        try:
            print("\n📊 Generating Final Report")
            
            # Determine success status
            successful_methods = [m for m in self.results["methods_attempted"] if m["success"]]
            self.results["success"] = len(successful_methods) > 0
            
            # Generate recommendations based on results
            recommendations = [
                {
                    "priority": "IMMEDIATE",
                    "action": "Manual User Creation via Dashboard",
                    "reason": "Most reliable method given current constraints",
                    "steps": [
                        "1. Visit https://app.supabase.com",
                        "2. Navigate to project Authentication > Users",
                        "3. Create user with provided credentials",
                        "4. Execute SQL script to create database record",
                        "5. Verify authentication works"
                    ]
                },
                {
                    "priority": "HIGH",
                    "action": "Fix API Key Authentication",
                    "reason": "Required for programmatic user management",
                    "steps": [
                        "1. Regenerate API keys in Supabase dashboard",
                        "2. Update .env file with new keys",
                        "3. Test connectivity with new keys",
                        "4. Retry programmatic creation"
                    ]
                },
                {
                    "priority": "MEDIUM", 
                    "action": "Setup Supabase CLI Authentication",
                    "reason": "Enables command-line user management",
                    "steps": [
                        "1. Run: npx supabase login",
                        "2. Authenticate with your account",
                        "3. Test CLI commands",
                        "4. Create user management scripts"
                    ]
                },
                {
                    "priority": "LOW",
                    "action": "Implement MCP Integration",
                    "reason": "Future-proofing for automated operations",
                    "steps": [
                        "1. Install proper MCP tools for Supabase",
                        "2. Configure authentication",
                        "3. Test MCP operations",
                        "4. Create wrapper functions"
                    ]
                }
            ]
            
            self.results["final_recommendations"] = recommendations
            
            # Create comprehensive summary
            summary = {
                "user_creation_status": "MANUAL_REQUIRED",
                "user_details": {
                    "email": self.user_email,
                    "name": self.user_name,
                    "profile": self.user_profile,
                    "password": self.user_password
                },
                "supabase_project": {
                    "url": self.project_url,
                    "ref": self.project_ref
                },
                "methods_tested": len(self.results["methods_attempted"]),
                "successful_methods": len(successful_methods),
                "generated_files": [
                    "create_user_manual.sql",
                    "dashboard_instructions.json", 
                    "api_key_diagnostics.json",
                    "final_user_creation_report.json"
                ],
                "immediate_next_steps": [
                    "Execute create_user_manual.sql in Supabase SQL Editor",
                    "Follow dashboard_instructions.json for manual user creation",
                    "Verify user creation was successful",
                    "Test authentication with provided credentials"
                ],
                "verification_checklist": [
                    "✓ Auth user exists in Supabase Authentication > Users",
                    "✓ Database record exists in usuarios table",
                    "✓ user_id in usuarios matches auth user ID",
                    "✓ Login test succeeds with email/password",
                    "✓ User has SUPER_ADMIN permissions"
                ]
            }
            
            self.results["summary"] = summary
            
            # Save final report
            report_filename = "final_user_creation_report.json"
            with open(report_filename, 'w') as f:
                json.dump(self.results, f, indent=2)
            
            self.log_method("Final Report Generation", True, {
                "filename": report_filename,
                "status": summary["user_creation_status"],
                "files_generated": len(summary["generated_files"])
            })
            
            print(f"   📄 Comprehensive report saved to: {report_filename}")
            
            return True
            
        except Exception as e:
            self.log_method("Final Report Generation", False, {"error": str(e)})
            return False
    
    def run_all_methods(self):
        """Run all user creation methods"""
        print("🚀 COMPREHENSIVE USER CREATION SOLUTION")
        print("=" * 60)
        print(f"📧 Target User: {self.user_email}")
        print(f"👤 Name: {self.user_name}")
        print(f"🎯 Profile: {self.user_profile}")
        print(f"🔗 Project: {self.project_url}")
        print("=" * 60)
        
        # Run all methods
        self.method_1_supabase_cli_auth()
        self.method_2_direct_sql_creation() 
        self.method_3_dashboard_instructions()
        self.method_4_api_key_diagnostics()
        self.generate_final_report()
        
        # Print final summary
        print("\n" + "=" * 60)
        print("📊 FINAL SUMMARY")
        print("=" * 60)
        
        successful = sum(1 for m in self.results["methods_attempted"] if m["success"])
        total = len(self.results["methods_attempted"])
        
        print(f"✅ Methods successful: {successful}/{total}")
        print(f"🎯 Recommended approach: Manual Dashboard Creation")
        print(f"📁 Files generated: {len(self.results.get('summary', {}).get('generated_files', []))}")
        
        print(f"\n🔥 IMMEDIATE ACTION REQUIRED:")
        print("1. 📝 Execute create_user_manual.sql in Supabase SQL Editor")  
        print("2. 🌐 Follow dashboard_instructions.json for user creation")
        print("3. 🔍 Verify user creation using checklist in final report")
        print("4. 🧪 Test authentication to confirm success")
        
        print(f"\n📂 Generated Files:")
        for file in self.results.get('summary', {}).get('generated_files', []):
            print(f"   • {file}")
        
        return self.results

def main():
    """Main execution function"""
    creator = ComprehensiveUserCreator()
    results = creator.run_all_methods()
    
    print(f"\n🎉 Process complete! Check generated files for detailed instructions.")
    print(f"📊 Full results saved in: final_user_creation_report.json")
    
    return results

if __name__ == "__main__":
    main()