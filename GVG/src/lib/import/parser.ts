import { Beneficiary, ColumnMapping, DeduplicationItem, RawImportRow, BeneficiaryCategory } from '../../types/gvg';

// Phone Normalization for Nigeria (+234 format)
export function normalizePhoneNumber(phoneRaw: any): string {
  if (!phoneRaw) return '';
  let str = String(phoneRaw).replace(/\D/g, ''); // strip non-digits

  if (!str) return '';

  if (str.startsWith('234') && str.length === 13) {
    return '+' + str;
  }
  if (str.startsWith('0') && str.length === 11) {
    return '+234' + str.substring(1);
  }
  if (str.length === 10) {
    return '+234' + str;
  }
  return '+' + str;
}

const HEADER_ALIASES: { targetField: keyof Beneficiary; aliases: string[] }[] = [
  {
    targetField: 'full_name',
    aliases: ['name', 'full name', 'beneficiary name', 'fullname', 'client name', 'beneficiary'],
  },
  {
    targetField: 'phone_number',
    aliases: ['phone', 'phone no', 'phone number', 'contact', 'telephone', 'mobile', 'gsm', 'phone_no'],
  },
  {
    targetField: 'lga',
    aliases: ['lga', 'local govt', 'local government', 'l.g.a', 'district', 'council area'],
  },
  {
    targetField: 'state',
    aliases: ['state', 'state of origin', 'location state'],
  },
  {
    targetField: 'category',
    aliases: ['category', 'machine type', 'asset', 'asset type', 'empowerment type', 'grant type', 'machine'],
  },
  {
    targetField: 'disability_status',
    aliases: ['disability', 'disability status', 'vulnerability', 'vulnerability category', 'special needs', 'handicap'],
  },
  {
    targetField: 'disbursement_date',
    aliases: ['disbursement date', 'date disbursed', 'date', 'grant date', 'pay date'],
  },
  {
    targetField: 'amount_received',
    aliases: ['amount', 'amount received', 'grant amount', 'cash disbursed', 'sum'],
  },
  {
    targetField: 'machine_serial',
    aliases: ['serial', 'machine serial', 'asset serial', 'equipment serial', 'machine id', 'serial no'],
  },
];

export function autoDetectColumnMappings(headers: string[]): ColumnMapping[] {
  return headers.map((header) => {
    const cleanHeader = header.trim().toLowerCase().replace(/[_.\-]/g, ' ');

    let matchedField: keyof Beneficiary | 'ignore' = 'ignore';

    for (const item of HEADER_ALIASES) {
      if (item.aliases.some((alias) => cleanHeader === alias || cleanHeader.includes(alias))) {
        matchedField = item.targetField;
        break;
      }
    }

    return {
      fileHeader: header,
      targetField: matchedField,
    };
  });
}

export function parseDelimitedText(text: string): { headers: string[]; rows: RawImportRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter (tab vs comma vs pipe)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes('|')) delimiter = '|';

  const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: RawImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

    const rowObj: RawImportRow = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] !== undefined ? cells[idx] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function processAndDeduplicateImport(
  rawRows: RawImportRow[],
  mappings: ColumnMapping[],
  existingBeneficiaries: Beneficiary[],
  batchId: string
): DeduplicationItem[] {
  const items: DeduplicationItem[] = [];
  const seenPhonesInBatch = new Set<string>();

  rawRows.forEach((row) => {
    const partial: Partial<Beneficiary> = {
      source: batchId,
      created_at: new Date().toISOString(),
      missed_checkins_count: 0,
      amount_received: 40000,
    };

    mappings.forEach((map) => {
      if (map.targetField === 'ignore') return;

      const rawVal = row[map.fileHeader];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        const strVal = String(rawVal).trim();

        if (map.targetField === 'phone_number') {
          partial.phone_number = normalizePhoneNumber(strVal);
        } else if (map.targetField === 'category') {
          const lower = strVal.toLowerCase();
          if (lower.includes('sew')) partial.category = 'sewing';
          else if (lower.includes('grind')) partial.category = 'grinding';
          else partial.category = 'unassigned';
        } else if (map.targetField === 'amount_received') {
          const num = parseFloat(strVal.replace(/[^0-9.]/g, ''));
          partial.amount_received = isNaN(num) ? 40000 : num;
        } else {
          (partial as any)[map.targetField] = strVal;
        }
      }
    });

    // Ensure fallback values
    if (!partial.full_name) partial.full_name = 'Unnamed Beneficiary';
    if (!partial.lga) partial.lga = 'Unassigned LGA';
    if (!partial.state) partial.state = 'Unassigned State';
    if (!partial.category) partial.category = 'unassigned';

    // Profile status rule: missing LGA, Category, or Phone makes it incomplete
    const isComplete =
      Boolean(partial.full_name) &&
      Boolean(partial.phone_number) &&
      partial.lga !== 'Unassigned LGA' &&
      partial.category !== 'unassigned';

    partial.profile_status = isComplete ? 'complete' : 'incomplete';
    partial.status = 'active';

    // Deduplication check
    const normalizedPhone = partial.phone_number || '';
    let matchedExisting: Beneficiary | undefined;

    if (normalizedPhone) {
      matchedExisting = existingBeneficiaries.find((b) => b.phone_number === normalizedPhone);
    }

    let issue: DeduplicationItem['issue'] = 'valid';
    let defaultAction: DeduplicationItem['selectedAction'] = 'import';

    if (matchedExisting) {
      issue = 'phone_match';
      defaultAction = 'skip';
    } else if (normalizedPhone && seenPhonesInBatch.has(normalizedPhone)) {
      issue = 'exact_duplicate';
      defaultAction = 'skip';
    } else if (partial.profile_status === 'incomplete') {
      issue = 'incomplete_fields';
      defaultAction = 'import'; // Incomplete records ARE valid partial records per core prompt requirements!
    }

    if (normalizedPhone) {
      seenPhonesInBatch.add(normalizedPhone);
    }

    items.push({
      row,
      mappedBeneficiary: partial,
      matchedExisting,
      issue,
      selectedAction: defaultAction,
    });
  });

  return items;
}
