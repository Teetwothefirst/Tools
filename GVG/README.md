# NSIPA GVG Beneficiary Progress Tracker 🇳🇬

An independent civic-tech post-disbursement tracking and reporting platform designed for **NSIPA's Grant for Vulnerable Groups (GVG)** programme (National Social Investment Programme Agency, Nigeria — [nsipa.gov.ng](https://nsipa.gov.ng/programmes/gvg)).

GVG disburses ₦40,000 cash plus a sewing or grinding machine to vulnerable beneficiaries across all 774 LGAs. This platform addresses the missing post-disbursement monitoring link by enabling rapid mobile field check-ins, multi-format bulk dataset imports, automated business failure / asset recovery escalations, and official federal impact reporting.

---

## 🌟 Key Features & Capabilities

1. **Flexible Data Import Pipeline**:
   - Drag-and-drop or paste `.xlsx`, `.xls`, `.csv`, `.docx` tables, or raw tabbed text.
   - Smart **Fuzzy Column Auto-Detection** matching headers like "Beneficiary Name", "Phone No", "LGA", "Special Needs", "Grant Sum".
   - **Partial Record Support**: Rows with minimal data (e.g., Name + Phone only) are imported validly with `profile_status: incomplete` for completion during field check-ins.
   - **Phone Normalization & Deduplication**: Normalizes all Nigerian phone numbers to `+234...` and flags duplicates for admin review.
   - **Import Batch Audit Trail (`import_batches`)**: Logs every upload batch with timestamp, row count, and uploader identity.

2. **Role & Row-Level Security (RLS) Scoping**:
   - **Super Admin**: Full platform configuration, user roles, dataset imports, and global reporting.
   - **Admin**: Bulk dataset import, escalation triage, and report generation.
   - **Agent**: Restricted strictly at query level (RLS) to assigned LGA and beneficiary list. Mobile-optimized check-in flow (&lt;2 mins).
   - **Beneficiary (WhatsApp API)**: Optional 1-2-3 numeric reply bot for self-confirmation status.

3. **PWA Offline Check-in Queue**:
   - Built-in network status listener (`navigator.onLine`).
   - Automatically queues field agent check-ins in local storage when in low/no connectivity areas, auto-flushing to database when network reconnects.

4. **Automated Escalation Rule Engine**:
   - Auto-flags beneficiaries when:
     - 2 consecutive check-ins report `business_active: false`.
     - `machine_in_use: false` reported at any point.
     - Beneficiary is unreachable for 2+ scheduled check-in cycles.
     - Agent manually checks `needs_assistance: true`.

5. **Impact Analytics & Executive Exports**:
   - Formatted, agency-branded **PDF Impact Report** generation (with NSIPA header, KPI summaries, and signature block).
   - Export to formatted **Excel / CSV** files.

---

## 🛠️ Stack & Setup

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Storage & State**: Reactive local/Supabase mock store with initial datasets across Kano, Lagos, Enugu, Rivers, Kaduna, and FCT Abuja.

### Quick Start

```bash
cd GVG
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
