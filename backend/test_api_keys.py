#!/usr/bin/env python3
"""
Test Supabase API Keys
Quick script to verify if the API keys are valid
"""

import requests
import json
from datetime import datetime

def test_api_keys():
    """Test if API keys are valid"""
    
    # Configuration
    url = "https://momwbpxqnvgehotfmvde.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNzU1NzksImV4cCI6MjA0ODc1MTU3OX0.FEGJxLY_MAlWgSRRBfzl9CHoGxRsxmOXSPsJQdQXpPo"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE3NTU3OSwiZXhwIjoyMDQ4NzUxNTc5fQ.vswc2tLg4PkMaRc3JoSVZGGLWBOeFgQPaGnQEP2AO-o"
    
    print("🔍 Testing Supabase API Keys")
    print("=" * 50)
    print(f"Project URL: {url}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)
    
    # Test 1: Basic connectivity
    print("\n1️⃣ Testing basic connectivity...")
    try:
        response = requests.get(f"{url}/rest/v1/", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Anon key
    print("\n2️⃣ Testing anon key...")
    try:
        headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}"
        }
        response = requests.get(f"{url}/rest/v1/", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ❌ Anon key is INVALID")
            print(f"   Response: {response.text}")
        else:
            print("   ✅ Anon key might be valid")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Service key
    print("\n3️⃣ Testing service key...")
    try:
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}"
        }
        response = requests.get(f"{url}/rest/v1/", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ❌ Service key is INVALID")
            print(f"   Response: {response.text}")
        else:
            print("   ✅ Service key might be valid")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Try to access auth endpoint
    print("\n4️⃣ Testing auth endpoint with service key...")
    try:
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        }
        response = requests.get(f"{url}/auth/v1/admin/users", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Service key is VALID and working!")
            users = response.json()
            print(f"   Found {len(users.get('users', []))} users")
        elif response.status_code == 401:
            print("   ❌ Service key is INVALID for auth operations")
            print(f"   Response: {response.text}")
        else:
            print(f"   Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Decode JWT to check expiration
    print("\n5️⃣ Checking JWT token details...")
    try:
        import base64
        
        # Decode service key JWT (without verification)
        parts = service_key.split('.')
        if len(parts) == 3:
            # Add padding if needed
            payload = parts[1]
            payload += '=' * (4 - len(payload) % 4)
            decoded = base64.b64decode(payload)
            jwt_data = json.loads(decoded)
            
            print("   Service Key JWT Payload:")
            print(f"   - Role: {jwt_data.get('role')}")
            print(f"   - Ref: {jwt_data.get('ref')}")
            print(f"   - Issued: {datetime.fromtimestamp(jwt_data.get('iat', 0))}")
            print(f"   - Expires: {datetime.fromtimestamp(jwt_data.get('exp', 0))}")
            
            # Check if expired
            if jwt_data.get('exp', 0) < datetime.now().timestamp():
                print("   ❌ Token is EXPIRED!")
            else:
                print("   ✅ Token is still valid")
    except Exception as e:
        print(f"   Error decoding JWT: {e}")
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print("If keys are invalid, you need to:")
    print("1. Go to https://app.supabase.com")
    print("2. Select your project")
    print("3. Go to Settings > API")
    print("4. Copy the new anon and service_role keys")
    print("5. Update the .env file")
    print("\nThen use the manual creation method described in:")
    print("- MANUAL_USER_CREATION_INSTRUCTIONS.md")
    print("- create_user_ricardo_manual.sql")

if __name__ == "__main__":
    test_api_keys()