# Contributing to Caldero Envío

Thank you for your interest in contributing!

---

## How to Contribute

### Reporting Bugs

1. Check if the bug already exists in issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a discussion first to align on the idea
2. Create a feature request issue with:
   - Problem you're solving
   - Proposed solution
   - Alternative solutions considered

### Code Contributions

#### Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/caldero-envio.git
cd caldero-envio
npm install
```

#### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

#### Make Changes

1. Write code following the conventions in `agent.md`
2. Run linting: `npm run lint`
3. Format code: `npm run format`
4. Test your changes manually

#### Commit

Follow the commit message format:

```
<type>(<scope>): <description>

feat(app): add new courier selection
fix(map): correct static map marker offset
docs(readme): update installation steps
```

#### Push and Create PR

```bash
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Review Process

1. I will review your PR within 48 hours
2. Address any feedback promptly
3. Once approved, I will merge

---

## Questions?

Open an issue for any questions about contributing.