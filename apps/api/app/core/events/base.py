import uuid
import datetime
from typing import Any, Dict, Protocol, TypeVar
from pydantic import BaseModel, Field

class Event(BaseModel):
    """
    Base class for all domain events.
    """
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    occurred_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    
    @property
    def event_name(self) -> str:
        return self.__class__.__name__

E = TypeVar('E', bound=Event)

class EventHandler(Protocol[E]):
    """
    Protocol for event handlers.
    """
    async def handle(self, event: E) -> None:
        ...
