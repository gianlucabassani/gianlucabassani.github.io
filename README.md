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

The homepage and blog index display posts as pages in a digital book. The final
page is an animated byte-construction placeholder. Add published posts to
`src/data/blog.json`; page navigation updates automatically.

## Project identities

Set a project's optional `logo` in `src/data/projects.json` to an asset path such
as `/assets/projects/gosint.webp`. Logos appear in the project directory,
featured projects, and project detail pages. Projects without a logo use a
category symbol. Asset provenance is in `public/assets/projects/sources.json`.

The project directory puts `featured` entries first, supports category/status
filters and a compact list view. The blog book orders posts newest first. Main navigation is shared across routes.
