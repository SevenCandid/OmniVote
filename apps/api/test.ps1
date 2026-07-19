$email = "test_$(Get-Date -UFormat %s)@example.com"
echo "Registering $email..."
curl.exe -s -X POST "http://localhost:8000/api/v1/identity/auth/register" -H "Content-Type: application/json" -d "{""email"": ""$email"", ""first_name"": ""Test"", ""last_name"": ""User"", ""password"": ""password123""}"

echo "Activating user..."
docker exec -e PGPASSWORD=Nexra2026 omnivote-postgres psql -U postgres -d omnivote -c "UPDATE identity_users SET status = 'active' WHERE email = '$email';"

echo "Logging in..."
$token_json = curl.exe -s -X POST "http://localhost:8000/api/v1/identity/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=$email&password=password123"
$token = ($token_json | ConvertFrom-Json).access_token
echo "Token: $token"

echo "Creating org..."
curl.exe -v -s -X POST "http://localhost:8000/api/v1/organizations/" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{""name"": ""Test Org"", ""slug"": ""test-org-$(Get-Date -UFormat %s)""}"
