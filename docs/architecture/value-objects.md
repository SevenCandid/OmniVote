# Value Objects

Value Objects represent descriptive aspects of the domain with no conceptual identity. They are immutable; if their value changes, the object is replaced entirely. They encapsulate validation and logic related to their data.

## Identified Value Objects

### 1. Email Address
*   **Purpose**: Represents a valid email format.
*   **Why**: Encapsulates regex validation, normalization (lowercasing, trimming), and prevents passing around invalid strings.

### 2. Money
*   **Purpose**: Represents a financial value and its associated currency.
*   **Why**: Prevents adding USD to EUR. Avoids floating-point precision errors by strictly using integers (cents) and encapsulating formatting logic.

### 3. Time Window
*   **Purpose**: Represents a period with a discrete `StartTime` and `EndTime`.
*   **Why**: Encapsulates logic like `isOpen(currentTime)`, `hasStarted()`, and validation (`EndTime` must be strictly greater than `StartTime`). Used heavily by the Event engine.

### 4. Organization Branding
*   **Purpose**: Contains hex color codes, logo URLs, and typography settings.
*   **Why**: Groups related visual attributes. If the organization changes its theme, the entire Branding object is replaced.

### 5. Candidate Code
*   **Purpose**: A unique, short identifier (e.g., "CAND-01") used for USSD or SMS voting.
*   **Why**: Encapsulates formatting rules, length restrictions, and case-insensitivity logic.

### 6. Voting Rules
*   **Purpose**: A localized configuration object defining min/max selections allowed per category.
*   **Why**: It has no identity; it purely describes constraints.

### 7. IP Address & GeoLocation
*   **Purpose**: Represents the origin of a Voter.
*   **Why**: Used by the Eligibility Engine to enforce regional voting restrictions. Encapsulates parsing logic.
