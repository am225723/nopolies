# Contributing to Nopolies

Thank you for your interest in contributing to Nopolies! This guide will help you get started with contributing to this 3D Monopoly-style game.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

### Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/nopolies.git
   cd nopolies
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

## 🛠️ Development Workflow

### VS Code Setup

The repository includes VS Code configurations:
- `.vscode/settings.json` - Editor settings
- `.vscode/extensions.json` - Recommended extensions
- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Build tasks

Install the recommended extensions when prompted in VS Code.

### Code Style

We use:
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks

#### Formatting on Save

Code is automatically formatted on save in VS Code. Manual formatting:
```bash
npm run format
```

#### Linting

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Build Process

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
nopolies/
├── src/                          # Source code
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components
│   │   └── __tests__/          # Component tests
│   ├── lib/                    # Utilities and helpers
│   ├── hooks/                  # Custom React hooks
│   ├── data/                   # Static data
│   └── main.tsx               # App entry point
├── public/                     # Static assets
├── api/                        # Vercel serverless functions
├── server/                     # Backend code
├── .vscode/                    # VS Code configuration
└── docs/                       # Documentation
```

## 🎯 Contributing Guidelines

### Feature Development

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code patterns
   - Add tests for new functionality
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add comments to complex code

2. **PR Description**
   - Describe what you changed
   - Explain why you changed it
   - Include screenshots for UI changes

3. **Code Review**
   - Address all feedback
   - Ensure tests pass
   - Update PR as needed

## 🎮 Game Development

### 3D Components

- Use **React Three Fiber** for 3D rendering
- Follow performance best practices
- Add proper loading states
- Include error boundaries

### UI Components

- Use **Tailwind CSS** for styling
- Follow **shadcn/ui** patterns
- Ensure responsive design
- Include accessibility features

### State Management

- Use **Zustand** for global state
- Keep components state local when possible
- Follow immutable update patterns

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment**
   - OS and browser
   - Node.js version
   - Reproduction steps

2. **Expected vs Actual Behavior**
   - What should happen
   - What actually happens

3. **Screenshots/Videos**
   - Visual bugs
   - Error messages

4. **Console Errors**
   - Browser console output
   - Terminal output

## 💡 Feature Requests

1. **Use the Issue Template**
2. **Describe the Problem**
3. **Propose Solutions**
4. **Consider Alternatives**

## 📝 Documentation

- Keep README updated
- Comment complex logic
- Update API documentation
- Add examples for new features

## 🤝 Community

- Be respectful and inclusive
- Help others in issues
- Share knowledge
- Follow the Code of Conduct

## 📧 Questions?

- Open an issue for questions
- Check existing discussions
- Review the codebase
- Ask in PRs if unsure

Thank you for contributing! 🎉