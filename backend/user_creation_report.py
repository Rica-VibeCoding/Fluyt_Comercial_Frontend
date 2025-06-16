#!/usr/bin/env python3
"""
Supabase User Creation Report
This script provides a comprehensive report of attempts to create a test user
and recommendations for manual creation.
"""

import json
import requests
from datetime import datetime
from dotenv import load_dotenv
import os

def generate_user_creation_report():
    """Generate a comprehensive report of user creation attempts and recommendations"""
    
    load_dotenv()
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "objective": "Create test user in Supabase project 'Fluyt'",
        "target_user": {
            "email": "ricardo.nilton@hotmail.com",
            "password": "1478953",
            "name": "Ricardo Nilton",
            "profile": "SUPER_ADMIN"
        },
        "supabase_project": {
            "url": "https://momwbpxqnvgehotfmvde.supabase.co",
            "project_ref": "momwbpxqnvgehotfmvde"
        },
        "attempts": [],
        "issues_encountered": [],
        "recommendations": [],
        "manual_steps": [],
        "verification_steps": []
    }
    
    # Document attempts made
    report["attempts"] = [
        {
            "method": "Supabase Python Client",
            "status": "Failed",
            "error": "Client.__init__() got an unexpected keyword argument 'proxy'",
            "description": "Attempted to use supabase-py library but encountered compatibility issues"
        },
        {
            "method": "Direct HTTP API",
            "status": "Failed", 
            "error": "HTTP 401: Invalid API key",
            "description": "Used requests library to call Supabase REST and Auth APIs directly"
        },
        {
            "method": "Supabase CLI via npx",
            "status": "Available",
            "error": None,
            "description": "Supabase CLI is available via npx but requires authentication"
        }
    ]
    
    # Document issues
    report["issues_encountered"] = [
        {
            "issue": "API Key Authentication",
            "description": "Both anon and service role keys are being rejected with 401 errors",
            "possible_causes": [
                "Keys may have expired",
                "Keys may be for a different environment",
                "Project settings may have changed",
                "RLS policies may be blocking access"
            ]
        },
        {
            "issue": "Python Client Compatibility",
            "description": "supabase-py library has proxy parameter conflict",
            "possible_causes": [
                "Version incompatibility between libraries",
                "HTTP client version mismatch",
                "Environment-specific configuration issues"
            ]
        },
        {
            "issue": "MCP Availability",
            "description": "No direct MCP tools found for Supabase operations",
            "possible_causes": [
                "MCP tools not installed or configured",
                "Specific Supabase MCP provider not available",
                "Project not configured for MCP access"
            ]
        }
    ]
    
    # Provide recommendations
    report["recommendations"] = [
        {
            "priority": "High",
            "action": "Verify API Keys",
            "description": "Log into Supabase dashboard and regenerate/verify API keys",
            "steps": [
                "1. Go to https://app.supabase.com/project/momwbpxqnvgehotfmvde/settings/api",
                "2. Verify project URL and reference ID",
                "3. Copy fresh anon and service_role keys",
                "4. Update .env file with new keys"
            ]
        },
        {
            "priority": "High", 
            "action": "Manual User Creation via Dashboard",
            "description": "Create user directly through Supabase Auth dashboard",
            "steps": [
                "1. Go to https://app.supabase.com/project/momwbpxqnvgehotfmvde/auth/users",
                "2. Click 'Add user' or 'Invite user'",
                "3. Enter email: ricardo.nilton@hotmail.com",
                "4. Set password: 1478953",
                "5. Confirm email (if required)",
                "6. Note the generated user_id"
            ]
        },
        {
            "priority": "Medium",
            "action": "Create Database Record",
            "description": "Add corresponding record in usuarios table",
            "steps": [
                "1. Go to https://app.supabase.com/project/momwbpxqnvgehotfmvde/editor",
                "2. Navigate to 'usuarios' table (create if doesn't exist)",
                "3. Insert new record with:",
                "   - user_id: [from step above]",
                "   - email: ricardo.nilton@hotmail.com", 
                "   - nome: Ricardo Nilton",
                "   - perfil: SUPER_ADMIN",
                "   - ativo: true",
                "   - created_at: now()"
            ]
        },
        {
            "priority": "Low",
            "action": "Setup MCP Integration",
            "description": "Configure proper MCP tools for future user management",
            "steps": [
                "1. Install Supabase MCP server/provider",
                "2. Configure authentication with valid credentials",
                "3. Test connection and operations",
                "4. Create wrapper functions for common operations"
            ]
        }
    ]
    
    # Manual creation steps
    report["manual_steps"] = [
        {
            "step": 1,
            "title": "Access Supabase Dashboard",
            "action": "Navigate to https://app.supabase.com and log in",
            "expected_result": "Dashboard shows project 'Fluyt' (momwbpxqnvgehotfmvde)"
        },
        {
            "step": 2,
            "title": "Create Auth User",
            "action": "Go to Authentication > Users and create new user",
            "details": {
                "email": "ricardo.nilton@hotmail.com",
                "password": "1478953",
                "auto_confirm": True
            },
            "expected_result": "User created with UUID assigned"
        },
        {
            "step": 3,
            "title": "Create Database Record",
            "action": "Go to Database > Tables and insert into usuarios table",
            "sql_example": """
            INSERT INTO usuarios (user_id, email, nome, perfil, ativo, created_at)
            VALUES ('[UUID_FROM_STEP_2]', 'ricardo.nilton@hotmail.com', 'Ricardo Nilton', 'SUPER_ADMIN', true, NOW());
            """,
            "expected_result": "Record created in usuarios table"
        },
        {
            "step": 4,
            "title": "Test Authentication",
            "action": "Use Supabase client or API to test login",
            "test_code": """
            // JavaScript example
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'ricardo.nilton@hotmail.com',
                password: '1478953'
            });
            """,
            "expected_result": "Successful authentication with access token"
        }
    ]
    
    # Verification steps
    report["verification_steps"] = [
        {
            "check": "Auth User Exists",
            "method": "Dashboard > Authentication > Users",
            "expected": "User with email ricardo.nilton@hotmail.com visible"
        },
        {
            "check": "Database Record Exists", 
            "method": "Dashboard > Database > usuarios table",
            "expected": "Record with matching user_id and email"
        },
        {
            "check": "Authentication Works",
            "method": "API call or client library test",
            "expected": "Successful login returns access token and user data"
        },
        {
            "check": "Permissions Correct",
            "method": "Test API calls with user token",
            "expected": "SUPER_ADMIN profile allows expected operations"
        }
    ]
    
    return report

def save_report(report, filename="user_creation_detailed_report.json"):
    """Save the report to a JSON file"""
    try:
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"✅ Report saved to: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to save report: {e}")
        return False

def print_summary(report):
    """Print a human-readable summary of the report"""
    print("🚀 SUPABASE USER CREATION REPORT")
    print("=" * 50)
    
    print(f"\n📅 Generated: {report['timestamp']}")
    print(f"🎯 Objective: {report['objective']}")
    
    print(f"\n👤 Target User:")
    user = report['target_user']
    print(f"   Email: {user['email']}")
    print(f"   Name: {user['name']}")
    print(f"   Profile: {user['profile']}")
    
    print(f"\n🔗 Supabase Project:")
    project = report['supabase_project']
    print(f"   URL: {project['url']}")
    print(f"   Reference: {project['project_ref']}")
    
    print(f"\n🔧 Attempts Made:")
    for i, attempt in enumerate(report['attempts'], 1):
        status_icon = "✅" if attempt['status'] == "Available" else "❌"
        print(f"   {i}. {status_icon} {attempt['method']}: {attempt['status']}")
        if attempt['error']:
            print(f"      Error: {attempt['error']}")
    
    print(f"\n⚠️  Issues Encountered:")
    for i, issue in enumerate(report['issues_encountered'], 1):
        print(f"   {i}. {issue['issue']}")
        print(f"      {issue['description']}")
    
    print(f"\n💡 Key Recommendations:")
    high_priority = [r for r in report['recommendations'] if r['priority'] == 'High']
    for i, rec in enumerate(high_priority, 1):
        print(f"   {i}. {rec['action']}")
        print(f"      {rec['description']}")
    
    print(f"\n📋 Manual Steps Required:")
    for step in report['manual_steps']:
        print(f"   Step {step['step']}: {step['title']}")
        print(f"   Action: {step['action']}")
    
    print(f"\n🔍 Verification Checklist:")
    for i, check in enumerate(report['verification_steps'], 1):
        print(f"   {i}. {check['check']}")
        print(f"      Method: {check['method']}")
        print(f"      Expected: {check['expected']}")

def main():
    """Main function to generate and display the report"""
    print("📊 Generating comprehensive user creation report...")
    
    report = generate_user_creation_report()
    
    # Save to file
    save_report(report)
    
    # Print summary
    print_summary(report)
    
    print(f"\n🎯 NEXT STEPS:")
    print("1. Verify/update Supabase API keys in dashboard")
    print("2. Create user manually via Supabase dashboard")
    print("3. Test authentication to confirm success")
    print("4. Set up proper MCP integration for future operations")
    
    return report

if __name__ == "__main__":
    main()