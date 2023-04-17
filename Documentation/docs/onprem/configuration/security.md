---
description: You should update this security keys to ship TDrive in production.
---

# 🔒 Security

> See how to [Detach Configuration](./) first.

The following keys must be updated to increase TDrive security in [docker-compose.yml location]/configuration/backend-node/production.json:

```json
{
  "websocket": {
    "auth": {
      "jwt": {
        "secret": "xxx" // JWT secret for websockets
      }
    }
  },
  "auth": {
    "jwt": {
      "secret": "xxx" // JWT secret
    }
  },
  "database": {
    "secret": "xxx" // Db app layer encryption key
  },
  "storage": {
    "secret": "xxx", // Storage app layer encryption key
    "iv": "xxx" // Storage app layer encryption iv
  }
}
```
