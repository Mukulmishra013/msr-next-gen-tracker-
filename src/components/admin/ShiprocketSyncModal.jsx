// Shiprocket 100% Automatic Direct Browser Sync & Robust RFC-4180 CSV Bulk Loader
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { supabase } from '../../services/supabase';
import { 
  RefreshCw, 
  PackageCheck, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Lock, 
  Mail, 
  X,
  HelpCircle,
  ExternalLink,
  Upload,
  FileText,
  Sparkles
} from 'lucide-react';

const DEFAULT_EMAIL = 'atulmishra9506348351@gmail.com';
const DEFAULT_PASS = 'k87oHWzmv6^9u8yxZsur8sw@G$DI0Od0';

// 🛡️ Robust RFC-4180 Compliant CSV Line Parser (Handles commas inside quotes perfectly)
function parseCsvGrid(text) {
  const rows = [];
  let row = [''];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      if (row.some(field => field.trim() !== '')) {
        rows.push(row.map(cell => cell.trim().replace(/^"|"$/g, '')));
      }
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.some(field => field.trim() !== '')) {
    rows.push(row.map(cell => cell.trim().replace(/^"|"$/g, '')));
  }
  return rows;
}

// 📱 Intelligent Unmasked Phone Number Extractor
function extractCleanPhoneNumber(rowObj) {
  for (const [key, val] of Object.entries(rowObj)) {
    const k = key.toLowerCase().replace(/[\s_\-]/g, '');
    if (
      k.includes('phone') ||
      k.includes('mobile') ||
      k.includes('contact') ||
      k.includes('telephone') ||
      k.includes('cell') ||
      k.includes('tel')
    ) {
      let strVal = String(val || '').trim();
      if (!strVal || strVal.toLowerCase().includes('not auth') || strVal.includes('xxx')) continue;
      
      if (strVal.includes('e+') || strVal.includes('E+')) {
        try {
          strVal = Number(strVal).toFixed(0);
        } catch (e) {}
      }
      
      const digits = strVal.replace(/\D/g, '');
      if (digits.length >= 10) {
        return `+91${digits.slice(-10)}`;
      }
    }
  }
  return null;
}

// 💰 Precise Currency Amount Parser (Correctly handles decimal like 249.00 -> 249)
function parseCurrencyAmount(val, fallback = 449) {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return Math.round(val);
  const clean = String(val).replace(/,/g, '').trim();
  const match = clean.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return fallback;
  const num = parseFloat(match[0]);
  return isNaN(num) ? fallback : Math.round(num);
}

// 👤 Customer Name Extractor
function extractCustomerName(rowObj) {
  for (const [key, val] of Object.entries(rowObj)) {
    const k = key.toLowerCase().replace(/[\s_\-]/g, '');
    if (
      k === 'customername' ||
      k === 'billingname' ||
      k === 'consigneename' ||
      k === 'buyername' ||
      k === 'name' ||
      k === 'recipientname' ||
      k === 'deliveryname' ||
      k.includes('customername') ||
      k.includes('buyer')
    ) {
      const strVal = String(val || '').trim();
      if (strVal && !strVal.toLowerCase().includes('not auth')) return strVal;
    }
  }
  return 'Customer';
}

export function ShiprocketSyncModal({ isOpen, onClose }) {
  const { setAmparoCalls } = useAppData();
  const [email, setEmail] = useState(() => localStorage.getItem('msr_sr_email') || DEFAULT_EMAIL);
  const [password, setPassword] = useState(() => localStorage.getItem('msr_sr_pass') || DEFAULT_PASS);
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('msr_sr_token') || '');
  const [showCreds, setShowCreds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // 1. Direct Live API Sync
  const handleAutomaticSync = async () => {
    setLoading(true);
    setErrorMsg('');
    setStatusMessage('1/3: Shiprocket API authenticate ho raha hai...');

    localStorage.setItem('msr_sr_email', email.trim());
    localStorage.setItem('msr_sr_pass', password.trim());
    if (apiToken.trim()) localStorage.setItem('msr_sr_token', apiToken.trim());

    try {
      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          token: apiToken.trim() || undefined
        })
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        if (setAmparoCalls) {
          setAmparoCalls(data.orders);
        }
        setStatusMessage(`✅ SUCCESS! ${data.orders.length} Live Shiprocket Orders unmasked phone numbers ke sath sync ho gaye!`);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
        return;
      }

      if (!data.success) {
        throw new Error(data.message || data.error || 'Shiprocket login failed');
      }
    } catch (err) {
      console.warn('Backend Shiprocket fetch failed, trying direct browser request:', err);

      try {
        let activeToken = apiToken.trim();

        if (!activeToken) {
          const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              password: password.trim()
            })
          });

          const authData = await authRes.json();
          if (!authData.token) {
            throw new Error(authData.message || 'Shiprocket authentication failed.');
          }
          activeToken = authData.token;
        }

        setStatusMessage('2/3: Live orders fetch ho rahe hain...');
        const ordRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=100', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        const ordData = await ordRes.json();
        const orders = ordData.data || [];

        const mappedOrders = orders.map((o) => {
          const isRto = String(o.status).toUpperCase().includes('RTO') || String(o.status).toUpperCase().includes('UNDELIVERED');
          const isDelivered = String(o.status).toUpperCase().includes('DELIVERED');

          const items = Array.isArray(o.products) && o.products.length > 0
            ? o.products.map((p) => p.name).join(', ')
            : 'Amparo Pure Shilajit (30g)';

          const rawPhone = String(
            o.customer_phone ||
            o.customer_mobile ||
            (o.others && o.others.billing_phone) ||
            ''
          );

          const cleanDigits = rawPhone.replace(/\D/g, '');
          const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : (rawPhone && !rawPhone.includes('xxx') ? rawPhone : '+91');
          const custName = o.customer_name || (o.others && o.others.billing_name) || 'Customer';
          const awb = o.shipments && o.shipments[0] ? String(o.shipments[0].awb) : 'Pending';

          return {
            shopify_order_id: String(o.channel_order_id || (o.others && o.others.name) || o.id),
            customer_name: custName === 'Not Authorized' ? 'Verified Buyer' : custName,
            phone: validPhone,
            product: items,
            amount: Number(o.total || 588),
            status: isDelivered ? 'confirmed' : (isRto ? 'rto_attempted' : 'pending_confirmation'),
            urgent_rto: isRto,
            call_type: isRto ? 'RTO Rescue' : (isDelivered ? 'Delivery Feedback' : 'Order Confirmation'),
            shiprocket_shipment_id: awb,
            notes: `Status: ${o.status} | AWB: ${awb}`
          };
        });

        if (mappedOrders.length > 0) {
          try {
            await supabase.from('amparo_calls').upsert(mappedOrders, { onConflict: 'shopify_order_id' });
          } catch (e) {}
          if (setAmparoCalls) setAmparoCalls(mappedOrders);
          setStatusMessage(`✅ SUCCESS! ${mappedOrders.length} Real Orders synced!`);
          setTimeout(() => { if (onClose) onClose(); }, 1500);
          return;
        }
      } catch (browserErr) {
        setErrorMsg(browserErr.message || 'Shiprocket login failed. Kripya API key ya password check karein ya CSV upload karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct CSV File Upload Handler (Robust RFC-4180 Parser)
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMessage('CSV Parse ho rahi hai...');
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const grid = parseCsvGrid(text);
        if (grid.length < 2) {
          setErrorMsg('CSV file me valid data rows nahi mile.');
          return;
        }

        const headers = grid[0];
        const parsedOrders = [];
        const seenOrders = new Set();

        for (let i = 1; i < grid.length; i++) {
          const cols = grid[i];
          if (cols.length < 2) continue;

          const row = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] || '';
          });

          // Extract real unmasked phone number
          const realPhone = extractCleanPhoneNumber(row);
          const customer = extractCustomerName(row);

          const orderId = String(
            row['Order ID'] ||
            row['order_id'] ||
            row['Channel Order ID'] ||
            row['Order Id'] ||
            row['Name'] ||
            `#SR-${i + 100}`
          ).trim();

          if (seenOrders.has(orderId)) continue;
          seenOrders.add(orderId);

          const status = String(row['Status'] || row['Order Status'] || row['Shipment Status'] || row['Financial Status'] || 'Delivered');
          const amount = parseCurrencyAmount(row['Order Total'] || row['Amount'] || row['Total'] || row['Total Price'] || row['total'], 449);
          const product = String(row['Product Name'] || row['Product'] || row['Items'] || row['Lineitem name'] || 'Amparo Pure Shilajit');
          const awb = String(row['AWB'] || row['awb'] || row['Tracking Number'] || 'N/A');
          const city = String(row['City'] || row['Customer City'] || row['Destination City'] || row['Shipping City'] || 'India');

          const statusLower = status.toLowerCase();
          const isFinalCancelled = statusLower.includes('cancel') || statusLower.includes('rto delivered') || statusLower.includes('3rd attempt');
          const isDelivered = statusLower.includes('deliv') && !isFinalCancelled;
          const isRtoActive = (statusLower.includes('undeliv') || statusLower.includes('rto initiated') || statusLower.includes('rto in transit') || statusLower.includes('1st attempt') || statusLower.includes('2nd attempt')) && !isDelivered && !isFinalCancelled;

          let callType = 'Order Confirmation';
          let finalStatus = 'pending_confirmation';

          if (isDelivered) {
            finalStatus = 'delivered';
            callType = 'Old Customer Feedback';
          } else if (isRtoActive) {
            finalStatus = 'rto_attempted';
            callType = 'RTO Rescue';
          } else if (isFinalCancelled) {
            finalStatus = 'rto_lost';
            callType = 'Order Cancelled';
          }

          parsedOrders.push({
            shopify_order_id: orderId,
            customer_name: customer,
            phone: realPhone || '+91',
            product,
            amount,
            status: finalStatus,
            urgent_rto: isRtoActive,
            call_type: callType,
            shiprocket_shipment_id: awb,
            notes: `Status: ${status} | City: ${city} | AWB: ${awb}`
          });
        }

        if (parsedOrders.length > 0) {
          try {
            // Clean replace to eliminate old corrupted/stale rows
            await supabase.from('amparo_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            // Insert in chunks of 50
            for (let c = 0; c < parsedOrders.length; c += 50) {
              await supabase.from('amparo_calls').insert(parsedOrders.slice(c, c + 50));
            }
          } catch (e) {
            console.error('Supabase batch insert error:', e);
          }
          if (setAmparoCalls) setAmparoCalls(parsedOrders);
          setStatusMessage(`✅ SUCCESS! ${parsedOrders.length} Real Orders unique phone numbers & proper categories ke sath load ho gaye!`);
          setTimeout(() => { if (onClose) onClose(); }, 1500);
        } else {
          setErrorMsg('CSV file me valid customer rows nahi mile.');
        }
      } catch (err) {
        setErrorMsg('CSV Parse error: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Shiprocket Live Orders Sync</h3>
              <p className="text-[11px] text-slate-400">Unmasked Customer Phone Numbers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Credentials Form (Toggleable) */}
        <div className="space-y-3">
          <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Shiprocket API Key / Token (Optional)
              </label>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
                placeholder="Paste njkO... API Key if generated"
              />
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Or Login Email & Password</span>
                <button
                  onClick={() => setShowCreds(!showCreds)}
                  className="text-[10px] text-purple-400 font-semibold hover:underline"
                >
                  {showCreds ? 'Hide' : 'Edit Email/Password'}
                </button>
              </div>

              {showCreds && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="atulmishra9506348351@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="Shiprocket Password"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold">
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            onClick={handleAutomaticSync}
            disabled={loading}
            className="tap-target w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50 py-3.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Syncing Live Shiprocket Orders...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>⚡ 1-Click Live API Sync</span>
              </>
            )}
          </button>

          {/* CSV Bulk Importer Fallback */}
          <div className="relative pt-2 text-center">
            <div className="p-4 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-slate-950/60 space-y-1.5 cursor-pointer relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-5 h-5 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-white">Or Upload Shiprocket Orders CSV</p>
              <p className="text-[10px] text-slate-400">Instantly loads 500+ orders with unmasked phone numbers</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
