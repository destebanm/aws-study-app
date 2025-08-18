# AWS Study App - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build Process
Navigate to the client directory first - all development happens in the `client/` subdirectory:
```bash
cd aws-study-app/client
```

Install dependencies:
```bash
npm install
```
**TIMING**: Takes approximately 60-70 seconds. NEVER CANCEL - set timeout to 150+ seconds.

Build the application:
```bash
npm run build
```
**TIMING**: Takes approximately 8 seconds. NEVER CANCEL - set timeout to 60+ seconds for safety.

**CRITICAL BUILD NOTE**: If the build fails with ESLint errors about unused imports, fix them manually. The CI environment treats warnings as errors (CI=true). For local development builds that bypass this, use:
```bash
CI=false npm run build
```

### Development and Testing

Start the development server:
```bash
npm start
```
**TIMING**: Takes approximately 10-15 seconds to start. NEVER CANCEL - set timeout to 60+ seconds.
**ACCESS**: Application runs at `http://localhost:3000/aws-study-app` (note the `/aws-study-app` basename for GitHub Pages compatibility).

Run tests:
```bash
npm test -- --watchAll=false
```
**IMPORTANT**: This repository has NO existing tests. The command will exit with "No tests found" - this is expected and normal.

## Validation Requirements

### Manual Testing is CRITICAL
Since there are no automated tests, you MUST manually validate all changes by running complete user scenarios:

1. **Always test the complete quiz flow**:
   - Start development server with `npm start`
   - Navigate to `http://localhost:3000/aws-study-app`
   - Click on any test option (e.g., "Test Rápido (10 preguntas)")
   - Verify questions load properly
   - Test question navigation (Previous/Next buttons)
   - Verify radio button selection works
   - Test notes functionality in textarea
   - Complete a full quiz and verify results display

2. **Always test navigation**:
   - Test "Nuevo Test" tab returns to homepage
   - Test "Historial" tab shows dashboard
   - Verify React Router navigation works with basename

3. **Always test build output**:
   - Run `npm run build` after any changes
   - Verify build succeeds without errors
   - Check that build output references correct `/aws-study-app/` paths

### Browser Testing with Playwright
Use Playwright for automated validation when available:
```javascript
// Navigate to app
await page.goto('http://localhost:3000/aws-study-app');

// Wait for questions to load
await page.waitForTimeout(3000);

// Test quiz functionality
await page.click('button:text("Test Rápido (10 preguntas)")');

// Verify quiz interface loads
await page.waitForSelector('h2:text("Simulacro de Examen")');
```

## Key Architecture Details

### Repository Structure
```
aws-study-app/
├── .github/
│   └── workflows/deploy.yml    # GitHub Actions CI/CD pipeline
├── client/                     # Main React application
│   ├── package.json           # Dependencies and scripts
│   ├── public/
│   │   ├── index.html
│   │   └── questions.json     # Quiz questions data
│   └── src/
│       ├── App.js             # Main app with React Router
│       ├── components/        # React components
│       │   ├── HomePage.js    # Test selection interface
│       │   ├── TestTaker.js   # Quiz interface and logic
│       │   └── Dashboard.js   # Test history dashboard
│       └── index.js           # React entry point
├── README.md
└── .gitignore
```

### Technology Stack
- **Frontend**: React 18 with React Router DOM
- **Styling**: Plain CSS (no preprocessing)
- **Deployment**: GitHub Pages with automated CI/CD
- **Data Storage**: localStorage for test history and notes
- **Questions**: Static JSON file in public/questions.json

### Important Configuration Notes
- **Basename**: App uses `basename="/aws-study-app"` for GitHub Pages deployment
- **Node Version**: GitHub Actions uses Node 16, local development tested with Node 20+
- **Package Manager**: Uses npm (not yarn)
- **Build Environment**: CI=true treats warnings as errors in production builds

## Common Development Tasks

### Making Code Changes
1. Always start in the `client/` directory
2. Make your changes to React components in `src/`
3. Test locally with `npm start`
4. MANUALLY validate the change by running through user scenarios
5. Build with `npm run build` to catch any build issues
6. Commit changes

### Adding New Features
1. Follow existing component patterns in `src/components/`
2. Update React Router routes in `App.js` if needed
3. Add CSS styles following existing naming conventions
4. Test all navigation paths manually
5. Verify localStorage functionality if adding data persistence

### Fixing Build Issues
Common build problems:
- **Unused imports**: Remove unused React hooks or other imports
- **ESLint errors**: Fix or disable specific rules if necessary
- **Path issues**: Ensure all imports use correct relative paths
- **GitHub Pages paths**: Verify basename configuration remains correct

## CI/CD Pipeline Details

### GitHub Actions Workflow
Location: `.github/workflows/deploy.yml`

**Trigger**: Push to main branch
**Environment**: Ubuntu latest with Node 16
**Process**:
1. Checkout code
2. Setup Node.js with npm caching
3. `cd client && npm ci` (clean install)
4. `cd client && CI=false npm run build` 
5. Deploy build folder to gh-pages branch

**TIMING**: Full CI/CD pipeline takes approximately 2-3 minutes. NEVER CANCEL.

### Deployment
- **Target**: GitHub Pages (`gh-pages` branch)
- **URL**: https://destebanm.github.io/aws-study-app/
- **Process**: Automatic on main branch push
- **Build Output**: `client/build/` directory contents

## Data and Content Structure

### Quiz Questions Format
The quiz questions are stored in `client/public/questions.json` as a JSON array. Each question has:
- `id`: Unique identifier (e.g., "q1", "q2")
- `questionText`: The question content  
- `options`: Array of answer choices with `text` and `isCorrect` boolean
- `explanation`: Detailed explanation of the correct answer
- `awsService`: AWS service category for organization

### Adding New Questions
To add quiz questions:
1. Edit `client/public/questions.json`
2. Follow the existing JSON structure exactly
3. Ensure each question has a unique `id`
4. Set exactly one option with `isCorrect: true`
5. Test by running a quiz to verify new questions appear

### Local Storage Structure
The app stores data in browser localStorage:
- `aws-notes`: User notes for each question (JSON object keyed by question ID)
- `aws-history`: Array of completed test results with scores and timestamps

## Troubleshooting

### Build Failures
If `npm run build` fails:
1. Check for ESLint errors about unused imports
2. Remove any unused React imports
3. Try `CI=false npm run build` for local testing
4. Verify all file paths are correct

### Development Server Issues
If `npm start` fails:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check for port conflicts on 3000
4. Verify you're in the `client/` directory

### Application Not Loading
If the app loads but shows errors:
1. Check browser console for JavaScript errors
2. Verify `questions.json` is accessible at `/aws-study-app/questions.json`
3. Check that localStorage is enabled in browser
4. Verify React Router basename configuration

## Performance and Timing Expectations

### Command Timeouts (NEVER CANCEL)
- `npm install`: 60-70 seconds typical, set 150+ second timeout
- `npm run build`: 8 seconds typical, set 60+ second timeout  
- `npm start`: 10-15 seconds startup, set 60+ second timeout
- Full CI/CD pipeline: 2-3 minutes, NEVER CANCEL

### Manual Validation Time
- Complete quiz flow test: 2-3 minutes
- Navigation testing: 1 minute
- Build verification: 30 seconds
- **ALWAYS** allow sufficient time for thorough testing

Remember: This application has no automated test suite, so manual validation of user scenarios is CRITICAL for ensuring code changes work correctly.