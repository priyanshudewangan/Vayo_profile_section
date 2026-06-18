import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export default function SecurityTab({ theme, emailParam, sessionEmail, triggerToast }) {
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });

  const handleUpdatePassword = async () => {
    if (!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm) return;
    
    const email = emailParam || sessionEmail;
    
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          currentPassword: pwdForm.current,
          newPassword: pwdForm.next
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPwdForm({ current: '', next: '', confirm: '' });
        setShowChangePwd(false);
        triggerToast('Password updated successfully!');
      } else {
        triggerToast(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error("Error updating password:", err);
      triggerToast('Network error while updating password.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Change Password Form */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Lock className={`w-3.5 h-3.5 ${theme.textAccent}`} />
            <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Change Password</span>
          </div>
          <button onClick={() => setShowChangePwd(p => !p)} className={`text-[10px] font-bold ${theme.textAccent} hover:underline cursor-pointer`}>
            {showChangePwd ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className={`p-4 space-y-3 transition-all ${showChangePwd ? 'block' : 'hidden'}`}>
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'next', label: 'New Password', placeholder: 'Minimum 8 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
          ].map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider">{field.label}</label>
              <div className="relative flex items-center">
                <input
                  type={showPwd[field.key] ? 'text' : 'password'}
                  value={pwdForm[field.key]}
                  onChange={e => setPwdForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className={`w-full text-xs border rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`}
                  placeholder={field.placeholder}
                />
                <button
                  onClick={() => setShowPwd(p => ({ ...p, [field.key]: !p[field.key] }))}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                  {showPwd[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
          {pwdForm.next && pwdForm.confirm && pwdForm.next !== pwdForm.confirm && (
            <p className="text-[10.5px] text-red-500 font-semibold">Passwords do not match</p>
          )}
          <button
            onClick={handleUpdatePassword}
            disabled={!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm}
            className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white disabled:opacity-40 cursor-pointer mt-1"
            style={{ background: theme.accent }}>
            Update Password
          </button>
        </div>
      </div>

      {/* Security Settings Switches */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center gap-2`}>
          <ShieldCheck className={`w-3.5 h-3.5 ${theme.textAccent}`} />
          <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Security Settings</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {[
            { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', enabled: false },
            { label: 'Login Notifications', desc: 'Get notified whenever a new sign-in occurs', enabled: true },
            { label: 'Remember Trusted Devices', desc: 'Stay logged in for 30 days on this device', enabled: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex-1 mr-4">
                <div className="text-[11.5px] font-bold text-neutral-700">{item.label}</div>
                <div className="text-[10.5px] text-neutral-500 font-medium mt-0.5">{item.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-not-allowed ${item.enabled ? theme.bgAccent : 'bg-neutral-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-100 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
          <X className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-extrabold text-red-500 uppercase tracking-wider">Danger Zone</span>
        </div>
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11.5px] font-bold text-neutral-700">Deactivate Account</div>
            <div className="text-[10.5px] text-neutral-500 font-medium mt-0.5">Temporarily hide your profile from the community</div>
          </div>
          <button
            onClick={() => triggerToast('Account deactivation is disabled in demo mode')}
            className="shrink-0 text-[10px] font-bold px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}
