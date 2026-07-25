import os
import re

files_to_fix = [
    'src/features/memberships/components/InvitationList.tsx',
    'src/features/memberships/components/MemberList.tsx',
    'src/features/memberships/pages/OrganizationInvitationsPage.tsx',
    'src/features/memberships/pages/OrganizationSettingsPage.tsx',
    'src/features/memberships/pages/UserInvitationsPage.tsx',
    'src/features/organizations/components/OrganizationForm.tsx',
    'src/features/organizations/layouts/OrganizationLayout.tsx',
    'src/features/rbac/services/rbacApi.ts',
    'src/features/support/components/CreateSupportRequestDialog.tsx',
    'src/features/support/components/PlatformRequestsTable.tsx',
    'src/tests/components/BaseButton.test.tsx',
    'src/tests/components/BaseInput.test.tsx',
    'src/tests/components/EmptyState.test.tsx',
    'src/tests/components/BaseBadge.test.tsx',
    'src/tests/components/BaseCard.test.tsx',
    'src/tests/components/BaseLoader.test.tsx',
    'src/tests/pages/Placeholder.test.tsx'
]

for file in files_to_fix:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf8') as f:
            content = f.read()
            
        # React imports in tests
        content = re.sub(r'import\s+React\s+from\s+[\'\"].*react[\'\"]\s*;\n', '', content)
        
        # Test imports (vi missing)
        if 'vi.' in content or 'vi ' in content:
            if 'import { describe, it, expect' in content and 'vi' not in content:
                content = content.replace('import { describe, it, expect }', 'import { describe, it, expect, vi }')
            elif 'import { describe, it, expect,' not in content and 'import { describe, expect, it }' in content:
                content = content.replace('import { describe, expect, it }', 'import { describe, expect, it, vi }')
                
        with open(file, 'w', encoding='utf8') as f:
            f.write(content)

