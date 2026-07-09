# Redis Key Namespaces / Prefixes

# Rate limiting prefixes
RATE_LIMIT_PREFIX = "omnivote:ratelimit"

# Security and verification token prefixes
VERIFICATION_TOKEN_PREFIX = "omnivote:token:verify"
PASSWORD_RESET_PREFIX = "omnivote:token:password"

# Distributed locking prefixes
LOCK_PREFIX = "omnivote:lock"

# Session and caching prefixes
USER_SESSION_PREFIX = "omnivote:session"
CACHE_PREFIX = "omnivote:cache"
