import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-white">Settings</h1>
      <Card>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" />Profile</h2>
        <div className="space-y-3 text-sm">
          <div><p className="text-slate-500 text-xs">Name</p><p className="text-white">{user?.name}</p></div>
          <div><p className="text-slate-500 text-xs">Email / Officer ID</p><p className="text-white">{user?.email}</p></div>
          <div><p className="text-slate-500 text-xs">Role</p><p className="text-white">{user?.role}</p></div>
          <div><p className="text-slate-500 text-xs">Badge Number</p><p className="text-white">{user?.badge_number || 'N/A'}</p></div>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" />About TRACEAI</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Version: 1.0.0 – Hackathon Release</p>
          <p>Problem Statement: 07 – Missing Person Investigation Assistant</p>
          <p>Event: IBM Bob × NFSU Hackathon 2026</p>
          <p className="text-xs text-amber-400 mt-3">⚠ This is a demonstration prototype. Not for operational law enforcement use. AI-generated results require human investigator verification.</p>
        </div>
      </Card>
    </div>
  );
}
