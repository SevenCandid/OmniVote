# Domain Glossary (Ubiquitous Language)

This document defines the core terminology used throughout the OmniVote platform. These terms form the Ubiquitous Language, establishing a shared understanding between business stakeholders and engineering teams.

## Core Definitions

* **Organization**: A distinct legal entity, company, or group that utilizes OmniVote to host events. An organization represents a tenant boundary within the system.
* **Workspace**: A logical sub-division within an Organization, allowing large tenants to isolate events, billing, or teams (e.g., "HR Dept", "Student Union").
* **Member**: An individual who belongs to an Organization or Workspace and is granted specific capabilities (via Roles) to manage or operate the platform.
* **User**: A generalized identity within the system. A User may be a Member of an Organization or simply a Voter in a public event.
* **Event**: A time-bound, configured voting occurrence (e.g., an election, a poll, a paid contest). The core vehicle for participation.
* **Event Type**: A predefined configuration template (e.g., "Strict Election", "Paid Competition") that dictates the rules, validation, and capabilities of an Event.
* **Category**: A specific grouping within an Event representing a single race or award (e.g., "President", "Best Actor").
* **Candidate**: An individual, team, or option that can receive votes within a Category.
* **Contestant**: A synonymous term for Candidate, often used in paid voting or reality show Event Types.
* **Ballot**: A structured representation of a Voter's choices across multiple Categories within a single Event.
* **Voter**: An individual who participates in an Event by casting a Vote. A Voter's identity may be strictly verified or completely anonymous depending on the Event Type.
* **Vote**: An immutable record representing a Voter's selection of a Candidate.
* **Payment**: The financial transaction associated with a Vote in a paid voting Event.
* **Transaction**: A ledger entry detailing the movement of funds, credits, or vote allocations.
* **Result**: The calculated outcome of an Event or Category, derived purely from the aggregated Votes.
* **Notification**: An outbound communication (Email, SMS, Webhook) triggered by a Domain Event.
* **Subscription**: An Organization's billing tier and feature entitlement agreement with OmniVote.
* **Audit Log**: An immutable, chronological record of significant actions taken by Members or the System for compliance and traceability.
* **Role**: A named collection of Permissions assigned to a Member within an Organization.
* **Permission**: A granular, specific right to perform an action within the system (e.g., "event:create", "results:view").
