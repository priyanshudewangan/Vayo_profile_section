"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { use } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus, Receipt, Users, ArrowRight, CheckCircle2, Smartphone,
  X, ChevronDown, ChevronUp, Trash2, IndianRupee,
  ChevronLeft, UserPlus, Loader2, Calendar, MapPin,
  Share2, Copy, Check, MessageCircle, QrCode,
} from "lucide-react";

// ─── constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Drinks", "Transport", "Stay", "Activities", "Misc"];
const CAT_EMOJI  = { Food:"🍽️", Drinks:"🥤", Transport:"🚗", Stay:"🏠", Activities:"🎯", Misc:"📦" };
const CAT_COLORS = {
  Food:"bg-orange-100 text-orange-600", Drinks:"bg-purple-100 text-purple-600",
  Transport:"bg-sky-100 text-sky-600", Stay:"bg-emerald-100 text-emerald-600",
  Activities:"bg-pink-100 text-pink-600", Misc:"bg-slate-100 text-slate-600",
};
const AV_GRADIENTS = [
  "from-[#4893C6] to-[#64A4CE]","from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400","from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400","from-sky-500 to-cyan-400",
];
const avatarGrad = (name) => {
  let h = 0; for (const c of (name||"?")) h = (h*31+c.charCodeAt(0))&0xffff;
  return AV_GRADIENTS[h % AV_GRADIENTS.length];
};
const initials = (name) => (name||"?").slice(0,2).toUpperCase();

// ─── greedy settle ───────────────────────────────────────────────────────────────
function calcSplits(expenses, members) {
  if (!members.length || !expenses.length) return [];
  const net = Object.fromEntries(members.map(m=>[m,0]));
  expenses.forEach(exp => {
    const share = exp.amount / members.length;
    members.forEach(m => { net[m] -= share; });
    net[exp.paidBy] += exp.amount;
  });
  const cr = Object.entries(net).filter(([,v])=>v>0.01).sort((a,b)=>b[1]-a[1]).map(([n,v])=>[n,v]);
  const dr = Object.entries(net).filter(([,v])=>v<-0.01).sort((a,b)=>a[1]-b[1]).map(([n,v])=>[n,-v]);
  const out=[]; let ci=0,di=0;
  while (ci<cr.length && di<dr.length) {
    const amt = Math.min(cr[ci][1], dr[di][1]);
    if (amt>0.01) out.push({ from:dr[di][0], to:cr[ci][0], amount:Math.round(amt) });
    cr[ci][1]-=amt; dr[di][1]-=amt;
    if (cr[ci][1]<0.01) ci++; if (dr[di][1]<0.01) di++;
  }
  return out;
}

function Avatar({ name, size="md" }) {
  const s = size==="sm"?"w-6 h-6 text-[8px]":size==="lg"?"w-10 h-10 text-xs":"w-8 h-8 text-[10px]";
  return (
    <div className={`${s} rounded-full bg-gradient-to-br ${avatarGrad(name)} flex items-center justify-center text-white font-black shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ─── Add Expense Modal ───────────────────────────────────────────────────────────
function AddExpenseModal({ members, onAdd, onClose }) {
  const [desc, setDesc]         = useState("");
  const [amount, setAmount]     = useState("");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy]     = useState(members[0]);

  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!desc.trim() || isNaN(amt) || amt<=0) return;
    onAdd({ id: Date.now(), desc: desc.trim(), amount: amt, category, paidBy });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-gradient-to-br from-[#4893C6] to-[#64A4CE] px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-black text-lg">Add Expense</h3>
            <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
          </div>
          <p className="text-white/70 text-[11px] font-medium">Split equally among all members</p>
        </div>
        <form onSubmit={submit} className="px-6 py-5 -mt-4 bg-white rounded-t-[2rem] relative space-y-4">
          <div className="flex items-center gap-2 bg-[#E2EFF6] rounded-2xl px-4 py-3">
            <IndianRupee className="w-5 h-5 text-[#4893C6] shrink-0"/>
            <input autoFocus type="number" min="1" step="0.01" placeholder="0.00" required
              value={amount} onChange={e=>setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-black text-slate-800 placeholder:text-slate-300 outline-none w-full"/>
          </div>
          <input type="text" placeholder="What was it for?" required maxLength={60}
            value={desc} onChange={e=>setDesc(e.target.value)}
            className="w-full bg-[#E2EFF6]/60 border-2 border-[#B7D7EA]/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#4893C6] transition-colors"/>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat=>(
              <button key={cat} type="button" onClick={()=>setCategory(cat)}
                className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${category===cat?"bg-[#4893C6] text-white shadow-md":"bg-[#E2EFF6] text-slate-500 hover:bg-[#B7D7EA]/60"}`}>
                {CAT_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Paid by</p>
            <div className="flex gap-2 flex-wrap">
              {members.map(m=>(
                <button key={m} type="button" onClick={()=>setPaidBy(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${paidBy===m?"bg-[#4893C6] text-white shadow-md":"bg-[#E2EFF6] text-slate-600 hover:bg-[#B7D7EA]/60"}`}>
                  <Avatar name={m} size="sm"/>{m}
                </button>
              ))}
            </div>
          </div>
          <button type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#4893C6] to-[#64A4CE] text-white rounded-2xl font-black text-sm shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center gap-2 transition-opacity">
            <Plus className="w-4 h-4"/> Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Share panel ─────────────────────────────────────────────────────────────────
function SharePanel({ url, eventName }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#B7D7EA]/40 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5">
        <Share2 className="w-4 h-4 text-[#4893C6]"/>
        <span className="font-black text-slate-800 text-sm uppercase tracking-wider flex-1">Share Split</span>
        <button onClick={()=>setShowQR(v=>!v)} className="p-1.5 rounded-lg hover:bg-[#E2EFF6] cursor-pointer transition-colors" title="Show QR code">
          <QrCode className="w-4 h-4 text-slate-400"/>
        </button>
      </div>
      <div className="px-5 pb-4 space-y-3">
        {/* Copy link row */}
        <div className="flex items-center gap-2 bg-[#E2EFF6]/60 rounded-xl px-3 py-2.5">
          <span className="flex-1 text-[11px] font-semibold text-slate-500 truncate">{url}</span>
          <button onClick={copy}
            className="flex items-center gap-1 text-[11px] font-black text-[#4893C6] hover:text-[#64A4CE] cursor-pointer transition-colors shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {/* QR */}
        {showQR && (
          <div className="flex justify-center py-2">
            <div className="p-3 bg-white border border-[#B7D7EA]/60 rounded-2xl shadow-sm">
              <QRCodeSVG value={url} size={140} level="M" includeMargin={false}/>
              <p className="text-center text-[10px] text-slate-400 font-bold mt-2">Scan to open split</p>
            </div>
          </div>
        )}
        <p className="text-[10px] text-slate-400 font-medium text-center">Anyone with this link can view &amp; add expenses</p>
      </div>
    </div>
  );
}

// ─── My summary banner ────────────────────────────────────────────────────────────
function MySummaryBanner({ youName, settlements, paid, members, expenses }) {
  if (!youName || !members.includes(youName)) return null;

  const totalSpend = expenses.reduce((s,e)=>s+e.amount,0);
  const myShare    = members.length ? Math.round(totalSpend / members.length) : 0;
  const iPaid      = expenses.filter(e=>e.paidBy===youName).reduce((s,e)=>s+e.amount,0);

  const iOwe = settlements.filter(s=>s.from===youName && !paid[`${s.from}-${s.to}`]);
  const owedToMe = settlements.filter(s=>s.to===youName && !paid[`${s.from}-${s.to}`]);
  const totalIOwe = iOwe.reduce((s,t)=>s+t.amount,0);
  const totalOwedToMe = owedToMe.reduce((s,t)=>s+t.amount,0);

  const isEven = totalIOwe===0 && totalOwedToMe===0;

  return (
    <div className={`rounded-2xl p-4 border ${isEven?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
      <div className="flex items-center gap-3">
        <Avatar name={youName} size="lg"/>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your summary</p>
          {isEven ? (
            <p className="text-sm font-black text-emerald-700 mt-0.5">You're all settled up 🎉</p>
          ) : totalIOwe > 0 ? (
            <p className="text-sm font-black text-amber-700 mt-0.5">
              You owe <span className="text-base">₹{totalIOwe.toLocaleString()}</span>
              {iOwe.length===1 && <span className="font-semibold text-amber-600"> to {iOwe[0].to}</span>}
            </p>
          ) : (
            <p className="text-sm font-black text-emerald-700 mt-0.5">
              You're owed <span className="text-base">₹{totalOwedToMe.toLocaleString()}</span>
            </p>
          )}
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your share: ₹{myShare} · You paid: ₹{iPaid}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────────
export default function EventSplitPage({ params }) {
  const { event_id } = use(params);

  const [youName, setYouName]     = useState("");
  const [pageUrl, setPageUrl]     = useState("");
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [members, setMembers]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [paid, setPaid]         = useState({});
  const [newMember, setNewMember]   = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showMembers, setShowMembers]   = useState(false);

  const saveTimer = useRef(null);
  const initialized = useRef(false);

  // ── Read URL params + load data ────────────────────────────────────────────────
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const you = sp.get("you") || "";
    const evtNameFromUrl = sp.get("event") || "";
    setYouName(you);
    setPageUrl(window.location.origin + window.location.pathname);

    async function load() {
      setLoading(true);
      try {
        // 1. Fetch event details
        const evtRes = await fetch("/api/events");
        let event = null;
        if (evtRes.ok) {
          const { events } = await evtRes.json();
          event = (events||[]).find(e=>e.event_id===event_id);
        }
        setEventInfo(event || { title: evtNameFromUrl || "Event", venue:"", event_date:"" });

        // 2. Load split session from Supabase
        const sessRes = await fetch(`/api/splits/${event_id}`);
        if (sessRes.ok) {
          const { session } = await sessRes.json();
          if (session) {
            setMembers(session.members || []);
            setExpenses(session.expenses || []);
            setPaid(session.paid || {});
            initialized.current = true;
            return;
          }
        }

        // 3. No session yet — seed members from RSVPs
        if (event) {
          const rsvpRes = await fetch(`/api/rsvp?event_id=${event_id}`);
          if (rsvpRes.ok) {
            const { rsvps } = await rsvpRes.json();
            const names = (rsvps||[])
              .map(r=>(r.user_name || r.user_email?.split("@")[0]||"").trim())
              .filter(Boolean)
              .filter((v,i,a)=>a.indexOf(v)===i);
            if (names.length) setMembers(names);
          }
        }
        // Also add "you" if not already in list
        if (you) {
          setMembers(m => m.includes(you) ? m : [...m, you]);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); initialized.current = true; }
    }
    load();
  }, [event_id]);

  // ── Debounced save to Supabase ─────────────────────────────────────────────────
  const saveToApi = useCallback((m, e, p, name) => {
    if (!initialized.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/splits/${event_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_name: name, members: m, expenses: e, paid: p }),
        });
      } catch(err) { console.error(err); }
      finally { setSaving(false); }
    }, 800);
  }, [event_id]);

  const eventName = eventInfo?.title || "Event";

  useEffect(() => { saveToApi(members, expenses, paid, eventName); }, [members, expenses, paid]);

  // ── Computed values ────────────────────────────────────────────────────────────
  const settlements = useMemo(()=>calcSplits(expenses,members),[expenses,members]);
  const total       = expenses.reduce((s,e)=>s+e.amount,0);
  const perHead     = members.length ? Math.round(total/members.length) : 0;
  const allSettled  = settlements.length>0 && settlements.every(s=>paid[`${s.from}-${s.to}`]);

  const addExpense    = (exp) => setExpenses(es=>[...es,exp]);
  const removeExpense = (id)  => setExpenses(es=>es.filter(e=>e.id!==id));
  const togglePaid    = (key) => setPaid(p=>({...p,[key]:!p[key]}));
  const addMember     = () => {
    const v=newMember.trim();
    if(v&&!members.includes(v)){ setMembers(m=>[...m,v]); setNewMember(""); }
  };

  // ── WhatsApp message builder ───────────────────────────────────────────────────
  const whatsappLink = (from, to, amount) => {
    const msg = `Hey ${from}, you owe ${to} ₹${amount} for *${eventName}* 💸\n\nPay via UPI:\nupi://pay?pa=vayo@okaxis&pn=${encodeURIComponent(to)}&am=${amount}&cu=INR\n\nView split: ${pageUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#E2EFF6] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#4893C6] animate-spin"/>
    </div>
  );

  const eventDate  = eventInfo?.event_date ? new Date(eventInfo.event_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "";
  const eventVenue = eventInfo?.venue || "";

  return (
    <div className="min-h-screen bg-[#E2EFF6]">
      {/* Header */}
      <div className="bg-white border-b border-[#B7D7EA]/50 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={()=>history.back()} className="p-1.5 rounded-xl hover:bg-[#E2EFF6] cursor-pointer transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500"/>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm truncate">{eventName}</p>
          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            Expense Split
            {saving && <span className="text-[#4893C6] animate-pulse">· saving…</span>}
          </p>
        </div>
        {members.length > 0 && (
          <button onClick={()=>setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#4893C6] text-white text-xs font-black px-4 py-2 rounded-full shadow-md hover:bg-[#64A4CE] transition-colors cursor-pointer shrink-0">
            <Plus className="w-3.5 h-3.5"/> Add
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Event info banner */}
        {(eventDate||eventVenue) && (
          <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 border border-[#B7D7EA]/40 shadow-sm flex-wrap">
            {eventDate && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-[#4893C6] shrink-0"/>{eventDate}
              </div>
            )}
            {eventVenue && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#4893C6] shrink-0"/>
                <span className="truncate">{eventVenue}</span>
              </div>
            )}
          </div>
        )}

        {/* Summary card */}
        <div className="bg-gradient-to-br from-[#4893C6] to-[#2e6fa3] rounded-[1.75rem] p-5 text-white shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Total",    value: total  ? `₹${total.toLocaleString()}`  : "—" },
              { label:"Per Head", value: perHead ? `₹${perHead}` : "—" },
              { label:"Expenses", value: expenses.length },
            ].map(({label,value})=>(
              <div key={label} className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                <p className="text-base font-black">{value}</p>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {members.length>0 && (
            <div className="flex items-center gap-1.5 mt-4">
              <div className="flex -space-x-2">
                {members.slice(0,5).map(m=>(
                  <div key={m} title={m} className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGrad(m)} flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white/30`}>
                    {initials(m)[0]}
                  </div>
                ))}
                {members.length>5 && <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white/30">+{members.length-5}</div>}
              </div>
              <span className="text-white/70 text-[11px] font-medium ml-1">splitting equally</span>
              {allSettled && <span className="ml-auto bg-emerald-400/30 border border-emerald-300/40 text-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">All Settled ✓</span>}
            </div>
          )}
        </div>

        {/* My summary banner */}
        <MySummaryBanner
          youName={youName} settlements={settlements}
          paid={paid} members={members} expenses={expenses}
        />

        {/* Share panel */}
        {pageUrl && <SharePanel url={pageUrl} eventName={eventName}/>}

        {/* Members */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#B7D7EA]/40 overflow-hidden">
          <button onClick={()=>setShowMembers(v=>!v)}
            className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#E2EFF6]/40 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4893C6]"/>
              <span className="font-black text-slate-800 text-sm uppercase tracking-wider">Members</span>
              <span className="bg-[#4893C6] text-white text-[9px] font-black px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            {showMembers?<ChevronUp className="w-4 h-4 text-slate-300"/>:<ChevronDown className="w-4 h-4 text-slate-300"/>}
          </button>
          {showMembers && (
            <div className="px-5 pb-4 space-y-3">
              {members.length>0 && (
                <div className="flex flex-wrap gap-2">
                  {members.map(m=>(
                    <div key={m} className={`flex items-center gap-1.5 border rounded-full pl-1 pr-2.5 py-1 ${m===youName?"bg-[#4893C6]/10 border-[#4893C6]/30":"bg-[#E2EFF6] border-[#B7D7EA]/50"}`}>
                      <Avatar name={m} size="sm"/>
                      <span className="text-xs font-bold text-slate-700">{m}</span>
                      {m===youName && <span className="text-[9px] font-black text-[#4893C6]">you</span>}
                      <button onClick={()=>setMembers(ms=>ms.filter(x=>x!==m))} className="text-slate-300 hover:text-rose-400 cursor-pointer ml-0.5 transition-colors">
                        <X className="w-3 h-3"/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newMember} onChange={e=>setNewMember(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()}
                  placeholder="Add member…" maxLength={20}
                  className="flex-1 bg-[#E2EFF6]/60 border border-[#B7D7EA]/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#4893C6] transition-colors"/>
                <button onClick={addMember} className="bg-[#4893C6] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#64A4CE] transition-colors cursor-pointer">
                  <UserPlus className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#B7D7EA]/40 overflow-hidden">
          <button onClick={()=>setShowExpenses(v=>!v)}
            className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#E2EFF6]/40 transition-colors">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#4893C6]"/>
              <span className="font-black text-slate-800 text-sm uppercase tracking-wider">Expenses</span>
              <span className="bg-[#4893C6] text-white text-[9px] font-black px-2 py-0.5 rounded-full">{expenses.length}</span>
            </div>
            {showExpenses?<ChevronUp className="w-4 h-4 text-slate-300"/>:<ChevronDown className="w-4 h-4 text-slate-300"/>}
          </button>
          {showExpenses && (
            <div className="divide-y divide-[#E2EFF6]">
              {expenses.length===0 ? (
                <div className="py-10 text-center">
                  <p className="text-3xl mb-2">🧾</p>
                  <p className="text-slate-400 text-xs font-bold">No expenses yet</p>
                  {members.length>=2 && (
                    <button onClick={()=>setShowAddModal(true)}
                      className="mt-3 text-[#4893C6] text-xs font-black border border-[#4893C6]/30 px-4 py-1.5 rounded-full hover:bg-[#E2EFF6] transition-colors cursor-pointer">
                      + Add First Expense
                    </button>
                  )}
                </div>
              ) : expenses.map(exp=>(
                <div key={exp.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-[#E2EFF6]/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${CAT_COLORS[exp.category]?.split(" ")[0]||"bg-slate-100"} flex items-center justify-center text-lg shrink-0`}>
                    {CAT_EMOJI[exp.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{exp.desc}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Avatar name={exp.paidBy} size="sm"/>
                      <span className="text-[10px] text-slate-500 font-semibold">{exp.paidBy} paid</span>
                      <span className="text-[9px] text-slate-300">·</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${CAT_COLORS[exp.category]||"bg-slate-100 text-slate-500"}`}>{exp.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-slate-800 text-sm">₹{exp.amount.toLocaleString()}</span>
                    <button onClick={()=>removeExpense(exp.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settle Up */}
        {expenses.length>0 && (
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#B7D7EA]/40 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2EFF6]">
              <ArrowRight className="w-4 h-4 text-[#4893C6]"/>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider flex-1">Settle Up</h2>
              {allSettled && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">All Done 🎉</span>}
            </div>
            <div className="divide-y divide-[#E2EFF6]">
              {settlements.length===0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">Everyone is even 🎉</div>
              ) : settlements.map((s,i)=>{
                const key=`${s.from}-${s.to}`;
                const isPaid=!!paid[key];
                const isMyRow = s.from===youName;
                return (
                  <div key={i} className={`flex items-center gap-2 px-4 py-4 transition-colors ${isPaid?"bg-emerald-50/60":isMyRow?"bg-amber-50/40":""}`}>
                    <Avatar name={s.from}/>
                    <span className={`text-xs font-bold shrink-0 ${isMyRow?"text-amber-700":"text-slate-700"}`}>
                      {s.from}{isMyRow&&<span className="text-[9px] text-amber-500 ml-1">(you)</span>}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0"/>
                    <Avatar name={s.to}/>
                    <span className="text-xs font-bold text-slate-700 shrink-0">{s.to}</span>
                    <span className="flex-1 text-right font-black text-slate-800 text-sm">₹{s.amount.toLocaleString()}</span>
                    {isPaid ? (
                      <div className="flex items-center gap-1 text-emerald-600 shrink-0 ml-2">
                        <CheckCircle2 className="w-4 h-4"/>
                        <span className="text-[10px] font-black">Paid</span>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 shrink-0 ml-1">
                        <a href={`upi://pay?pa=vayo@okaxis&pn=${encodeURIComponent(s.to)}&am=${s.amount}&cu=INR`}
                          className="flex items-center gap-1 bg-[#4893C6] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-[#64A4CE] transition-colors cursor-pointer shadow-sm">
                          <Smartphone className="w-3 h-3"/> UPI
                        </a>
                        <a href={whatsappLink(s.from, s.to, s.amount)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                          <MessageCircle className="w-3 h-3"/> WA
                        </a>
                        <button onClick={()=>togglePaid(key)}
                          className="flex items-center gap-1 border-2 border-emerald-300 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer">
                          <CheckCircle2 className="w-3 h-3"/> Done
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 font-medium pb-6">
          Powered by <span className="font-black text-[#4893C6]">VAYO</span> · No more awkward money talks
        </p>
      </div>

      {showAddModal && members.length>0 && (
        <AddExpenseModal members={members} onAdd={addExpense} onClose={()=>setShowAddModal(false)}/>
      )}
    </div>
  );
}
