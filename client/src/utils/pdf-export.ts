import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Add type declaration inline
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    } | undefined;
  }
}

// Define the patient type
export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory: string;
  lastSession: string;
  nextAppointment: string;
  status: string;
  wheezingLevel: number;
  respiratoryRate: number;
  oxygenLevel: number;
  medications: string[];
  notes: string;
}

// Define the session data type
export interface SessionData {
  time: string;
  level: number;
}

// Define the session info type
export interface SessionInfo {
  sessionStart: string;
  sessionDuration: string;
  dataPointsCount: number;
  averageWheezingLevel: number;
  maxWheezingLevel: number;
  currentStatus: string;
}

/**
 * Export patient data and session data to PDF
 */
export const exportToPDF = async (
  _patientId: number, // Prefixed with underscore to indicate it's not used
  patientData: Patient | null,
  sessionData: SessionData[],
  chartRef: React.RefObject<HTMLDivElement | null>,
  sessionInfo?: SessionInfo | null
) => {
  try {
    console.log("Starting PDF export...");

    // Define constants for layout
    const PAGE_WIDTH = 210; // A4 width in mm
    const PAGE_HEIGHT = 297; // A4 height in mm
    const MARGIN = 15; // Margin in mm
    const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);
    const SECTION_SPACING = 10; // Space between sections in mm

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
    currentY += 10; // Move down after title

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, MARGIN, currentY);
    currentY += SECTION_SPACING + 5; // Add space after date

    console.log("Adding session summary...");

    // Add session summary if available
    if (sessionInfo) {
      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - 100) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Session Summary', MARGIN, currentY);
      currentY += 5; // Space after section title

      // Create session info table
      const sessionInfoTable = [
        ['Session Start', sessionInfo.sessionStart],
        ['Session Duration', sessionInfo.sessionDuration],
        ['Data Points', sessionInfo.dataPointsCount.toString()],
        ['Average Wheezing Level', `${sessionInfo.averageWheezingLevel}%`],
        ['Maximum Wheezing Level', `${sessionInfo.maxWheezingLevel}%`],
        ['Current Status', sessionInfo.currentStatus]
      ];

      console.log("Creating session info table...");

      doc.autoTable({
        startY: currentY,
        head: [['Metric', 'Value']],
        body: sessionInfoTable,
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak', cellWidth: 'auto' },
        columnStyles: { 0: { cellWidth: 50 } },
        margin: { left: MARGIN, right: MARGIN }
      });

      // Update current Y position after table
      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + SECTION_SPACING : currentY + 50;
    }

  // Add patient information if available
  if (patientData) {
    // Check if we need a new page
    if (currentY > PAGE_HEIGHT - 100) {
      doc.addPage();
      currentY = MARGIN;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information', MARGIN, currentY);
    currentY += 5; // Space after section title

    // Create patient info table
    const patientInfo = [
      ['Name', patientData.name],
      ['Age', patientData.age.toString()],
      ['Gender', patientData.gender],
      ['Medical History', patientData.medicalHistory],
      ['Status', patientData.status],
      ['Current Wheezing Level', `${patientData.wheezingLevel}%`],
      ['Respiratory Rate', `${patientData.respiratoryRate} bpm`],
      ['Oxygen Level', `${patientData.oxygenLevel}%`],
      ['Medications', patientData.medications.join(', ')],
      ['Notes', patientData.notes]
    ];

    // @ts-ignore - jspdf-autotable extends jsPDF
    doc.autoTable({
      startY: currentY,
      head: [['Field', 'Value']],
      body: patientInfo,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255] },
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
      columnStyles: { 0: { cellWidth: 50 } },
      margin: { left: MARGIN, right: MARGIN }
    });

    // Update current Y position after table
    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + SECTION_SPACING : currentY + 80;
  }

  // Calculate average wheezing level if not provided in sessionInfo
  let averageLevel = 0;
  if (sessionData.length > 0) {
    const totalLevel = sessionData.reduce((sum, point) => sum + point.level, 0);
    averageLevel = Math.round(totalLevel / sessionData.length);
  }

  // Only add this section if we don't already have session info
  if (!sessionInfo && sessionData.length > 0) {
    // Check if we need a new page
    if (currentY > PAGE_HEIGHT - 100) {
      doc.addPage();
      currentY = MARGIN;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Session Summary', MARGIN, currentY);
    currentY += 5; // Space after section title

    // Create a simple summary table
    const summaryData = [
      ['Total Data Points', sessionData.length.toString()],
      ['Average Wheezing Level', `${averageLevel}%`]
    ];

    // Add first and last timestamp if available
    if (sessionData.length > 1) {
      const firstTimestamp = sessionData[0].time;
      const lastTimestamp = sessionData[sessionData.length - 1].time;
      summaryData.push(['Session Period', `${firstTimestamp} - ${lastTimestamp}`]);
    }

    // @ts-ignore - jspdf-autotable extends jsPDF
    doc.autoTable({
      startY: currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255] },
      margin: { left: MARGIN, right: MARGIN }
    });

    // Update current Y position after table
    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + SECTION_SPACING : currentY + 40;
  }

  // Always add a chart page with data visualization
  if (sessionData.length > 0) {
    try {
      // Always start a new page for the chart
      doc.addPage();
      currentY = MARGIN;

      // Add chart title
      doc.setFontSize(16);
      doc.setTextColor(39, 174, 96); // Green color
      doc.text('Session Trend Chart', MARGIN, currentY);
      currentY += 10;

      // Add average wheezing level summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Average Wheezing Level: ${averageLevel}%`, MARGIN, currentY);
      currentY += SECTION_SPACING;

      // Draw a simple line chart
      if (sessionData.length > 1) {
        const chartMargin = MARGIN;
        const chartWidth = CONTENT_WIDTH;
        const chartHeight = 80;
        const chartY = currentY + chartHeight;

        // Draw chart title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Wheezing Level Trend', chartMargin, currentY);
        currentY += 5;

        // Draw axes
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(chartMargin, chartY, chartMargin, chartY - chartHeight); // Y-axis
        doc.line(chartMargin, chartY, chartMargin + chartWidth, chartY); // X-axis

        // Draw Y-axis labels
        doc.setFontSize(8);
        doc.text('100%', chartMargin - 10, chartY - chartHeight);
        doc.text('75%', chartMargin - 8, chartY - chartHeight * 0.75);
        doc.text('50%', chartMargin - 8, chartY - chartHeight * 0.5);
        doc.text('25%', chartMargin - 8, chartY - chartHeight * 0.25);
        doc.text('0%', chartMargin - 5, chartY);

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

        // Draw points
        doc.setFillColor(39, 174, 96);
        points.forEach(point => {
          doc.circle(point.x, point.y, 1, 'F');
        });

        // Draw X-axis labels (time) for first, middle and last points
        if (sessionData.length >= 3) {
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(sessionData[0].time, chartMargin, chartY + 10);
          doc.text(sessionData[Math.floor(sessionData.length / 2)].time,
                  chartMargin + chartWidth / 2, chartY + 10);
          doc.text(sessionData[sessionData.length - 1].time,
                  chartMargin + chartWidth - 15, chartY + 10);
        }

        // Update current Y position after chart
        currentY = chartY + 20;
      }

      // Try to capture the chart if available, but don't rely on it
      if (chartRef.current) {
        try {
          // This is an optional enhancement, not critical for functionality
          const canvas = await html2canvas(chartRef.current, { scale: 1 });
          const chartImage = canvas.toDataURL('image/png');

          // Check if we need a new page
          if (currentY > PAGE_HEIGHT - 100) {
            doc.addPage();
            currentY = MARGIN;
          } else {
            currentY += SECTION_SPACING;
          }

          doc.setFontSize(14);
          doc.setTextColor(39, 174, 96);
          doc.text('Live Monitor Visualization', MARGIN, currentY);
          currentY += 10;

          const imgWidth = CONTENT_WIDTH;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image would go off page
          if (currentY + imgHeight > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            currentY = MARGIN;
          }

          doc.addImage(chartImage, 'PNG', MARGIN, currentY, imgWidth, imgHeight);
        } catch (e) {
          // Silently fail - we already have the manual chart above
          console.log('Chart capture failed, using manual chart only');
        }
      }
    } catch (error) {
      console.error('Error creating chart page:', error);
      // Add error message to PDF
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(12);
      doc.text('Error: Could not create chart visualization.', MARGIN, 50);
    }
  }

    console.log("Finalizing PDF...");

    // Add a footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
      doc.text('Aeropulse - Respiratory Monitoring System', PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: 'center' });
    }

    console.log("Saving PDF...");

    // Save the PDF
    const fileName = patientData
      ? `aeropulse_report_${patientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      : `aeropulse_session_report_${new Date().toISOString().split('T')[0]}.pdf`;

    // Force download the PDF
    doc.save(fileName);

    console.log("PDF saved successfully!");
    return true;
  } catch (error) {
    console.error("Error in PDF export:", error);
    throw error;
  }
};

/**
 * Generate a smoother, more natural wheezing level
 * Uses a weighted average of the previous value and a new random value
 * to create more natural fluctuations
 */
export const generateNaturalWheezingLevel = (
  previousLevel: number,
  baseLevel: number = 30,
  volatility: number = 0.3
): number => {
  // Generate a random value with normal distribution around the base level
  const randomFactor = Math.random() * 2 - 1; // Value between -1 and 1
  const change = randomFactor * volatility * baseLevel;

  // Calculate new level with 70% weight on previous value and 30% on new random value
  // This creates smoother transitions
  const newLevel = previousLevel * 0.7 + (baseLevel + change) * 0.3;

  // Ensure the value stays within 0-100 range
  return Math.min(Math.max(newLevel, 0), 100);
};
