import jsPDF from 'jspdf';
import { SampleTestReport } from '@/types/testRequest';

export const generateReportPDF = async (report: SampleTestReport): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  const margin = 15;
  const lineHeight = 7;
  const sectionSpacing = 14; // slightly more spacing for better readability

  // --- Color scheme as tuples (updated professional palette) ---
  const primaryColor: [number, number, number] = [20, 63, 145]; // Deep Blue
  const secondaryColor: [number, number, number] = [75, 85, 99]; // Slate Gray
  const headerBg: [number, number, number] = [232, 244, 253]; // Soft Blue
  const textColor: [number, number, number] = [15, 23, 42]; // Almost Black
  const accentGreen: [number, number, number] = [22, 163, 74]; // Vibrant Green
  const accentRed: [number, number, number] = [220, 38, 38]; // Rich Red
  const accentOrange: [number, number, number] = [245, 158, 11]; // For intermediate status

  // --- Helper functions ---
  const addSectionHeader = (title: string) => {
    doc.setFillColor(...headerBg);
    doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 9, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12); // increased font size for headers
    doc.setFont("helvetica", 'bold');
    doc.text(title, margin + 2, yPosition + 3);
    yPosition += sectionSpacing;
  };

  const addKeyValue = (key: string, value: string) => {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10); // increased font size
    doc.setFont("helvetica", 'normal');
    doc.text(`${key}:`, margin, yPosition);

    doc.setTextColor(...textColor);
    doc.setFont("helvetica", 'bold');
    const valueX = margin + 50; // slightly more offset for readability
    const maxWidth = pageWidth - valueX - margin;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, valueX, yPosition);

    yPosition += lineHeight + (lines.length - 1) * lineHeight;
  };

  const checkPageBreak = (height: number = sectionSpacing) => {
    if (yPosition + height > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // --- HEADER ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); // slightly bigger for the main title
  doc.setFont("helvetica", 'bold');
  doc.text('WATER QUALITY TEST REPORT', margin, 15);

  yPosition = 35;

  // --- REPORT INFORMATION ---
  addSectionHeader('Report Information');
  addKeyValue('Request ID', report.requestId);
  addKeyValue('Test Date', new Date(report.createdAt).toLocaleDateString());
  addKeyValue('Generated on', new Date().toLocaleString());

  checkPageBreak();

  // --- LOCATION DETAILS ---
  addSectionHeader('Location Details');
  addKeyValue('Location', report.location);
  addKeyValue('Sample Location', report.sampleLocation);
  addKeyValue('Water Type', report.waterType.name);
  addKeyValue('Contact Number', report.mobileNumber);

  checkPageBreak();

  // --- OVERALL STATUS ---
  addSectionHeader('Overall Water Quality Status');

  const getStatusColor = (status: string): [number, number, number] => {
    switch (status) {
      case 'EXCELLENT': return accentGreen;
      case 'GOOD': return [37, 99, 235]; // Blue for good
      case 'MODERATE': return accentOrange;
      case 'POOR': return accentRed;
      case 'UNSAFE': return [127, 29, 29]; // Dark Red
      default: return [107, 114, 128]; // Gray
    }
  };

  const statusColor = getStatusColor(report.overallResult);
  doc.setFillColor(...statusColor);

  // Rounded badge for overall status
  const badgeWidth = 25;
  const badgeHeight = 10;
  const radius = 3;
  doc.roundedRect(margin, yPosition - 3, badgeWidth, badgeHeight, radius, radius, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11); // slightly bigger
  doc.setFont("helvetica", 'bold');
  doc.text(`${report.overallResult}`, margin + 3, yPosition + 4); // text centered vertically
  yPosition += sectionSpacing + 2;
  checkPageBreak();

  // --- TEST RESULTS ---
  addSectionHeader('Test Results');

  report.sampleTests.forEach((test, index) => {
    checkPageBreak(lineHeight * 4);

    // Test name
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11); // slightly bigger for test names
    doc.setFont("helvetica", 'bold');
    doc.text(`${index + 1}. ${test.testName}`, margin, yPosition);
    yPosition += lineHeight;

    // Test details
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(9); // slightly bigger
    doc.setFont("helvetica", 'normal');
    const rangeText = `Range: ${test.minValueUsed} - ${test.maxValueUsed} ${test.unitUsed}`;
    doc.text(rangeText, margin + 5, yPosition);
    yPosition += lineHeight;

    // Result badge
    const resultColor = test.result === 'SAFE' ? accentGreen : accentRed;
    doc.setFillColor(...resultColor);

    const badgeX = margin + 5;
    const badgeY = yPosition - 3;
    const badgeWidth = 18;
    const badgeHeight = 7;
    const borderRadius = 2;
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, borderRadius, borderRadius, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); // slightly bigger for badge text
    doc.setFont("helvetica", 'bold');
    doc.text(test.result, badgeX + 3, yPosition + 1.5); // adjust for centered text

    yPosition += lineHeight + 3;
  });

  yPosition += 4;
  checkPageBreak();

  // --- FOOTER ---
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", 'normal');
  const footerText = 'This report is generated automatically and contains test results for the collected water sample.';
  const footerLines = doc.splitTextToSize(footerText, pageWidth - 2 * margin);
  doc.text(footerLines, margin, pageHeight - 14);

  return doc.output('blob');
};