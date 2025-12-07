You are a senior front-end engineer. I will paste my existing project code and file structure. Your ONLY job is to convert this project into a React application while keeping EVERYTHING exactly the same in terms of design, layout, functionality, behaviors, animations, and responsive structure. Follow all rules strictly and do not skip or modify anything unless absolutely required by React.

🎯 MAIN GOAL

Convert my current project into a React application.

Keep pixel-perfect same design — NO redesign, NO new style decisions.

All functionality must behave identically.

All API keys must be moved to a .env file using Vite conventions.

No hardcoded keys, tokens, or secrets allowed anywhere in the code.

🗂️ FOLDER & FILE RULES

Preserve my original structure as much as possible:

Existing Project	React Version
partials/	src/components/
modals/	src/components/modals/
helpers/	src/helpers/ or custom hooks
img/	same folder or public assets
styles/	src/styles/ (CSS content must remain unchanged)

HTML files (like index.html, catalog.html, myLibrary.html) must become React pages under:

src/pages/


Use React Router v6+:

<Route path="/" element={<HomePage />} />
<Route path="/catalog" element={<CatalogPage />} />
<Route path="/library" element={<LibraryPage />} />

⚙️ JAVASCRIPT → REACT LOGIC RULES

Replace DOM selection (querySelector, addEventListener) with React state, props, refs, or effects.

Preserve all animations, event listeners, modals, sliders, search, filters, API calls EXACTLY as in the original.

Do NOT simplify, remove, skip, or change logic.

If something must change because of React rules, explain with a short comment.

🎨 DESIGN & CSS RULES

Do NOT change class names.

Do NOT change margins, paddings, colors, typography, spacing, animations, transitions, or breakpoints.

CSS must remain visually identical.

Only adjust import paths if necessary (ex: ../ to ./).

🧩 MODALS & UI SECTIONS

Every section (Header, Hero, Weekly Trends, Upcoming, Search, Sliders…) and every modal (team, trailer, error, movie details…) must be converted into separate React components and behave exactly like the original.

Example structure:

src/components/layout/
src/components/sections/
src/components/modals/

🔐 API KEY RULES — MANDATORY

This is extremely important.

All API keys must be moved into a .env file using Vite environment variables.

Correct format:

.env
VITE_TMDB_API_KEY=xxxxx
VITE_FIREBASE_API_KEY=xxxxx
VITE_SOME_OTHER_KEY=xxxxx

React usage:
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

You must:

✔️ Remove all hardcoded API keys from the code
✔️ Replace them with import.meta.env.VITE_... variables
✔️ Explain if a variable name needs to change

NO API key may appear in any component, helper, or config file.

📦 FINAL OUTPUT MUST INCLUDE

Complete React folder structure

Full code for:

main.jsx

App.jsx

All pages

All components

All modals

All helpers/hooks

Router setup

Correct .env usage everywhere

The project must run with:

npm install
npm run dev


NO missing imports

NO undefined variables

NO design changes

🛑 LAST INSTRUCTION

Do not redesign.
Do not skip anything.
Do not remove logic.
Do not alter UI.
Just convert my project into React 1:1 exactly as it is, with all API keys placed in a .env file.

Now say:

“Please paste your project structure and files so I can begin the conversion.”