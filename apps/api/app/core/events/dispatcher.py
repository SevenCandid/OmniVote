import asyncio
import logging
from typing import Any, Dict, List, Type
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.events.base import Event, EventHandler

logger = logging.getLogger(__name__)

class EventDispatcher:
    def __init__(self):
        self._handlers: Dict[Type[Event], List[EventHandler]] = {}

    def register(self, event_type: Type[Event], handler: EventHandler) -> None:
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    async def publish(self, event: Event) -> None:
        """
        Publishes the event to all registered handlers synchronously in sequence,
        catching exceptions so one failing handler does not affect others.
        In a real production system, this could push to a message broker (Kafka, Redis Streams).
        """
        handlers = self._handlers.get(type(event), [])
        logger.info(f"Publishing event {event.event_name} to {len(handlers)} handlers.")
        for handler in handlers:
            try:
                await handler.handle(event)
            except Exception as e:
                logger.error(f"Error executing handler {handler.__class__.__name__} for event {event.event_name}: {e}", exc_info=True)

    def register_pending_event(self, session: AsyncSession, domain_event: Event) -> None:
        """
        Registers an event to be published only after the SQLAlchemy session commits.
        """
        if not hasattr(session, "info"):
            session.info = {}
        
        if "pending_events" not in session.info:
            session.info["pending_events"] = []
            
        session.info["pending_events"].append(domain_event)
        
        # Ensure we only attach the listener once per session
        if "has_event_listener" not in session.info:
            # We attach to the sync session underlying the AsyncSession
            sync_session = session.sync_session
            
            @event.listens_for(sync_session, "after_commit")
            def receive_after_commit(sess):
                pending = sess.info.get("pending_events", [])
                if not pending:
                    return
                
                # Because after_commit is a sync hook and our handlers are async,
                # we need to schedule them on the running event loop.
                try:
                    loop = asyncio.get_running_loop()
                    for ev in pending:
                        loop.create_task(self.publish(ev))
                except RuntimeError:
                    # If there's no running loop, we can't dispatch properly here.
                    logger.error("No running event loop found during after_commit, events dropped.")
                    
                sess.info["pending_events"] = []

            @event.listens_for(sync_session, "after_rollback")
            def receive_after_rollback(sess):
                # Clear pending events on rollback
                if "pending_events" in sess.info:
                    sess.info["pending_events"] = []
                    
            session.info["has_event_listener"] = True

# Global singleton dispatcher
_global_dispatcher = EventDispatcher()

def get_event_dispatcher() -> EventDispatcher:
    return _global_dispatcher
