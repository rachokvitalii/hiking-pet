## Purpose

Defines user roles, how admin privilege appears in the session, and how privileged access is enforced and bootstrapped for operators.

## ADDED Requirements

### Requirement: Users have a role

The system SHALL store each user with a role of either `user` or `admin`. New users MUST default to `user`.

#### Scenario: New account defaults to user

- **WHEN** a user registers successfully
- **THEN** their role MUST be `user`

#### Scenario: Admin role can be assigned

- **WHEN** an operator promotes a user to admin via the supported bootstrap mechanism
- **THEN** that user's role MUST be `admin`

### Requirement: Session exposes role

Authenticated sessions MUST include the user's current role so the client and server can authorize admin features.

#### Scenario: Admin session includes role

- **WHEN** an admin user signs in
- **THEN** the session MUST include `role` equal to `admin`

#### Scenario: Regular session includes role

- **WHEN** a non-admin user signs in
- **THEN** the session MUST include `role` equal to `user`

### Requirement: Admin access is enforced on the server

Admin-only pages and mutations MUST reject callers who are not authenticated admins. Hiding UI alone is not sufficient.

#### Scenario: Non-admin cannot open admin pages

- **WHEN** an authenticated non-admin requests an admin page
- **THEN** the system MUST deny access (redirect or equivalent) without rendering admin content

#### Scenario: Unauthenticated caller cannot mutate as admin

- **WHEN** an unauthenticated caller invokes an admin mutation
- **THEN** the system MUST reject the mutation

#### Scenario: Non-admin cannot mutate as admin

- **WHEN** an authenticated non-admin invokes an admin mutation
- **THEN** the system MUST reject the mutation

### Requirement: Promote admin via CLI

The system MUST provide a CLI command that sets a user's role to `admin` by email for bootstrap.

#### Scenario: Promote existing user

- **WHEN** an operator runs the promote-admin command with an existing user's email
- **THEN** that user's role MUST become `admin`

#### Scenario: Unknown email

- **WHEN** an operator runs the promote-admin command with an email that does not exist
- **THEN** the command MUST fail with a clear error and MUST NOT create a user
