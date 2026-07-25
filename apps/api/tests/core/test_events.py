import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.events.base import Event, EventHandler
from app.core.events.dispatcher import EventDispatcher

class DummyEvent(Event):
    payload: str

class DummyHandler(EventHandler[DummyEvent]):
    def __init__(self):
        self.handled_events = []

    async def handle(self, event: DummyEvent) -> None:
        self.handled_events.append(event)

class FailingHandler(EventHandler[DummyEvent]):
    async def handle(self, event: DummyEvent) -> None:
        raise ValueError("I failed")

@pytest.mark.asyncio
async def test_event_dispatcher_register_and_publish():
    dispatcher = EventDispatcher()
    handler = DummyHandler()
    
    dispatcher.register(DummyEvent, handler)
    
    event = DummyEvent(payload="test")
    await dispatcher.publish(event)
    
    assert len(handler.handled_events) == 1
    assert handler.handled_events[0].payload == "test"

@pytest.mark.asyncio
async def test_event_dispatcher_failing_handler_isolation():
    dispatcher = EventDispatcher()
    handler1 = DummyHandler()
    handler2 = FailingHandler()
    handler3 = DummyHandler()
    
    dispatcher.register(DummyEvent, handler1)
    dispatcher.register(DummyEvent, handler2)
    dispatcher.register(DummyEvent, handler3)
    
    event = DummyEvent(payload="test")
    # Should not raise exception
    await dispatcher.publish(event)
    
    assert len(handler1.handled_events) == 1
    assert len(handler3.handled_events) == 1

@pytest.mark.asyncio
async def test_register_pending_event_on_session():
    dispatcher = EventDispatcher()
    
    mock_session = AsyncMock(spec=AsyncSession)
    mock_session.info = {}
    mock_session.sync_session = MagicMock()
    
    event = DummyEvent(payload="pending")
    
    dispatcher.register_pending_event(mock_session, event)
    
    assert "pending_events" in mock_session.info
    assert len(mock_session.info["pending_events"]) == 1
    assert mock_session.info["pending_events"][0] == event
    assert "has_event_listener" in mock_session.info
