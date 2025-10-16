# Contributing to Yannova Bouw

Thank you for your interest in contributing to Yannova Bouw! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account (for backend development)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/yannova-bouw.git
   cd yannova-bouw
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd api && npm install
   ```

4. **Setup environment**
   ```bash
   cp api/env.example api/.env
   # Edit api/.env with your Supabase credentials
   ```

5. **Start development**
   ```bash
   # Terminal 1: Backend
   cd api && npm start
   
   # Terminal 2: Frontend
   # Open index.html in browser or use live server
   ```

## 📝 How to Contribute

### Reporting Issues
- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Provide clear steps to reproduce
- Include screenshots if applicable
- Check existing issues first

### Suggesting Features
- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Describe the problem and proposed solution
- Consider implementation complexity

### Code Contributions

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 🎨 Code Style

### JavaScript
- Use ES6+ features
- Follow camelCase for variables and functions
- Use meaningful variable names
- Add JSDoc comments for functions

### CSS
- Use BEM methodology for class names
- Organize styles logically
- Use CSS custom properties for theming
- Mobile-first responsive design

### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels
- Ensure accessibility compliance

## 🧪 Testing

### Frontend Testing
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on different screen sizes
- Validate HTML and CSS
- Check accessibility with screen readers

### Backend Testing
- Test API endpoints with Postman or similar
- Verify database operations
- Check error handling

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] No new warnings introduced
- [ ] Changes tested thoroughly

### PR Description
- Use the [Pull Request template](.github/pull_request_template.md)
- Describe what changes were made
- Explain why changes were necessary
- Include screenshots for UI changes
- Reference related issues

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - OS and version
   - Browser and version
   - Node.js version

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Additional Context**
   - Screenshots or videos
   - Console errors
   - Network requests (if applicable)

## ✨ Feature Requests

When suggesting features:

1. **Problem Description**
   - What problem does this solve?
   - Who would benefit from this?

2. **Proposed Solution**
   - How should it work?
   - Any design considerations?

3. **Alternatives**
   - Other ways to solve this problem?
   - Why this approach is better?

## 🏗️ Project Structure

```
yannova-bouw/
├── admin/           # Admin dashboard
├── api/            # Backend API
├── assets/         # Static assets
├── components/     # Reusable components
├── pages/          # Website pages
└── .github/        # GitHub templates and workflows
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- Live Server
- Prettier
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### Useful Commands
```bash
# Format code
npm run format

# Lint code
npm run lint

# Build project
npm run build

# Start development server
npm run dev
```

## 📞 Getting Help

- **Documentation**: Check the README.md
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers

## 🎯 Areas for Contribution

### High Priority
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] SEO enhancements

### Medium Priority
- [ ] New features
- [ ] UI/UX improvements
- [ ] Code refactoring
- [ ] Documentation updates

### Low Priority
- [ ] Code cleanup
- [ ] Minor bug fixes
- [ ] Style improvements

## 📜 License

By contributing to Yannova Bouw, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Yannova Bouw! 🚀
