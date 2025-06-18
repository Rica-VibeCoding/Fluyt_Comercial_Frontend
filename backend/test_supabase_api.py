#!/usr/bin/env python3
"""
Test Supabase API connectivity
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url = os.getenv("SUPABASE_URL", "https://momwbpxqnvgehotfmvde.supabase.co")
anon_key = os.getenv("SUPABASE_ANON_KEY")
service_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"🔗 URL: {url}")
print(f"🔑 Anon key: {anon_key[:20] if anon_key else 'None'}...")
print(f"🔐 Service key: {service_key[:20] if service_key else 'None'}...")

# Test basic connectivity
print("\n🧪 Testing basic connectivity...")

# Test with anon key
headers_anon = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}"
}

try:
    response = requests.get(f"{url}/rest/v1/", headers=headers_anon, timeout=10)
    print(f"✅ Anon API: {response.status_code} - {response.text[:100]}")
except Exception as e:
    print(f"❌ Anon API Error: {e}")

# Test with service key
headers_service = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}"
}

try:
    response = requests.get(f"{url}/rest/v1/", headers=headers_service, timeout=10)
    print(f"✅ Service API: {response.status_code} - {response.text[:100]}")
except Exception as e:
    print(f"❌ Service API Error: {e}")

# Test auth endpoint with service key
print("\n🔐 Testing auth endpoints...")
try:
    response = requests.get(f"{url}/auth/v1/admin/users", headers=headers_service, timeout=10)
    print(f"✅ Auth Admin API: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Users found: {len(data.get('users', []))}")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"❌ Auth Admin API Error: {e}")