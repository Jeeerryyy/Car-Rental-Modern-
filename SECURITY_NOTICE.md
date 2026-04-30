# Security Notice

## JWT Secret Rotation Required — 2026-04-30

The JWT_SECRET previously used in development was committed to git history and is now considered **compromised**. It has been invalidated.

### Impact
- All previously issued JWT tokens are now invalid
- All users will need to log in again after deployment

### Required Action Before Deploying

Generate a new cryptographically secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as your `JWT_SECRET` environment variable in your hosting platform (Render / Vercel / Railway).

### Recommended: Purge Git History

To fully remove the old secret from version control:

```bash
# Using BFG Repo Cleaner (recommended)
bfg --replace-text passwords.txt .
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

Or use `git filter-branch` to rewrite history and remove `.env` from all past commits.

---

*This notice was generated as part of the pre-deployment security audit.*
