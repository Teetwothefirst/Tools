import { Beneficiary, CheckIn, Escalation } from '../../types/gvg';

export function exportBeneficiariesToCSV(beneficiaries: Beneficiary[], filename: string = 'GVG_Beneficiary_Registry.csv') {
  const headers = [
    'ID',
    'Full Name',
    'Phone Number',
    'LGA',
    'State',
    'Category',
    'Disability Status',
    'Disbursement Date',
    'Amount Received',
    'Machine Serial',
    'Assigned Agent',
    'Profile Status',
    'Current Status',
    'Source Batch',
    'Last Checkin Date',
  ];

  const rows = beneficiaries.map((b) => [
    `"${b.id}"`,
    `"${b.full_name.replace(/"/g, '""')}"`,
    `"${b.phone_number}"`,
    `"${b.lga.replace(/"/g, '""')}"`,
    `"${b.state.replace(/"/g, '""')}"`,
    `"${b.category}"`,
    `"${(b.disability_status || 'None').replace(/"/g, '""')}"`,
    `"${b.disbursement_date || 'N/A'}"`,
    b.amount_received || 40000,
    `"${b.machine_serial || 'Unassigned'}"`,
    `"${(b.assigned_agent_name || 'Unassigned').replace(/"/g, '""')}"`,
    `"${b.profile_status}"`,
    `"${b.status}"`,
    `"${b.source}"`,
    `"${b.last_checkin_date || 'Never'}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
