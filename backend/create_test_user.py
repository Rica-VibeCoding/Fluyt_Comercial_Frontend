#!/usr/bin/env python3
"""
Create Test User in Supabase
Creates a test user with specified credentials and sets up the corresponding database records.
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("❌ supabase-py not available. Install with: pip install supabase")
    exit(1)

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class SupabaseUserCreator:
    """Create and manage test users in Supabase"""
    
    def __init__(self):
        self.url = "https://momwbpxqnvgehotfmvde.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNzU1NzksImV4cCI6MjA0ODc1MTU3OX0.FEGJxLY_MAlWgSRRBfzl9CHoGxRsxmOXSPsJQdQXpPo"
        self.service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE3NTU3OSwiZXhwIjoyMDQ4NzUxNTc5fQ.vswc2tLg4PkMaRc3JoSVZGGLWBOeFgQPaGnQEP2AO-o"
        
        # Create both anon and admin clients
        self.client = create_client(self.url, self.anon_key)
        self.admin_client = create_client(self.url, self.service_key)
        
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "operations": [],
            "user_data": {},
            "errors": [],
            "success": False
        }
    
    def log_operation(self, operation: str, success: bool, data: Any = None, error: str = None):
        """Log an operation result"""
        entry = {
            "operation": operation,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "data": data,
            "error": error
        }
        self.results["operations"].append(entry)
        
        status = "✅" if success else "❌"
        print(f"{status} {operation}")
        if error:
            print(f"   Error: {error}")
        if data and success:
            print(f"   Data: {data}")
    
    def check_existing_user(self, email: str) -> Optional[Dict]:
        """Check if user already exists"""
        try:
            # Check auth.users (requires service role)
            response = self.admin_client.auth.admin.list_users()
            if hasattr(response, 'users') and response.users:
                for user in response.users:
                    if user.email == email:
                        self.log_operation("check_existing_auth_user", True, {"found": True, "user_id": user.id})
                        return {"auth_user": user}
            
            self.log_operation("check_existing_auth_user", True, {"found": False})
            return None
            
        except Exception as e:
            self.log_operation("check_existing_auth_user", False, error=str(e))
            return None
    
    def create_auth_user(self, email: str, password: str) -> Optional[str]:
        """Create user in Supabase Auth"""
        try:
            # Create user using admin client
            response = self.admin_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True  # Auto-confirm email
            })
            
            if hasattr(response, 'user') and response.user:
                user_id = response.user.id
                self.log_operation("create_auth_user", True, {
                    "user_id": user_id,
                    "email": email,
                    "created_at": response.user.created_at
                })
                return user_id
            else:
                self.log_operation("create_auth_user", False, error="No user returned from create_user")
                return None
                
        except Exception as e:
            self.log_operation("create_auth_user", False, error=str(e))
            return None
    
    def create_test_store(self) -> Optional[str]:
        """Create a test store for the user"""
        try:
            store_data = {
                "nome": "Loja Teste",
                "cnpj": "12.345.678/0001-90",
                "endereco": "Rua Teste, 123",
                "cidade": "Cidade Teste",
                "estado": "SP",
                "cep": "01234-567",
                "telefone": "(11) 99999-9999",
                "email": "teste@lojateste.com",
                "created_at": datetime.now().isoformat()
            }
            
            response = self.admin_client.table("lojas").insert(store_data).execute()
            
            if response.data and len(response.data) > 0:
                loja_id = response.data[0]["id"]
                self.log_operation("create_test_store", True, {
                    "loja_id": loja_id,
                    "nome": store_data["nome"]
                })
                return loja_id
            else:
                self.log_operation("create_test_store", False, error="No store data returned")
                return None
                
        except Exception as e:
            self.log_operation("create_test_store", False, error=str(e))
            return None
    
    def create_user_record(self, user_id: str, email: str, nome: str, perfil: str = "SUPER_ADMIN", loja_id: Optional[str] = None) -> bool:
        """Create user record in usuarios table"""
        try:
            user_data = {
                "user_id": user_id,
                "email": email,
                "nome": nome,
                "perfil": perfil,
                "loja_id": loja_id,
                "ativo": True,
                "created_at": datetime.now().isoformat()
            }
            
            response = self.admin_client.table("usuarios").insert(user_data).execute()
            
            if response.data and len(response.data) > 0:
                self.log_operation("create_user_record", True, {
                    "user_id": user_id,
                    "email": email,
                    "nome": nome,
                    "perfil": perfil,
                    "loja_id": loja_id
                })
                return True
            else:
                self.log_operation("create_user_record", False, error="No user record data returned")
                return False
                
        except Exception as e:
            self.log_operation("create_user_record", False, error=str(e))
            return False
    
    def test_authentication(self, email: str, password: str) -> bool:
        """Test if the created user can authenticate"""
        try:
            # Create a new client for testing authentication
            test_client = create_client(self.url, self.anon_key)
            
            response = test_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if hasattr(response, 'user') and response.user:
                self.log_operation("test_authentication", True, {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "authenticated": True
                })
                
                # Sign out after testing
                test_client.auth.sign_out()
                return True
            else:
                self.log_operation("test_authentication", False, error="Authentication failed - no user returned")
                return False
                
        except Exception as e:
            self.log_operation("test_authentication", False, error=str(e))
            return False
    
    def verify_user_creation(self, user_id: str, email: str) -> Dict[str, Any]:
        """Verify all user data was created correctly"""
        verification = {
            "auth_user_exists": False,
            "usuarios_record_exists": False,
            "data_consistent": False
        }
        
        try:
            # Check auth user
            auth_users = self.admin_client.auth.admin.list_users()
            if hasattr(auth_users, 'users'):
                for user in auth_users.users:
                    if user.id == user_id and user.email == email:
                        verification["auth_user_exists"] = True
                        break
            
            # Check usuarios table
            response = self.admin_client.table("usuarios").select("*").eq("user_id", user_id).execute()
            if response.data and len(response.data) > 0:
                user_record = response.data[0]
                verification["usuarios_record_exists"] = True
                verification["user_record"] = user_record
                
                # Check data consistency
                if user_record["email"] == email and user_record["user_id"] == user_id:
                    verification["data_consistent"] = True
            
            self.log_operation("verify_user_creation", True, verification)
            return verification
            
        except Exception as e:
            self.log_operation("verify_user_creation", False, error=str(e))
            return verification
    
    def create_complete_user(self, email: str, password: str, nome: str, perfil: str = "SUPER_ADMIN") -> Dict[str, Any]:
        """Create a complete user with all required records"""
        print(f"🚀 Creating user: {email}")
        print("=" * 50)
        
        # Check if user already exists
        existing = self.check_existing_user(email)
        if existing:
            print(f"⚠️  User {email} already exists!")
            return {"success": False, "error": "User already exists", "existing_user": existing}
        
        # Step 1: Create auth user
        user_id = self.create_auth_user(email, password)
        if not user_id:
            return {"success": False, "error": "Failed to create auth user"}
        
        self.results["user_data"]["user_id"] = user_id
        self.results["user_data"]["email"] = email
        
        # Step 2: Create test store (optional)
        loja_id = self.create_test_store()
        if loja_id:
            self.results["user_data"]["loja_id"] = loja_id
        
        # Step 3: Create user record in usuarios table
        user_record_created = self.create_user_record(user_id, email, nome, perfil, loja_id)
        if not user_record_created:
            return {"success": False, "error": "Failed to create user record"}
        
        # Step 4: Test authentication
        auth_test = self.test_authentication(email, password)
        if not auth_test:
            print("⚠️  Authentication test failed, but user may still be created")
        
        # Step 5: Verify everything was created
        verification = self.verify_user_creation(user_id, email)
        
        # Final success check
        self.results["success"] = (
            verification["auth_user_exists"] and 
            verification["usuarios_record_exists"] and 
            verification["data_consistent"]
        )
        
        return self.results
    
    def save_results(self, filename: str = None):
        """Save results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"user_creation_results_{timestamp}.json"
        
        try:
            with open(filename, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"\n💾 Results saved to: {filename}")
        except Exception as e:
            print(f"\n❌ Failed to save results: {e}")


def main():
    """Main function to create test user"""
    creator = SupabaseUserCreator()
    
    # User credentials
    email = "ricardo.nilton@hotmail.com"
    password = "1478953"
    nome = "Ricardo Nilton"
    perfil = "SUPER_ADMIN"
    
    # Create the user
    results = creator.create_complete_user(email, password, nome, perfil)
    
    # Save results
    creator.save_results()
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 USER CREATION SUMMARY")
    print("=" * 50)
    
    if results["success"]:
        print("✅ User created successfully!")
        print(f"   User ID: {results['user_data'].get('user_id')}")
        print(f"   Email: {results['user_data'].get('email')}")
        print(f"   Store ID: {results['user_data'].get('loja_id', 'None')}")
    else:
        print("❌ User creation failed!")
        print(f"   Error: {results.get('error', 'Unknown error')}")
    
    print(f"\nOperations completed: {len(results['operations'])}")
    successful_ops = sum(1 for op in results['operations'] if op['success'])
    print(f"Successful operations: {successful_ops}/{len(results['operations'])}")
    
    if results['errors']:
        print(f"\nErrors encountered: {len(results['errors'])}")
        for error in results['errors']:
            print(f"   • {error}")
    
    return results


if __name__ == "__main__":
    main()