import pytest
from app.modules.realtime.connections.metadata import ConnectionMetadata
from app.modules.realtime.connections.manager import ConnectionManager
from app.modules.realtime.gateway.gateway import RealtimeGateway
from app.modules.realtime.schemas.events import RealtimeEvent, ResultsUpdatedPayload


@pytest.mark.asyncio
async def test_connection_metadata_hashing():
    ip_hash = ConnectionMetadata.hash_string("192.168.1.1")
    assert ip_hash is not None
    assert len(ip_hash) == 16
    assert ConnectionMetadata.hash_string(None) is None


@pytest.mark.asyncio
async def test_connection_manager_presence_and_metrics():
    manager = ConnectionManager()
    
    meta1 = ConnectionMetadata(
        connection_id="conn-1",
        connection_type="user",
        authenticated=True,
        authentication_method="jwt",
        user_id="user-123",
        organization_ids={"org-1"},
    )
    meta2 = ConnectionMetadata(
        connection_id="conn-2",
        connection_type="visitor",
        authenticated=True,
        authentication_method="visitor_token",
        visitor_session_id="visitor-456",
        active_election_ids={"elec-789"},
    )

    # Mock websocket class
    class MockWS:
        async def send_text(self, text):
            pass

    await manager.connect(MockWS(), meta1)
    await manager.connect(MockWS(), meta2)

    await manager.subscribe("conn-1", "election.elec-789.results")
    await manager.subscribe("conn-2", "election.elec-789.results")

    presence = await manager.get_presence("election.elec-789.results")
    assert presence["online_connections"] == 2
    assert presence["online_users"] == 1
    assert presence["online_visitors"] == 1

    metrics = await manager.get_metrics()
    assert metrics["connected_sockets"] == 2
    assert metrics["authenticated_users"] == 1
    assert metrics["anonymous_visitors"] == 1
    assert metrics["active_channels"] == 1

    await manager.disconnect("conn-1")
    await manager.disconnect("conn-2")

    metrics_after = await manager.get_metrics()
    assert metrics_after["connected_sockets"] == 0
    assert metrics_after["active_channels"] == 0


@pytest.mark.asyncio
async def test_gateway_subscription_authorization():
    gateway = RealtimeGateway()

    user_meta = ConnectionMetadata(
        connection_id="user-conn",
        connection_type="user",
        authenticated=True,
        authentication_method="jwt",
        user_id="usr-1",
        organization_ids={"org-abc"},
    )

    visitor_meta = ConnectionMetadata(
        connection_id="vis-conn",
        connection_type="visitor",
        authenticated=True,
        authentication_method="visitor_token",
        visitor_session_id="vis-1",
    )

    # User subscribing to org channel
    assert await gateway.authorize_subscription(user_meta, "organization.org-abc") is True
    assert await gateway.authorize_subscription(user_meta, "organization.org-other") is False

    # User subscribing to user channel
    assert await gateway.authorize_subscription(user_meta, "user.usr-1") is True
    assert await gateway.authorize_subscription(user_meta, "user.usr-2") is False

    # Visitor subscribing to election channel
    assert await gateway.authorize_subscription(visitor_meta, "election.123.results") is True
    assert await gateway.authorize_subscription(visitor_meta, "organization.org-abc") is False


@pytest.mark.asyncio
async def test_realtime_event_schema_serialization():
    payload = ResultsUpdatedPayload(
        election_id="elec-1",
        total_ballots_cast=150,
        candidate_tallies={"cand-a": 100, "cand-b": 50},
        percentages={"cand-a": 66.67, "cand-b": 33.33},
        updated_at="2026-07-26T10:00:00Z",
    )

    event = RealtimeEvent(
        event_name="ResultsUpdated",
        event_version=1,
        channel="election.elec-1.results",
        scope="results",
        payload=payload.model_dump(),
    )

    data = event.model_dump()
    assert data["event_name"] == "ResultsUpdated"
    assert data["channel"] == "election.elec-1.results"
    assert data["payload"]["total_ballots_cast"] == 150
