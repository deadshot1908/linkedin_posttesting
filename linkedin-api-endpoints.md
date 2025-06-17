# 🔗 LinkedIn API Endpoints Used in Project

This document lists all LinkedIn endpoints used in this project, with detailed usage instructions.

---

## 1. 🔐 Authorization URL (OAuth 2.0)

**Endpoint:**
```
https://www.linkedin.com/oauth/v2/authorization
```

**Method:** `GET`  
**Purpose:** Redirects the user to LinkedIn's OAuth authorization screen.

**Query Parameters:**
| Param        | Description                                |
|--------------|--------------------------------------------|
| response_type | Always set to `code`                      |
| client_id     | Your LinkedIn App's Client ID             |
| redirect_uri  | Must match one of the URIs in LinkedIn app settings |
| scope         | Space-separated list of scopes            |
| state (opt.)  | Optional CSRF protection token            |

**Example:**
```bash
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3001/auth/linkedin/callback&scope=w_member_social%20openid%20email
```

---

## 2. 🎫 Get Access Token

**Endpoint:**
```
https://www.linkedin.com/oauth/v2/accessToken
```

**Method:** `POST`  
**Purpose:** Exchanges the `authorization code` for an `access_token`.

**Headers:**
```http
Content-Type: application/x-www-form-urlencoded
```

**Body (URL-encoded):**
```bash
grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=http://localhost:3001/auth/linkedin/callback&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

**Response:**
```json
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 5184000
}
```

---

## 3. 👤 Get User Profile via OpenID Connect

**Endpoint:**
```
https://api.linkedin.com/v2/userinfo
```

**Method:** `GET`  
**Purpose:** Retrieves user info using the OpenID Connect product.

**Headers:**
```http
Authorization: Bearer ACCESS_TOKEN
```

**Response Example:**
```json
{
  "sub": "linkedin-urn-id",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john@example.com"
}
```

---

---

## 4. 📝 Create a Post (UGC Share API)

**Endpoint:**
```
https://api.linkedin.com/v2/ugcPosts
```

**Method:** `POST`  
**Purpose:** Posts content (text, links, etc.) to the authenticated user’s LinkedIn feed.

**Required Scope:** `w_member_social`

**Headers:**
```http
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
X-Restli-Protocol-Version: 2.0.0
```

**Body Example (Text-only post):**
```json
{
  "author": "urn:li:person:USER_ID",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "This is a scheduled post from my app!"
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

**Response:**
```json
{
  "id": "urn:li:share:1234567890"
}
```

---

## ✅ Required LinkedIn Product Permissions

| Product                                 | Allows Use Of                          |
|----------------------------------------|----------------------------------------|
| Sign In with LinkedIn using OIDC       | `/v2/userinfo`, `openid`, `email`      |
| Share on LinkedIn                      | `w_member_social`                      |

---

## 🛠 Auth Notes

- All requests after token exchange must include:
  ```http
  Authorization: Bearer ACCESS_TOKEN
  ```
- Token should be securely stored and not exposed in frontend code.