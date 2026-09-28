import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Search, Users, Camera, Zap, FileText, Map, Clock,
  ChevronRight, AlertTriangle, ArrowRight, Eye, Target, TrendingUp
} from 'lucide-react';

const FEATURES = [
  { icon: <Shield className="w-6 h-6" />, title: 'Case Management', desc: 'Create and manage missing-person cases with structured data collection across all evidence types.' },
  { icon: <Users className="w-6 h-6" />, title: 'Family Information', desc: 'Capture comprehensive family-provided details, routines, and personal information securely.' },
  { icon: <Search className="w-6 h-6" />, title: 'Investigator Tips', desc: 'Log field tips, witness reports, and community information with source-type tagging.' },
  { icon: <Camera className="w-6 h-6" />, title: 'CCTV Sighting Correlation', desc: 'Record mock CCTV textual descriptions and correlate with case data across time and location.' },
  { icon: <Zap className="w-6 h-6" />, title: 'AI Lead Prioritization', desc: 'Deterministic AI engine scores leads on clothing, age, location, time, and description matching.' },
  { icon: <Clock className="w-6 h-6" />, title: 'Investigation Timeline', desc: 'Visual chronological timeline of all events, sightings, tips, and AI-generated milestones.' },
  { icon: <Map className="w-6 h-6" />, title: 'Location Map', desc: 'Interactive investigation map showing last known location, sightings, and witness tip locations.' },
  { icon: <Target className="w-6 h-6" />, title: 'Recommended Actions', desc: 'Each AI-generated lead includes specific investigator-facing recommended next steps.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Public Appeal Generator', desc: 'Auto-populated public missing-person notice ready for review and distribution.' },
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Police Case File', desc: 'Structured AI-assisted police case file report. Requires investigator verification before use.' },
];

const STEPS = [
  { n: '01', title: 'Create Case', desc: 'Register the missing-person case with personal details, physical description, and last known information.' },
  { n: '02', title: 'Add Information', desc: 'Add family statements, investigator field tips, and CCTV sighting descriptions.' },
  { n: '03', title: 'AI Correlation', desc: 'The AI engine matches clothing, age, locations, timestamps, and descriptions across all sources.' },
  { n: '04', title: 'Prioritize Leads', desc: 'Scored leads ranked from CRITICAL to LOW with transparent factor breakdown.' },
  { n: '05', title: 'Generate Reports', desc: 'Produce a public appeal notice and structured police case file for investigator review.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-200">
      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#070d1a]/95 backdrop-blur-md border-b border-slate-700/50' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-auto">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-wide">TRACE<span className="text-blue-400">AI</span></span>
          </div>
          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-sm border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left copy */}
          <div className="fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-6">
              <Shield className="w-3 h-3" />
              IBM Bob × NFSU Hackathon 2026
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Turning Missing-Person Information Into{' '}
              <span className="gradient-text">Actionable Leads.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              TRACEAI is an AI-powered investigation support platform that helps investigators correlate
              family information, field tips, and CCTV sightings to prioritize leads and accelerate case coordination.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Start Investigation
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg font-semibold text-sm transition-all"
              >
                Explore How It Works
              </a>
            </div>
          </div>

          {/* Right – workflow visualization */}
          <div className="hidden lg:block fade-in">
            <WorkflowViz />
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ─────────────────────────────────────────────────────── */}
      <div className="bg-amber-500/5 border-y border-amber-500/20 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 text-xs text-amber-400/80">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>TRACEAI</strong> is an investigation-support prototype developed for the IBM Bob × NFSU Hackathon.
            AI-generated leads and recommendations are not proof and must be verified by authorized investigators.
          </span>
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">A complete end-to-end investigation workflow from case creation to actionable reports.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              <div className="glass rounded-xl p-5 card-hover h-full">
                <div className="text-3xl font-bold text-blue-500/30 mb-3">{step.n}</div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2.5 z-10 -translate-y-1/2">
                  <ChevronRight className="w-5 h-5 text-blue-500/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every component of the investigation workflow is covered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass rounded-xl p-5 card-hover">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / CTA ────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <div className="glass rounded-2xl p-12 max-w-3xl mx-auto">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">About TRACEAI</h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            TRACEAI addresses Problem Statement 07 of the IBM Bob × NFSU Hackathon:{' '}
            <em>"Missing Person Investigation Assistant"</em>. It demonstrates how AI-assisted lead
            correlation can support investigators in organizing information and identifying actionable
            investigative priorities — while clearly requiring human verification before any action.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            Demo the Platform
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-700/50 py-8 text-center text-xs text-slate-500">
        <p>TRACEAI — IBM Bob × NFSU Hackathon 2026 | Problem Statement 07: Missing Person Investigation Assistant</p>
        <p className="mt-1">Demo application. AI-generated results are decision-support only and require human investigator verification.</p>
      </footer>
    </div>
  );
}

function WorkflowViz() {
  const nodes = [
    { label: 'Missing Person', color: '#3b82f6', icon: '👤' },
    { label: 'Family Information', color: '#6366f1', icon: '👨‍👩‍👦' },
    { label: 'Investigator Tips', color: '#8b5cf6', icon: '📋' },
    { label: 'CCTV Sightings', color: '#0ea5e9', icon: '📹' },
    { label: 'AI Correlation', color: '#06b6d4', icon: '🔗' },
    { label: 'Prioritized Leads', color: '#10b981', icon: '🎯' },
  ];
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600/0 via-blue-500/30 to-green-500/0 -translate-x-1/2" />
      {nodes.map((n, i) => (
        <div
          key={i}
          className="relative w-64 glass rounded-xl px-5 py-3 flex items-center gap-3 slide-up"
          style={{ animationDelay: `${i * 0.1}s`, borderColor: `${n.color}30` }}
        >
          <span className="text-lg">{n.icon}</span>
          <span className="text-sm font-medium text-slate-200">{n.label}</span>
          <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
        </div>
      ))}
    </div>
  );
}
