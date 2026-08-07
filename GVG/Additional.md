# Build prompt: GVG Beneficiary Progress Tracker

## Context (for the builder/AI to understand the domain)

This is an independent civic-tech tool built to support **NSIPA's Grant for Vulnerable Groups (GVG)** programme (National Social Investment Programme Agency, Nigeria — nsipa.gov.ng/programmes/gvg). GVG disburses ₦40,000 cash plus a sewing or grinding machine to vulnerable beneficiaries (persons with disabilities, senior citizens, and individuals in the National Social Register) as part of a flagship empowerment drive spanning all 774 LGAs. The programme currently has **no mechanism to track beneficiaries after disbursement** — no way to know if a machine is still in use, if the business is generating income, or if someone needs further support. This tool fills that gap: it is a post-disbursement tracking and reporting system, not a disbursement or eligibility system.

Most beneficiaries are not digitally literate. The system must never require a beneficiary to operate a web app, fill a form, or read complex UI. Field agents and admins are the primary users; beneficiaries are the subject of the data, with an optional lightweight channel for the few who are digitally capable.

## Objective

Build a full-stack web platform (registry + tracking + reporting) that:
1. Lets admins bulk-import beneficiary data in whatever format it currently exists (Excel, CSV, table, Word doc), even if the data is just names and phone numbers, and treats that as a valid partial baseline.
2. Lets field agents log periodic check-ins on beneficiaries assigned to them, in under 2 minutes, from a phone.
3. Automatically flags beneficiaries who show signs of business failure, non-usage of assets, or unreachability, so they can be considered for further assistance.
4. Produces exportable reports (PDF/Excel) an agency officer can use as evidence of programme impact.
5. Optionally lets digitally capable beneficiaries self-confirm status via WhatsApp — never required, never the primary data path.

## Roles and permissions

| Capability | Super admin | Admin | Agent | Beneficiary (optional) |
|---|---|---|---|---|
| Manage users/roles | Yes | No | No | No |
| System/config settings | Yes | No | No | No |
| Import beneficiary datasets | Yes | Yes | No | No |
| View all beneficiaries/agents | Yes | Yes | No | No |
| Assign beneficiaries to agents | Yes | Yes | No | No |
| View/submit check-ins | Yes | View only | Own assigned beneficiaries only | No |
| Review/resolve escalations | Yes | Yes | Can raise, not resolve | No |
| Generate/export reports | Yes | Yes | No | No |
| Confirm own status | No | No | No | Yes (via WhatsApp/OTP lookup only) |

Auth: super admin creates admin accounts; admins create/manage agent accounts. Agents are scoped to an assigned LGA/beneficiary list only — enforce this at the query level (row-level security), not just in the UI.

## Flexible data import (core requirement)

Admins must be able to drag-and-drop **any** of: `.xlsx`, `.xls`, `.csv`, `.docx` (with a table), or a pasted table, and have the system:

1. **Auto-detect columns** — fuzzy-match headers to known fields (e.g. "Name" / "Full Name" / "Beneficiary Name" all map to `full_name`; "Phone" / "Phone No" / "Contact" map to `phone_number`). Show a mapping-confirmation screen before committing, since real-world sheets are messy.
2. **Accept partial records** — a row with only name + phone is valid. Missing fields (LGA, category, machine serial, disability status, etc.) are left null and the record is marked `profile_status: incomplete`. Agents complete these fields naturally during their first check-in with that beneficiary — don't force a rejected import for incomplete data.
3. **Deduplicate** — match on phone number (normalized to a consistent format) before insert; flag likely duplicates for admin review rather than silently merging or silently creating duplicates.
4. **Preview before commit** — show a table preview (first ~20 rows + total count + detected issues) before the import is written to the database.
5. **Import log** — keep a record of every import batch (who, when, file name, rows added/skipped/flagged) for auditability.

Use a parsing library appropriate to the stack (e.g. SheetJS/xlsx for Excel/CSV, `mammoth` for docx table extraction) run client-side or in a serverless function, normalize to a common row schema, then run the mapping/preview/dedupe pipeline before any database write.

## Data model (suggested)

**beneficiaries**
`id, full_name, phone_number (normalized, unique), lga, state, category (sewing | grinding | unassigned), disability_status, disbursement_date, amount_received, machine_serial, baseline_photo_url, assigned_agent_id, profile_status (incomplete | complete), status (active | inactive | unreachable), created_at, source (import_batch_id | manual)`

**agents**
`id, name, phone_number, assigned_lga, role (agent | admin | super_admin), created_by, active`

**checkins**
`id, beneficiary_id, agent_id, date, channel (agent_visit | agent_call | whatsapp_self), business_active (bool), machine_in_use (bool), estimated_monthly_income, challenges (tags + free text), needs_assistance (bool), photo_url, notes`

**escalations**
`id, beneficiary_id, triggered_by (checkin_id | manual), reason, status (open | in_review | resolved), assigned_to, resolution_notes, created_at, resolved_at`

**import_batches**
`id, uploaded_by, filename, format, rows_total, rows_added, rows_flagged, created_at`

## Escalation logic (auto-flagging)

Flag a beneficiary for review when any of:
- Two consecutive check-ins report `business_active: false`
- `machine_in_use: false` reported at all (asset may need recovery/reassignment)
- Beneficiary unreachable for 2+ scheduled check-in cycles
- Agent manually flags `needs_assistance: true`

Flags create an `escalations` record visible to admin/super admin only, with a resolution workflow (in review → resolved, with notes).

## Beneficiary-facing layer (strictly optional)

- WhatsApp Cloud API bot: numbered-menu only ("Reply 1 if your business is still running, 2 if not, 3 to speak to someone"), no free text required, no app install, no login.
- No dashboard, no dense forms, no requirement to participate — check-ins from agents remain fully sufficient without it.

## Tech stack (cost-effective, solo-buildable)

- **Frontend/backend:** Next.js (App Router), deployed on Vercel free tier
- **Database/auth/storage:** Supabase (Postgres + Row-Level Security for role scoping + Storage for check-in/baseline photos) — free tier sufficient through pilot
- **Import parsing:** SheetJS (xlsx/csv), mammoth (docx tables)
- **Beneficiary channel:** WhatsApp Cloud API (Meta) — free tier covers pilot volume
- **Offline support:** PWA with local queue for agents filling check-ins in low-connectivity areas, syncing when back online
- **Reporting:** server-side PDF/Excel export (e.g. exceljs / pdf generation) from aggregated Postgres views

## Data protection notes

This involves sensitive data on a legally vulnerable population (disability status, national register inclusion). Even at pilot stage: capture consent at enrollment/import, enforce role-based access strictly via RLS (not just UI hiding), and avoid exposing beneficiary PII in any beneficiary-facing WhatsApp responses beyond what that specific beneficiary already knows about themselves.

## Build order (solo dev, phased)

1. Auth + roles (super admin/admin/agent) + beneficiary registry with flexible import pipeline
2. Agent check-in flow (mobile-first, offline-capable) + assignment logic
3. Escalation flagging + admin review workflow
4. Reporting dashboard + PDF/Excel export
5. WhatsApp self check-in bot (optional layer)