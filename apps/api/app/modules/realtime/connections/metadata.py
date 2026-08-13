import datetime
import hashlib
from dataclasses import dataclass, field
from typing import Literal, Optional, Set


@dataclass
class ConnectionMetadata:
    connection_id: str
    connection_type: Literal["user", "visitor", "service"]
    authenticated: bool
    authentication_method: Literal["jwt", "visitor_token", "service_token"]
    user_id: Optional[str] = None
    visitor_session_id: Optional[str] = None
    organization_ids: Set[str] = field(default_factory=set)
    active_election_ids: Set[str] = field(default_factory=set)
    connected_at: datetime.datetime = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_seen: datetime.datetime = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    heartbeat_count: int = 0
    client_version: Optional[str] = None
    platform: Optional[str] = None
    device_type: Optional[str] = None
    ip_hash: Optional[str] = None
    user_agent_hash: Optional[str] = None
    subscribed_channels: Set[str] = field(default_factory=set)

    @staticmethod
    def hash_string(value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]
