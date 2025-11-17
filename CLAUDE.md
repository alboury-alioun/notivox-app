# CLAUDE.md - AI Assistant Guide for Notivox App

## Project Overview

**Project Name:** Notivox App
**Type:** Node.js HTTP Server Application
**Primary Language:** JavaScript (Node.js)
**Current Version:** 1.0.0
**Repository:** alboury-alioun/notivox-app

Notivox is a web application project currently in early development stages. The application uses French language for user-facing content ("Bienvenue sur Notivox !").

## Repository Structure

```
notivox-app/
├── .git/                 # Git version control
├── index.js             # Main application entry point (HTTP server)
├── package.json         # Node.js package configuration
└── CLAUDE.md           # This file - AI assistant guide
```

### Key Files

- **index.js:3-10** - Main HTTP server implementation using Node.js built-in `http` module
- **package.json:1-8** - Project metadata and scripts configuration

## Technology Stack

### Runtime & Core
- **Node.js** - JavaScript runtime environment
- **HTTP Module** - Built-in Node.js HTTP server (no framework)

### Current Dependencies
- None (using only Node.js built-in modules)

### Development Tools
- Git for version control
- No build tools configured yet
- No testing framework configured yet
- No linting tools configured yet

## Development Workflow

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd notivox-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # Currently no dependencies, but this will be needed as project grows
   ```

3. **Start the development server:**
   ```bash
   npm start
   # Server runs on port 3000 by default (configurable via PORT env var)
   ```

### Running the Application

- **Default command:** `npm start`
- **Direct execution:** `node index.js`
- **Port configuration:** Set `PORT` environment variable or defaults to 3000
- **Access:** http://localhost:3000

### Git Branching Strategy

This project uses a **Claude-specific branching strategy** for AI-assisted development:

#### Branch Naming Convention
- Feature branches follow pattern: `claude/claude-md-<session-id>`
- Example: `claude/claude-md-mi3l4lwim8qln6vo-01DggAsDCTaZqYyqujaCJCCG`
- **CRITICAL:** Branch names MUST start with `claude/` and end with matching session ID for push operations to succeed

#### Active Branches
- Current development branch: `claude/claude-md-mi3l4lwim8qln6vo-01DggAsDCTaZqYyqujaCJCCG`
- Previous branch: `claude/expert-file-analysis-012F8gPc3MNvQKBwx9MJu3p7`

#### Git Operations Best Practices

**Pushing Changes:**
```bash
# Always use -u flag with branch name
git push -u origin <branch-name>

# Retry logic: If push fails due to network errors, retry up to 4 times
# with exponential backoff (2s, 4s, 8s, 16s)
```

**Fetching/Pulling:**
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Apply same retry logic for network failures
```

**Important Git Rules:**
- NEVER push to branches not starting with `claude/` without explicit permission
- ALWAYS develop on designated feature branches
- COMMIT with clear, descriptive messages
- NEVER skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested
- NEVER force push to main/master branches

### Commit Message Conventions

- Use clear, descriptive commit messages
- Focus on the "why" rather than just the "what"
- Examples from history:
  - `Initialize package.json for notivox-app`
  - `Create a simple HTTP server in index.js`

## Code Conventions

### Language & Localization
- **User-facing content:** French
- **Code comments:** Can be English or French (be consistent)
- **Variable/function names:** English (standard practice)

### Code Style
- Use modern JavaScript (ES6+) features where appropriate
- Current code uses `const` for immutable references
- Arrow functions accepted for callbacks

### File Organization
- Entry point: `index.js`
- As project grows, consider organizing into:
  - `src/` - Source code
  - `config/` - Configuration files
  - `routes/` - HTTP route handlers
  - `middleware/` - Express/custom middleware
  - `utils/` - Utility functions
  - `tests/` - Test files

## Testing Guidelines

### Current State
- No testing framework configured yet
- No test files present

### Recommended Setup (for future)
- **Unit Testing:** Jest or Mocha
- **Integration Testing:** Supertest for HTTP testing
- **Test Location:** `tests/` or `__tests__/` directory
- **Coverage:** Aim for >80% code coverage

### When Adding Tests
1. Install testing dependencies
2. Add test scripts to `package.json`
3. Create test files alongside source files or in `tests/` directory
4. Run tests before committing changes

## Security Considerations

### Current Security Notes
- Server listens on all interfaces (0.0.0.0) by default
- No authentication/authorization implemented
- No input validation present
- No HTTPS configuration

### Security Best Practices for Development
- Validate all user inputs
- Use environment variables for sensitive configuration
- Implement rate limiting for production
- Add helmet.js for security headers (when using Express)
- Never commit secrets, API keys, or credentials (.env files should be gitignored)
- Be careful of OWASP top 10 vulnerabilities: SQL injection, XSS, command injection, etc.

## Development Best Practices for AI Assistants

### Before Making Changes
1. **Read existing files** before editing or creating new ones
2. **Use TodoWrite tool** to plan multi-step tasks
3. **Check git status** before committing
4. **Verify dependencies** are installed if adding new ones

### Code Modification Guidelines
1. **ALWAYS prefer editing** existing files over creating new ones
2. **Never introduce security vulnerabilities** (command injection, XSS, SQL injection)
3. **If you write insecure code, immediately fix it**
4. **Use specialized tools:**
   - Read tool for reading files (not `cat`)
   - Edit tool for editing files (not `sed`/`awk`)
   - Write tool for creating files (not `echo` or heredoc)
   - Bash only for actual system commands

### Task Management
1. Use TodoWrite tool for complex multi-step tasks
2. Mark todos as in_progress before starting
3. Mark todos as completed immediately after finishing
4. Only ONE task should be in_progress at a time

### Communication
- Output text directly to user (never use `echo` or bash comments to communicate)
- Be concise and clear
- Don't use emojis unless explicitly requested
- Use GitHub-flavored markdown for formatting

### File References
When referencing code, use pattern: `file_path:line_number`
- Example: "Server initialization happens in index.js:8"

## Environment Variables

### Current Usage
- `PORT` - Server port (default: 3000)

### Adding New Environment Variables
1. Document them in this file
2. Add defaults in code
3. Consider creating `.env.example` file
4. Never commit actual `.env` files

## Deployment

### Current State
- No deployment configuration present
- Application ready for basic Node.js hosting

### Deployment Considerations (Future)
- Consider platforms: Heroku, Railway, Render, AWS, DigitalOcean
- Add `engines` field to package.json to specify Node.js version
- Configure production PORT from environment
- Add production dependencies vs devDependencies distinction
- Consider process manager (PM2) for production

## Project Roadmap & Future Enhancements

### Potential Next Steps
1. Add a web framework (Express.js recommended)
2. Implement proper routing
3. Add static file serving
4. Set up testing framework
5. Add linting (ESLint)
6. Configure code formatting (Prettier)
7. Add environment variable management (.env files with dotenv)
8. Implement logging (Winston, Morgan)
9. Add database integration if needed
10. Create API endpoints
11. Add frontend framework/templates

## Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Check for syntax errors in index.js

**Cannot push to git:**
- Ensure branch name starts with `claude/` and includes session ID
- Check network connectivity
- Verify you're on the correct branch: `git branch`

**Module not found errors:**
- Run `npm install` to ensure dependencies are installed
- Check that the module is listed in package.json

## Additional Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [NPM Documentation](https://docs.npmjs.com/)
- [Git Documentation](https://git-scm.com/doc)

### Learning Resources
- Node.js HTTP Server: https://nodejs.org/api/http.html
- Express.js (recommended framework): https://expressjs.com/

## Changelog

### 2025-11-17
- Initial project setup
- Created basic HTTP server
- Initialized package.json
- Created CLAUDE.md documentation

---

**Last Updated:** 2025-11-17
**Maintained by:** AI Assistants working on notivox-app
**Update Policy:** This file should be updated whenever significant changes are made to project structure, workflows, or conventions.
