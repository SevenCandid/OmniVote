import sys
import re

COMMIT_MSG_FILE = sys.argv[1]

CONVENTIONAL_REGEX = re.compile(
    r"^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([a-z0-9\-]+\))?: .+$"
)

with open(COMMIT_MSG_FILE, "r", encoding="utf-8") as f:
    # Get the first line of the commit message (excluding comments)
    lines = f.readlines()
    commit_msg = ""
    for line in lines:
        if not line.strip().startswith("#"):
            commit_msg = line.strip()
            break

if not commit_msg:
    print("Error: Empty commit message.")
    sys.exit(1)

# Check conventional commit message pattern
if not CONVENTIONAL_REGEX.match(commit_msg):
    print("\n[GIT EXCEPTION] Invalid Commit Message Format!")
    print(f"Message: '{commit_msg}'")
    print("\nCommit messages must follow the Conventional Commits specification:")
    print("  <type>(<scope>): <description>")
    print("\nAllowed types:")
    print("  feat, fix, docs, style, refactor, test, chore, perf, ci, build")
    print("\nExamples:")
    print("  feat(auth): add login endpoint")
    print("  fix(votes): prevent duplicate submissions")
    print("  docs(api): update API documentation\n")
    sys.exit(1)

print("Commit message format validation passed.")
sys.exit(0)
