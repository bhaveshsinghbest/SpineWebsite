# Database schema

Generated from the Drizzle migration snapshot (`database/migrations/meta`). Source of truth: `backend/src/models/schema.ts`.

**Enums:** `admin_role` (admin, editor, recruiter); `application_status` (new, shortlisted, interview, rejected, hired); `employment_type` (Full-time, Part-time, Contract, Internship); `enquiry_status` (new, in_progress, closed, spam); `job_status` (draft, open, closed); `media_kind` (image, document, cv); `publish_status` (draft, published); `sector_kind` (sector, industry, pillar)

## activity_log

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| user_id | integer | yes |  |
| action | varchar(40) | no |  |
| entity | varchar(60) | no |  |
| entity_id | varchar(60) | yes |  |
| summary | varchar(300) | yes |  |
| created_at | timestamp with time zone | no | now() |

Foreign keys: user_id → admin_users(id) on delete set null

## admin_sessions

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| user_id | integer | no |  |
| token_hash | varchar(64) | no |  |
| expires_at | timestamp with time zone | no |  |
| ip | varchar(64) | yes |  |
| user_agent | varchar(300) | yes |  |
| created_at | timestamp with time zone | no | now() |

Foreign keys: user_id → admin_users(id) on delete cascade

Unique: token_hash

## admin_users

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| email | varchar(160) | no |  |
| name | varchar(120) | no |  |
| password_hash | text | no |  |
| role | admin_role | no | 'editor' |
| active | boolean | no | true |
| failed_logins | integer | no | 0 |
| locked_until | timestamp with time zone | yes |  |
| last_login_at | timestamp with time zone | yes |  |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: admin_users_email_uq

## article_sections

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| article_id | integer | no |  |
| heading | varchar(200) | no |  |
| body | text[] | no | '{}'::text[] |
| bullets | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |

Foreign keys: article_id → articles(id) on delete cascade

## articles

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| slug | varchar(120) | no |  |
| title | varchar(200) | no |  |
| category | varchar(80) | no |  |
| banner | varchar(60) | yes |  |
| published_on | date | no |  |
| reading_minutes | integer | no | 5 |
| meta_description | varchar(200) | no |  |
| summary | text | no |  |
| takeaways | text[] | no | '{}'::text[] |
| status | publish_status | no | 'draft' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: slug

## associates

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| name | varchar(200) | no |  |
| sort_order | integer | no | 0 |
| status | publish_status | no | 'published' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

## clients

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| short_name | varchar(40) | no |  |
| name | varchar(200) | no |  |
| logo_url | varchar(300) | yes |  |
| sort_order | integer | no | 0 |
| status | publish_status | no | 'published' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

## enquiries

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| name | varchar(120) | no |  |
| organisation | varchar(160) | no |  |
| email | varchar(160) | no |  |
| phone | varchar(30) | no |  |
| area | varchar(160) | no |  |
| message | text | yes |  |
| status | enquiry_status | no | 'new' |
| notes | text | yes |  |
| ip | varchar(64) | yes |  |
| user_agent | varchar(300) | yes |  |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

## faqs

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| practice_id | integer | yes |  |
| sector_id | integer | yes |  |
| article_id | integer | yes |  |
| question | varchar(300) | no |  |
| answer | text | no |  |
| sort_order | integer | no | 0 |

Foreign keys: practice_id → practices(id) on delete cascade; sector_id → sectors(id) on delete cascade; article_id → articles(id) on delete cascade

Checks: `num_nonnulls("faqs"."practice_id", "faqs"."sector_id", "faqs"."article_id") = 1`

## job_applications

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| job_opening_id | integer | yes |  |
| position | varchar(200) | no |  |
| name | varchar(120) | no |  |
| email | varchar(160) | no |  |
| phone | varchar(30) | no |  |
| location | varchar(120) | no |  |
| qualification | varchar(160) | no |  |
| experience_years | numeric(4, 1) | no |  |
| linkedin | varchar(300) | yes |  |
| message | text | yes |  |
| cv_media_id | integer | no |  |
| consent | boolean | no |  |
| status | application_status | no | 'new' |
| notes | text | yes |  |
| ip | varchar(64) | yes |  |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Foreign keys: job_opening_id → job_openings(id) on delete set null; cv_media_id → media(id) on delete restrict

Checks: `"job_applications"."consent"`

## job_openings

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| slug | varchar(120) | no |  |
| title | varchar(160) | no |  |
| department | varchar(80) | no |  |
| location | varchar(120) | no |  |
| experience | varchar(60) | no |  |
| employment_type | employment_type | no | 'Full-time' |
| summary | text | yes |  |
| qualifications | text[] | no | '{}'::text[] |
| responsibilities | text[] | no | '{}'::text[] |
| posted_on | date | no |  |
| closes_on | date | yes |  |
| status | job_status | no | 'draft' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: slug

Checks: `"job_openings"."closes_on" IS NULL OR "job_openings"."closes_on" >= "job_openings"."posted_on"`

## media

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| kind | media_kind | no |  |
| original_name | varchar(255) | no |  |
| stored_name | varchar(120) | no |  |
| mime_type | varchar(120) | no |  |
| size_bytes | integer | no |  |
| is_public | boolean | no | true |
| alt | varchar(255) | yes |  |
| uploaded_by | integer | yes |  |
| created_at | timestamp with time zone | no | now() |

Foreign keys: uploaded_by → admin_users(id) on delete set null

Unique: stored_name

## offices

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| city | varchar(80) | no |  |
| region | varchar(80) | no |  |
| lines | text[] | no | '{}'::text[] |
| postal_code | varchar(12) | yes |  |
| head_office | boolean | no | false |
| sort_order | integer | no | 0 |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: offices_one_head_office_uq

## practice_items

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| practice_id | integer | no |  |
| anchor_id | varchar(80) | no |  |
| title | varchar(160) | no |  |
| description | text | no |  |
| deliverables | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |

Foreign keys: practice_id → practices(id) on delete cascade

Unique: practice_items_anchor_uq

## practices

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| slug | varchar(80) | no |  |
| title | varchar(120) | no |  |
| icon | varchar(60) | no |  |
| banner | varchar(60) | yes |  |
| meta_description | varchar(200) | no |  |
| summary | text | no |  |
| answer | text | no |  |
| tags | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |
| status | publish_status | no | 'published' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: slug

## redirects

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| from_path | varchar(300) | no |  |
| to_path | varchar(300) | no |  |
| status_code | integer | no | 301 |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: from_path

Checks: `"redirects"."status_code" IN (301, 302, 307, 308)`

## sector_practices

| Column | Type | Null | Default |
|---|---|---|---|
| sector_id | integer | no |  |
| practice_id | integer | no |  |
| sort_order | integer | no | 0 |

Foreign keys: sector_id → sectors(id) on delete cascade; practice_id → practices(id) on delete cascade

Primary key: (sector_id, practice_id)

## sector_sections

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| sector_id | integer | no |  |
| heading | varchar(200) | no |  |
| body | text[] | no | '{}'::text[] |
| bullets | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |

Foreign keys: sector_id → sectors(id) on delete cascade

## sectors

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| kind | sector_kind | no |  |
| slug | varchar(80) | no |  |
| title | varchar(160) | no |  |
| short_title | varchar(80) | no |  |
| icon | varchar(60) | no |  |
| tag | varchar(80) | no |  |
| banner | varchar(60) | yes |  |
| meta_description | varchar(200) | no |  |
| summary | text | no |  |
| answer | text | no |  |
| highlights | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |
| status | publish_status | no | 'published' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: sectors_kind_slug_uq

## site_content

| Column | Type | Null | Default |
|---|---|---|---|
| key (PK) | varchar(60) | no |  |
| data | jsonb | no |  |
| updated_by | integer | yes |  |
| updated_at | timestamp with time zone | no | now() |

Foreign keys: updated_by → admin_users(id) on delete set null

## team_members

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| slug | varchar(80) | no |  |
| name | varchar(120) | no |  |
| role | varchar(160) | no |  |
| photo_url | varchar(300) | yes |  |
| credentials | varchar(200) | yes |  |
| focus | text[] | no | '{}'::text[] |
| bio | text[] | no | '{}'::text[] |
| sort_order | integer | no | 0 |
| status | publish_status | no | 'published' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Unique: slug

## testimonials

| Column | Type | Null | Default |
|---|---|---|---|
| id (PK) | serial | no |  |
| quote | text | no |  |
| name | varchar(120) | no |  |
| designation | varchar(160) | no |  |
| organisation | varchar(200) | no |  |
| consent_on_file | boolean | no | false |
| sort_order | integer | no | 100 |
| status | publish_status | no | 'draft' |
| created_at | timestamp with time zone | no | now() |
| updated_at | timestamp with time zone | no | now() |

Checks: `"testimonials"."status" = 'draft' OR "testimonials"."consent_on_file"`

