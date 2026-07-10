import os
import time
import uuid


def generate_uuid7() -> uuid.UUID:
    """
    Generate a UUIDv7 conforming to RFC 9562.
    Uses the native uuid.uuid7() if available (Python 3.14+),
    otherwise falls back to a clean Python-based generation.
    """
    if hasattr(uuid, "uuid7"):
        return uuid.uuid7()

    # Fallback implementation:
    # 48-bit timestamp in milliseconds
    timestamp_ms = int(time.time() * 1000)

    # Combine with random data
    # UUIDv7 format:
    # 48 bits: timestamp
    # 4 bits: version (7)
    # 12 bits: rand_a
    # 2 bits: variant (10)
    # 62 bits: rand_b
    rand_bytes = os.urandom(10)

    # 48 bits timestamp shifted left
    val = (timestamp_ms & 0xFFFFFFFFFFFF) << 80

    # 4 bits version + 12 bits rand_a
    rand_a = ((rand_bytes[0] << 8) | rand_bytes[1]) & 0x0FFF
    val |= (0x7000 | rand_a) << 64

    # 2 bits variant + 62 bits rand_b
    rand_b = 0
    for i in range(2, 10):
        rand_b = (rand_b << 8) | rand_bytes[i]
    rand_b &= 0x3FFFFFFFFFFFFFFF
    val |= 0x8000000000000000 | rand_b

    return uuid.UUID(int=val)
