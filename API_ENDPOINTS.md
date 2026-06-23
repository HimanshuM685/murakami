# API Endpoints — cURL Reference

All routes are served under the global prefix `/v1` and the app listens on port `3000` by default.

```bash
# Base URL used throughout this document
BASE_URL="http://localhost:3000/v1"
```

## Authentication model

| Scheme | Header | Applies to |
| --- | --- | --- |
| Manager JWT (Bearer) | `Authorization: Bearer <JWT>` | Every endpoint except sign-in. Obtain the JWT from `POST /v1/auth/sign-in`. |
| Public | _none_ | `POST /v1/auth/sign-in` only. |

In addition to the manager JWT, operations that spend a **user's** own Algos — or
export a user's key — require that user's **password** (set when the user is created).
See [Per-user passwords](#per-user-passwords).

Set this once for the examples below:

```bash
TOKEN="<paste access_token from sign-in>"
```

Interactive Swagger UI is available at `http://localhost:3000/docs`.

---

## Per-user passwords

Each user is created with a password. It is hashed (scrypt) and stored in Vault; the
plaintext is never persisted. The same password must be supplied to:

- **Export** the user's private key (`POST /wallet/users/:id/export`).
- **Spend the user's own Algos**: `transfer-algo`, `app-call`, and `group-transaction`
  whenever the sending `fromUserId` is a real user (not `manager`).

Manager-driven operations (`create-asset`, `transfer-asset`, `clawback-asset`, and any
step sent by `manager`) do **not** take a password — they are gated by the manager JWT
alone. A missing or wrong password returns **401 Unauthorized**.

---

## Auth

### Sign In
Exchange a Vault token for a JWT access token. **Public.**

```bash
curl -X POST "$BASE_URL/auth/sign-in/" \
  -H "Content-Type: application/json" \
  -d '{
    "vault_token": "hvb.AAAAAQJ5tcbZ2...."
  }'
```

---

## Wallet

All wallet endpoints require the manager JWT (`Authorization: Bearer $TOKEN`).

### Get User by ID

```bash
curl -X GET "$BASE_URL/wallet/users/1234/" \
  -H "Authorization: Bearer $TOKEN"
```

### Export Private Key
Exports the user's raw ed25519 private key. Requires the user's **password** (set at
user creation) as a confirmation step. **Returns highly sensitive key material.**

```bash
curl -X POST "$BASE_URL/wallet/users/1234/export" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "s3cr3t-passphrase"
  }'
```

### Get Wallet Manager
Returns manager details including the Algorand `public_address`.

```bash
curl -X GET "$BASE_URL/wallet/manager/" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Account Asset Holdings

```bash
curl -X GET "$BASE_URL/wallet/assets/1234" \
  -H "Authorization: Bearer $TOKEN"
```

### Create User
Creates a user (and its Vault signing key) and stores the password that protects it.

```bash
curl -X POST "$BASE_URL/wallet/user/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "1234",
    "password": "s3cr3t-passphrase"
  }'
```

### Get Users
Lists all users in the wallet.

```bash
curl -X GET "$BASE_URL/wallet/users/" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Asset
Manager-driven; no user password required.

```bash
curl -X POST "$BASE_URL/wallet/transactions/create-asset/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 31415,
    "decimals": 2,
    "defaultFrozen": false,
    "unitName": "Test",
    "assetName": "Test Asset",
    "url": "https://example.com",
    "managerAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU",
    "reserveAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU",
    "freezeAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU",
    "clawbackAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU"
  }'
```

### Transfer Asset
Send an asset from the manager to a user. Manager-driven; no user password required.

```bash
curl -X POST "$BASE_URL/wallet/transactions/transfer-asset/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 1234567890,
    "userId": "1234",
    "amount": 10,
    "lease": "9kykoZ1IpuOAqhzDgRVaVY2ME0ZlCNrUpnzxpXlEF/s=",
    "note": "Note to all: notes are public"
  }'
```

### Transfer Algo
Send Algos to an address. Sender may be the manager or a user. **When `fromUserId` is a
user, include that user's `password`** (omit it when the sender is `manager`).

```bash
curl -X POST "$BASE_URL/wallet/transactions/transfer-algo/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU",
    "amount": 10,
    "fromUserId": "1234",
    "password": "s3cr3t-passphrase",
    "lease": "9kykoZ1IpuOAqhzDgRVaVY2ME0ZlCNrUpnzxpXlEF/s=",
    "note": "Note to all: notes are public"
  }'
```

### Clawback Asset
Clawback an asset from a user to the manager. The asset must have been created with the
manager as clawback address. Manager-driven; no user password required.

```bash
curl -X POST "$BASE_URL/wallet/transactions/clawback-asset/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 1234567890,
    "userId": "1234",
    "amount": 10,
    "lease": "9kykoZ1IpuOAqhzDgRVaVY2ME0ZlCNrUpnzxpXlEF/s=",
    "note": "Note to all: notes are public"
  }'
```

### App Call
Application call. Most fields are optional; `fromUserId` is required. **When `fromUserId`
is a user, include that user's `password`** (omit it when the sender is `manager`).

```bash
curl -X POST "$BASE_URL/wallet/transactions/app-call/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": 1234,
    "onComplete": 0,
    "fromUserId": "1234",
    "password": "s3cr3t-passphrase",
    "foreignAssets": [1, 2],
    "foreignApps": [1, 2],
    "foreignAccounts": ["V5LR6C5SVHBQY3SPTEPD5WEGNBBUDNEP2MSDIONQIODZXZHRMC6QF3CTZI"],
    "boxes": [{ "i": 0, "n": "YWN0XwAAAAAAAATS" }],
    "args": {
      "name": "abi_method_name",
      "args": [
        { "type": "uint64", "value": 12345 },
        { "type": "string", "value": "abcd" }
      ],
      "returns": { "type": "void" }
    },
    "fee": 1000,
    "note": "Note to all: notes are public"
  }'
```

### Group Transaction
Submit an atomic group of heterogeneous transactions. **When any step is sent by a user,
include that user's `password` at the top level** (omit it when every step is sent by
`manager`).

```bash
curl -X POST "$BASE_URL/wallet/transactions/group-transaction/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      { "type": "payment", "payload": { "toAddress": "ADDR", "amount": 1000, "fromUserId": "manager" } },
      { "type": "appCall", "payload": { "appId": 123, "onComplete": 0, "fromUserId": "manager" } }
    ]
  }'
```

A group that includes a user-sent step:

```bash
curl -X POST "$BASE_URL/wallet/transactions/group-transaction/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "s3cr3t-passphrase",
    "transactions": [
      { "type": "payment", "payload": { "toAddress": "ADDR", "amount": 1000, "fromUserId": "1234" } }
    ]
  }'
```
