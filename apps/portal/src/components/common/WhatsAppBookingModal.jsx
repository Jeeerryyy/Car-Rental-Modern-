import { useState, useEffect, useRef } from 'react';
import {
  X, Copy, Check, Send, Phone, User, Calendar, Car,
  Sparkles, DollarSign, Edit3,
  CheckCircle2, AlertTriangle, RotateCcw, MapPin, ShieldCheck
} from 'lucide-react';
import {
  MODERN_DRIVE_TEMPLATES,
  MODERN_INSERTABLE_VARIABLES,
  extractBookingDetails,
  renderBookingTemplate,
  getRecommendedTemplateId,
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone,
} from '../../utils/whatsappTemplates.js';

export function WhatsAppBookingModal({
  isOpen,
  onClose,
  booking,
  defaultTemplateId,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const bookingDetails = extractBookingDetails(booking);
  const allTemplates = MODERN_DRIVE_TEMPLATES;

  useEffect(() => {
    if (isOpen && booking) {
      const recommendedId = getRecommendedTemplateId(booking);
      const initialTemplateId =
        defaultTemplateId && allTemplates.some((t) => t.id === defaultTemplateId)
          ? defaultTemplateId
          : recommendedId;

      setSelectedTemplateId(initialTemplateId);
      const matchedTemplate =
        allTemplates.find((t) => t.id === initialTemplateId) || allTemplates[0];

      if (matchedTemplate) {
        const parsed = renderBookingTemplate(matchedTemplate.template, booking);
        setMessageText(parsed);
      }

      const initialPhone = bookingDetails.raw_customer_phone || bookingDetails.clean_phone || '';
      setRecipientPhone(initialPhone);
      setCopied(false);
      setCategoryFilter('all');
    }
  }, [isOpen, booking, defaultTemplateId]);

  if (!isOpen || !booking) return null;

  const cleanRecipient = sanitizeWhatsAppPhone(recipientPhone);
  const isPhoneValid = isValidWhatsAppPhone(recipientPhone);
  const isModifiedFromBooking = recipientPhone !== (bookingDetails.raw_customer_phone || '');

  const filteredTemplates =
    categoryFilter === 'all'
      ? allTemplates
      : allTemplates.filter((t) => t.category === categoryFilter);

  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    const parsed = renderBookingTemplate(template.template, booking);
    setMessageText(parsed);
  };

  const handleResetCurrentTemplate = () => {
    const current = allTemplates.find((t) => t.id === selectedTemplateId);
    if (current) {
      const parsed = renderBookingTemplate(current.template, booking);
      setMessageText(parsed);
    }
  };

  const handleResetRecipientPhone = () => {
    setRecipientPhone(bookingDetails.raw_customer_phone || '');
  };

  const handleInsertVariable = (tag) => {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + ` ${tag}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = messageText.substring(0, start);
    const after = messageText.substring(end);

    const newText = before + tag + after;
    const parsed = renderBookingTemplate(newText, booking);
    setMessageText(parsed);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = start + tag.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 50);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendWhatsApp = () => {
    if (!cleanRecipient || !isPhoneValid) {
      alert('Please enter a valid 10-digit mobile number before sending.');
      return;
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanRecipient}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const recommendedId = getRecommendedTemplateId(booking);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#F8F6F1] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-[#D6D0C7] my-auto">
        
        {/* HEADER - Modern Drive Obsidian & Copper Branding */}
        <div className="px-6 py-4.5 bg-[#121212] border-b border-[#262626] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#A56A43]/20 border border-[#A56A43]/40 text-[#A56A43] shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#F8F6F1]">
                  Modern Drive WhatsApp Dispatch
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A56A43]/20 text-[#D6D0C7] border border-[#A56A43]/30">
                  🚗 Self-Drive & Fleet
                </span>
              </div>
              <p className="text-xs text-[#A5A5A5] mt-0.5">
                Send vehicle handover notices, hub pickup maps, payment reminders & deposit refunds to customer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A5A5A5] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#121212]">

          {/* 1. BOOKING SUMMARY CARD */}
          <div className="bg-[#FFFFFF] border border-[#D6D0C7] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3.5 shadow-sm">
            <div className="space-y-1 md:border-r border-[#E7E0D4] pr-2">
              <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-[#A56A43]" /> Customer Details
              </span>
              <div className="font-bold text-sm text-[#121212] truncate">{bookingDetails.customer_name}</div>
              <div className="flex items-center gap-1 text-[11px] text-[#5C5C5C]">
                <span className="font-mono font-medium">{bookingDetails.display_phone}</span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-[#E7E0D4] pr-2">
              <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3 text-[#A56A43]" /> Assigned Vehicle
              </span>
              <div className="font-bold text-xs text-[#121212] truncate">{bookingDetails.vehicle_name}</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] bg-[#E7E0D4] px-2 py-0.5 rounded font-bold text-[#121212]">
                  {bookingDetails.vehicle_number}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                  {bookingDetails.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-[#E7E0D4] pr-2">
              <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#A56A43]" /> Rental Duration
              </span>
              <div className="text-[11px] text-[#121212] font-semibold truncate">
                Pickup: {bookingDetails.pickup_date} ({bookingDetails.pickup_time})
              </div>
              <div className="text-[10px] text-[#5C5C5C] truncate">
                Return: {bookingDetails.dropoff_date} ({bookingDetails.dropoff_time})
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#A56A43]" /> Payment Summary
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-[#5C5C5C]">Total Fare:</span>
                <span className="font-bold text-[#121212]">₹{bookingDetails.total_amount}</span>
              </div>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-emerald-700 font-medium">Advance: ₹{bookingDetails.advance_paid}</span>
                <span className="text-[#9C4B45] font-bold bg-[#F0D9D6] px-1.5 py-0.5 rounded">
                  Due: ₹{bookingDetails.balance_amount}
                </span>
              </div>
            </div>
          </div>

          {/* 2. RECIPIENT PHONE ROUTING BOX */}
          <div className="bg-[#FFFFFF] border border-[#D6D0C7] rounded-2xl p-4 flex items-center justify-between gap-3.5 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <label htmlFor="recipient-phone-input" className="font-bold text-[#121212] text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#A56A43]" />
                  <span>Customer WhatsApp Number:</span>
                </label>
                {isPhoneValid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {isModifiedFromBooking ? 'Custom Recipient' : 'Booking Phone Verified'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Enter 10-digit number
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5C5C5C]">
                Standard format: 10-digit Indian mobile number (e.g. 98765 43210) · Dispatches via <span className="font-mono font-bold text-[#121212]">wa.me/{cleanRecipient || '...'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-xs text-[#5C5C5C] select-none flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  id="recipient-phone-input"
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="pl-14 pr-3 py-2 bg-[#F8F6F1] border border-[#D6D0C7] rounded-xl font-mono font-bold text-xs text-[#121212] focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] shadow-inner w-56 transition-all"
                />
              </div>

              {isModifiedFromBooking && (
                <button
                  type="button"
                  onClick={handleResetRecipientPhone}
                  className="px-2.5 py-2 rounded-xl bg-[#E7E0D4] hover:bg-[#D6D0C7] text-[#121212] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Revert to Booking Phone"
                >
                  <RotateCcw className="w-3 h-3" /> Revert
                </button>
              )}
            </div>
          </div>

          {/* 3. TEMPLATE CATEGORY TABS & SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-[#121212] text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A56A43]" /> Select Modern Drive Template:
              </span>
              <div className="flex items-center gap-1.5 bg-[#E7E0D4] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-[#121212] text-white shadow-sm'
                      : 'text-[#5C5C5C] hover:text-[#121212]'
                  }`}
                >
                  All Notices ({allTemplates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('dispatch')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    categoryFilter === 'dispatch'
                      ? 'bg-[#121212] text-white shadow-sm'
                      : 'text-[#5C5C5C] hover:text-[#121212]'
                  }`}
                >
                  🚗 Vehicle Handover & Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('billing')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    categoryFilter === 'billing'
                      ? 'bg-[#121212] text-white shadow-sm'
                      : 'text-[#5C5C5C] hover:text-[#121212]'
                  }`}
                >
                  💳 Billing & Deposit Refund
                </button>
              </div>
            </div>

            {/* Template Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const isRecommended = recommendedId === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#121212] ring-2 ring-[#121212]/10 shadow-md'
                        : 'bg-[#FFFFFF]/70 hover:bg-[#FFFFFF] border-[#D6D0C7] hover:border-[#A56A43]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-base leading-none">{tpl.icon}</span>
                        <div className="flex items-center gap-1">
                          {isRecommended && (
                            <span className="text-[9px] font-bold bg-[#A56A43] text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              Recommended
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#121212] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-xs text-[#121212] line-clamp-1">{tpl.title}</div>
                      <div className="text-[10px] text-[#5C5C5C] line-clamp-2 mt-1 leading-snug">
                        {tpl.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. INSERTABLE VARIABLES CHIPS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-[#A56A43]" /> Insert Dynamic Booking Details:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {MODERN_INSERTABLE_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  className="px-2.5 py-1 rounded-lg bg-[#E7E0D4] hover:bg-[#D6D0C7] text-[#121212] font-semibold text-[10px] transition-colors border border-[#D6D0C7] hover:border-[#A56A43] flex items-center gap-1 cursor-pointer"
                  title={`Insert ${v.label}`}
                >
                  <span>+</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. LIVE MESSAGE DRAFT TEXTAREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#121212] text-xs flex items-center gap-1">
                <span>Message Draft</span>
                <span className="text-[10px] font-normal text-[#5C5C5C]">(Editable preview before dispatch)</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#5C5C5C] font-mono">
                  {messageText.length} characters
                </span>
                <button
                  type="button"
                  onClick={handleResetCurrentTemplate}
                  className="text-[10px] font-bold text-[#A56A43] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Reset to template default text"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset Template
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={9}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-4 bg-[#FFFFFF] border border-[#D6D0C7] rounded-2xl font-sans text-xs text-[#121212] leading-relaxed focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] shadow-inner resize-y transition-all"
            />
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-t border-[#D6D0C7] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="px-4 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E7E0D4] text-[#121212] border border-[#D6D0C7] font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-gray-100 text-[#5C5C5C] font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!isPhoneValid}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                isPhoneValid
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>🟢 Open in WhatsApp & Send ({cleanRecipient ? `+${cleanRecipient}` : 'No Phone'})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppBookingModal;
