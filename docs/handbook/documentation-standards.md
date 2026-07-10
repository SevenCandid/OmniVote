# Documentation Standards

To keep OmniVote's codebase understandable for current developers, VeroSeven engineers, and external contributors, documentation must remain clean, accurate, and up-to-date.

---

## 1. Documentation Structure & Rules

All platform documentation resides under the [docs/](file:///c:/Users/DELL/omnivote/docs/) directory.
- **`docs/handbook/`**: Core principles, coding rules, release processes.
- **`docs/architecture/`**: High-level designs, database mappings, system diagrams.
- **`docs/decisions/`**: Architecture Decision Records (ADRs).
- **`docs/development/`**: Quickstarts, Git branch workflows, testing commands.
- **`docs/templates/`**: Feature requests, pull requests, sprint checklists templates.
- **`docs/roadmap/`**: Roadmaps, sprint status checklists.

---

## 2. Formatting Guidelines

- **Markdown**: Use Github-Flavored Markdown (GFM). Ensure files use UTF-8 encoding and LF line endings.
- **Headings Structure**: Use a single `#` header per page as the title, followed by `##` for core sections, and `###` for nested details. Keep heading names concise.
- **Markdown Links**: When referencing codebase files or other documentation pages, use absolute file scheme links (e.g. `[testing-guide.md](file:///c:/Users/DELL/omnivote/docs/development/testing-guide.md)`). Avoid relative links to keep navigation working across editors.

---

## 3. Architecture Decision Records (ADRs)

For any major architectural shifts, new tech stack dependencies, or library choices:
- Create a new ADR file in the `docs/decisions/` folder using the format `ADR-XXX-slug.md` (where `XXX` is a sequential index, e.g. `007`).
- Write the ADR using [ADR-template.md](file:///c:/Users/DELL/omnivote/docs/templates/ADR.md).
- Update the index table in [docs/decisions/README.md](file:///c:/Users/DELL/omnivote/docs/decisions/README.md).

---

## 4. Keeping Documentation Up-to-Date
- **Verify changes**: When updating API routes, model columns, or package scripts, immediately update the corresponding docs files.
- **No placeholder text**: Avoid writing "TODO" or placeholder copy in documentation. If a section is not yet implemented, document it clearly as a planned future milestone.
