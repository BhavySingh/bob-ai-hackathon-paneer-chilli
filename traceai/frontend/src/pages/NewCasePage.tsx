import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Info, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

const STEPS = [
  { label: 'Basic Info', icon: User },
  { label: 'Physical', icon: User },
  { label: 'Last Known', icon: MapPin },
  { label: 'Additional', icon: Info },
];

const initial = {
  full_name: '', age: '', gender: 'Male', date_of_birth: '', phone: '', emergency_contact: '', photo_url: '',
  height: '', weight: '', build: '', hair_color: '', eye_color: '', complexion: '', identifying_marks: '',
  last_seen_date: '', last_seen_time: '', last_seen_location: '', last_seen_clothing: '', last_seen_possessions: '', known_destinations: '',
  medical_notes: '', known_contacts: '', usual_locations: '', additional_info: '',
  priority: 'medium',
};

export default function NewCasePage() {
  const navigate = useNavigate();
  const { add, ToastPortal } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      priority: form.priority,
      missing_person: {
        ...form,
        age: parseInt(form.age) || 0,
      },
    };
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        add('Case created successfully!', 'success');
        navigate(`/cases/${data.case_id}`);
      } else {
        throw new Error('API error');
      }
    } catch {
      // demo mode – generate local mock
      const caseId = `MP-2026-${String(Date.now()).slice(-3)}`;
      add('Case created (demo mode)', 'success');
      navigate(`/cases/MP-2026-001`);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, type = 'text', placeholder = '', required = false }: { label: string; k: string; type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input
        type={type}
        value={(form as any)[k]}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        required={required}
      />
    </div>
  );

  const Textarea = ({ label, k, placeholder = '' }: { label: string; k: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <textarea
        value={(form as any)[k]}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
      />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastPortal />
      <h1 className="text-xl font-bold text-white mb-6">Create New Case</h1>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${i === step ? 'text-blue-400' : i < step ? 'text-green-400' : 'text-slate-500'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs
                ${i === step ? 'border-blue-500 bg-blue-500/20 text-blue-400' : i < step ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-slate-600 text-slate-500'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-500/40' : 'bg-slate-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" k="full_name" placeholder="Rahul Sharma" required />
              <Field label="Age" k="age" type="number" placeholder="21" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Gender <span className="text-red-400">*</span></label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <Field label="Date of Birth" k="date_of_birth" type="date" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone Number" k="phone" placeholder="9876543210" />
              <Field label="Emergency Contact" k="emergency_contact" placeholder="Name – Number" />
            </div>
            <Field label="Photo URL (optional)" k="photo_url" placeholder="https://..." />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="low">Low</option><option value="medium">Medium</option>
                <option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white mb-4">Physical Description</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Height" k="height" placeholder="5ft 9in" />
              <Field label="Weight" k="weight" placeholder="65 kg" />
              <Field label="Build" k="build" placeholder="Slim / Athletic / Medium" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Hair Color" k="hair_color" placeholder="Black" />
              <Field label="Eye Color" k="eye_color" placeholder="Brown" />
              <Field label="Complexion" k="complexion" placeholder="Fair / Medium / Dark" />
            </div>
            <Textarea label="Identifying Marks, Scars, Tattoos" k="identifying_marks" placeholder="Small scar on left cheek; eagle tattoo on right forearm..." />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white mb-4">Last Known Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Last Seen Date" k="last_seen_date" type="date" required />
              <Field label="Last Seen Time" k="last_seen_time" type="time" required />
            </div>
            <Field label="Last Seen Location" k="last_seen_location" placeholder="Surat Railway Station, Platform 3" required />
            <Textarea label="Clothing Description" k="last_seen_clothing" placeholder="Blue cotton shirt, black jeans, white sports shoes..." />
            <Textarea label="Personal Possessions" k="last_seen_possessions" placeholder="Black backpack, phone, wallet..." />
            <Textarea label="Known Destinations" k="known_destinations" placeholder="Adajan area, university campus..." />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white mb-4">Additional Information</h2>
            <Textarea label="Medical Notes (if relevant)" k="medical_notes" placeholder="No known conditions / mild asthma..." />
            <Textarea label="Known Contacts" k="known_contacts" placeholder="Friends, classmates, colleagues..." />
            <Textarea label="Usual Locations / Routines" k="usual_locations" placeholder="Common hangout spots, routes..." />
            <Textarea label="Additional Family-Provided Information" k="additional_info" placeholder="Anything else relevant to the investigation..." />
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <Button
            variant="secondary"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/cases')}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button icon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button loading={loading} onClick={handleSubmit}>
              Create Case
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
