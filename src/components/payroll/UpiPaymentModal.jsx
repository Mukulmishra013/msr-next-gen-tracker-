// Manual UPI One-Tap Payment Modal (GPay, PhonePe, Paytm, BHIM)
import React, { useState } from 'react';
import { generateUpiDeepLink, getUpiAppLinks } from '../../services/upiPayment';
import { useAppData } from '../../context/AppDataContext';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  ExternalLink, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';

export function UpiPaymentModal({ isOpen, onClose, payrollItem }) {
  const { markPayrollPaid } = useAppData();
  const [utrInput, setUtrInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payrollItem) return null;

  const upiUrl = generateUpiDeepLink({
    vpa: payrollItem.upi_id || '9876543210@paytm',
    payeeName: payrollItem.name,
    amount: payrollItem.final_payable,
    note: `MSR Salary Payout ${payrollItem.month} - ${payrollItem.name}`,
    transactionRef: `MSR_PAY_${payrollItem.id}`
  });

  const appLinks = getUpiAppLinks({
    vpa: payrollItem.upi_id || '9876543210@paytm',
    payeeName: payrollItem.name,
    amount: payrollItem.final_payable,
    note: `MSR Salary - ${payrollItem.name}`
  });

  // Generate dynamic QR code image URL via public QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}&bgcolor=0f172a&color=22c55e`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payrollItem.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPaid = (e) => {
    e.preventDefault();
    markPayrollPaid(payrollItem.id, utrInput || `UPI_${Date.now().toString().slice(-6)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">UPI Direct Salary Payout</h3>
              <p className="text-[11px] text-slate-400">Owner Manual One-Tap Settlement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee & Amount Summary */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">{payrollItem.name} ({payrollItem.roleLabel})</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-emerald-400">{payrollItem.upi_id}</span>
              <button
                onClick={handleCopyUpiId}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Net Payable</p>
            <p className="text-lg font-black text-emerald-400">₹{payrollItem.final_payable?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Mobile One-Tap Intent Buttons (Directly opens GPay/PhonePe on phone) */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-slate-300">Tap to Pay Directly with your UPI App:</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={appLinks.phonepe}
              className="tap-target py-2 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>📱 PhonePe</span>
            </a>
            <a
              href={appLinks.gpay}
              className="tap-target py-2 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>📱 Google Pay</span>
            </a>
            <a
              href={appLinks.paytm}
              className="tap-target py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>📱 Paytm UPI</span>
            </a>
            <a
              href={upiUrl}
              className="tap-target py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>⚡ Generic UPI</span>
            </a>
          </div>
        </div>

        {/* Dynamic QR Code */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
          <img src={qrCodeUrl} alt="UPI QR Code" className="w-20 h-20 rounded-lg border border-slate-700 bg-slate-950 p-1" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Or Scan via Any UPI App</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              QR scan karke payment confirm karein aur neeche reference number daal kar record save karein.
            </p>
          </div>
        </div>

        {/* Enter UTR / Confirm Payment */}
        <form onSubmit={handleConfirmPaid} className="mt-4 space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              UPI Transaction / UTR Ref No. (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 423910842911"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark as Paid & Update Ledger ✅</span>
          </button>
        </form>

      </div>
    </div>
  );
}
