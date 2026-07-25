import os
import re

def fix_file(filepath, replacements):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf8') as f:
        content = f.read()
    
    for old, new in replacements:
        if callable(old):
            content = old(content)
        else:
            content = content.replace(old, new)
            
    with open(filepath, 'w', encoding='utf8') as f:
        f.write(content)

# 1. ElectionCreatePage.tsx
fix_file('src/features/elections/pages/ElectionCreatePage.tsx', [
    ("Globe,\n  Users,\n", ""),
    ("  Globe,\n  Users,\n", ""),
    ("Globe, Users, ", ""),
    ("Globe,", ""),
    ("Users,", ""),
    ("const { register, handleSubmit, control, watch, formState: { errors } } = useForm", "const { register, handleSubmit, formState: { errors } } = useForm"),
    ("const { register, handleSubmit, control, watch, formState", "const { register, handleSubmit, formState")
])

# 2. ElectionEditPage.tsx
def fix_election_edit(c):
    c = c.replace("<AlertCircle", "<Settings")
    c = c.replace("AlertCircle", "Settings")
    return c
fix_file('src/features/elections/pages/ElectionEditPage.tsx', [(fix_election_edit, "")])

# 3. auditApi.ts
def fix_audit_api(c):
    c = re.sub(r':\s*int', ': number', c)
    return c
fix_file('src/features/identity/api/auditApi.ts', [(fix_audit_api, "")])

# 4. VerifyEmailPage.tsx
fix_file('src/features/identity/pages/VerifyEmailPage.tsx', [
    ("import { Link, useNavigate", "import { useNavigate")
])

# 5. InvitationList.tsx
def fix_invitation_list(c):
    c = c.replace("React.MouseEvent", "any")
    c = c.replace("React.ReactNode", "any")
    c = re.sub(r'import\s*\{\s*\}\s*from\s*[\'\"].*[\'\"];?\n', '', c)
    return c
fix_file('src/features/memberships/components/InvitationList.tsx', [(fix_invitation_list, "")])

# 6. OrganizationInvitationsPage.tsx
fix_file('src/features/memberships/pages/OrganizationInvitationsPage.tsx', [
    ("  useOrganization,\n", "")
])

