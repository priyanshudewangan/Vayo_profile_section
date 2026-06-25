"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { use } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronLeft, MapPin, Calendar, Users, UserCheck,
  Plus, Receipt, ArrowRight, CheckCircle2, Smartphone,
  X, ChevronDown, ChevronUp, Trash2, IndianRupee,
  Loader2, MessageCircle, Share2, Copy, Check, QrCode,
} from "lucide-react";

const CATEGORIES = ["Food","Drinks","Transport","Stay","Activities","Misc"];
const CAT_EMOJI  = { Food:"🍽️",Drinks:"🥤",Transport:"🚗",Stay:"🏠",Activities:"🎯",Misc:"📦" };
const CAT_COLORS = {
  Food:"bg-orange-50 text-orange-600 border-orange-100",
  Drinks:"bg-purple-50 text-purple-600 border-purple-100",
  Transport:"bg-sky-50 text-sky-600 border-sky-100",
  Stay:"bg-emerald-50 text-emerald-600 border-emerald-100",
  Activities:"bg-pink-50 text-pink-600 border-pink-100",
  Misc:"bg-slate-50 text-slate-600 border-slate-100",
};
const GRADS = [
  "from-teal-400 to-cyan-300","from-violet-400 to-purple-300",
  "from-rose-400 to-pink-300","from-amber-400 to-orange-300",
  "from-sky-400 to-blue-300","from-emerald-400 to-green-300",
];
const grad  = (s) => { let h=0; for(const c of (s||"?")) h=(h*31+c.charCodeAt(0))&0xffff; return GRADS[h%GRADS.length]; };
const inits = (s) => (s||"?").slice(0,2).toUpperCase();
const nameFromEmail = (email) => email?.split("@")[0]?.replace(/[._]/g," ").replace(/\b\w/g,c=>c.toUpperCase()) || email || "?";

function Avatar({ name, size="md" }) {
  const sz = size==="sm"?"w-7 h-7 text-[9px]":size==="lg"?"w-11 h-11 text-sm":size==="xl"?"w-14 h-14 text-base":"w-9 h-9 text-[10px]";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${grad(name)} flex items-center justify-center text-white font-black shrink-0`}>
      {inits(name)}
    </div>
  );
}

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
  while(ci<cr.length&&di<dr.length){
    const amt=Math.min(cr[ci][1],dr[di][1]);
    if(amt>0.01) out.push({from:dr[di][0],to:cr[ci][0],amount:Math.round(amt)});
    cr[ci][1]-=amt; dr[di][1]-=amt;
    if(cr[ci][1]<0.01)ci++; if(dr[di][1]<0.01)di++;
  }
  return out;
}

function AddExpenseModal({ members, onAdd, onClose }) {
  const [desc,setDesc]=useState("");
  const [amt,setAmt]=useState("");
  const [cat,setCat]=useState("Food");
  const [paidBy,setPaidBy]=useState(members[0]);

  const submit=(e)=>{
    e.preventDefault();
    const a=parseFloat(amt);
    if(!desc.trim()||isNaN(a)||a<=0) return;
    onAdd({id:Date.now(),desc:desc.trim(),amount:a,category:cat,paidBy});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-neutral-100" onClick={e=>e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div>
            <h3 className="text-neutral-800 font-black text-lg">Add Expense</h3>
            <p className="text-neutral-400 text-[11px] font-medium mt-0.5">Split equally among {members.length} people</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="px-6 pb-6 pt-4 space-y-4">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
            <IndianRupee className="w-5 h-5 text-teal-500 shrink-0"/>
            <input autoFocus type="number" min="1" step="0.01" placeholder="0.00" required
              value={amt} onChange={e=>setAmt(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-black text-neutral-800 placeholder:text-neutral-300 outline-none"/>
          </div>
          <input type="text" placeholder="What was this for?" required maxLength={60}
            value={desc} onChange={e=>setDesc(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-teal-400 transition-colors"/>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c=>(
              <button key={c} type="button" onClick={()=>setCat(c)}
                className={`py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer border ${cat===c?"bg-teal-500 text-white border-teal-500":"bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-teal-300"}`}>
                {CAT_EMOJI[c]} {c}
              </button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Paid by</p>
            <div className="flex gap-2 flex-wrap">
              {members.map(m=>(
                <button key={m} type="button" onClick={()=>setPaidBy(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${paidBy===m?"bg-teal-500 text-white border-teal-500":"bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-teal-300"}`}>
                  <Avatar name={m} size="sm"/>{m}
                </button>
              ))}
            </div>
          </div>
          <button type="submit"
            className="w-full py-3.5 bg-teal-500 text-white rounded-2xl font-black text-sm hover:bg-teal-600 cursor-pointer flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-4 h-4"/> Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }) {
  const { event_id } = use(params);

  const [event, setEvent]         = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [youName, setYouName]     = useState("");
  const [pageUrl, setPageUrl]     = useState("");

  const [members, setMembers]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [paid, setPaid]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showExpenses, setShowExpenses]   = useState(true);
  const [showSettle, setShowSettle]       = useState(true);
  const [copiedLink, setCopiedLink]       = useState(false);
  const [showQR, setShowQR]               = useState(false);
  const [newMember, setNewMember]         = useState("");

  const saveTimer   = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const sp  = new URLSearchParams(window.location.search);
    const you = sp.get("you") || "";
    setPageUrl(window.location.origin + window.location.pathname);

    async function load() {
      setLoading(true);
      try {
        const [evtRes, checkinsRes, sessRes] = await Promise.all([
          fetch(`/api/events/${event_id}`),
          fetch(`/api/checkins?event_id=${event_id}`),
          fetch(`/api/splits/${event_id}`),
        ]);

        if (evtRes.ok) {
          const { event } = await evtRes.json();
          setEvent(event);
        }

        let checkedInNames = [];
        if (checkinsRes.ok) {
          const { checkins } = await checkinsRes.json();
          const list = (checkins||[]).map(c => nameFromEmail(c.user_email));
          setAttendees(list);
          checkedInNames = list;
        }

        // Match you param case-insensitively to an existing member name
        const youMatched = checkedInNames.find(n => n.toLowerCase() === you.toLowerCase()) || nameFromEmail(you + "@x.com");
        setYouName(youMatched);

        if (sessRes.ok) {
          const { session } = await sessRes.json();
          if (session) {
            setMembers(session.members||[]);
            setExpenses(session.expenses||[]);
            setPaid(session.paid||{});
            initialized.current = true;
            return;
          }
        }

        const seedMembers = checkedInNames.length ? checkedInNames : (youMatched ? [youMatched] : []);
        const alreadyIn = seedMembers.some(n => n.toLowerCase() === you.toLowerCase());
        setMembers(alreadyIn ? seedMembers : youMatched ? [...seedMembers, youMatched] : seedMembers);
      } catch(e) { console.error(e); }
      finally { setLoading(false); initialized.current = true; }
    }
    load();
  }, [event_id]);

  const saveToApi = useCallback((m,e,p,name) => {
    if (!initialized.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async()=>{
      setSaving(true);
      try {
        await fetch(`/api/splits/${event_id}`,{
          method:"PUT",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({event_name:name,members:m,expenses:e,paid:p}),
        });
      } catch(err){console.error(err);}
      finally{setSaving(false);}
    },800);
  },[event_id]);

  const eventName = event?.title || "Event";
  useEffect(()=>{ saveToApi(members,expenses,paid,eventName); },[members,expenses,paid]);

  const settlements = useMemo(()=>calcSplits(expenses,members),[expenses,members]);
  const total       = expenses.reduce((s,e)=>s+e.amount,0);
  const perHead     = members.length ? Math.round(total/members.length) : 0;
  const allSettled  = settlements.length>0 && settlements.every(s=>paid[`${s.from}-${s.to}`]);

  const myDebts   = settlements.filter(s=>s.from===youName&&!paid[`${s.from}-${s.to}`]);
  const totalIOwe = myDebts.reduce((s,t)=>s+t.amount,0);

  const addExpense    = (exp) => setExpenses(es=>[...es,exp]);
  const removeExpense = (id)  => setExpenses(es=>es.filter(e=>e.id!==id));
  const togglePaid    = (key) => setPaid(p=>({...p,[key]:!p[key]}));
  const addMember     = () => {
    const v=newMember.trim();
    if(v&&!members.includes(v)){setMembers(m=>[...m,v]);setNewMember("");}
  };

  const waLink = (from,to,amount) => {
    const msg=`Hey ${from}, you owe ${to} ₹${amount} for *${eventName}* 💸\nPay: upi://pay?pa=vayo@okaxis&pn=${encodeURIComponent(to)}&am=${amount}&cu=INR\nView split: ${pageUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(()=>{
      setCopiedLink(true); setTimeout(()=>setCopiedLink(false),2000);
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-teal-500 animate-spin"/>
    </div>
  );

  const coverImg = event?.cover_image_url || "/assets/events/something.jpg";
  const eventDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})
    : "";

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <div className="relative h-56 sm:h-64">
        <img src={coverImg} alt={eventName} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60"/>

        <a href="/profile"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white transition-colors shadow-md">
          <ChevronLeft className="w-5 h-5 text-neutral-700"/>
        </a>

        {event?.is_live && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 px-3 py-1 rounded-full shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            <span className="text-[11px] font-black uppercase tracking-widest text-white">Live</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          {event?.category && (
            <span className="text-[10px] font-black uppercase tracking-[3px] text-teal-300 mb-1 block">{event.category}</span>
          )}
          <h1 className="text-xl font-black text-white leading-tight drop-shadow">{eventName}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {eventDate && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80">
                <Calendar className="w-3 h-3 shrink-0"/>{eventDate}
              </div>
            )}
            {event?.venue && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80">
                <MapPin className="w-3 h-3 shrink-0"/>{event.venue}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Who Attended */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-blue-500"/>
            <h2 className="font-bold text-[12px] text-blue-600 uppercase tracking-widest">GPS Verified Attendees</h2>
            <span className="ml-auto bg-teal-50 text-teal-600 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-teal-100">
              {attendees.length} checked in
            </span>
          </div>

          {attendees.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-neutral-400 text-xs font-bold">No GPS check-ins yet</p>
              <p className="text-neutral-300 text-[11px] mt-1">Attendees appear here after verifying location</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {attendees.map((name,i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar name={name} size="lg"/>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white"/>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-800">{name}</p>
                    <p className="text-[10px] text-teal-500 font-bold">Verified ✓</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-extrabold text-base text-neutral-800">Expense Split</h2>
            <p className="text-neutral-400 text-[11px] font-medium mt-0.5">
              {members.length > 0 ? `${members.length} people · ₹${perHead}/head` : "Members auto-seeded from attendees"}
              {saving && <span className="text-teal-400 ml-2 animate-pulse">· saving…</span>}
            </p>
          </div>
          {members.length > 0 && (
            <button onClick={()=>setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-teal-500 text-white text-xs font-black px-4 py-2.5 rounded-full hover:bg-teal-600 transition-colors cursor-pointer shadow-md">
              <Plus className="w-3.5 h-3.5"/> Add Expense
            </button>
          )}
        </div>

        {/* My debt banner */}
        {youName && members.includes(youName) && expenses.length > 0 && (
          <div className={`rounded-2xl px-5 py-4 border flex items-center gap-3 ${totalIOwe>0?"bg-amber-50 border-amber-200":"bg-emerald-50 border-emerald-200"}`}>
            <Avatar name={youName} size="lg"/>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your summary</p>
              {totalIOwe > 0 ? (
                <p className="text-base font-black text-amber-600 mt-0.5">
                  You owe ₹{totalIOwe.toLocaleString()}
                  {myDebts.length===1&&<span className="text-sm font-semibold text-amber-500"> to {myDebts[0].to}</span>}
                </p>
              ) : (
                <p className="text-base font-black text-emerald-600 mt-0.5">You're all settled up 🎉</p>
              )}
              <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                Your share: ₹{perHead} · You paid: ₹{expenses.filter(e=>e.paidBy===youName).reduce((s,e)=>s+e.amount,0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {label:"Total",    value:`₹${total.toLocaleString()}`},
              {label:"Per Head", value:`₹${perHead}`},
              {label:"Expenses", value:expenses.length},
            ].map(({label,value})=>(
              <div key={label} className="bg-white border border-neutral-200 rounded-2xl p-4 text-center shadow-md">
                <p className="text-base font-black text-neutral-800">{value}</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Members */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100">
            <Users className="w-4 h-4 text-blue-500"/>
            <span className="font-bold text-[12px] text-blue-600 uppercase tracking-widest flex-1">Splitting Between</span>
            <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">{members.length}</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            {members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {members.map(m=>(
                  <div key={m} className={`flex items-center gap-1.5 border rounded-full pl-1 pr-2.5 py-1 ${m===youName?"bg-teal-50 border-teal-200":"bg-neutral-50 border-neutral-200"}`}>
                    <Avatar name={m} size="sm"/>
                    <span className="text-xs font-bold text-neutral-700">{m}</span>
                    {m===youName&&<span className="text-[9px] font-black text-teal-500">you</span>}
                    <button onClick={()=>setMembers(ms=>ms.filter(x=>x!==m))} className="text-neutral-300 hover:text-red-400 cursor-pointer transition-colors">
                      <X className="w-3 h-3"/>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-xs font-medium">No members yet — add people below</p>
            )}
            <div className="flex gap-2">
              <input value={newMember} onChange={e=>setNewMember(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()}
                placeholder="Add someone manually…" maxLength={20}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-teal-400 transition-colors"/>
              <button onClick={addMember} className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-teal-600 transition-colors cursor-pointer">Add</button>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
          <button onClick={()=>setShowExpenses(v=>!v)}
            className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-neutral-50 transition-colors border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500"/>
              <span className="font-bold text-[12px] text-blue-600 uppercase tracking-widest">Expenses</span>
              <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">{expenses.length}</span>
            </div>
            {showExpenses?<ChevronUp className="w-4 h-4 text-neutral-300"/>:<ChevronDown className="w-4 h-4 text-neutral-300"/>}
          </button>
          {showExpenses && (
            <div className="divide-y divide-neutral-100">
              {expenses.length===0 ? (
                <div className="py-10 text-center">
                  <p className="text-3xl mb-2">🧾</p>
                  <p className="text-neutral-400 text-xs font-bold">No expenses yet</p>
                  {members.length>=2 && (
                    <button onClick={()=>setShowAddModal(true)}
                      className="mt-3 text-teal-500 text-xs font-black border border-teal-200 px-4 py-1.5 rounded-full hover:bg-teal-50 transition-colors cursor-pointer">
                      + Add First Expense
                    </button>
                  )}
                </div>
              ) : expenses.map(exp=>(
                <div key={exp.id} className="flex items-center gap-3 px-5 py-4 group hover:bg-neutral-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${CAT_COLORS[exp.category]||"bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                    {CAT_EMOJI[exp.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800 truncate">{exp.desc}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Avatar name={exp.paidBy} size="sm"/>
                      <span className="text-[10px] text-neutral-400 font-semibold">{exp.paidBy} paid</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${CAT_COLORS[exp.category]||"bg-neutral-50 text-neutral-500 border-neutral-200"}`}>{exp.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-neutral-800 text-sm">₹{exp.amount.toLocaleString()}</span>
                    <button onClick={()=>removeExpense(exp.id)} className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settle Up */}
        {expenses.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
            <button onClick={()=>setShowSettle(v=>!v)}
              className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-neutral-50 transition-colors border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500"/>
                <span className="font-bold text-[12px] text-blue-600 uppercase tracking-widest">Settle Up</span>
                {allSettled&&<span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">All Done 🎉</span>}
              </div>
              {showSettle?<ChevronUp className="w-4 h-4 text-neutral-300"/>:<ChevronDown className="w-4 h-4 text-neutral-300"/>}
            </button>
            {showSettle && (
              <div className="divide-y divide-neutral-100">
                {settlements.length===0 ? (
                  <div className="py-8 text-center text-neutral-400 text-xs font-bold">Everyone is even 🎉</div>
                ) : settlements.map((s,i)=>{
                  const key=`${s.from}-${s.to}`;
                  const isPaid=!!paid[key];
                  const isMe=s.from===youName;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-5 py-4 transition-colors ${isPaid?"bg-emerald-50/60":isMe?"bg-amber-50/60":""}`}>
                      <Avatar name={s.from}/>
                      <div className="flex flex-col shrink-0">
                        <span className={`text-xs font-bold ${isMe?"text-amber-600":"text-neutral-700"}`}>{s.from}</span>
                        {isMe&&<span className="text-[9px] text-amber-400 font-bold">you</span>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300 shrink-0"/>
                      <Avatar name={s.to}/>
                      <span className="text-xs font-bold text-neutral-700 shrink-0">{s.to}</span>
                      <span className="flex-1 text-right font-black text-neutral-800 text-sm">₹{s.amount.toLocaleString()}</span>
                      {isPaid ? (
                        <div className="flex items-center gap-1 text-emerald-500 shrink-0 ml-1">
                          <CheckCircle2 className="w-4 h-4"/>
                          <span className="text-[10px] font-black">Paid</span>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 shrink-0 ml-1">
                          <a href={`upi://pay?pa=vayo@okaxis&pn=${encodeURIComponent(s.to)}&am=${s.amount}&cu=INR`}
                            className="flex items-center gap-1 bg-teal-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-teal-600 transition-colors cursor-pointer">
                            <Smartphone className="w-3 h-3"/> UPI
                          </a>
                          <a href={waLink(s.from,s.to,s.amount)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:opacity-90 cursor-pointer">
                            <MessageCircle className="w-3 h-3"/> WA
                          </a>
                          <button onClick={()=>togglePaid(key)}
                            className="flex items-center gap-1 border border-emerald-300 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 cursor-pointer">
                            <CheckCircle2 className="w-3 h-3"/> Done
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Share */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-500"/>
            <span className="font-bold text-[12px] text-blue-600 uppercase tracking-widest flex-1">Share Event Split</span>
            <button onClick={()=>setShowQR(v=>!v)} className="p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors" title="QR code">
              <QrCode className="w-4 h-4 text-neutral-400"/>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
            <span className="flex-1 text-[11px] font-semibold text-neutral-400 truncate">{pageUrl}</span>
            <button onClick={copyLink} className="flex items-center gap-1 text-[11px] font-black text-teal-500 hover:text-teal-600 cursor-pointer shrink-0">
              {copiedLink?<Check className="w-3.5 h-3.5 text-emerald-500"/>:<Copy className="w-3.5 h-3.5"/>}
              {copiedLink?"Copied!":"Copy"}
            </button>
          </div>
          {showQR && (
            <div className="flex justify-center py-2">
              <div className="p-3 bg-white border border-neutral-200 rounded-2xl shadow-md">
                <QRCodeSVG value={pageUrl} size={140} level="M" includeMargin={false}/>
                <p className="text-center text-[10px] text-neutral-400 font-bold mt-2">Scan to open split</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-neutral-300 font-medium pb-8">
          Powered by <span className="font-black text-teal-500">VAYO</span> · No more awkward money talks
        </p>
      </div>

      {showAddModal && members.length>0 && (
        <AddExpenseModal members={members} onAdd={addExpense} onClose={()=>setShowAddModal(false)}/>
      )}
    </div>
  );
}
