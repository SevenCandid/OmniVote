from app.core.events.dispatcher import get_event_dispatcher
from app.modules.election.events import BallotSubmitted
from app.modules.election.handlers.results_handler import ResultsUpdateHandler
from app.modules.election.handlers.audit_handler import AuditEventHandler
from app.modules.election.handlers.analytics_handler import AnalyticsHandler

def setup_event_dispatcher():
    dispatcher = get_event_dispatcher()
    
    dispatcher.register(BallotSubmitted, ResultsUpdateHandler())
    dispatcher.register(BallotSubmitted, AuditEventHandler())
    dispatcher.register(BallotSubmitted, AnalyticsHandler())
