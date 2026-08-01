import { Beneficiary, CheckIn, Escalation } from '../../types/gvg';

export function generateImpactPDFReport(
  beneficiaries: Beneficiary[],
  checkIns: CheckIn[],
  escalations: Escalation[],
  reportTitle: string = 'NSIPA GVG Post-Disbursement Impact Report'
) {
  const activeCount = beneficiaries.filter((b) => b.status === 'active').length;
  const inactiveCount = beneficiaries.filter((b) => b.status === 'inactive').length;
  const unreachableCount = beneficiaries.filter((b) => b.status === 'unreachable').length;
  const total = beneficiaries.length || 1;
  const activePercent = ((activeCount / total) * 100).toFixed(1);

  const sewingCount = beneficiaries.filter((b) => b.category === 'sewing').length;
  const grindingCount = beneficiaries.filter((b) => b.category === 'grinding').length;

  const resolvedEscalations = escalations.filter((e) => e.status === 'resolved').length;
  const openEscalations = escalations.filter((e) => e.status === 'open').length;

  const totalMonthlyIncome = checkIns.reduce((acc, curr) => acc + (curr.estimated_monthly_income || 0), 0);
  const avgIncome = checkIns.length ? Math.round(totalMonthlyIncome / checkIns.length) : 0;

  // Build clean HTML print window for reliable high-fidelity PDF output
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and download the PDF report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1a202c;
            padding: 40px;
            margin: 0;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #008751;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 24px;
            font-weight: 800;
            color: #008751;
            letter-spacing: -0.5px;
          }
          .sub-logo {
            font-size: 13px;
            color: #4a5568;
            font-weight: 500;
          }
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #718096;
          }
          .title-section {
            margin-bottom: 25px;
          }
          h1 {
            font-size: 20px;
            margin: 0 0 8px 0;
            color: #2d3748;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            background-color: #e6fffa;
            color: #234e52;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .kpi-card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }
          .kpi-value {
            font-size: 22px;
            font-weight: 700;
            color: #008751;
          }
          .kpi-label {
            font-size: 11px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }
          section {
            margin-bottom: 30px;
          }
          h2 {
            font-size: 15px;
            border-left: 4px solid #008751;
            padding-left: 10px;
            margin-bottom: 12px;
            color: #2d3748;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #edf2f7;
            font-weight: 600;
            color: #4a5568;
          }
          tr:nth-child(even) {
            background-color: #f7fafc;
          }
          .footer-sign {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e0;
            font-size: 12px;
          }
          .sign-box {
            width: 200px;
            text-align: center;
          }
          .sign-line {
            border-bottom: 1px solid #718096;
            margin-top: 40px;
            margin-bottom: 5px;
          }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">NSIPA — GVG PROGRAMME</div>
            <div class="sub-logo">National Social Investment Programme Agency, Nigeria</div>
          </div>
          <div class="report-meta">
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Scope:</strong> Post-Disbursement Impact Evaluation</div>
          </div>
        </div>

        <div class="title-section">
          <h1>${reportTitle}</h1>
          <span class="badge">Official Federal Impact Record</span>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${activePercent}%</div>
            <div class="kpi-label">Active Business Rate</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${beneficiaries.length}</div>
            <div class="kpi-label">Total Tracked</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">₦${avgIncome.toLocaleString()}</div>
            <div class="kpi-label">Avg Monthly Income</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${openEscalations} / ${escalations.length}</div>
            <div class="kpi-label">Open Escalations</div>
          </div>
        </div>

        <section>
          <h2>Programme Impact Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category / Asset</th>
                <th>Total Beneficiaries</th>
                <th>Active (%)</th>
                <th>Inactive (%)</th>
                <th>Unreachable (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sewing Machine Beneficiaries</td>
                <td>${sewingCount}</td>
                <td>${((beneficiaries.filter((b) => b.category === 'sewing' && b.status === 'active').length / (sewingCount || 1)) * 100).toFixed(0)}%</td>
                <td>${((beneficiaries.filter((b) => b.category === 'sewing' && b.status === 'inactive').length / (sewingCount || 1)) * 100).toFixed(0)}%</td>
                <td>${((beneficiaries.filter((b) => b.category === 'sewing' && b.status === 'unreachable').length / (sewingCount || 1)) * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td>Grinding Machine Beneficiaries</td>
                <td>${grindingCount}</td>
                <td>${((beneficiaries.filter((b) => b.category === 'grinding' && b.status === 'active').length / (grindingCount || 1)) * 100).toFixed(0)}%</td>
                <td>${((beneficiaries.filter((b) => b.category === 'grinding' && b.status === 'inactive').length / (grindingCount || 1)) * 100).toFixed(0)}%</td>
                <td>${((beneficiaries.filter((b) => b.category === 'grinding' && b.status === 'unreachable').length / (grindingCount || 1)) * 100).toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Beneficiary Status Summary (Sample Registry Audit)</h2>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>LGA / State</th>
                <th>Category</th>
                <th>Disability / Note</th>
                <th>Profile Status</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              ${beneficiaries
                .slice(0, 15)
                .map(
                  (b) => `
                <tr>
                  <td><strong>${b.full_name}</strong><br><small>${b.phone_number}</small></td>
                  <td>${b.lga}, ${b.state}</td>
                  <td>${b.category.toUpperCase()}</td>
                  <td>${b.disability_status || 'None'}</td>
                  <td>${b.profile_status.toUpperCase()}</td>
                  <td><strong style="color: ${b.status === 'active' ? '#008751' : b.status === 'inactive' ? '#c53030' : '#d69e2e'}">${b.status.toUpperCase()}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </section>

        <div class="footer-sign">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div><strong>GVG Field Supervisor</strong></div>
            <div>Sign & Date</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div><strong>NSIPA Director of Monitoring</strong></div>
            <div>Sign & Date</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
