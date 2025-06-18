#!/usr/bin/env python3
"""
Create Test User in Supabase using HTTP API
Creates a test user with specified credentials using direct HTTP calls.
"""

import json
import requests
from datetime import datetime
from typing import Dict, Any, Optional


class SupabaseUserCreatorHTTP:
    """Create and manage test users in Supabase using HTTP API"""
    
    def __init__(self):
        # Load from environment file if available
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        self.url = os.getenv("SUPABASE_URL", "https://momwbpxqnvgehotfmvde.supabase.co")
        self.anon_key = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNzU1NzksImV4cCI6MjA0ODc1MTU3OX0.FEGJxLY_MAlWgSRRBfzl9CHoGxRsxmOXSPsJQdQXpPo")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE3NTU3OSwiZXhwIjoyMDQ4NzUxNTc5fQ.vswc2tLg4PkMaRc3JoSVZGGLWBOeFgQPaGnQEP2AO-o")
        
        print(f"🔗 Connecting to: {self.url}")
        print(f"🔑 Using anon key: {self.anon_key[:20]}...")
        print(f"🔐 Using service key: {self.service_key[:20]}...")
        
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
    
    def get_admin_headers(self):
        """Get headers for admin operations"""
        return {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json"
        }
    
    def get_anon_headers(self):
        """Get headers for anonymous operations"""
        return {
            "apikey": self.anon_key,
            "Authorization": f"Bearer {self.anon_key}",
            "Content-Type": "application/json"
        }
    
    def check_existing_user(self, email: str) -> Optional[Dict]:
        """Check if user already exists using admin API"""
        try:
            # List users endpoint
            url = f"{self.url}/auth/v1/admin/users"
            headers = self.get_admin_headers()
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                users_data = response.json()
                users = users_data.get("users", [])
                
                for user in users:
                    if user.get("email") == email:
                        self.log_operation("check_existing_auth_user", True, {"found": True, "user_id": user.get("id")})
                        return {"auth_user": user}
                
                self.log_operation("check_existing_auth_user", True, {"found": False})
                return None
            else:
                self.log_operation("check_existing_auth_user", False, error=f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_operation("check_existing_auth_user", False, error=str(e))
            return None
    
    def create_auth_user(self, email: str, password: str) -> Optional[str]:
        """Create user in Supabase Auth using admin API"""
        try:
            url = f"{self.url}/auth/v1/admin/users"
            headers = self.get_admin_headers()
            
            data = {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "created_by": "system_admin"
                }
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code in [200, 201]:
                user_data = response.json()
                user_id = user_data.get("id")
                
                if user_id:
                    self.log_operation("create_auth_user", True, {
                        "user_id": user_id,
                        "email": email,
                        "created_at": user_data.get("created_at")
                    })
                    return user_id
                else:
                    self.log_operation("create_auth_user", False, error="No user ID in response")
                    return None
            else:
                self.log_operation("create_auth_user", False, error=f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_operation("create_auth_user", False, error=str(e))
            return None
    
    def create_test_store(self) -> Optional[str]:
        """Create a test store using REST API"""
        try:
            url = f"{self.url}/rest/v1/lojas"
            headers = self.get_admin_headers()
            headers["Prefer"] = "return=representation"
            
            store_data = {
                "nome": "Loja Teste",
                "cnpj": "12.345.678/0001-90",
                "endereco": "Rua Teste, 123",
                "cidade": "Cidade Teste",
                "estado": "SP",
                "cep": "01234-567",
                "telefone": "(11) 99999-9999",
                "email": "teste@lojateste.com"
            }
            
            response = requests.post(url, headers=headers, json=store_data, timeout=30)
            
            if response.status_code in [200, 201]:
                store_response = response.json()
                if isinstance(store_response, list) and len(store_response) > 0:
                    loja_id = store_response[0].get("id")
                    self.log_operation("create_test_store", True, {
                        "loja_id": loja_id,
                        "nome": store_data["nome"]
                    })
                    return loja_id
                else:
                    self.log_operation("create_test_store", False, error="Invalid response format")
                    return None
            else:
                # Store creation might fail due to table not existing, that's OK
                self.log_operation("create_test_store", False, error=f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_operation("create_test_store", False, error=str(e))
            return None
    
    def create_user_record(self, user_id: str, email: str, nome: str, perfil: str = "SUPER_ADMIN", loja_id: Optional[str] = None) -> bool:
        """Create user record in usuarios table using REST API"""
        try:
            url = f"{self.url}/rest/v1/usuarios"
            headers = self.get_admin_headers()
            headers["Prefer"] = "return=representation"
            
            user_data = {
                "user_id": user_id,
                "email": email,
                "nome": nome,
                "perfil": perfil,
                "loja_id": loja_id,
                "ativo": True
            }
            
            response = requests.post(url, headers=headers, json=user_data, timeout=30)
            
            if response.status_code in [200, 201]:
                self.log_operation("create_user_record", True, {
                    "user_id": user_id,
                    "email": email,
                    "nome": nome,
                    "perfil": perfil,
                    "loja_id": loja_id
                })
                return True
            else:
                self.log_operation("create_user_record", False, error=f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_operation("create_user_record", False, error=str(e))
            return False
    
    def test_authentication(self, email: str, password: str) -> bool:
        """Test authentication using sign-in endpoint"""
        try:
            url = f"{self.url}/auth/v1/token?grant_type=password"
            headers = self.get_anon_headers()
            
            data = {
                "email": email,
                "password": password
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                auth_data = response.json()
                access_token = auth_data.get("access_token")
                user_data = auth_data.get("user")
                
                if access_token and user_data:
                    self.log_operation("test_authentication", True, {
                        "user_id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "authenticated": True,
                        "token_type": auth_data.get("token_type")
                    })
                    return True
                else:
                    self.log_operation("test_authentication", False, error="No access token or user data in response")
                    return False
            else:
                self.log_operation("test_authentication", False, error=f"HTTP {response.status_code}: {response.text}")
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
            url = f"{self.url}/auth/v1/admin/users/{user_id}"
            headers = self.get_admin_headers()
            
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("email") == email:
                    verification["auth_user_exists"] = True
            
            # Check usuarios table
            url = f"{self.url}/rest/v1/usuarios?user_id=eq.{user_id}"
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                users_data = response.json()
                if isinstance(users_data, list) and len(users_data) > 0:
                    user_record = users_data[0]
                    verification["usuarios_record_exists"] = True
                    verification["user_record"] = user_record
                    
                    # Check data consistency
                    if user_record.get("email") == email and user_record.get("user_id") == user_id:
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
            print("⚠️  Failed to create user record in usuarios table - table might not exist")
        
        # Step 4: Test authentication
        auth_test = self.test_authentication(email, password)
        if not auth_test:
            print("⚠️  Authentication test failed, but user may still be created")
        
        # Step 5: Verify everything was created
        verification = self.verify_user_creation(user_id, email)
        
        # Final success check - only require auth user for success
        self.results["success"] = verification["auth_user_exists"]
        
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
    creator = SupabaseUserCreatorHTTP()
    
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
    
    operations = results.get('operations', [])
    print(f"\nOperations completed: {len(operations)}")
    successful_ops = sum(1 for op in operations if op.get('success'))
    print(f"Successful operations: {successful_ops}/{len(operations)}")
    
    errors = results.get('errors', [])
    if errors:
        print(f"\nErrors encountered: {len(errors)}")
        for error in errors:
            print(f"   • {error}")
    
    # Print detailed operation log
    print("\n📋 DETAILED OPERATION LOG:")
    print("-" * 30)
    for i, op in enumerate(operations, 1):
        status = "✅" if op.get('success') else "❌"
        print(f"{i}. {status} {op.get('operation', 'Unknown')}")
        if op.get('error'):
            print(f"   Error: {op['error']}")
        if op.get('data'):
            print(f"   Data: {op['data']}")
    
    return results


if __name__ == "__main__":
    main()