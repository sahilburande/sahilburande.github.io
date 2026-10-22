# Sahil Burande — Personal Portfolio

A responsive personal portfolio for a Computer Science Engineering student interested in web development and data science. The site uses a restrained, Apple-inspired visual style and vanilla web technologies.

## Technologies

- HTML5 for semantic structure
- CSS3 for layout, themes, responsive styles, and motion
- Vanilla JavaScript for interactions and project rendering
- JSON for editable project data

## Features

- Responsive navigation with a mobile menu and active section indicator
- Light and dark themes, with optional theme persistence in `localStorage`
- Project cards fetched from `data/projects.json`
- Graceful project loading and image error states
- Accessible contact form validation with Supabase insert support and an encoded `mailto:` fallback
- Reduced-motion support, visible focus styles, and skip navigation
- Local profile image at `assets/images/profile.jpg`

## Folder structure

```text
outputs/
├── index.html
├── css/style.css
├── js/script.js
├── js/supabase-config.js
├── data/projects.json
├── supabase/contact-messages.sql
├── assets/images/profile.jpg
└── README.md
```

## Run locally

The Fetch API used for projects needs an HTTP server; opening `index.html` directly with `file://` may prevent the JSON request from working.

From this folder, run one of:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. You can also use the Live Server extension in VS Code.

## JavaScript concepts demonstrated

- DOM selection and updates
- Event listeners and callbacks
- Smooth anchor navigation and responsive menu state
- Fetch API with loading and error handling
- Dynamic DOM element creation from JSON data
- Contact form required-field and email validation
- Supabase REST insert for `contact_messages` (once configured)
- `mailto:` URL encoding fallback
- `localStorage` with unavailable-storage handling
- Intersection Observer for reveal effects and active navigation
- Dynamic copyright year

## Update your details

- **Profile photo:** replace `assets/images/profile.jpg` with your preferred portrait (keep the filename, or update the image path in `index.html`).
- **Email:** replace `your-email@example.com` in the `CONTACT_EMAIL` constant at the top of `js/script.js`.
- **Supabase:** fill `url` and `anonKey` in `js/supabase-config.js` with the project URL and publishable/anon key. Run `supabase/contact-messages.sql` once in the project SQL editor to create the table and insert-only RLS policy. Never place a service-role key in browser code. When Supabase is unavailable, the form prepares an email draft.
- **Projects:** edit `data/projects.json`. Each item supports `title`, `description`, `technologies`, `repository`, `demo`, and `preview`. Leave repository/demo blank until a verified URL is available. Preview paths are relative to the site root.
- **Skills and education:** edit the corresponding semantic sections in `index.html` as details change.

## Profiles

- [GitHub](https://github.com/sahilburande)
- [LinkedIn](https://www.linkedin.com/in/sahilburande?utm_source=share_via&utm_content=profile&utm_medium=member_android)

## Project screenshots

Add screenshots here after capturing the site in a browser.
