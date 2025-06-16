#!/usr/bin/env python3
"""
Test MCP Connection to Supabase
This script tests the connection to Supabase using the provided credentials
and attempts various operations to verify MCP compatibility.
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional

# Try different supabase client imports
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class SupabaseMCPTester:
    """Test Supabase connectivity and MCP operations"""
    
    def __init__(self):
        self.url = "https://momwbpxqnvgehotfmvde.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNzU1NzksImV4cCI6MjA0ODc1MTU3OX0.FEGJxLY_MAlWgSRRBfzl9CHoGxRsxmOXSPsJQdQXpPo"
        self.service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE3NTU3OSwiZXhwIjoyMDQ4NzUxNTc5fQ.vswc2tLg4PkMaRc3JoSVZGGLWBOeFgQPaGnQEP2AO-o"
        self.client = None
        self.admin_client = None
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "library_availability": {},
            "connection_tests": {},
            "operation_tests": {},
            "errors": [],
            "summary": {}
        }
    
    def check_library_availability(self):
        """Check which libraries are available"""
        libs = {
            "supabase-py": SUPABASE_AVAILABLE,
            "httpx": HTTPX_AVAILABLE,  
            "requests": REQUESTS_AVAILABLE
        }
        self.results["library_availability"] = libs
        print("📚 Library Availability:")
        for lib, available in libs.items():
            status = "✅" if available else "❌"
            print(f"  {status} {lib}")
        return libs
    
    def test_basic_connectivity(self):
        """Test basic HTTP connectivity to Supabase"""
        tests = {}
        
        # Test with requests if available
        if REQUESTS_AVAILABLE:
            try:
                response = requests.get(f"{self.url}/rest/v1/", 
                                      headers={"apikey": self.anon_key},
                                      timeout=10)
                tests["requests_rest_api"] = {
                    "success": response.status_code in [200, 401, 403],
                    "status_code": response.status_code,
                    "response_size": len(response.content),
                    "headers": dict(response.headers)
                }
            except Exception as e:
                tests["requests_rest_api"] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Test with httpx if available
        if HTTPX_AVAILABLE:
            try:
                with httpx.Client() as client:
                    response = client.get(f"{self.url}/rest/v1/",
                                        headers={"apikey": self.anon_key},
                                        timeout=10)
                    tests["httpx_rest_api"] = {
                        "success": response.status_code in [200, 401, 403],
                        "status_code": response.status_code,
                        "response_size": len(response.content),
                        "headers": dict(response.headers)
                    }
            except Exception as e:
                tests["httpx_rest_api"] = {
                    "success": False,
                    "error": str(e)
                }
        
        self.results["connection_tests"] = tests
        print("\n🔌 Basic Connectivity Tests:")
        for test_name, result in tests.items():
            status = "✅" if result.get("success") else "❌"
            print(f"  {status} {test_name}: {result}")
        
        return tests
    
    def test_supabase_client(self):
        """Test Supabase client operations"""
        if not SUPABASE_AVAILABLE:
            print("\n❌ Supabase client not available - skipping client tests")
            return {}
        
        tests = {}
        
        try:
            # Create clients
            self.client = create_client(self.url, self.anon_key)
            self.admin_client = create_client(self.url, self.service_key)
            
            tests["client_creation"] = {"success": True, "message": "Clients created successfully"}
            
            # Test table listing with anon client
            try:
                # This might fail due to RLS, but should give us info about connection
                response = self.client.table("information_schema.tables").select("table_name").limit(5).execute()
                tests["anon_table_list"] = {
                    "success": True,
                    "table_count": len(response.data) if response.data else 0,
                    "data": response.data[:3] if response.data else []
                }
            except Exception as e:
                tests["anon_table_list"] = {
                    "success": False,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            
            # Test with service role (admin) client
            try:
                response = self.admin_client.table("information_schema.tables").select("table_name").limit(10).execute()
                tests["admin_table_list"] = {
                    "success": True,
                    "table_count": len(response.data) if response.data else 0,
                    "tables": [item.get("table_name") for item in response.data[:10]] if response.data else []
                }
            except Exception as e:
                tests["admin_table_list"] = {
                    "success": False,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            
        except Exception as e:
            tests["client_creation"] = {
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }
            self.results["errors"].append(f"Client creation failed: {e}")
        
        self.results["operation_tests"] = tests
        print("\n🔧 Supabase Client Tests:")
        for test_name, result in tests.items():
            status = "✅" if result.get("success") else "❌"
            print(f"  {status} {test_name}: {result}")
        
        return tests
    
    def test_mcp_specific_operations(self):
        """Test operations that would be useful for MCP"""
        if not self.admin_client:
            print("\n❌ No admin client available - skipping MCP-specific tests")
            return {}
        
        mcp_tests = {}
        
        # Test schema inspection
        try:
            # Get schema information
            schema_query = """
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
            LIMIT 20
            """
            
            response = self.admin_client.rpc('exec_sql', {'query': schema_query}).execute()
            mcp_tests["schema_inspection"] = {
                "success": True,
                "method": "rpc_exec_sql",
                "result": response.data if hasattr(response, 'data') else str(response)
            }
        except Exception as e:
            # Try alternative method
            try:
                response = self.admin_client.table("information_schema.tables").select("table_name,table_type").eq("table_schema", "public").limit(20).execute()
                mcp_tests["schema_inspection"] = {
                    "success": True,
                    "method": "table_query",
                    "table_count": len(response.data) if response.data else 0,
                    "tables": response.data if response.data else []
                }
            except Exception as e2:
                mcp_tests["schema_inspection"] = {
                    "success": False,
                    "error": str(e2),
                    "original_error": str(e)
                }
        
        # Test column information
        try:
            response = self.admin_client.table("information_schema.columns").select("table_name,column_name,data_type").eq("table_schema", "public").limit(50).execute()
            mcp_tests["column_inspection"] = {
                "success": True,
                "column_count": len(response.data) if response.data else 0,
                "sample_columns": response.data[:10] if response.data else []
            }
        except Exception as e:
            mcp_tests["column_inspection"] = {
                "success": False,
                "error": str(e)
            }
        
        print("\n🤖 MCP-Specific Operation Tests:")
        for test_name, result in mcp_tests.items():
            status = "✅" if result.get("success") else "❌"
            print(f"  {status} {test_name}: {result.get('method', 'N/A')}")
        
        return mcp_tests
    
    def generate_summary(self):
        """Generate a summary of all tests"""
        conn_tests = self.results.get("connection_tests", {})
        op_tests = self.results.get("operation_tests", {})
        libs = self.results.get("library_availability", {})
        
        successful_connections = sum(1 for test in conn_tests.values() if test.get("success"))
        successful_operations = sum(1 for test in op_tests.values() if test.get("success"))
        
        summary = {
            "overall_status": "success" if successful_connections > 0 else "failed",
            "libraries_available": sum(libs.values()),
            "connection_tests_passed": f"{successful_connections}/{len(conn_tests)}",
            "operation_tests_passed": f"{successful_operations}/{len(op_tests)}",
            "mcp_compatibility": "high" if successful_operations >= 2 else "medium" if successful_operations >= 1 else "low",
            "recommendations": []
        }
        
        # Add recommendations
        if not SUPABASE_AVAILABLE:
            summary["recommendations"].append("Install supabase-py: pip install supabase")
        if successful_connections == 0:
            summary["recommendations"].append("Check network connectivity and credentials")
        if successful_operations == 0:
            summary["recommendations"].append("Verify service role key permissions")
        
        self.results["summary"] = summary
        
        print("\n📊 SUMMARY:")
        print(f"  Overall Status: {summary['overall_status'].upper()}")
        print(f"  Libraries Available: {summary['libraries_available']}/3")
        print(f"  Connection Tests: {summary['connection_tests_passed']}")
        print(f"  Operation Tests: {summary['operation_tests_passed']}")
        print(f"  MCP Compatibility: {summary['mcp_compatibility'].upper()}")
        
        if summary["recommendations"]:
            print("  Recommendations:")
            for rec in summary["recommendations"]:
                print(f"    • {rec}")
        
        return summary
    
    def save_results(self, filename="mcp_supabase_test_results.json"):
        """Save test results to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"\n💾 Results saved to: {filename}")
        except Exception as e:
            print(f"\n❌ Failed to save results: {e}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting MCP Supabase Connectivity Tests")
        print("=" * 50)
        
        self.check_library_availability()
        self.test_basic_connectivity()
        self.test_supabase_client()
        self.test_mcp_specific_operations()
        self.generate_summary()
        self.save_results()
        
        return self.results


def main():
    tester = SupabaseMCPTester()
    results = tester.run_all_tests()
    
    print("\n" + "=" * 50)
    print("🏁 MCP Supabase Tests Complete!")
    return results


if __name__ == "__main__":
    main()