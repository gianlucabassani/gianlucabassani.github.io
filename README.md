# Blog related links

Blog posts in `src/data/blog.json` can have an optional `relatedLinks` list:

```json
"relatedLinks": [
  {
    "label": "Source on GitLab",
    "href": "https://gitlab.com/your-account/your-repo",
    "description": "Source code and setup instructions."
  },
  {
    "label": "My projects",
    "href": "/projects"
  }
]
```

Ask the agent to add or change these links when editing a post. Each entry needs
a label and URL; the description is optional. Use a full HTTPS URL for GitHub or
GitLab, or a site path such as `/projects` for internal pages.

The card stays on the right while scrolling on desktop and follows the article on
smaller screens. Omit `relatedLinks` or set it to `[]` to hide it.
