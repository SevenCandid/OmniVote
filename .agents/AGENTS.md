# Workspace Rules

## Sprint Conclusion & Architecture Review Checklist

Before officially closing any sprint and concluding the work, the agent must verify the following **Architecture Review Checklist**. Ensure everything passes and flag any issues to the user before marking the sprint as Complete.

### Domain
- Does the implementation match the approved domain model?
- Were any new business concepts introduced? If so, are they documented?

### API
- Is the API consistent with existing conventions?
- Are validation and error responses uniform?

### UI
- Is the experience consistent?
- Is it responsive?
- Does it follow the OmniVote design language?

### Performance
- Any obvious N+1 queries?
- Unnecessary re-renders?
- Opportunities for caching?

### Security
- Input validation (e.g., Zod schemas, Pydantic bounds)
- Authorization hooks
- Audit logging (where applicable)
- Sensitive data handling

If the entire checklist passes, you may close the sprint. This serves as a consistent quality gate.
