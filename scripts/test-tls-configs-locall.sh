                                                                                                                                                                                                                                              
  #!/bin/bash                                                                                                                                                                                                                                   
   
  # ==============================================================================  
      # Make sure you're in the directory with plugin-backend binary
                                                                                                                                                            
  # PR #580 Local TLS Configuration Testing Script
  # Tests: --tls-curves, --tls-cipher-suites, --tls-min-version, --tls-max-version
  # ==============================================================================

  set -e

  # Configuration
  PLUGIN_BINARY="./plugin-backend"
  TEST_PORT="9443"
  WAIT_TIME=3
  TIMEOUT=5

  # Colors for output
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color

  # Test results
  TESTS_PASSED=0
  TESTS_FAILED=0

  # ==============================================================================
  # Helper Functions
  # ==============================================================================

  log_info() {
      echo -e "${BLUE}[INFO]${NC} $1"
  }

  log_success() {
      echo -e "${GREEN}[SUCCESS]${NC} $1"
      ((TESTS_PASSED++))
  }

  log_failure() {
      echo -e "${RED}[FAILURE]${NC} $1"
      ((TESTS_FAILED++))
  }

  log_warning() {
      echo -e "${YELLOW}[WARNING]${NC} $1"
  }

  cleanup() {
      log_info "Cleaning up background processes..."
      pkill -f "plugin-backend" 2>/dev/null || true
      sleep 1
  }

  wait_for_server() {
      log_info "Waiting for server to start..."
      for i in {1..10}; do
          if nc -z localhost $TEST_PORT 2>/dev/null; then
              log_info "Server is ready"
              return 0
          fi
          sleep 1
      done
      log_failure "Server failed to start within 10 seconds"
      return 1
  }

  test_connection() {
      local test_name="$1"
      local openssl_args="$2"
      local should_succeed="$3"

      log_info "Testing: $test_name"

      local result
      result=$(timeout $TIMEOUT openssl s_client -connect localhost:$TEST_PORT $openssl_args -brief 2>&1 || true)

      if [[ "$should_succeed" == "true" ]]; then
          if echo "$result" | grep -q "Protocol version: TLSv1"; then
              log_success "$test_name - Connection succeeded as expected"
              echo "  → $(echo "$result" | grep "Protocol version\|Ciphersuite\|Server Temp Key" | head -1)"
              return 0
          else
              log_failure "$test_name - Connection failed unexpectedly"
              echo "  → Error: $(echo "$result" | grep -i "error\|alert\|handshake failure" | head -1)"
              return 1
          fi
      else
          if echo "$result" | grep -q -i "handshake failure\|alert\|error.*version\|wrong version"; then
              log_success "$test_name - Connection correctly rejected"
              return 0
          else
              log_failure "$test_name - Connection unexpectedly succeeded"
              echo "  → Should have been rejected: $(echo "$result" | grep "Protocol version\|Ciphersuite" | head -1)"
              return 1
          fi
      fi
  }

  start_plugin() {
      local args="$1"
      cleanup
      log_info "Starting plugin with: $args"
      $PLUGIN_BINARY $args > /tmp/plugin.log 2>&1 &
      PLUGIN_PID=$!
      sleep $WAIT_TIME

      if ! ps -p $PLUGIN_PID > /dev/null 2>&1; then
          log_failure "Plugin failed to start"
          cat /tmp/plugin.log
          return 1
      fi

      wait_for_server
  }

  # ==============================================================================
  # Prerequisite Checks
  # ==============================================================================

  check_prerequisites() {
      log_info "Checking prerequisites..."

      # Check if plugin binary exists
      if [[ ! -f "$PLUGIN_BINARY" ]]; then
          log_failure "Plugin binary not found: $PLUGIN_BINARY"
          exit 1
      fi

      # Check if OpenSSL is available
      if ! command -v openssl &> /dev/null; then
          log_failure "OpenSSL not found. Please install OpenSSL."
          exit 1
      fi

      # Check if port is available
      if lsof -i :$TEST_PORT > /dev/null 2>&1; then
          log_warning "Port $TEST_PORT is in use. Attempting cleanup..."
          cleanup
          sleep 2
          if lsof -i :$TEST_PORT > /dev/null 2>&1; then
              log_failure "Port $TEST_PORT is still in use. Please free the port manually."
              exit 1
          fi
      fi

      log_success "Prerequisites check passed"
  }

  # ==============================================================================
  # Test Functions
  # ==============================================================================

  test_tls_curves() {
      echo
      log_info "========== Testing TLS Curves Configuration =========="

      # Test with P-256 and P-384 only
      start_plugin "--tls-curves=P-256,P-384" || return 1

      test_connection "P-256 curve (allowed)" "-curves P-256" true
      test_connection "P-384 curve (allowed)" "-curves P-384" true
      test_connection "P-521 curve (not allowed)" "-curves P-521" false
      test_connection "X25519 curve (not allowed)" "-curves X25519" false

      cleanup
  }

  test_tls_versions() {
      echo
      log_info "========== Testing TLS Version Configuration =========="

      # Test minimum version enforcement
      log_info "Testing minimum TLS version (1.2)"
      start_plugin "--tls-min-version=1.2" || return 1

      test_connection "TLS 1.2 (at minimum)" "-tls1_2" true
      test_connection "TLS 1.3 (above minimum)" "-tls1_3" true
      test_connection "TLS 1.1 (below minimum)" "-tls1_1" false

      cleanup

      # Test maximum version enforcement
      log_info "Testing maximum TLS version (1.2)"
      start_plugin "--tls-max-version=1.2" || return 1

      test_connection "TLS 1.2 (at maximum)" "-tls1_2" true
      test_connection "TLS 1.3 (above maximum)" "-tls1_3" false

      cleanup

      # Test version range
      log_info "Testing TLS version range (1.2-1.3)"
      start_plugin "--tls-min-version=1.2 --tls-max-version=1.3" || return 1

      test_connection "TLS 1.2 (within range)" "-tls1_2" true
      test_connection "TLS 1.3 (within range)" "-tls1_3" true
      test_connection "TLS 1.1 (below range)" "-tls1_1" false

      cleanup
  }

  test_cipher_suites() {
      echo
      log_info "========== Testing TLS Cipher Suites Configuration =========="

      # Test with limited cipher suites
      start_plugin "--tls-cipher-suites=TLS_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256" || return 1

      test_connection "TLS_AES_256_GCM_SHA384 (allowed)" "-ciphersuites 'TLS_AES_256_GCM_SHA384'" true
      test_connection "TLS_AES_128_GCM_SHA256 (allowed)" "-ciphersuites 'TLS_AES_128_GCM_SHA256'" true
      test_connection "TLS_CHACHA20_POLY1305_SHA256 (not allowed)" "-ciphersuites 'TLS_CHACHA20_POLY1305_SHA256'" false

      cleanup
  }

  test_combined_configuration() {
      echo
      log_info "========== Testing Combined TLS Configuration =========="

      # Test all configurations together
      start_plugin "--tls-min-version=1.2 --tls-max-version=1.3 --tls-cipher-suites=TLS_AES_256_GCM_SHA384 --tls-curves=P-384" || return 1

      test_connection "Valid combination (TLS 1.3, AES256, P-384)" "-tls1_3 -ciphersuites 'TLS_AES_256_GCM_SHA384' -curves P-384" true
      test_connection "Invalid TLS version" "-tls1_1 -ciphersuites 'TLS_AES_256_GCM_SHA384' -curves P-384" false
      test_connection "Invalid cipher suite" "-tls1_3 -ciphersuites 'TLS_AES_128_GCM_SHA256' -curves P-384" false
      test_connection "Invalid curve" "-tls1_3 -ciphersuites 'TLS_AES_256_GCM_SHA384' -curves P-256" false

      cleanup
  }

  test_default_behavior() {
      echo
      log_info "========== Testing Default Behavior (No Restrictions) =========="

      # Test without any TLS restrictions
      start_plugin "" || return 1

      test_connection "Default TLS 1.2" "-tls1_2" true
      test_connection "Default TLS 1.3" "-tls1_3" true
      test_connection "Default P-256 curve" "-curves P-256" true
      test_connection "Default AES cipher" "-ciphersuites 'TLS_AES_256_GCM_SHA384'" true

      cleanup
  }

  # ==============================================================================
  # Main Execution
  # ==============================================================================

  main() {
      echo "=============================================================================="
      echo "                    PR #580 TLS Configuration Testing"
      echo "=============================================================================="

      check_prerequisites

      # Trap to ensure cleanup on script exit
      trap cleanup EXIT

      # Run all tests
      test_default_behavior
      test_tls_curves
      test_tls_versions
      test_cipher_suites
      test_combined_configuration

      # Print summary
      echo
      echo "=============================================================================="
      log_info "TEST SUMMARY"
      echo "=============================================================================="
      log_success "Tests passed: $TESTS_PASSED"
      if [[ $TESTS_FAILED -gt 0 ]]; then
          log_failure "Tests failed: $TESTS_FAILED"
          echo
          log_failure "Some TLS configuration features are not working correctly!"
          exit 1
      else
          echo
          log_success "All TLS configuration features are working correctly!"
          log_success "PR #580 TLS configuration is functioning as expected!"
      fi
  }

  # ==============================================================================
  # Script Usage
  # ==============================================================================

  if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
      # Show usage if help is requested
      if [[ "$1" == "-h" || "$1" == "--help" ]]; then
          echo "Usage: $0"
          echo ""
          echo "This script tests PR #580 TLS configuration features:"
          echo "  - TLS curves configuration (--tls-curves)"
          echo "  - TLS version ranges (--tls-min-version, --tls-max-version)"
          echo "  - TLS cipher suites (--tls-cipher-suites)"
          echo "  - Combined configurations"
          echo ""
          echo "Prerequisites:"
          echo "  - plugin-backend binary in current directory"
          echo "  - OpenSSL installed"
          echo "  - Port 9443 available"
          echo ""
          echo "Options:"
          echo "  -h, --help    Show this help message"
          exit 0
      fi

      main "$@"
  fi



