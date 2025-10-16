# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to protect our users.

### 2. Contact us directly
- **Email**: security@yannovabouw.ai
- **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature
- **Response Time**: We aim to respond within 24-48 hours

### 3. Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if you have them)

### 4. What to expect:
- **Acknowledgment**: We'll confirm receipt within 24-48 hours
- **Assessment**: We'll evaluate the vulnerability within 3-5 business days
- **Fix Timeline**: Critical vulnerabilities will be patched within 7 days
- **Disclosure**: We'll coordinate responsible disclosure with you

## Security Best Practices

### For Users:
- Keep your dependencies updated
- Use strong passwords for admin accounts
- Enable 2FA where available
- Regularly backup your data
- Monitor for suspicious activity

### For Developers:
- Follow secure coding practices
- Validate all user inputs
- Use HTTPS everywhere
- Implement proper authentication
- Regular security audits

## Security Features

Our application includes several security measures:

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: XSS and injection protection
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API protection against abuse
- **HTTPS Enforcement**: SSL/TLS encryption
- **Secure Headers**: Security headers implementation
- **Dependency Scanning**: Regular vulnerability checks

## Vulnerability Disclosure Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Report | 0-1 days | Vulnerability reported |
| Triage | 1-2 days | Initial assessment |
| Fix | 3-7 days | Patch development |
| Release | 1-2 days | Security update released |
| Disclosure | 30 days | Public disclosure (if applicable) |

## Security Contact

- **Primary**: security@yannovabouw.ai
- **GitHub**: [Private Vulnerability Reporting](https://github.com/Rustammiq/yannova-bouw/security/advisories/new)
- **Response Time**: 24-48 hours

## Acknowledgments

We appreciate the security research community and will acknowledge responsible disclosure in our security advisories.

---

**Note**: This security policy is subject to change. Please check back regularly for updates.