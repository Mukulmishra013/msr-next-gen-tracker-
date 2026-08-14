// Manual UPI Deep Link & Payment Link Builder for Indian Payment Apps (GPay, PhonePe, Paytm, BHIM)

/**
 * Generates an Indian standard UPI Intent Deep Link URL
 * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
 */
export function generateUpiDeepLink({ vpa, payeeName, amount, note, transactionRef }) {
  const cleanVpa = encodeURIComponent(vpa.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanAmount = parseFloat(amount).toFixed(2);
  const cleanNote = encodeURIComponent(note || `MSR Salary Payout - ${payeeName}`);
  const cleanRef = encodeURIComponent(transactionRef || `MSR_${Date.now()}`);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}&tr=${cleanRef}`;
}

/**
 * Generates App-specific Intent Links for mobile browsers
 */
export function getUpiAppLinks({ vpa, payeeName, amount, note, transactionRef }) {
  const baseParams = `pa=${encodeURIComponent(vpa.trim())}&pn=${encodeURIComponent(payeeName.trim())}&am=${parseFloat(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(note || 'MSR Payout')}`;
  
  return {
    generic: `upi://pay?${baseParams}`,
    gpay: `gpay://upi/pay?${baseParams}`,
    phonepe: `phonepe://pay?${baseParams}`,
    paytm: `paytmmp://pay?${baseParams}`
  };
}

/**
 * Validates Indian UPI VPA format (e.g. name@okaxis, 9876543210@paytm, user@ybl)
 */
export function validateUpiId(upiId) {
  if (!upiId) return false;
  const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId.trim());
}
