# Production Deployment Checklist

## 🚨 CRITICAL - Before Production Deployment

This checklist must be completed before deploying to production.

### ✅ Environment Variables Configuration

#### Required Backend Variables
- [ ] **JWT_SECRET** - Set to new secure value (128 characters, from crypto.randomBytes(64))
  - [ ] Generated using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - [ ] NOT the example value from .env.example
  - [ ] Stored securely in production environment (not in code)
  - [ ] Different from development/staging secrets

- [ ] **MONGO_URI** - Production MongoDB connection string
  - [ ] Points to production database cluster
  - [ ] Uses strong password
  - [ ] IP allowlist configured
  - [ ] Connection pooling enabled

- [ ] **CLOUDINARY_URL** - Production Cloudinary credentials
- [ ] **CLOUDINARY_CLOUD_NAME** - Production cloud name
- [ ] **CLOUDINARY_API_KEY** - Production API key
- [ ] **CLOUDINARY_API_SECRET** - Production API secret

- [ ] **FRONTEND_URL** - Production frontend URL
  - [ ] Set to actual production domain
  - [ ] No trailing slash
  - [ ] HTTPS enabled

#### Required Frontend Variables (Vite)
- [ ] **VITE_CLOUDINARY_CLOUD_NAME** - Matches CLOUDINARY_CLOUD_NAME
- [ ] **VITE_CLOUDINARY_UPLOAD_PRESET** - Production upload preset
- [ ] **VITE_GEMINI_API_KEY** - Production API key with restrictions

### 🔒 Security Verification

- [ ] .env file is NOT committed to git
- [ ] .env is listed in .gitignore
- [ ] No secrets in git history (or at least new secrets are set)
- [ ] All secrets are unique to production environment
- [ ] Secrets are stored in secure secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Access to secrets is restricted to authorized personnel only
- [ ] JWT_SECRET is at least 128 characters long (512 bits)
- [ ] JWT_SECRET was generated cryptographically randomly

### 🧪 Testing

- [ ] All tests pass in production environment
- [ ] Authentication flow works (signup/login)
- [ ] Admin middleware works correctly
- [ ] Image uploads work (Cloudinary)
- [ ] Database connections are stable
- [ ] CORS is configured correctly
- [ ] API endpoints respond correctly

### 📊 Monitoring

- [ ] Error logging is configured
- [ ] Performance monitoring is enabled
- [ ] Failed authentication attempts are logged
- [ ] Database connection errors are alerted
- [ ] API rate limiting is enabled

### 📝 Documentation

- [ ] ENVIRONMENT_VARIABLES.md is up to date
- [ ] Deployment procedure is documented
- [ ] Rollback procedure is documented
- [ ] Secret rotation procedure is documented
- [ ] Team members know how to access production logs

### 🔄 Maintenance Schedule

- [ ] JWT_SECRET rotation scheduled (every 90 days)
  - **Last Rotation:** March 15, 2026
  - **Next Rotation Due:** June 13, 2026
- [ ] Database backup schedule configured
- [ ] Security audit schedule planned

## Environment-Specific Settings

### Development
```bash
JWT_SECRET=<dev_secret>
MONGO_URI=<dev_database>
FRONTEND_URL=http://localhost:5173
```

### Staging
```bash
JWT_SECRET=<staging_secret>
MONGO_URI=<staging_database>
FRONTEND_URL=https://staging.wetowe.com
```

### Production
```bash
JWT_SECRET=<production_secret>
MONGO_URI=<production_database>
FRONTEND_URL=https://wetowe.vercel.app
```

## Quick Reference Commands

### Generate New JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test JWT Configuration
```bash
node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"
```

### Verify Environment Variables
```bash
# List all required variables
grep -E "^[A-Z_]+=" .env | cut -d= -f1
```

## Deployment Steps

1. **Set environment variables** in your hosting platform
2. **Test configuration** in staging environment first
3. **Deploy application** to production
4. **Verify functionality** after deployment
5. **Monitor logs** for any errors
6. **Update documentation** with deployment date

## Emergency Procedures

### JWT_SECRET Compromised
1. Generate new JWT_SECRET immediately
2. Update production environment variable
3. Restart all application servers
4. All users will need to log in again
5. Monitor for suspicious activity
6. Review access logs
7. Update security documentation

### Database Connection Issues
1. Check MONGO_URI is correct
2. Verify database cluster is running
3. Check IP allowlist includes production servers
4. Review connection pool settings
5. Check database credentials
6. Enable connection retry logic

## Support Contacts

- **Security Issues:** Repository maintainers
- **Infrastructure:** DevOps team
- **Database:** DBA team
- **Monitoring:** Operations team

## Sign-off

This checklist must be reviewed and signed off by:

- [ ] Developer: _________________ Date: _________
- [ ] Security Lead: _____________ Date: _________
- [ ] DevOps Lead: ______________ Date: _________
- [ ] Project Manager: ___________ Date: _________

---

**Last Updated:** March 15, 2026
**Document Version:** 1.0
**Next Review:** June 15, 2026
