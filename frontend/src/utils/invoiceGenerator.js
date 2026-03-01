import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Enhanced Invoice Generator
 * Generates a professional PDF invoice for ride bookings
 */
export const generateInvoicePDF = (booking) => {
  try {
    console.log('🎨 Starting PDF generation...');
    console.log('📋 Booking data:', booking);
    
    if (!booking) {
      throw new Error('No booking data provided');
    }

    if (!booking.bookingReference) {
      throw new Error('Booking reference is missing');
    }
    
    const doc = new jsPDF();
    
    console.log('✅ jsPDF initialized');
    console.log('✅ autoTable imported successfully');
  
  // Company colors - Luxury brand palette
  const primaryColor = [26, 26, 26]; // #1a1a1a - Deep Black
  const goldColor = [212, 175, 55]; // #d4af37 - Luxury Gold
  const silverColor = [192, 192, 192]; // #c0c0c0 - Silver
  const lightGray = [245, 245, 245]; // #f5f5f5
  const darkGray = [102, 102, 102]; // #666666
  
  // ============================================
  // HEADER - Company Logo and Branding
  // ============================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('RIDESERENE', 105, 18, { align: 'center' });
  
  // Tagline
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Chauffeur Services Worldwide', 105, 26, { align: 'center' });
  
  // Gold accent line
  doc.setFillColor(...goldColor);
  doc.rect(0, 35, 210, 2, 'F');
  
  // ============================================
  // INVOICE TITLE & DETAILS
  // ============================================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 50);
  
  // Invoice Details Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(130, 42, 65, 38, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Invoice Number:', 135, 48);
  doc.text('Booking Reference:', 135, 56);
  doc.text('Invoice Date:', 135, 64);
  doc.text('Status:', 135, 72);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);
  const invoiceNumber = `INV-${booking.bookingReference || 'UNKNOWN'}`;
  doc.text(invoiceNumber, 135, 52);
  doc.text(booking.bookingReference || 'N/A', 135, 60);
  doc.text(new Date().toLocaleDateString('en-US'), 135, 68);
  
  // Status with color coding
  const statusColors = {
    confirmed: [76, 175, 80],
    completed: [76, 175, 80],
    pending: [255, 152, 0],
    cancelled: [244, 67, 54],
    assigned: [33, 150, 243],
    'in-progress': [156, 39, 176]
  };
  const statusColor = statusColors[booking.status] || goldColor;
    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text((booking.status || 'pending').toUpperCase(), 135, 76);
    doc.setTextColor(...primaryColor);
    
    // ============================================
    // CUSTOMER INFORMATION
    // ============================================
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const firstName = booking.passengerInfo?.firstName || booking.customer?.firstName || '';
  const lastName = booking.passengerInfo?.lastName || booking.customer?.lastName || '';
  const passengerName = `${firstName} ${lastName}`.trim() || 'N/A';
  const email = booking.passengerInfo?.email || booking.customer?.email || 'N/A';
  const phone = booking.passengerInfo?.phone || booking.customer?.phone || 'N/A';
  
  doc.text(passengerName, 20, 108);
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.text(email, 20, 114);
  doc.text(phone, 20, 120);
  doc.setTextColor(...primaryColor);
  
  // ============================================
  // RIDE DETAILS SECTION
  // ============================================
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('RIDE DETAILS', 20, 135);
  
  const rideDetails = [
    ['Ride Type', (booking.rideType || 'one-way').replace(/-/g, ' ').toUpperCase()],
    ['Pickup Location', booking.pickupLocation?.address || 'N/A'],
    ['Drop-off Location', booking.dropoffLocation?.address || 'N/A'],
    ['Pickup Date', new Date(booking.pickupDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })],
    ['Pickup Time', booking.pickupTime || 'N/A'],
    ['Vehicle Class', booking.vehicleClass?.name || 'N/A'],
    ['Vehicle Model', booking.vehicleClass?.vehicle || 'N/A']
  ];
  
  // Add optional fields
  if (booking.duration) {
    rideDetails.push(['Duration', `${booking.duration} hours`]);
  }
  if (booking.estimatedDistance) {
    rideDetails.push(['Distance', `${booking.estimatedDistance} km`]);
  }
  if (booking.vehicleClass?.passengers) {
    rideDetails.push(['Passenger Capacity', booking.vehicleClass.passengers.toString()]);
  }
  
  autoTable(doc, {
    startY: 140,
    head: [],
    body: rideDetails,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [230, 230, 230],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold', 
        cellWidth: 45,
        textColor: darkGray
      },
      1: { 
        cellWidth: 125,
        textColor: primaryColor
      }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });
  
  // ============================================
  // CHAUFFEUR INFORMATION (if assigned)
  // ============================================
  if (booking.chauffeur) {
    const chauffeurY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('CHAUFFEUR INFORMATION', 20, chauffeurY);
    
    const chauffeurData = [
      ['Chauffeur Name', `${booking.chauffeur.firstName || ''} ${booking.chauffeur.lastName || ''}`.trim()],
      ['Contact Number', booking.chauffeur.phone || 'N/A']
    ];
    
    if (booking.chauffeur.vehicleInfo) {
      chauffeurData.push(['Vehicle Details', 
        `${booking.chauffeur.vehicleInfo.make || ''} ${booking.chauffeur.vehicleInfo.model || ''} (${booking.chauffeur.vehicleInfo.licensePlate || 'N/A'})`.trim()
      ]);
    }
    
    autoTable(doc, {
      startY: chauffeurY + 5,
      body: chauffeurData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: 45,
          textColor: darkGray
        },
        1: { 
          cellWidth: 125,
          textColor: primaryColor
        }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });
  }
  
  // ============================================
  // PAYMENT BREAKDOWN
  // ============================================
  const paymentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 20, paymentY);
  
  const paymentItems = [];
  
  // Base fare
  const basePrice = booking.basePrice || booking.totalPrice || 0;
  paymentItems.push(['Base Fare', '', `$${basePrice.toFixed(2)}`]);
  
  // Taxes
  if (booking.taxes && booking.taxes > 0) {
    paymentItems.push(['Taxes', '', `$${booking.taxes.toFixed(2)}`]);
  }
  
  // Fees
  if (booking.fees && booking.fees > 0) {
    paymentItems.push(['Service Fees', '', `$${booking.fees.toFixed(2)}`]);
  }
  
  // Additional charges
  if (booking.additionalCharges && booking.additionalCharges > 0) {
    paymentItems.push(['Additional Charges', '', `$${booking.additionalCharges.toFixed(2)}`]);
  }
  
  // Discount
  if (booking.discount && booking.discount > 0) {
    paymentItems.push(['Discount', '', `-$${booking.discount.toFixed(2)}`]);
  }
  
  autoTable(doc, {
    startY: paymentY + 5,
    body: paymentItems,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { 
        cellWidth: 120,
        fontStyle: 'bold',
        textColor: darkGray
      },
      1: { cellWidth: 30 },
      2: { 
        halign: 'right', 
        cellWidth: 40,
        textColor: primaryColor,
        fontStyle: 'bold'
      }
    }
  });
  
  // ============================================
  // TOTAL AMOUNT (Highlighted Box)
  // ============================================
  const totalY = doc.lastAutoTable.finalY + 3;
  
  // Gold background box
  doc.setFillColor(...goldColor);
  doc.roundedRect(110, totalY, 80, 14, 2, 2, 'F');
  
  // Total text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', 115, totalY + 9);
  doc.text(`$${(booking.totalPrice || 0).toFixed(2)}`, 185, totalY + 9, { align: 'right' });
  
  // ============================================
  // PAYMENT INFORMATION
  // ============================================
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const paymentInfoY = totalY + 22;
  
  // Payment method
  const paymentMethod = booking.paymentMethod 
    ? booking.paymentMethod.replace('_', ' ').toUpperCase() 
    : 'CREDIT CARD';
  doc.text(`Payment Method: ${paymentMethod}`, 20, paymentInfoY);
  
  // Payment status
  const paymentStatus = booking.paymentStatus || 'completed';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(statusColors[paymentStatus] || goldColor));
  doc.text(`Payment Status: ${paymentStatus.toUpperCase()}`, 20, paymentInfoY + 6);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'normal');
  
  // Transaction details
  if (booking.transactionId) {
    doc.text(`Transaction ID: ${booking.transactionId}`, 20, paymentInfoY + 12);
  }
  if (booking.paidAt) {
    doc.text(`Paid On: ${new Date(booking.paidAt).toLocaleString()}`, 20, paymentInfoY + 18);
  }
  
  // ============================================
  // SPECIAL REQUESTS (if any)
  // ============================================
  if (booking.passengerInfo?.specialRequests || booking.specialRequests) {
    const specialY = paymentInfoY + 28;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SPECIAL REQUESTS:', 20, specialY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    const requests = booking.passengerInfo?.specialRequests || booking.specialRequests;
    const splitText = doc.splitTextToSize(requests, 170);
    doc.text(splitText, 20, specialY + 5);
    doc.setTextColor(...primaryColor);
  }
  
  // ============================================
  // FOOTER
  // ============================================
  const footerY = 270;
  
  // Gold accent line
  doc.setFillColor(...goldColor);
  doc.rect(0, footerY - 2, 210, 1, 'F');
  
  // Footer background
  doc.setFillColor(...lightGray);
  doc.rect(0, footerY, 210, 27, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing RideSerene!', 105, footerY + 8, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);
  doc.text('Terms & Conditions apply. Visit www.rideserene.com for complete details.', 105, footerY + 14, { align: 'center' });
  
  // ============================================
  // SAVE PDF
  // ============================================
  const fileName = `RideSerene_Invoice_${booking.bookingReference}_${new Date().toISOString().split('T')[0]}.pdf`;
  console.log('💾 Saving PDF as:', fileName);
  doc.save(fileName);
  console.log('✅ PDF generated and downloaded successfully!');
  
  return true;
  
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw error;
  }
};
