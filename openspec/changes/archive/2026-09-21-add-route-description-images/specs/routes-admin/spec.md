## MODIFIED Requirements

### Requirement: Rich-text description editor

The route form MUST provide a rich-text editor for `description` with text styles (bold, italic, headings, lists, and links) and an image-insert control in the toolbar. Image insert MUST upload a file chosen through that control; the editor MUST NOT treat clipboard paste or drag-and-drop as image upload in this change. The system MUST store the description as HTML in the database, including `img` tags for successfully uploaded images.

#### Scenario: HTML persisted

- **WHEN** an admin saves a description with styled text (for example bold or a heading)
- **THEN** the stored description MUST retain that HTML markup

#### Scenario: Image insert control

- **WHEN** an admin uses the description editor
- **THEN** the editor MUST expose an image-insert control in the toolbar

#### Scenario: Uploaded image persisted as HTML

- **WHEN** an admin inserts an allowed image through the toolbar and saves the route
- **THEN** the stored description MUST include an `img` whose `src` is the public URL of the uploaded file

#### Scenario: No paste or drop upload

- **WHEN** an admin pastes or drops an image file onto the description editor
- **THEN** the editor MUST NOT upload that file or insert it as a description image

### Requirement: Public description is not raw HTML

Public and authenticated route detail views MUST render the stored description as formatted text and MUST display allowed description images. They MUST NOT display raw HTML tags.

#### Scenario: Styled description on route detail

- **WHEN** a user opens a route whose description contains HTML markup such as a heading or bold text
- **THEN** the page MUST show the formatted text, not the HTML source

#### Scenario: Description images on route detail

- **WHEN** a user opens a route whose stored description contains an allowed image
- **THEN** the page MUST show that image, not the HTML source of the `img` tag

### Requirement: Delete route

Admins MUST be able to delete a route after explicit confirmation. When a route is deleted, the system MUST also attempt to delete object-storage files referenced by that route's stored description. Failure of object-storage deletion MUST NOT restore the route row.

#### Scenario: Confirmed delete

- **WHEN** an admin confirms delete for a route
- **THEN** the system MUST remove that route from the database

#### Scenario: Cancel delete

- **WHEN** an admin cancels the delete confirmation
- **THEN** the system MUST leave the route unchanged

#### Scenario: Description images removed with the route

- **WHEN** an admin confirms delete for a route whose description references object-storage image files
- **THEN** the system MUST attempt to delete those object-storage files

### Requirement: Embedding uses plain-text description

When building the embedding document and embedding source hash, the system MUST convert `description` to plain text by stripping HTML tags and MUST NOT include image content. Other route fields in the embedding document stay unchanged.

#### Scenario: Tags stripped before embed

- **WHEN** a saved description contains HTML tags
- **THEN** the embedding document MUST use the tag-stripped plain text of that description

#### Scenario: Markup-only change does not change embed text

- **WHEN** an admin changes only HTML markup in the description and the visible text stays the same
- **THEN** the plain-text embedding input MUST be unchanged

#### Scenario: Images excluded from embed

- **WHEN** a saved description contains images
- **THEN** the embedding document MUST NOT include those images or their object-storage URLs as embedding content

## ADDED Requirements

### Requirement: Description image file limits

The system MUST accept description image uploads that are JPEG, PNG, or WebP and at most 5 megabytes. The system MUST reject any other type or a larger file and MUST NOT insert it into the description.

#### Scenario: Allowed image accepted

- **WHEN** an admin chooses a JPEG, PNG, or WebP file that is 5 megabytes or smaller through the image-insert control
- **THEN** the system MUST upload the file and make it available to insert into the description

#### Scenario: Oversized image rejected

- **WHEN** an admin chooses an image larger than 5 megabytes through the image-insert control
- **THEN** the system MUST reject the upload, MUST NOT store the file, and MUST NOT insert an image into the description

#### Scenario: Disallowed type rejected

- **WHEN** an admin chooses a file that is not JPEG, PNG, or WebP through the image-insert control
- **THEN** the system MUST reject the upload, MUST NOT store the file, and MUST NOT insert an image into the description

### Requirement: Description image upload is admin-only

Only admins MUST be able to upload description images. Non-admins MUST NOT be able to store a file for use in a route description.

#### Scenario: Non-admin upload rejected

- **WHEN** a non-admin attempts to upload a description image
- **THEN** the system MUST reject the upload and MUST NOT store the file

### Requirement: Description images only from app object storage

On save and when rendering a description, the system MUST keep `img` tags only when `src` points at the application's object-storage host for route images. The system MUST strip any other `img` source.

#### Scenario: Foreign image source stripped on save

- **WHEN** an admin saves a description whose HTML includes an `img` whose `src` is not the application's object-storage host
- **THEN** the stored description MUST NOT contain that `img`

#### Scenario: Foreign image source not shown

- **WHEN** a stored description contains an `img` whose `src` is not the application's object-storage host
- **THEN** route views MUST NOT display that image

### Requirement: Unused description images are deleted on save

When an admin saves a route, the system MUST attempt to delete object-storage files whose URLs were present in the previously stored description and are absent from the newly stored description. Reordering existing images MUST NOT delete those files. Failure to delete unused files MUST NOT roll back the saved route content.

#### Scenario: Removed image file deleted

- **WHEN** an admin saves a description that no longer contains an image URL that was in the previously stored description
- **THEN** the system MUST attempt to delete the object-storage file for that URL

#### Scenario: Reordered images kept

- **WHEN** an admin saves a description that contains the same image URLs as before in a different order
- **THEN** the system MUST NOT delete those object-storage files

#### Scenario: Save succeeds if unused-file deletion fails

- **WHEN** route content save succeeds but deleting an unused object-storage file fails
- **THEN** the route row MUST remain saved with the new description

### Requirement: Route cards omit description images

Route list and recommendation cards MUST NOT display images from the route description. They MUST still show the description as text (including any existing text clamp).

#### Scenario: Card preview has no description image

- **WHEN** a user views a route card whose description contains images
- **THEN** the card MUST NOT show those images
