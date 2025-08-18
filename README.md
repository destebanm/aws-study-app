# AWS Study App

A comprehensive study application designed to help users prepare for AWS certifications through interactive quizzes and practice tests. Built with React and deployed automatically to GitHub Pages using GitHub Actions workflow.

## � CI/CD Pipeline

This project implements a Continuous Integration/Continuous Deployment (CI/CD) pipeline using GitHub Actions:

### Continuous Integration
- **Automated Builds**: Every push to the `main` branch triggers an automated build process
- **Environment Setup**: Node.js environment is automatically configured with caching for faster builds
- **Dependency Management**: `npm ci` ensures clean and reproducible dependency installation
- **Build Verification**: The application is built to verify no breaking changes were introduced

### Continuous Deployment
- **Automatic Deployment**: Successful builds are automatically deployed to GitHub Pages
- **Environment**: Deployment to the `gh-pages` branch which serves as our production environment
- **Zero-Downtime**: The deployment process ensures zero-downtime updates
- **Artifact Management**: Build artifacts are properly managed and deployed
- **URL**: The application is accessible at [https://destebanm.github.io/aws-study-app/](https://destebanm.github.io/aws-study-app/)

### Workflow Details
```yaml
# Key workflow features
- Triggers: Push to main branch
- Environment: Ubuntu latest
- Node version: 16
- Build command: npm run build
- Deployment: GitHub Pages via actions-gh-pages
```

### Repository Structure
```
aws-study-app/
├── client/           # React application
├── .github/          # GitHub configurations
│   └── workflows/    # CI/CD workflow definitions
└── README.md        # Project documentation
```

## �🚀 Features

- Interactive quiz interface
- Real-time scoring
- Progress tracking
- Comprehensive AWS certification questions
- Mobile-responsive design
- Test retake capability
- Dashboard with progress statistics

## 🛠️ Technology Stack

- **Frontend**: React.js
- **Styling**: CSS
- **Routing**: React Router DOM with basename configuration for GitHub Pages
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions with automated workflows
- **Version Control**: Git with protected main branch
- **Hosting**: GitHub Pages with custom domain configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/destebanm/aws-study-app.git
```

2. Navigate to the client directory:
```bash
cd aws-study-app/client
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🌐 Production Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch. You can access the live version at: https://destebanm.github.io/aws-study-app/

## 🧪 Testing

To run the tests:
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS documentation and whitepapers
- React.js community
- All contributors who have helped improve this project
