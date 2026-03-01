import jsPDF from 'jspdf';

export const generateSimpleInvoicePDF = (booking) => {
  try {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [26, 26, 26];
    const goldColor = [212, 175, 55];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RIDESERENE', 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('The premium chauffeur marketplace', 105, 24, { align: 'center' });
    
    // Invoice Title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING RECEIPT', 20, 48);
    
    // Booking Reference
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${booking.bookingReference || 'N/A'}`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 78);
    doc.text(`Status: ${(booking.status || 'CONFIRMED').toUpperCase()}`, 20, 86);
    
    // Customer Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', 20, 100);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const passengerName = `${booking.passengerInfo?.firstName || ''} ${booking.passengerInfo?.lastName || ''}`.trim();
    doc.text(`Name: ${passengerName || 'N/A'}`, 20, 110);
    doc.text(`Email: ${booking.passengerInfo?.email || 'N/A'}`, 20, 118);
    doc.text(`Phone: ${booking.passengerInfo?.phone || 'N/A'}`, 20, 126);
    
    // Trip Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Details', 20, 145);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pickup: ${booking.pickupLocation?.address || 'N/A'}`, 20, 155);
    if (booking.dropoffLocation?.address) {
      doc.text(`Drop-off: ${booking.dropoffLocation.address}`, 20, 163);
    }
    doc.text(`Date: ${new Date(booking.pickupDate).toLocaleDateString()}`, 20, 171);
    doc.text(`Time: ${booking.pickupTime || 'N/A'}`, 20, 179);
    
    // Vehicle Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Details', 20, 195);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${booking.vehicleClass?.name || 'N/A'}`, 20, 205);
    doc.text(`Vehicle: ${booking.vehicleClass?.vehicle || 'N/A'}`, 20, 213);
    doc.text(`Passengers: ${booking.vehicleClass?.passengers || 'N/A'}`, 20, 221);
    
    // Payment Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 20, 240);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Base Fare: $${(booking.basePrice || 0).toFixed(2)}`, 20, 250);
    doc.text(`Taxes & Fees: Included`, 20, 258);
    
    // Total Amount Box
    doc.setFillColor(...goldColor);
    doc.rect(20, 268, 170, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT:', 25, 278);
    doc.text(`$${(booking.totalPrice || 0).toFixed(2)}`, 185, 278, { align: 'right' });
    
    // Payment Info
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${booking.paymentMethod || 'Pay on Arrival'}`, 20, 295);
    doc.text(`Payment Status: ${booking.paymentStatus || 'Pending'}`, 20, 303);
    if (booking.transactionId) {
      doc.text(`Transaction ID: ${booking.transactionId}`, 20, 311);
    }
    
    // Save
    const fileName = `Receipt_${booking.bookingReference}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error in generateSimpleInvoicePDF:', error);
    throw error;
  }
};
