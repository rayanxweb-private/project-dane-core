import { winstonLogger } from '@/lib/logger';

export function exportToExcel(data: any[]) {
  try {
    winstonLogger.info(`Compiling excel report generation lifecycle for ${data.length} records.`);
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Amount,Type,Status,Timestamp\n';

    data.forEach((row: any) => {
      csvContent += `${row.orderId},${row.amount},${row.paymentType || 'DIRECT'},${row.status},${row.createdAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DANA_FINANCIAL_LEDGER_REPORT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    winstonLogger.error('Export Excel system crash:', error);
  }
}

export function exportToPDF(data: any[]) {
  try {
    winstonLogger.info('Triggering system window printer driver sequence payload compiled framework mapping.');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let htmlContent = `
      <html>
        <head>
          <title>DANA Enterprise Operational Audit Statement</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #1e293b; }
            h1 { font-size: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 11px; }
            th { bg-color: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>DANA Enterprise Ledger System Audit Document</h1>
          <p>Generated: ${new Date().toISOString()}</p>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Transaction Nominal</th><th>Execution Model</th><th>Status Code</th></tr>
            </thead>
            <tbody>
    `;

    data.forEach((row: any) => {
      htmlContent += `
        <tr>
          <td>${row.orderId}</td>
          <td>IDR ${row.amount.toLocaleString()}</td>
          <td>${row.paymentType}</td>
          <td>${row.status}</td>
        </tr>
      `;
    });

    htmlContent += '</tbody></table></body></html>';
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    winstonLogger.error('Export PDF compilation system crash:', error);
  }
}
