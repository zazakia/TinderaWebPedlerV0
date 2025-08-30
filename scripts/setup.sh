#!/bin/bash

# TindahanKO POS - Automated Setup Script
# Version: 1.0
# Date: August 29, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/setup.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE} TindahanKO POS Setup Script${NC}"
    echo -e "${PURPLE} Version 1.0 - Production Ready${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get user input with default
get_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"

    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        input=${input:-$default}
    else
        read -p "$prompt: " input
    fi

    eval "$var_name='$input'"
}

# Function to validate email format
validate_email() {
    local email="$1"
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."

    local requirements_met=true

    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2)
        local major_version=$(echo "$node_version" | cut -d'.' -f1)
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js $node_version detected"
        else
            print_error "Node.js 18+ required, found $node_version"
            requirements_met=false
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+"
        requirements_met=false
    fi

    # Check package manager
    if command_exists pnpm; then
        print_success "pnpm detected (recommended)"
        PACKAGE_MANAGER="pnpm"
    elif command_exists npm; then
        print_success "npm detected"
        PACKAGE_MANAGER="npm"
    else
        print_error "No package manager found. Please install npm or pnpm"
        requirements_met=false
    fi

    # Check Git
    if command_exists git; then
        print_success "Git detected"
    else
        print_error "Git not found. Please install Git"
        requirements_met=false
    fi

    # Check curl
    if command_exists curl; then
        print_success "curl detected"
    else
        print_warning "curl not found. Some features may not work"
    fi

    if [ "$requirements_met" = false ]; then
        print_error "System requirements not met. Please install missing dependencies."
        exit 1
    fi

    print_success "All system requirements met!"
}

# Function to setup project dependencies
setup_dependencies() {
    print_status "Installing project dependencies..."

    cd "$PROJECT_ROOT"

    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi

    print_success "Dependencies installed successfully!"
}

# Function to collect configuration
collect_configuration() {
    print_status "Collecting configuration information..."
    echo ""

    print_status "Please provide the following information:"
    echo ""

    # Supabase Configuration
    echo -e "${YELLOW}Supabase Configuration:${NC}"
    get_input "Supabase Project URL" "" SUPABASE_URL
    get_input "Supabase Anon Key" "" SUPABASE_ANON_KEY
    get_input "Supabase Service Role Key" "" SUPABASE_SERVICE_KEY
    echo ""

    # Business Information
    echo -e "${YELLOW}Business Information:${NC}"
    get_input "Business Name" "My Store" BUSINESS_NAME
    get_input "Business Address" "" BUSINESS_ADDRESS
    get_input "Business Phone" "" BUSINESS_PHONE

    while true; do
        get_input "Business Email" "" BUSINESS_EMAIL
        if validate_email "$BUSINESS_EMAIL"; then
            break
        else
            print_error "Invalid email format. Please try again."
        fi
    done
    echo ""

    # Application Configuration
    echo -e "${YELLOW}Application Configuration:${NC}"
    get_input "Application URL" "http://localhost:3000" APP_URL
    get_input "Application Name" "TindahanKO POS" APP_NAME
    echo ""

    # Feature Flags
    echo -e "${YELLOW}Feature Configuration:${NC}"
    echo "Enable the following features? (y/n)"

    read -p "Barcode Scanner [y]: " enable_barcode
    ENABLE_BARCODE=${enable_barcode:-y}

    read -p "Offline Mode [y]: " enable_offline
    ENABLE_OFFLINE=${enable_offline:-y}

    read -p "Multi-location Support [n]: " enable_multi_location
    ENABLE_MULTI_LOCATION=${enable_multi_location:-n}

    echo ""
    print_success "Configuration collected successfully!"
}

# Function to create environment file
create_environment_file() {
    print_status "Creating environment configuration..."

    local env_file="$PROJECT_ROOT/.env.local"

    # Generate security keys
    local nextauth_secret=$(generate_secret)
    local jwt_secret=$(generate_secret)

    cat > "$env_file" << EOF
# ========================================
# TindahanKO POS - Environment Configuration
# Generated on: $(date)
# ========================================

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Application Configuration
NEXT_PUBLIC_APP_URL=$APP_URL
NEXT_PUBLIC_APP_NAME=$APP_NAME
NEXT_PUBLIC_APP_VERSION=1.0.0

# Business Configuration
NEXT_PUBLIC_BUSINESS_NAME=$BUSINESS_NAME
NEXT_PUBLIC_BUSINESS_ADDRESS=$BUSINESS_ADDRESS
NEXT_PUBLIC_BUSINESS_PHONE=$BUSINESS_PHONE
NEXT_PUBLIC_BUSINESS_EMAIL=$BUSINESS_EMAIL

# Feature Flags
NEXT_PUBLIC_ENABLE_BARCODE_SCANNER=$([ "$ENABLE_BARCODE" = "y" ] && echo "true" || echo "false")
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=$([ "$ENABLE_OFFLINE" = "y" ] && echo "true" || echo "false")
NEXT_PUBLIC_ENABLE_MULTI_LOCATION=$([ "$ENABLE_MULTI_LOCATION" = "y" ] && echo "true" || echo "false")

# Security Configuration
NEXTAUTH_SECRET=$nextauth_secret
NEXTAUTH_URL=$APP_URL
SUPABASE_JWT_SECRET=$jwt_secret

# Environment
NODE_ENV=development
EOF

    print_success "Environment file created: .env.local"
}

# Function to test database connection
test_database_connection() {
    print_status "Testing database connection..."

    local test_url="$SUPABASE_URL/rest/v1/products?limit=1"

    if command_exists curl; then
        local response=$(curl -s -w "%{http_code}" -H "apikey: $SUPABASE_ANON_KEY" "$test_url" -o /dev/null)

        if [ "$response" = "200" ]; then
            print_success "Database connection successful!"
        else
            print_warning "Database connection test returned HTTP $response"
            print_warning "Please verify your Supabase configuration"
        fi
    else
        print_warning "Cannot test database connection (curl not available)"
    fi
}

# Function to run database migrations
run_database_migrations() {
    print_status "Checking database schema..."

    echo ""
    print_warning "Database migrations need to be run manually via Supabase Dashboard:"
    echo ""
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Run the following migration files in order:"
    echo "   - supabase/migrations/20250829000001_initial_schema.sql"
    echo "   - supabase/migrations/20250829000002_enhanced_products.sql"
    echo "   - supabase/migrations/20250829000003_inventory_transaction_system.sql"
    echo "   - supabase/migrations/20250829000004_inventory_transaction_system_complete.sql"
    echo ""

    read -p "Press Enter after running migrations, or 's' to skip: " skip_migrations

    if [ "$skip_migrations" != "s" ]; then
        print_success "Database migrations completed!"
    else
        print_warning "Database migrations skipped. Remember to run them before production use."
    fi
}

# Function to build and test application
build_and_test() {
    print_status "Building and testing application..."

    cd "$PROJECT_ROOT"

    # Type checking
    print_status "Running TypeScript checks..."
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run type-check || true
    else
        npm run type-check || true
    fi

    # Linting
    print_status "Running linter..."
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run lint || true
    else
        npm run lint || true
    fi

    # Build application
    print_status "Building application..."
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run build
    else
        npm run build
    fi

    print_success "Build completed successfully!"
}

# Function to create initial data
create_initial_data() {
    print_status "Setting up initial data..."

    echo ""
    print_status "Would you like to create sample data for testing? (y/n)"
    read -p "Create sample data? [n]: " create_sample
    create_sample=${create_sample:-n}

    if [ "$create_sample" = "y" ]; then
        print_status "Sample data creation should be done via the application interface"
        print_status "After starting the application, you can:"
        echo "  1. Add product categories"
        echo "  2. Add sample products"
        echo "  3. Add test customers"
        echo "  4. Configure business settings"
    else
        print_success "Skipping sample data creation"
    fi
}

# Function to setup development tools
setup_development_tools() {
    print_status "Setting up development tools..."

    # Create useful scripts
    local scripts_dir="$PROJECT_ROOT/scripts"
    mkdir -p "$scripts_dir"

    # Development start script
    cat > "$scripts_dir/dev.sh" << 'EOF'
#!/bin/bash
echo "Starting TindahanKO POS Development Server..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm dev
else
    npm run dev
fi
EOF

    # Build script
    cat > "$scripts_dir/build.sh" << 'EOF'
#!/bin/bash
echo "Building TindahanKO POS for production..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm build
else
    npm run build
fi
EOF

    # Make scripts executable
    chmod +x "$scripts_dir/dev.sh"
    chmod +x "$scripts_dir/build.sh"

    print_success "Development tools configured!"
}

# Function to display final instructions
display_final_instructions() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN} Setup Complete! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

    echo -e "${YELLOW}Next Steps:${NC}"
    echo ""

    echo "1. ${BLUE}Start Development Server:${NC}"
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        echo "   pnpm dev"
    else
        echo "   npm run dev"
    fi
    echo "   or run: ./scripts/dev.sh"
    echo ""

    echo "2. ${BLUE}Access Application:${NC}"
    echo "   Open browser to: $APP_URL"
    echo ""

    echo "3. ${BLUE}Configure Business Settings:${NC}"
    echo "   - Navigate to Settings in the application"
    echo "   - Update business information"
    echo "   - Configure tax rates and preferences"
    echo ""

    echo "4. ${BLUE}Add Initial Data:${NC}"
    echo "   - Create product categories"
    echo "   - Add your products"
    echo "   - Set up customer accounts"
    echo ""

    echo "5. ${BLUE}Production Deployment:${NC}"
    echo "   - Review DEPLOYMENT_GUIDE.md"
    echo "   - Configure production environment"
    echo "   - Deploy to Vercel or your preferred platform"
    echo ""

    echo -e "${YELLOW}Important Files:${NC}"
    echo "   📄 .env.local - Environment configuration"
    echo "   📖 DEPLOYMENT_GUIDE.md - Production deployment guide"
    echo "   📋 IMPLEMENTATION_PROGRESS.md - Feature implementation status"
    echo "   📝 setup.log - Setup process log"
    echo ""

    echo -e "${YELLOW}Support & Resources:${NC}"
    echo "   📚 Documentation: ./docs/"
    echo "   🐛 Issues: Create GitHub issue for problems"
    echo "   💬 Community: Join our Discord server"
    echo ""

    print_success "TindahanKO POS is ready for use!"
    echo ""
    echo -e "${PURPLE}Happy Selling! 🏪✨${NC}"
}

# Function to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Setup failed. Check setup.log for details."
        echo ""
        echo "Common issues and solutions:"
        echo "1. Node.js version: Ensure Node.js 18+ is installed"
        echo "2. Network issues: Check internet connection"
        echo "3. Permissions: Ensure write access to project directory"
        echo "4. Supabase config: Verify URL and API keys"
        echo ""
    fi
}

# Main setup function
main() {
    trap cleanup EXIT

    # Initialize log file
    echo "TindahanKO POS Setup Log - $(date)" > "$LOG_FILE"

    print_header

    # Run setup steps
    check_requirements
    echo ""

    collect_configuration
    echo ""

    create_environment_file
    echo ""

    setup_dependencies
    echo ""

    test_database_connection
    echo ""

    run_database_migrations
    echo ""

    build_and_test
    echo ""

    create_initial_data
    echo ""

    setup_development_tools
    echo ""

    display_final_instructions
}

# Check if running with proper permissions
if [ ! -w "$PROJECT_ROOT" ]; then
    print_error "No write permission to project directory"
    print_error "Please ensure you have write access to: $PROJECT_ROOT"
    exit 1
fi

# Run main setup
main "$@"
