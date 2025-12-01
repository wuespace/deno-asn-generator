# Configuration Environment Variables

Note that for every parameter, you can also set "[PARAMETER]_FILE" to a file
that contains the value. This is especially useful for things like mounted
secrets in Docker Swarm or Kubernetes.

## ASN Generation Settings

### `ADDITIONAL_MANAGED_NAMESPACES` (optional)

Additional namespaces managed by the system outside of the ASN_NAMESPACE_RANGE.

Namespaces are notated as "&lt;Namespace Label>&lt;Namespace Label>..." where:

- Namespace is the numeric ID of the namespace.
- Label is the label for the namespace. Optionally, commas and spaces can be
  used to separate namespaces.

If empty, no additional namespaces are managed and only the ASN_NAMESPACE_RANGE
is used.

#### Default Value (used by the application if not provided)

```env
ADDITIONAL_MANAGED_NAMESPACES=
```

#### Other Examples

```env
ADDITIONAL_MANAGED_NAMESPACES=<700 NDA-Covered Documents (Generic)><800 Personal Data Documents (Generic)>
```

### `ASN_BARCODE_TYPE` (optional)

The type of barcode to generate for the ASN.

#### Default Value (used by the application if not provided)

```env
ASN_BARCODE_TYPE=CODE128
```

#### Other Examples

```env
ASN_BARCODE_TYPE=CODE39
```

```env
ASN_BARCODE_TYPE=CODE93
```

### `ASN_ENABLE_NAMESPACE_EXTENSION` (optional)

Enable namespace extension. If true, the ADDITIONAL_MANAGED_NAMESPACES can have
more digits than the ASN_NAMESPACE_RANGE. If false, the
ADDITIONAL_MANAGED_NAMESPACES must have the same number of digits as the
ASN_NAMESPACE_RANGE.

This works by reserving leading `9`s for namespace extension: For example, let's
say the ASN_NAMESPACE_RANGE is 60. Therefore, without the extension, our
ADDITIONAL_MANAGED_NAMESPACES could only be 6X-9X, meaning we only have 39
available namespaces. With the extension, in the two-digit namespace range, we
actually lose 9X (leaving 6X-8X). However, leading 9s expand the namespace by
another digit. This can also be chained, giving us theoretically infinite
additional namespaces: 6X-8X, 90X-98X, 990X-998X, 9990X-9998X, etc.

Note that behind the leading 9s, the namespace must still be the same number of
digits as the ASN_NAMESPACE_RANGE.

#### Default Value (used by the application if not provided)

```env
ASN_ENABLE_NAMESPACE_EXTENSION=false
```

#### Other Examples

```env
ASN_ENABLE_NAMESPACE_EXTENSION=true
```

### `ASN_NAMESPACE_RANGE`

The namespace range. The number of digits must not change after the first run.
For example, if the range is 600, auto-generated ASNs will be in the range of
100XXX to 599XXX. 600XXX to 999XXX will be reserved for manual ASNs in that
case.

#### Default Value (from the example environment file, must be provided)

```env
ASN_NAMESPACE_RANGE=600
```

### `ASN_PREFIX`

Prefix for the ASN. Must not change after the first run.

#### Default Value (from the example environment file, must be provided)

```env
ASN_PREFIX=ASN
```

## ASN Lookup Settings

### `ASN_LOOKUP_URL` (optional)

URL to look up existing ASN data. "{asn}" will be replaced with the ASN. If
empty, the lookup feature will be disabled.

#### Default Value (used by the application if not provided)

```env
ASN_LOOKUP_URL=
```

#### Other Examples

```env
ASN_LOOKUP_URL="https://dms.example.com/documents?archive_serial_number
```

### `ASN_LOOKUP_URL_INCLUDE_PREFIX` (optional)

Include the ASN_PREFIX in the {asn} replacement of the lookup URL. If false, the
prefix will be removed. Default is false.

#### Default Value (used by the application if not provided)

```env
ASN_LOOKUP_URL_INCLUDE_PREFIX=false
```

## Network Settings

### `PORT` (optional)

The port the server will listen on.

#### Default Value (used by the application if not provided)

```env
PORT=8080
```

#### Other Examples

```env
PORT=80
```

## OIDC (OpenID Connect) Configuration

### `OIDC_AUTH_SECRET`

Secret key used for signing and verifying tokens. Must be at least 32 characters
long for security purposes.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_AUTH_SECRET=RANDOM_SECRET_WITH_MIN_32_CHARS_CHANGE_ME_IMMEDIATELY_UPON_COPYING
```

### `OIDC_CLIENT_ID`

Client ID provided by your OIDC provider. Replace "XXX" with your actual client
ID.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_CLIENT_ID="XXX"
```

### `OIDC_CLIENT_SECRET`

Client Secret provided by your OIDC provider. Replace "XXX" with your actual
client secret.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_CLIENT_SECRET="XXX"
```

### `OIDC_ISSUER`

The URL of the OIDC provider's authorization server. This is where your
application will redirect users to authenticate.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_ISSUER=https://logto.example.com/oidc # Logto
```

#### Other Examples

```env
OIDC_ISSUER=https://authentik.example.com/application/o/dms/ # Authentik
```

```env
OIDC_ISSUER=https://authelia.example.com # Authelia
```

```env
OIDC_ISSUER=https://keycloak.example.com/realms/[REALM] # Keycloak
```

### `OIDC_NAME_CLAIM` (optional)

The claim in the ID token that contains the user's name.

#### Default Value (used by the application if not provided)

```env
OIDC_NAME_CLAIM=name
```

#### Other Examples

```env
OIDC_NAME_CLAIM=preferred_username
```

### `OIDC_REDIRECT_URI`

The URL to which the OIDC provider will redirect users after authentication.
This should match the redirect URI registered with your OIDC provider.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_REDIRECT_URI=http://localhost:41319/oidc/callback
```

### `OIDC_ROLES_CLAIM` (optional)

The claim in the ID token that contains the user's roles.

#### Default Value (used by the application if not provided)

```env
OIDC_ROLES_CLAIM=roles
```

#### Other Examples

```env
OIDC_ROLES_CLAIM=groups
```

```env
OIDC_ROLES_CLAIM=custom-roles-claim
```

### `OIDC_SCOPES`

Scopes requested from the OIDC provider. These determine the information
returned in the ID token.

#### Default Value (from the example environment file, must be provided)

```env
OIDC_SCOPES="openid profile roles"
```

### `OIDC_UID_CLAIM` (optional)

The claim in the ID token that contains the user's unique identifier.

#### Default Value (used by the application if not provided)

```env
OIDC_UID_CLAIM=sub
```

#### Other Examples

```env
OIDC_UID_CLAIM=uid
```

```env
OIDC_UID_CLAIM=email
```

```env
OIDC_UID_CLAIM=custom-uid-claim
```

## Storage Settings

### `DATA_DIR` (optional)

Data directory.

#### Default Value (used by the application if not provided)

```env
DATA_DIR=data
```

### `DB_FILE_NAME` (optional)

Name of the SQLite3 database file within the data directory. The database gets
created if it does not exist. To use a distributed database, set this to a URL
beginning with "http" or "https". If it starts with "http" or "https", this uses
the KV Connect Protocol:
https://github.com/denoland/denokv/blob/main/proto/kv-connect.md

#### Default Value (used by the application if not provided)

```env
DB_FILE_NAME=denokv.sqlite3
```

### `DENO_KV_ACCESS_TOKEN` (optional)

The access token for the KV Connect Protocol. This is required if DB_FILE_NAME
is a URL. The token must be set in the environment variable DENO_KV_ACCESS_TOKEN
as per Deno's requirements.

#### Default Value (used by the application if not provided)

```env
DENO_KV_ACCESS_TOKEN=XXX
```
