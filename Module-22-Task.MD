# Task: Complete the Comment Module APIs

## Overview

In this project, the `auth`, `user`, and `post` modules are already completed using the standard `route -> controller -> service` pattern.

Your task is to complete the **comment module** in the same style.

The backend already has the comment module files in place. Your job is to make sure the comment APIs work correctly, follow the existing project pattern, and match the project requirements.

## What You Are Building

The comment module must support these API operations:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/comments/author/:authorId` | Get all comments written by one author. |
| `GET` | `/api/comments/:commentId` | Get a single comment by its id. |
| `POST` | `/api/comments` | Create a new comment on a post. |
| `PATCH` | `/api/comments/:commentId` | Update a comment owned by the logged-in user. |
| `DELETE` | `/api/comments/:commentId` | Delete a comment owned by the logged-in user. |
| `PATCH` | `/api/comments/:commentId/moderate` | Allow admin moderation of comment status. |

## Files You Will Work With

You should complete the logic in these files:

- `src/modules/comment/comment.router.ts`
- `src/modules/comment/comment.controller.ts`
- `src/modules/comment/comment.service.ts`

Use the same style already used in the `auth`, `user`, and `post` modules.

## Functional Requirements

### 1. Get Comments by Author

Return all comments for a given author id.

Expected behavior:

- Accept `authorId` from the route parameter.
- Return comments in descending order by creation time.
- Include related post information in the response.

Example request:

```http
GET /api/comments/author/user-id-1
```

Example response:

```json
[
  {
    "id": "comment-id-1",
    "content": "Nice post",
    "authorId": "user-id-1",
    "postId": "post-id-1",
    "status": "APPROVED",
    "post": {
      "id": "post-id-1",
      "title": "My First Post"
    }
  }
]
```

### 2. Get Comment by Id

Return one comment by its id.

Expected behavior:

- Accept `commentId` from the route parameter.
- Return the comment data.
- Include selected post details such as id, title, and views.

Example request:

```http
GET /api/comments/comment-id-1
```

Example response:

```json
{
  "id": "comment-id-1",
  "content": "Nice post",
  "authorId": "user-id-1",
  "postId": "post-id-1",
  "status": "APPROVED",
  "post": {
    "id": "post-id-1",
    "title": "My First Post",
    "views": 10
  }
}
```

### 3. Create Comment

Create a new comment for an existing post.

Expected behavior:

- This route must be protected.
- Use the logged-in user id as `authorId`.
- Accept `content` and `postId` in the request body.
- Make sure the post exists before creating the comment.
- Set the default status to `APPROVED`.

Example request:

```json
{
  "content": "This is a comment",
  "postId": "post-id-1"
}
```

Example response:

```json
{
  "id": "comment-id-2",
  "content": "This is a comment",
  "authorId": "user-id-1",
  "postId": "post-id-1",
  "status": "APPROVED"
}
```

### 4. Update Comment

Allow the logged-in user to update their own comment.

Expected behavior:

- This route must be protected.
- A user can only update a comment that belongs to them.
- Use the comment id from the route parameter.
- Update only the allowed fields from the request body.

Example request:

```json
{
  "content": "Updated comment text"
}
```

### 5. Delete Comment

Allow the logged-in user to delete their own comment.

Expected behavior:

- This route must be protected.
- A user can only delete a comment that belongs to them.
- Use the comment id from the route parameter.

Example request:

```http
DELETE /api/comments/comment-id-2
```

### 6. Moderate Comment

Allow admins to change comment status.

Expected behavior:

- This route must be protected.
- Only admins can access it.
- Accept a `status` field in the request body.
- Prevent updating a comment to the same status it already has.

Example request:

```json
{
  "status": "REJECT"
}
```

## Implementation Rules

Follow these rules while working:

- Keep the same `route -> controller -> service` structure used in the other modules.
- Use the existing Prisma client from `src/lib/prisma.ts`.
- Keep response styles consistent with the rest of the project.
- Protect the write routes with the existing auth middleware.
- Make sure ownership checks are done in the service layer.
- Keep error messages clear and simple.

## Suggested Service Functions

Your `comment.service.ts` should expose functions that handle:

- Creating a comment.
- Fetching one comment.
- Fetching comments by author.
- Updating a comment.
- Deleting a comment.
- Moderating a comment.

## Criteria :

The task is complete when:

- All comment routes work without errors.
- A logged-in user can create, update, and delete only their own comments.
- An admin can moderate comment status.
- Comment reads return the related post data.
- The code follows the same style and structure as the rest of the backend.

## Check :

Verify that:

- Routes are connected correctly.
- Controller functions call the service layer.
- Service functions use Prisma correctly.
- Ownership checks are enforced.
- Admin-only moderation is protected.