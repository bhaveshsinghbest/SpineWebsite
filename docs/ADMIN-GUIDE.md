# Admin guide

This guide is for the person who updates the Spine Advisory website. Everything you publish in the Admin Panel appears on the website immediately; no developer is needed.

## Signing in

- Click **Admin** (the small lock button at the top right of the website), or go to **/admin/login**.
- Sign in with the administrator **username** (or the account email) and password. There is one administrator account.
- Forgot the password? Click **Forgot password?**, enter the username or email, and open the emailed link within 30 minutes. The link works once; using it signs out every session.
- Change the password under **your name (top right) → My account**. Passwords need at least 12 characters, with upper-case and lower-case letters and a number.
- After 5 wrong passwords the account locks for 15 minutes. Every failed attempt is recorded in the **Audit Log**.
- You are signed out automatically after 30 minutes without activity (a warning appears 2 minutes before), after 8 hours in any case, or when you click **Logout**.
- If the password is lost and email is not set up, a developer can reset the account on the server with `npm run admin:create -- --username admin`.

## The menu

| Menu | What it is for |
|---|---|
| **Dashboard** | Visitors, enquiries, active projects and published announcements; monthly charts; project status overview; recent admin activity |
| **Career Management** | *Job openings* (add, edit, publish, unpublish, close), *Applications* (view, download résumés, set status, remarks, export) and *Settings* (job categories, locations, employment types, experience levels) |
| **Enquiry Management** | All website enquiries: status, internal remarks, follow-up date, filters and export |
| **Project Management** | Projects with images, status and categories; published projects appear on the **Projects** page |
| **Announcements & News** | News items and announcements, with scheduling and archiving; shown on the **News** page and the homepage |
| **Website Content Management** | Homepage (hero, banner image, promotional section, section headings), page headings, About Us, services, industries and sectors, team, clients, testimonials, insights, media library, redirects |
| **Audit Log** | Read-only record of sign-ins, failed sign-ins, sign-outs and every change |
| **Website Settings** | Company name, logo, contact numbers and emails, social media links, footer text and office addresses |

The sidebar can be collapsed (**Collapse**, bottom left). On a phone or tablet it opens from the **☰** button.

## Lists

Every list has search, filters, sortable column headings (click a heading; click again to reverse) and pagination with a choice of rows per page. The buttons at the end of each row are:

| Icon | Action |
|---|---|
| ⤒ Publish / ⊘ Unpublish | Show or hide the item on the website (asks for confirmation before hiding) |
| Archive / Close | Archive an announcement or close a job vacancy |
| ↗ | View on the website |
| ✎ | Edit |
| 🗑 | Delete (asks for confirmation) |

## Drafts, publishing and scheduling

- **Draft** items are saved but hidden. **Published** (or **Open** for jobs) shows them.
- **Announcements**: set **Publication date and time** in the future and status **Published** to schedule it — it appears automatically when due (the list shows *Scheduled*). **Archive** hides an old item but keeps it. Untick **Show on the homepage** to keep it off the homepage.
- **Job openings** also disappear automatically after their closing date.
- **Projects**: tick **Feature on the homepage** to show the project in the homepage's *Featured projects* section.
- **Testimonials** can only be published when **Written client consent on file** is ticked.
- **URL slugs** are generated from the title and must be unique. Changing a published slug changes its web address, so add a **Redirect** from the old address.

## Website text without code changes

- **Website Content Management → Homepage**: hero headings, button labels, banner image, a promotional section (switch it on, add a heading, text and button) and every section heading on the homepage.
- **Website Content Management → Page headings**: the banner heading and introduction of each main page.
- In both, **an empty field keeps the built-in wording**, shown in grey inside the field. `{founded}` inserts the founding year.
- **About Us** texts, values, approach, "why choose Spine" and headline figures are under **Website Content Management → Overview**.

## Images

Use **Upload image** / **Replace image** next to any image field, or the **Media library**. JPG, PNG and WebP up to 8 MB are resized and converted to WebP automatically. Project galleries: **+ Add image**, upload, add a caption, reorder with ↑ ↓ and remove with ✕; changes apply when you save. Team photos work best as 4:5 portraits. Only upload client logos the client has allowed you to use.

## Enquiries and applications

- Statuses — enquiries: *New, In progress, Resolved, Closed*; applications: *Pending, Shortlisted, Rejected, Selected*.
- Open a record to read it, change the status, write **internal remarks** (never shown publicly) and, for enquiries, set a **follow-up date**.
- Filter by status, category / job opening and date received; **Export to Excel (CSV)** downloads exactly the filtered records.
- **Delete** removes an application together with its résumé (data-protection good practice).
- New submissions are also emailed to the addresses configured on the server.

## Audit Log

Newest first. Filter by date, action (for example **Failed sign-ins**), module, or search. **Changes** shows the field values before and after an edit. Entries cannot be edited or deleted.
