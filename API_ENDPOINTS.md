# API Endpoints — cURL Reference

All routes are served under the global prefix `/v1` and the app listens on port `3000` by default.

```bash
# Base URL used throughout this document
BASE_URL="http://localhost:3000/v1"
```

## Authentication model

| Scheme | Header | Applies to |
| --- | --- | --- |
| Manager JWT (Bearer) | `Authorization: Bearer <JWT>` | Most endpoints. Obtain the JWT from `POST /v1/auth/sign-in`. |
| Credential presentation (API key) | `X-Credential-Presentation: <compact SD-JWT VC>` | The `did:algo` `create`/`update` `transactions`/`submit` routes. These are `@Public()` (opt out of the manager JWT) but gated by the credential guard. |
| Public | _none_ | `POST /v1/auth/sign-in` only. |

Set these once for the examples below:

```bash
TOKEN="<paste access_token from sign-in>"
CRED="<paste compact SD-JWT VC presentation>"
```

Interactive Swagger UI is available at `http://localhost:3000/docs`.

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
Exports the user's raw ed25519 private key. Requires re-submitting a Vault AppRole `role_id`/`secret_id` pair. **Returns highly sensitive key material.**

```bash
curl -X POST "$BASE_URL/wallet/users/1234/export" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": "3ab5dada-ec1d-34a6-19ed-d63c9f6eba9c",
    "secret_id": "e857e495-48b2-ab69-3cd1-99f6fe44ccc1"
  }'
```

### Get Wallet Manager
Returns manager details including the Algorand `public_address`.

```bash
curl -X GET "$BASE_URL/wallet/manager/" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Manager Identity
Resolves the manager's issuer `did:algo` and returns its DID Document. Returns `404` when no `DIDAlgoStorage` contract is deployed.

```bash
curl -X GET "$BASE_URL/wallet/manager/identity" \
  -H "Authorization: Bearer $TOKEN"
```

### Deploy Manager Identity
Deploys (or, with `force`, redeploys) the `DIDAlgoStorage` contract backing the manager's issuer DID. Body is optional; `409 Conflict` if a contract already exists unless `force: true`.

```bash
curl -X POST "$BASE_URL/wallet/manager/identity" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "force": false
  }'
```

### Get Account Asset Holdings

```bash
curl -X GET "$BASE_URL/wallet/assets/1234" \
  -H "Authorization: Bearer $TOKEN"
```

### Create User

```bash
curl -X POST "$BASE_URL/wallet/user/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "1234"
  }'
```

### Get Users
Lists all users in the wallet.

```bash
curl -X GET "$BASE_URL/wallet/users/" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Asset

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
Send an asset from the manager to a user.

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
Send Algos to an address. Sender may be the manager or a user.

```bash
curl -X POST "$BASE_URL/wallet/transactions/transfer-algo/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU",
    "amount": 10,
    "fromUserId": "1234",
    "lease": "9kykoZ1IpuOAqhzDgRVaVY2ME0ZlCNrUpnzxpXlEF/s=",
    "note": "Note to all: notes are public"
  }'
```

### Clawback Asset
Clawback an asset from a user to the manager. The asset must have been created with the manager as clawback address.

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
Application call. Most fields are optional; `fromUserId` is required.

```bash
curl -X POST "$BASE_URL/wallet/transactions/app-call/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": 1234,
    "onComplete": 0,
    "fromUserId": "1234",
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
Submit an atomic group of heterogeneous transactions.

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

---

## DID (`did:algo` registry)

GET endpoints use the manager JWT. The `create`/`update` transaction-building and submit endpoints are credential-gated via `X-Credential-Presentation`.

### List Identities
List every per-user `did:algo` registered in Vault KV. **Manager JWT.**

```bash
curl -X GET "$BASE_URL/did/identities" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Identity by did:key
Look up a single user record. Returns `404` if not registered. **Manager JWT.**

```bash
curl -X GET "$BASE_URL/did/identities/did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH" \
  -H "Authorization: Bearer $TOKEN"
```

### Build Create Transactions
Build the tx group to deploy a caller-owned `did:algo` contract. Empty body accepted. **Credential-gated.**

```bash
curl -X POST "$BASE_URL/did/create/transactions" \
  -H "X-Credential-Presentation: $CRED" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Submit Create
Broadcast the wallet-signed create-app group and register the new `did:algo`. **Credential-gated.**

```bash
curl -X POST "$BASE_URL/did/create/submit" \
  -H "X-Credential-Presentation: $CRED" \
  -H "Content-Type: application/json" \
  -d '{
    "signedTxns": [null, null, "<base64-signed-appl-create-txn>"]
  }'
```

### Build Update Transactions
Build tx groups to update the caller-owned `did:algo` document. `document` is optional (omit to republish the canonical document). **Credential-gated.**

```bash
curl -X POST "$BASE_URL/did/update/transactions" \
  -H "X-Credential-Presentation: $CRED" \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "id": "did:algo:dockernet:app:1002:9a2c..."
    }
  }'
```

### Submit Update
Broadcast a user-signed `did:algo` document update. **Credential-gated.**

```bash
curl -X POST "$BASE_URL/did/update/submit" \
  -H "X-Credential-Presentation: $CRED" \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "id": "did:algo:dockernet:app:1002:9a2c..."
    },
    "groups": [
      { "signedTxns": [null, "<base64-signed-txn>"] }
    ]
  }'
```

---

## OID4VC — Issuer

Manager JWT (Bearer) for all issuer endpoints. Routes are under `credential/issuer`.

> Note: the OID4VCI protocol endpoints themselves (token, credential, credential-offer fetch) are mounted separately by Credo under `OID4VC_ISSUER_PATH`; the routes below are the application-side orchestration helpers.

### List Credential Configurations

```bash
curl -X GET "$BASE_URL/credential/issuer/configurations" \
  -H "Authorization: Bearer $TOKEN"
```

### Set Credential Configuration
Add or update a dynamic credential configuration in Vault.

```bash
curl -X POST "$BASE_URL/credential/issuer/configurations/device-attestation-credential" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "vc+sd-jwt",
    "vct": "my-custom-credential",
    "cryptographic_binding_methods_supported": ["did:key", "did:algo"],
    "credential_signing_alg_values_supported": ["EdDSA"],
    "scope": "my-scope"
  }'
```

### Remove Credential Configuration

```bash
curl -X DELETE "$BASE_URL/credential/issuer/configurations/device-attestation-credential" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Offer
Create a pre-authorized OID4VCI credential offer pinned to a wallet-local `did:key`.

```bash
curl -X POST "$BASE_URL/credential/issuer/offers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "credentialConfigurationIds": ["device-attestation-credential"],
    "holderDidKey": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
    "issuanceMetadata": { "rewardTier": "gold", "earnedAt": "2025-05-06T16:00:00.000Z" }
  }'
```

### List Issuance Sessions

```bash
curl -X GET "$BASE_URL/credential/issuer/sessions" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Issuance Session

```bash
curl -X GET "$BASE_URL/credential/issuer/sessions/<session-id>" \
  -H "Authorization: Bearer $TOKEN"
```

---

## OID4VC — Verifier

Manager JWT (Bearer) for all verifier endpoints. Routes are under `credential/verifier`.

> Note: the OID4VP/SIOP protocol endpoints are mounted separately by Credo under `OID4VC_VERIFIER_PATH`; the routes below are application-side helpers.

### Create Presentation Request
Create an OID4VP authorization request and return its URI for QR rendering.

```bash
curl -X POST "$BASE_URL/credential/verifier/requests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "presentationDefinition": {
      "id": "rewards-eligibility",
      "input_descriptors": [
        {
          "id": "device-attestation-credential",
          "format": { "vc+sd-jwt": { "sd-jwt_alg_values": ["EdDSA"] } },
          "constraints": {
            "fields": [
              { "path": ["$.vct"], "filter": { "type": "string", "const": "device-attestation-credential" } }
            ]
          }
        }
      ]
    }
  }'
```

### List Verification Sessions

```bash
curl -X GET "$BASE_URL/credential/verifier/sessions" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Verification Session

```bash
curl -X GET "$BASE_URL/credential/verifier/sessions/<session-id>" \
  -H "Authorization: Bearer $TOKEN"
```
