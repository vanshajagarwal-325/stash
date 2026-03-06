# Content Gallery (Stash)

This is a web app for managing content links, events, and resources.

## Deployment Checklist & Safeguards

Before finishing a work session or deploying to live, follow this checklist to prevent a dirty workspace and broken states:

1. **Cross-File Integrity Scan**: If you added/removed categories or renamed fields, run a global `grep` to ensure no "ghost" elements remain in static HTML/CSS files.
2. **Run Checks**: Execute `npm run verify-clean` to ensure syntax is valid and the working tree will be clean post-commit.
3. **Commit**: Ensure `git status --short` is clean (except intended files) before and after your final commit.
4. **Deploy**: Deploy directly to live environments (e.g. `npx wrangler pages deploy .`) so there is no desync between the repo and the hosted version.
