"use client";
import React, { useState, useMemo } from "react";
import {
  Plus, Receipt, Users, ArrowRight, CheckCircle2, Smartphone,
  X, ChevronDown, ChevronUp, Trash2, IndianRupee,
  SplitSquareHorizontal, PartyPopper, ChevronLeft, Calendar, UserPlus
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Drinks", "Transport", "Stay", "Activities", "Misc"];
const CAT_EMOJI   = { Food:"🍽️", Drinks:"🥤", Transport:"🚗", Stay:"🏠", Activities:"🎯", Misc:"📦" };
const CAT_COLORS  = { Food:"bg-orange-100 text-orange-600", Drinks:"bg-purple-100 text-purple-600",
  Transport:"bg-sky-100 text-sky-600", Stay:"bg-emerald-100 text-emerald-600",
  Activities:"bg-pink-100 text-pink-600", Misc:"bg-slate-100 text-slate-600" };

const AV_GRADIENTS = [
  "from-[#4893C6] to-[#64A4CE]","from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400","from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400","from-sky-500 to-cyan-400",
];
const avatarGrad = (name) => {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AV_GRADIENTS[h % AV_GRADIENTS.length];
};
const initials = (name) => name.slice(0,2).toUpperCase();

// ─── greedy settle ─────────────────────────────────────────────────────────────
function calcSplits(expenses, members) {
  if (!members.length || !expenses.length) return [];
  const net = Object.fromEntries(members.map(m => [m, 0]));
  expenses.forEach(exp => {
    const share = exp.amount / members.length;
    members.forEach(m => { net[m] -= share; });
    net[exp.paidBy] += exp.amount;
  });
  const cr = Object.entries(net).filter(([,v])=>v>0.01).sort((a,b)=>b[1]-a[1]).map(([n,v])=>[n,v]);
  const dr = Object.entries(net).filter(([,v])=>v<-0.01).sort((a,b)=>a[1]-b[1]).map(([n,v])=>[n,-v]);
  const out = []; let ci=0,di=0;
  while (ci<cr.length && di<dr.length) {
    const amt = Math.min(cr[ci][1], dr[di][1]);
    if (amt>0.01) out.push({ from:dr[di][0], to:cr[ci][0], amount:Math.round(amt) });
    cr[ci][1]-=amt; dr[di][1]-=amt;
    if (cr[ci][1]<0.01) ci++; if (dr[di][1]<0.01) di++;
  }
  return out;
}

// ─── Avatar chip ──────────────────────────────────────────────────────────────
function Avatar({ name, size="md" }) {
  const s = size==="sm" ? "w-6 h-6 text-[8px]" : size==="lg" ? "w-10 h-10 text-xs" : "w-8 h-8 text-[10px]";
  return (
    <div className={`${s} rounded-full bg-gradient-to-br ${avatarGrad(name)} flex items-center justify-center text-white font-black shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ─── Step 1: Home / event list ─────────────────────────────────────────────────
function HomeScreen({ events, onOpen, onCreate }) {
  return (
    <div className="min-h-screen bg-[#E2EFF6]">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-[#4893C6] to-[#2e6fa3] pt-10 pb-16 px-5 text-white">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <SplitSquareHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">VAYO</p>
            <h1 className="font-black text-lg leading-tight tracking-tight">Splits</h1>
          </div>
        </div>
        <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xs">
          Track shared expenses during events. Split fairly. Settle with one tap.
        </p>
      </div>

      {/* Card lifted over header */}
      <div className="px-4 -mt-8 space-y-3">
        {/* Create new */}
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-4 bg-white rounded-[1.5rem] p-5 shadow-lg border-2 border-dashed border-[#4893C6]/30 hover:border-[#4893C6] transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#4893C6]/10 group-hover:bg-[#4893C6]/20 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-[#4893C6]" />
          </div>
          <div className="text-left">
            <p className="font-black text-slate-800 text-sm">New Split Event</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Create a group and add expenses</p>
          </div>
        </button>

        {/* Past events */}
        {events.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 pt-2">Recent Events</p>
            {events.map(ev => {
              const total = ev.expenses.reduce((s,e)=>s+e.amount,0);
              const settled = ev.settlements.every(s=>ev.paid[`${s.from}-${s.to}`]);
              return (
                <button key={ev.id} onClick={()=>onOpen(ev.id)}
                  className="w-full flex items-center gap-4 bg-white rounded-[1.5rem] p-4 shadow-sm border border-[#B7D7EA]/50 hover:shadow-md hover:border-[#4893C6]/40 transition-all cursor-pointer text-left"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#E2EFF6] flex items-center justify-center text-xl shrink-0">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{ev.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{ev.members.length} people · {ev.expenses.length} expenses</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-800 text-sm">₹{total.toLocaleString()}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${settled ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {settled ? "Settled" : "Pending"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-8">
          <div className="text-5xl mb-4">🎲</div>
          <p className="font-black text-slate-600 text-sm">No split events yet</p>
          <p className="text-slate-400 text-xs font-medium mt-1">Create one above to get started</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Create event wizard ──────────────────────────────────────────────
function CreateScreen({ onDone, onBack }) {
  const [step, setStep] = useState(1); // 1=name, 2=members
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [input, setInput] = useState("");

  const addMember = () => {
    const v = input.trim();
    if (v && !members.includes(v) && members.length < 12) {
      setMembers(m => [...m, v]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#E2EFF6] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#B7D7EA]/50 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={step===1?onBack:()=>setStep(1)} className="p-1.5 rounded-xl hover:bg-[#E2EFF6] cursor-pointer transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <p className="font-black text-slate-800 text-sm">New Split Event</p>
          <p className="text-[10px] text-slate-400 font-medium">Step {step} of 2</p>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-[#4893C6]" />
          <div className={`w-6 h-1.5 rounded-full transition-colors ${step===2?"bg-[#4893C6]":"bg-[#B7D7EA]"}`} />
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-black text-slate-800 text-xl">Name your event</h2>
              <p className="text-slate-400 text-sm mt-1">What are you splitting for?</p>
            </div>
            <input
              autoFocus
              type="text" placeholder="e.g. Goa Trip, Dinner at Mylapore…"
              value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&name.trim()&&setStep(2)}
              maxLength={50}
              className="w-full bg-white border-2 border-[#B7D7EA]/60 rounded-2xl px-5 py-4 text-base font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#4893C6] transition-colors shadow-sm"
            />
            {/* Quick templates */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Quick templates</p>
              <div className="flex flex-wrap gap-2">
                {["Goa Trip 🏖️","Board Game Night 🎲","Dinner 🍽️","Trek 🏔️","Movie Night 🎬","House Party 🏠"].map(t=>(
                  <button key={t} onClick={()=>setName(t.replace(/ [^\w]/g,"").trim())}
                    className="px-3 py-1.5 bg-white border border-[#B7D7EA]/60 rounded-full text-xs font-bold text-slate-600 hover:border-[#4893C6] hover:text-[#4893C6] transition-colors cursor-pointer shadow-sm"
                  >{t}</button>
                ))}
              </div>
            </div>
            <button
              disabled={!name.trim()}
              onClick={()=>setStep(2)}
              className="w-full py-4 bg-gradient-to-r from-[#4893C6] to-[#64A4CE] text-white rounded-2xl font-black text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 cursor-pointer transition-opacity flex items-center justify-center gap-2"
            >
              Next — Add Members <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="text-5xl mb-3">👥</div>
              <h2 className="font-black text-slate-800 text-xl">Who's splitting?</h2>
              <p className="text-slate-400 text-sm mt-1">Add everyone who shared expenses</p>
            </div>

            {/* Member chips */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#B7D7EA]/40 min-h-[72px]">
              {members.length === 0 ? (
                <p className="text-slate-300 text-xs font-medium text-center py-3">Add at least 2 people</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <div key={m} className="flex items-center gap-1.5 bg-[#E2EFF6] border border-[#B7D7EA]/50 rounded-full pl-1 pr-2.5 py-1">
                      <Avatar name={m} size="sm" />
                      <span className="text-xs font-bold text-slate-700">{m}</span>
                      <button onClick={()=>setMembers(ms=>ms.filter(x=>x!==m))} className="text-slate-300 hover:text-rose-400 cursor-pointer transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add member input */}
            <div className="flex gap-2">
              <input
                autoFocus
                type="text" placeholder="Enter name…" maxLength={20}
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addMember()}
                className="flex-1 bg-white border-2 border-[#B7D7EA]/60 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#4893C6] transition-colors shadow-sm"
              />
              <button onClick={addMember}
                className="bg-[#4893C6] text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-[#64A4CE] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <button
              disabled={members.length < 2}
              onClick={()=>onDone(name.trim(), members)}
              className="w-full py-4 bg-gradient-to-r from-[#4893C6] to-[#64A4CE] text-white rounded-2xl font-black text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 cursor-pointer transition-opacity flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-4 h-4" /> Create Event &amp; Start Splitting
            </button>
            {members.length < 2 && <p className="text-center text-[11px] text-slate-400">Add at least 2 members to continue</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Expense Modal ─────────────────────────────────────────────────────────
function AddExpenseModal({ members, onAdd, onClose }) {
  const [desc, setDesc]       = useState("");
  const [amount, setAmount]   = useState("");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy]   = useState(members[0]);

  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!desc.trim() || isNaN(amt) || amt <= 0) return;
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
          {/* Amount */}
          <div className="flex items-center gap-2 bg-[#E2EFF6] rounded-2xl px-4 py-3">
            <IndianRupee className="w-5 h-5 text-[#4893C6] shrink-0"/>
            <input type="number" min="1" step="0.01" placeholder="0.00" required
              value={amount} onChange={e=>setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-black text-slate-800 placeholder:text-slate-300 outline-none w-full"/>
          </div>

          {/* Description */}
          <input type="text" placeholder="What was it for?" required maxLength={60}
            value={desc} onChange={e=>setDesc(e.target.value)}
            className="w-full bg-[#E2EFF6]/60 border-2 border-[#B7D7EA]/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#4893C6] transition-colors"/>

          {/* Category */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={()=>setCategory(cat)}
                className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${category===cat?"bg-[#4893C6] text-white shadow-md":"bg-[#E2EFF6] text-slate-500 hover:bg-[#B7D7EA]/60"}`}>
                {CAT_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Paid by */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Paid by</p>
            <div className="flex gap-2 flex-wrap">
              {members.map(m => (
                <button key={m} type="button" onClick={()=>setPaidBy(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${paidBy===m?"bg-[#4893C6] text-white shadow-md":"bg-[#E2EFF6] text-slate-600 hover:bg-[#B7D7EA]/60"}`}>
                  <Avatar name={m} size="sm"/>
                  {m}
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

// ─── Step 3: Event detail (expenses + settle) ──────────────────────────────────
function EventScreen({ event, onUpdate, onBack }) {
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showExpenses, setShowExpenses]   = useState(true);
  const [showMembers, setShowMembers]     = useState(false);
  const [newMember, setNewMember]         = useState("");

  const { name, members, expenses, paid } = event;
  const total    = expenses.reduce((s,e)=>s+e.amount, 0);
  const perHead  = members.length ? Math.round(total/members.length) : 0;
  const settlements = useMemo(()=>calcSplits(expenses,members),[expenses,members]);
  const allSettled  = settlements.length>0 && settlements.every(s=>paid[`${s.from}-${s.to}`]);

  const addExpense = (exp) => onUpdate({ ...event, expenses:[...expenses,exp] });
  const removeExpense = (id) => onUpdate({ ...event, expenses:expenses.filter(e=>e.id!==id) });
  const togglePaid = (key) => onUpdate({ ...event, paid:{ ...paid, [key]:!paid[key] } });
  const addMember = () => {
    const v = newMember.trim();
    if (v && !members.includes(v)) { onUpdate({...event, members:[...members,v]}); setNewMember(""); }
  };
  const removeMember = (m) => onUpdate({...event, members:members.filter(x=>x!==m), expenses:expenses.filter(e=>e.paidBy!==m)});

  return (
    <div className="min-h-screen bg-[#E2EFF6]">
      {/* Sticky header */}
      <div className="bg-white border-b border-[#B7D7EA]/50 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-[#E2EFF6] cursor-pointer transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500"/>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm truncate">{name}</p>
          <p className="text-[10px] text-slate-400 font-medium">{members.length} people · ₹{total.toLocaleString()} total</p>
        </div>
        <button onClick={()=>setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#4893C6] text-white text-xs font-black px-4 py-2 rounded-full shadow-md hover:bg-[#64A4CE] transition-colors cursor-pointer shrink-0">
          <Plus className="w-3.5 h-3.5"/> Add
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Summary card */}
        <div className="bg-gradient-to-br from-[#4893C6] to-[#2e6fa3] rounded-[1.75rem] p-5 text-white shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {[{label:"Total",value:`₹${total.toLocaleString()}`},{label:"Per Head",value:`₹${perHead}`},{label:"Expenses",value:expenses.length}].map(({label,value})=>(
              <div key={label} className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                <p className="text-base font-black">{value}</p>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Member avatars row */}
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
        </div>

        {/* Members (collapsible) */}
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
              <div className="flex flex-wrap gap-2">
                {members.map(m=>(
                  <div key={m} className="flex items-center gap-1.5 bg-[#E2EFF6] border border-[#B7D7EA]/50 rounded-full pl-1 pr-2.5 py-1">
                    <Avatar name={m} size="sm"/><span className="text-xs font-bold text-slate-700">{m}</span>
                    <button onClick={()=>removeMember(m)} className="text-slate-300 hover:text-rose-400 cursor-pointer ml-0.5 transition-colors"><X className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newMember} onChange={e=>setNewMember(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()}
                  placeholder="Add member…" maxLength={20}
                  className="flex-1 bg-[#E2EFF6]/60 border border-[#B7D7EA]/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#4893C6] transition-colors"/>
                <button onClick={addMember} className="bg-[#4893C6] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#64A4CE] transition-colors cursor-pointer">Add</button>
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
                  <button onClick={()=>setShowAddModal(true)}
                    className="mt-3 text-[#4893C6] text-xs font-black border border-[#4893C6]/30 px-4 py-1.5 rounded-full hover:bg-[#E2EFF6] transition-colors cursor-pointer">
                    + Add First Expense
                  </button>
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
                      <span className="text-[10px] text-slate-300">·</span>
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
                return (
                  <div key={i} className={`flex items-center gap-2 px-4 py-4 transition-colors ${isPaid?"bg-emerald-50/60":""}`}>
                    <Avatar name={s.from}/>
                    <span className="text-xs font-bold text-slate-700 shrink-0">{s.from}</span>
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
                        <button onClick={()=>{ const u=`upi://pay?pa=vayo@okaxis&pn=${encodeURIComponent(s.to)}&am=${s.amount}&cu=INR`; window.open(u,"_blank"); }}
                          className="flex items-center gap-1 bg-[#4893C6] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-[#64A4CE] transition-colors cursor-pointer shadow-sm">
                          <Smartphone className="w-3 h-3"/> UPI
                        </button>
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

      {showAddModal && (
        <AddExpenseModal members={members} onAdd={addExpense} onClose={()=>setShowAddModal(false)}/>
      )}
    </div>
  );
}

// ─── Root orchestrator ─────────────────────────────────────────────────────────
export default function SplitsApp() {
  const [screen, setScreen]   = useState("home"); // home | create | event
  const [events, setEvents]   = useState([]);
  const [activeId, setActiveId] = useState(null);

  const activeEvent = events.find(e=>e.id===activeId);

  const createEvent = (name, members) => {
    const ev = { id: Date.now(), name, members, expenses: [], paid: {}, settlements: [] };
    setEvents(evs=>[ev,...evs]);
    setActiveId(ev.id);
    setScreen("event");
  };

  const updateEvent = (updated) => {
    const settlements = calcSplits(updated.expenses, updated.members);
    setEvents(evs=>evs.map(e=>e.id===updated.id?{...updated,settlements}:e));
  };

  if (screen==="create") return <CreateScreen onDone={createEvent} onBack={()=>setScreen("home")}/>;
  if (screen==="event" && activeEvent) return (
    <EventScreen event={activeEvent} onUpdate={updateEvent} onBack={()=>setScreen("home")}/>
  );
  return (
    <HomeScreen
      events={events}
      onCreate={()=>setScreen("create")}
      onOpen={(id)=>{ setActiveId(id); setScreen("event"); }}
    />
  );
}
