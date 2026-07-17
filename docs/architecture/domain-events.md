# Domain Events

Domain Events represent significant business occurrences that have taken place in the past. They are used to communicate state changes between Bounded Contexts asynchronously, promoting loose coupling.

## Core Domain Events

### Organization Context
*   `OrganizationCreated`: Emitted when a new tenant is provisioned. Triggers billing setup.
*   `MemberInvited`: Triggers the Notifications context to send an invitation email.
*   `MemberJoined`: Emitted when an invite is accepted. Updates audit logs.
*   `SubscriptionUpgraded`: Emitted when a tenant changes tiers. Unlocks features in Event Management.

### Event Management Context
*   `EventCreated`: Emitted when a draft event is saved.
*   `EventPublished`: Emitted when an event transitions to 'Live'. Locks critical configurations.
*   `CandidateRegistered`: Emitted when a new candidate is added to a category.
*   `EventClosed`: Emitted when the time window expires. Triggers final result calculation.

### Voting Engine Context
*   `VotingStarted`: Emitted when the engine opens its gates for a specific Event.
*   `VoteCast`: A critical, high-volume event. Emitted when a vote is successfully persisted. Consumed by Reporting for real-time dashboards and Audit for traceability.
*   `VoteVoided`: Emitted if a vote is flagged for fraud post-factum.

### Payment Context
*   `PaymentInitialized`: Emitted when a checkout session begins.
*   `PaymentConfirmed`: Emitted when funds are captured. Triggers the Voting Engine to finalize Paid Votes.
*   `PaymentFailed`: Emitted on card decline. Triggers notification to voter.
*   `PaymentRefunded`: Triggers Voting Engine to deduct corresponding votes.

### Reporting Context
*   `ResultsPublished`: Emitted when official results are made public. Triggers Notifications to stakeholders.
