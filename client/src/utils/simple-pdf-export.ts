import { jsPDF } from 'jspdf';
import { SessionData, Patient, SessionInfo } from './pdf-export';

/**
 * A simplified version of the PDF export function that doesn't rely on complex features
 */
export const simplePdfExport = (
  patientData: Patient | null,
  sessionData: SessionData[],
  sessionInfo?: SessionInfo | null
): boolean => {
  try {
    console.log("Starting simple PDF export...");

    // Define constants for layout
    const PAGE_WIDTH = 210; // A4 width in mm
    const PAGE_HEIGHT = 297; // A4 height in mm
    const MARGIN = 15; // Margin in mm
    const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);
    const LINE_HEIGHT = 10; // Height between lines in mm
    const SECTION_SPACING = 15; // Space between sections in mm

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Track current Y position
    let currentY = MARGIN;

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(39, 174, 96); // Green color
    doc.text('Aeropulse - Respiratory Monitoring Report', MARGIN, currentY);
    currentY += LINE_HEIGHT + 5;

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, MARGIN, currentY);
    currentY += LINE_HEIGHT + SECTION_SPACING;

    // Add patient information
    if (patientData) {
      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - 100) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Information', MARGIN, currentY);
      currentY += LINE_HEIGHT;

      doc.setFontSize(12);

      // Create a function to add text with overflow protection
      const addTextLine = (text: string) => {
        // Check if we need a new page
        if (currentY > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          currentY = MARGIN;
        }

        doc.text(text, MARGIN, currentY);
        currentY += LINE_HEIGHT;
      };

      addTextLine(`Name: ${patientData.name}`);
      addTextLine(`Age: ${patientData.age}`);
      addTextLine(`Gender: ${patientData.gender}`);
      addTextLine(`Medical History: ${patientData.medicalHistory}`);
      addTextLine(`Wheezing Level: ${patientData.wheezingLevel}%`);
      addTextLine(`Respiratory Rate: ${patientData.respiratoryRate} bpm`);
      addTextLine(`Oxygen Level: ${patientData.oxygenLevel}%`);

      currentY += SECTION_SPACING; // Add extra space after patient info
    }

    // Add session summary
    if (sessionInfo) {
      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - 100) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Session Summary', MARGIN, currentY);
      currentY += LINE_HEIGHT;

      doc.setFontSize(12);

      // Create a function to add text with overflow protection
      const addTextLine = (text: string) => {
        // Check if we need a new page
        if (currentY > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          currentY = MARGIN;
        }

        doc.text(text, MARGIN, currentY);
        currentY += LINE_HEIGHT;
      };

      addTextLine(`Session Start: ${sessionInfo.sessionStart}`);
      addTextLine(`Session Duration: ${sessionInfo.sessionDuration}`);
      addTextLine(`Data Points: ${sessionInfo.dataPointsCount}`);
      addTextLine(`Average Wheezing Level: ${sessionInfo.averageWheezingLevel}%`);
      addTextLine(`Maximum Wheezing Level: ${sessionInfo.maxWheezingLevel}%`);
      addTextLine(`Current Status: ${sessionInfo.currentStatus}`);

      currentY += SECTION_SPACING; // Add extra space after session info
    }

    // Add session summary instead of detailed data
    if (sessionData.length > 0 && !sessionInfo) {
      // Calculate average wheezing level
      const totalLevel = sessionData.reduce((sum, point) => sum + point.level, 0);
      const averageLevel = Math.round(totalLevel / sessionData.length);

      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - 100) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Session Summary', MARGIN, currentY);
      currentY += LINE_HEIGHT;

      doc.setFontSize(12);

      // Create a function to add text with overflow protection
      const addTextLine = (text: string) => {
        // Check if we need a new page
        if (currentY > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          currentY = MARGIN;
        }

        doc.text(text, MARGIN, currentY);
        currentY += LINE_HEIGHT;
      };

      addTextLine(`Total Data Points: ${sessionData.length}`);
      addTextLine(`Average Wheezing Level: ${averageLevel}%`);

      // Add first and last timestamp to show session duration
      if (sessionData.length > 1) {
        const firstTimestamp = sessionData[0].time;
        const lastTimestamp = sessionData[sessionData.length - 1].time;
        addTextLine(`Session Period: ${firstTimestamp} - ${lastTimestamp}`);
      }

      currentY += SECTION_SPACING; // Add extra space after session summary
    }

    // Add a simple chart visualization
    if (sessionData.length > 1) {
      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - 120) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFontSize(16);
      doc.setTextColor(39, 174, 96);
      doc.text('Wheezing Level Trend', MARGIN, currentY);
      currentY += LINE_HEIGHT;

      // Draw a simple line chart
      const chartMargin = MARGIN;
      const chartWidth = CONTENT_WIDTH;
      const chartHeight = 80;
      const chartY = currentY + chartHeight;

      // Draw axes
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(chartMargin, chartY, chartMargin, chartY - chartHeight); // Y-axis
      doc.line(chartMargin, chartY, chartMargin + chartWidth, chartY); // X-axis

      // Draw data points and connect them
      const maxLevel = 100;
      const points = sessionData.map((data, index) => {
        const x = chartMargin + (index / (sessionData.length - 1)) * chartWidth;
        const y = chartY - (data.level / maxLevel) * chartHeight;
        return { x, y };
      });

      // Draw the line
      doc.setDrawColor(39, 174, 96);
      doc.setLineWidth(1);
      for (let i = 0; i < points.length - 1; i++) {
        doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      }
    }

    // Add a footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
      doc.text('Aeropulse - Respiratory Monitoring System', PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: 'center' });
    }

    // Save the PDF
    const fileName = patientData
      ? `aeropulse_report_${patientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      : `aeropulse_session_report_${new Date().toISOString().split('T')[0]}.pdf`;

    doc.save(fileName);
    console.log("Simple PDF export completed successfully!");
    return true;
  } catch (error) {
    console.error("Error in simple PDF export:", error);
    alert("Error generating PDF. Please try again.");
    throw error;
  }
};
