#!/bin/bash
set -e

# Generate a random email
EMAIL="test_$(date +%s)@example.com"

echo "Registering $EMAIL..."
curl -s -X POST "http://localhost:8000/api/v1/identity/auth/register" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$EMAIL\", \"first_name\": \"Test\", \"last_name\": \"User\", \"password\": \"password123\"}"

echo "Activating user..."
docker exec -e PGPASSWORD=Nexra2026 omnivote-postgres psql -U postgres -d omnivote -c "UPDATE identity_users SET status = 'active' WHERE email = '$EMAIL';"

echo "Logging in..."
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/identity/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=$EMAIL&password=password123" | jq -r .access_token)

echo "Token: $TOKEN"

echo "Creating org..."
curl -v -s -X POST "http://localhost:8000/api/v1/organizations/" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"name\": \"Test Org\", \"slug\": \"test-org-$(date +%s)\"}"
