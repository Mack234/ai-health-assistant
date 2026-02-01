import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class HealthAssistantAPITester:
    def __init__(self, base_url="https://smarthealth-26.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True, test_email, "TestPass123!"
        return False, None, None

    def test_user_login(self, email, password):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_profile(self):
        """Test get user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "profile",
            200
        )
        return success

    def test_ai_chat(self):
        """Test AI chat functionality"""
        chat_data = {
            "message": "What are the symptoms of a common cold?",
            "session_id": f"test_session_{uuid.uuid4().hex[:8]}"
        }
        
        success, response = self.run_test(
            "AI Chat Message",
            "POST",
            "chat/message",
            200,
            data=chat_data
        )
        
        if success and 'response' in response:
            # Test chat history
            history_success, _ = self.run_test(
                "Get Chat History",
                "GET",
                f"chat/history?session_id={chat_data['session_id']}",
                200
            )
            return success and history_success
        return False

    def test_symptom_analysis(self):
        """Test symptom analysis"""
        symptom_data = {
            "symptoms": "I have a headache and fever",
            "duration": "2 days",
            "severity": "moderate"
        }
        
        success, response = self.run_test(
            "Symptom Analysis",
            "POST",
            "symptoms/analyze",
            200,
            data=symptom_data
        )
        
        if success:
            # Test symptom history
            history_success, _ = self.run_test(
                "Get Symptom History",
                "GET",
                "symptoms/history",
                200
            )
            return success and history_success
        return False

    def test_health_metrics(self):
        """Test health metrics CRUD operations"""
        # Create metric
        metric_data = {
            "metric_type": "weight",
            "value": "70.5",
            "unit": "kg",
            "notes": "Morning weight"
        }
        
        success, response = self.run_test(
            "Add Health Metric",
            "POST",
            "metrics",
            200,
            data=metric_data
        )
        
        if not success:
            return False
        
        metric_id = response.get('id')
        
        # Get all metrics
        success, _ = self.run_test(
            "Get All Health Metrics",
            "GET",
            "metrics",
            200
        )
        
        if not success:
            return False
        
        # Get metrics by type
        success, _ = self.run_test(
            "Get Health Metrics by Type",
            "GET",
            "metrics?metric_type=weight",
            200
        )
        
        if not success:
            return False
        
        # Delete metric
        if metric_id:
            success, _ = self.run_test(
                "Delete Health Metric",
                "DELETE",
                f"metrics/{metric_id}",
                200
            )
            return success
        
        return True

    def test_reminders(self):
        """Test reminders CRUD operations"""
        # Create reminder
        scheduled_time = (datetime.now() + timedelta(hours=1)).isoformat()
        reminder_data = {
            "reminder_type": "medication",
            "title": "Take Blood Pressure Medication",
            "description": "Take with food",
            "scheduled_time": scheduled_time,
            "repeat": "daily"
        }
        
        success, response = self.run_test(
            "Create Reminder",
            "POST",
            "reminders",
            200,
            data=reminder_data
        )
        
        if not success:
            return False
        
        reminder_id = response.get('id')
        
        # Get all reminders
        success, _ = self.run_test(
            "Get All Reminders",
            "GET",
            "reminders",
            200
        )
        
        if not success:
            return False
        
        # Complete reminder
        if reminder_id:
            success, _ = self.run_test(
                "Complete Reminder",
                "PATCH",
                f"reminders/{reminder_id}/complete",
                200
            )
            
            if not success:
                return False
            
            # Delete reminder
            success, _ = self.run_test(
                "Delete Reminder",
                "DELETE",
                f"reminders/{reminder_id}",
                200
            )
            return success
        
        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Health Assistant API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test authentication flow
        print("\n🔐 Testing Authentication...")
        reg_success, email, password = self.test_user_registration()
        if not reg_success:
            print("❌ Registration failed, stopping tests")
            return False
        
        login_success = self.test_user_login(email, password)
        if not login_success:
            print("❌ Login failed, stopping tests")
            return False
        
        # Test profile
        print("\n👤 Testing User Profile...")
        self.test_get_profile()
        
        # Test AI features
        print("\n🤖 Testing AI Features...")
        self.test_ai_chat()
        self.test_symptom_analysis()
        
        # Test health tracking
        print("\n📊 Testing Health Tracking...")
        self.test_health_metrics()
        self.test_reminders()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    tester = HealthAssistantAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())