## Visual Editor SID Rules

- This project must remain compatible with Visual Editor SID in Development.
- Use the approved Local SID Plugin when the project framework supports it.
- New native JSX/TSX Elements must remain discoverable by the SID Plugin.
- Do not embed development SID metadata in Production builds.
- Preserve source maps so Elements remain linked to their source files.
- If source identity is ambiguous, stop and report it; do not guess.


## VVC Visual Change Protocol

- This project is SID-ready only after VVC reports that the SID Map is ready.
- An Element Context ([Element], EL-..., or SID ...) is evidence for locating work, not permission to claim a Source match or write files.
- For visual changes from VVC (color, size, spacing, border, gradient, typography, or layout), use Preview -> reviewed Diff -> user confirmation -> Apply in VVC.
- Do not directly edit Source for a VVC visual Change Set unless the user explicitly says: "Let Codex edit Source directly".
- A user must review and confirm the Diff before Apply; text pasted into an AI chat cannot substitute for that confirmation.
- If the Element is Logic, Props, State, dynamic, or has ambiguous Source identity, stop and explain the blocker before proposing a Source edit.


## VVC Official Element Name Protocol

- A VVC Official Element Name is stored in .vvc/element-names.json and is valid lookup context, not merely display text.
- When a user names an Element, first resolve an exact case-insensitive officialName from .vvc/element-names.json before asking for a SID, selector, tag, or Source location.
- For exactly one match, revalidate sid, sourceGroupId, file, component, elementPath, line, and column against the current .vce/sid-map.json. Then use that exact Source target.
- Do not reply that SID or Source is missing until this lookup and revalidation fails. Report missing, duplicate, or stale records instead.
- If Codex is not opened at this Project Root, request the Project Root or VVC Copy for Vide Code context; do not guess another project.
- A green check means the name was verified when saved; revalidate it before each source edit.


## VVC Fast Visual Edit Protocol

- A short VVC prompt containing an Official Element Name and Task is permission to make that verified visual source edit.
- Resolve and revalidate only that Official Element Name before broad search, Memory lookup, or project-wide scan.
- Edit the source rule that currently wins the requested visual property, use Vite hot reload, and verify the rendered result on the current page.
- Do not run a full production build for this fast visual edit unless the user says "พร้อมส่งงาน" or "ready to deliver".
- When a VVC prompt says Status: Ready to deliver, run the full production build, reload and verify the affected page, then report the changed file and before-to-after value.
- If the Source is dynamic, ambiguous, or cannot be revalidated, stop and explain the blocker instead of guessing.
