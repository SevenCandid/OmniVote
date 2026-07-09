from arq.connections import RedisSettings
from app.core.config import settings

# Map core settings parameters into Arq RedisSettings schema
arq_redis_settings = RedisSettings(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    database=settings.REDIS_DB
)

# Separate Queue Namespaces mapped to critical and heavy operation domains
QUEUE_HIGH = "arq:queue:high"
QUEUE_NOTIFICATIONS = "arq:queue:notifications"
QUEUE_REPORTS = "arq:queue:reports"
QUEUE_MAINTENANCE = "arq:queue:maintenance"

ALL_QUEUES = [
    QUEUE_HIGH,
    QUEUE_NOTIFICATIONS,
    QUEUE_REPORTS,
    QUEUE_MAINTENANCE
]
