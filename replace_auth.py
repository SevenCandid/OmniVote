import os

def replace_in_file(path):
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('membership=Depends(RequirePermission', 'auth_context: dict = Depends(RequirePermission')
    content = content.replace('membership.id', 'auth_context["membership_id"]')
    content = content.replace('membership: Membership = Depends(RequirePermission', 'auth_context: dict = Depends(RequirePermission')
    with open(path, 'w') as f:
        f.write(content)

files = [
    'apps/api/app/modules/rbac/routes/roles.py',
    'apps/api/app/modules/rbac/routes/memberships.py',
    'apps/api/app/modules/support/routes/support.py',
    'apps/api/app/api/v1/endpoints/organizations.py',
]

for file in files:
    if os.path.exists(file):
        replace_in_file(file)
        print(f"Replaced in {file}")
