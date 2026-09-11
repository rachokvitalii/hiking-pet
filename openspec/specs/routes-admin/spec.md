# routes-admin Specification

## Purpose

Lets admins manage hiking routes in-app with full CRUD, rich-text descriptions, slug helpers, and reliable embedding refresh after save failures.

## Requirements

### Requirement: Admin route list

Admins MUST be able to view a list of all routes in the admin area.

#### Scenario: Admin sees routes

- **WHEN** an admin opens the admin routes list
- **THEN** the system MUST show existing routes with enough identity to open edit (at least title and slug)

### Requirement: Create route

Admins MUST be able to create a route with all required domain fields: title, description (rich text stored as HTML), region, type(s), difficulty, latitude, longitude, distanceKm, days, elevationGain, seasons, and slug.

#### Scenario: Successful create

- **WHEN** an admin submits a valid create form
- **THEN** the system MUST persist the route and make it available in the admin list and app route reads

#### Scenario: Invalid create

- **WHEN** an admin submits invalid create data
- **THEN** the system MUST reject the create and return field or form errors without creating a row

### Requirement: Update route

Admins MUST be able to edit an existing route and save changes to all editable domain fields.

#### Scenario: Successful update

- **WHEN** an admin submits a valid edit form for an existing route
- **THEN** the system MUST persist the updated fields

#### Scenario: Edit missing route

- **WHEN** an admin opens edit for a route id that does not exist
- **THEN** the system MUST show a not-found outcome

### Requirement: Delete route

Admins MUST be able to delete a route after explicit confirmation.

#### Scenario: Confirmed delete

- **WHEN** an admin confirms delete for a route
- **THEN** the system MUST remove that route from the database

#### Scenario: Cancel delete

- **WHEN** an admin cancels the delete confirmation
- **THEN** the system MUST leave the route unchanged

### Requirement: Auto slug with manual override

The create/edit form MUST auto-generate a slug from the title and MUST allow the admin to edit the slug manually. Once the slug has been manually edited, changing the title MUST NOT overwrite the slug unless the admin opts back into auto behavior (if provided) or clears the override.

#### Scenario: Slug follows title until edited

- **WHEN** an admin types a title and has not manually edited the slug
- **THEN** the slug field MUST update to a slugified form of the title

#### Scenario: Manual slug wins

- **WHEN** an admin manually changes the slug and then changes the title
- **THEN** the slug MUST remain the manually entered value

#### Scenario: Duplicate slug rejected

- **WHEN** an admin saves a route with a slug already used by another route
- **THEN** the system MUST reject the save with a slug uniqueness error

### Requirement: Rich-text description editor

The route form MUST provide a rich-text editor for `description` with text styles (bold, italic, headings, lists, and links). The editor MUST NOT offer image insert in this change. The system MUST store the description as HTML in the database.

#### Scenario: HTML persisted

- **WHEN** an admin saves a description with styled text (for example bold or a heading)
- **THEN** the stored description MUST retain that HTML markup

#### Scenario: No image insert

- **WHEN** an admin uses the description editor
- **THEN** the editor MUST NOT expose an image-insert control

### Requirement: Public description is not raw HTML

Public and authenticated route detail views MUST render the stored description as formatted text. They MUST NOT display raw HTML tags. Image tags, if present in stored HTML, MUST NOT be shown.

#### Scenario: Styled description on route detail

- **WHEN** a user opens a route whose description contains HTML markup such as a heading or bold text
- **THEN** the page MUST show the formatted text, not the HTML source

### Requirement: Embedding uses plain-text description

When building the embedding document and embedding source hash, the system MUST convert `description` to plain text by stripping HTML tags and MUST NOT include image content. Other route fields in the embedding document stay unchanged.

#### Scenario: Tags stripped before embed

- **WHEN** a saved description contains HTML tags
- **THEN** the embedding document MUST use the tag-stripped plain text of that description

#### Scenario: Markup-only change does not change embed text

- **WHEN** an admin changes only HTML markup in the description and the visible text stays the same
- **THEN** the plain-text embedding input MUST be unchanged

### Requirement: Soft-fail embedding on save

After a successful create or update of route content, the system MUST attempt to generate and store the route embedding. If embedding fails, the system MUST still keep the saved route content and MUST NOT treat the overall save as a content rollback. Embedding columns MUST remain unchanged on embed failure (null if never embedded, or previous values if updating).

#### Scenario: Save succeeds when embed fails

- **WHEN** route content save succeeds but the embedding API fails
- **THEN** the route row MUST remain saved with form fields persisted and embedding columns unchanged, and the admin MUST be informed that embedding failed

#### Scenario: Save succeeds when embed succeeds

- **WHEN** route content save and embedding both succeed
- **THEN** the route MUST have updated embedding metadata (model, source hash, updated timestamp) matching the plain-text embedding document derived from the saved content

### Requirement: Re-embed action

Admins MUST be able to trigger re-embedding for a saved route without re-entering the full form.

#### Scenario: Re-embed success

- **WHEN** an admin triggers Re-embed for a route that exists
- **THEN** the system MUST regenerate the embedding from the current route document fields and update embedding columns

#### Scenario: Re-embed failure

- **WHEN** an admin triggers Re-embed and the embedding API fails
- **THEN** the system MUST leave route content unchanged, leave embedding columns unchanged, and report the failure

### Requirement: Admin navigation

Authenticated admins MUST have a discoverable navigation entry to the admin routes area. Non-admins MUST NOT see that entry.

#### Scenario: Admin sees nav link

- **WHEN** an admin views the authenticated app chrome
- **THEN** a link to the admin routes area MUST be available

#### Scenario: Non-admin does not see nav link

- **WHEN** a non-admin views the authenticated app chrome
- **THEN** the admin routes link MUST NOT be shown
