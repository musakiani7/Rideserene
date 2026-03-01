# Authentication Validation Rules

This document outlines the validation rules implemented for all authentication endpoints in the RideSerene application.

## Overview

Validation has been implemented for:
- Customer registration and login
- Chauffeur registration and login
- Admin login

## Validation Rules

### Email Address
- **Rule**: Must be a valid email format
- **Examples**:
  - ✅ Valid: `user@example.com`, `john.doe@company.co.uk`
  - ❌ Invalid: `invalid-email`, `user@`, `@example.com`
- **Implementation**: Uses `express-validator`'s `isEmail()` method with email normalization

### Password Requirements
All passwords must meet the following criteria:

1. **Minimum Length**: At least 8 characters
2. **Lowercase Letter**: At least one lowercase letter (a-z)
3. **Uppercase Letter**: At least one uppercase letter (A-Z)
4. **Numeric Digit**: At least one number (0-9)
5. **Special Character**: At least one special character from: `!@#$%^&*(),.?":{}|<>`

**Examples**:
- ✅ Valid: `MyPass123!`, `SecureP@ssw0rd`, `Tr0ng#Pass`
- ❌ Invalid:
  - `short1!` (too short)
  - `nouppercase1!` (no uppercase)
  - `NOLOWERCASE1!` (no lowercase)
  - `NoNumber!` (no number)
  - `NoSpecial1` (no special character)

### Phone Number (United States)
- **Rule**: Must be a valid US phone number format
- **Accepted Formats**:
  - `(555) 123-4567`
  - `555-123-4567`
  - `5551234567`
  - `+1-555-123-4567`
  - `1-555-123-4567`
  - `555.123.4567`
  - `555 123 4567`
- **Pattern**: `^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$`
- **Examples**:
  - ✅ Valid: `(555) 123-4567`, `+1-555-123-4567`, `5551234567`
  - ❌ Invalid: `123-4567` (too short), `+44-555-123-4567` (wrong country code)

## Affected Endpoints

### Customer Authentication
- **POST** `/api/auth/signup` - Customer registration
  - Validates: firstName, lastName, email, phone, password, confirmPassword
- **POST** `/api/auth/login` - Customer login
  - Validates: email, password

### Chauffeur Authentication
- **POST** `/api/chauffeur/register` - Chauffeur registration
  - Validates: firstName, lastName, email, phone, password, confirmPassword
- **POST** `/api/chauffeur/login` - Chauffeur login
  - Validates: email, password

### Admin Authentication
- **POST** `/api/admin/auth/login` - Admin login
  - Validates: email, password

## Error Response Format

When validation fails, the API returns a `400 Bad Request` response with the following format:

```json
{
  "success": false,
  "errors": [
    {
      "msg": "Password must be at least 8 characters long",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Password must contain at least one uppercase letter",
      "param": "password",
      "location": "body"
    }
  ]
}
```

## Implementation Files

The validation rules are implemented in the following files:

1. **Routes**:
   - `backend/routes/auth.js` - Customer authentication routes
   - `backend/routes/chauffeur.js` - Chauffeur authentication routes
   - `backend/routes/adminAuth.js` - Admin authentication routes
   - `backend/signup-service/routes/auth.js` - Signup service routes

2. **Controllers**:
   - `backend/controllers/authController.js` - Customer authentication controller
   - `backend/controllers/chauffeurController.js` - Chauffeur authentication controller
   - `backend/controllers/adminAuthController.js` - Admin authentication controller

## Testing Validation

### Test Valid Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Test Invalid Password (Too Short)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "password": "Short1!",
    "confirmPassword": "Short1!"
  }'
```

Expected response:
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Password must be at least 8 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### Test Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "invalid-email",
    "phone": "(555) 123-4567",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Test Invalid US Phone Number
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-4567",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

## Notes

- All validations are performed server-side using `express-validator`
- Email addresses are normalized (converted to lowercase, trimmed) before validation
- Phone numbers accept various US formats with or without country code
- Password validation is case-sensitive and requires all four character types
- The same validation rules apply across all user types (customers, chauffeurs, admins)
