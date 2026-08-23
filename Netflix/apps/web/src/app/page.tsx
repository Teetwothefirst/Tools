'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, X, Tv, Download, Monitor, Smile, Globe } from 'lucide-react';

const faqItems = [
  {
    question: 'What is StreamFlix?',
    answer:
      'StreamFlix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want without a single commercial – all for one low monthly price.',
  },
  {
    question: 'How much does StreamFlix cost?',
    answer:
      'Watch StreamFlix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $9.99 to $19.99 a month. No extra costs, no contracts.',
  },
  {
    question: 'Where can I watch?',
    answer:
      'Watch anywhere, anytime. Sign in with your StreamFlix account to watch instantly on the web at streamflix.com from your personal computer or on any internet-connected device that offers the StreamFlix app, including smart TVs, smartphones, tablets, streaming media players, and game consoles.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'StreamFlix is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.',
  },
  {
    question: 'What can I watch on StreamFlix?',
    answer:
      'StreamFlix has an extensive library of feature films, documentaries, TV shows, anime, award-winning StreamFlix originals, and more. Watch as much as you want, anytime you want.',
  },
  {
    question: 'Is StreamFlix good for kids?',
    answer:
      'The StreamFlix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles.',
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/register?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/register');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white font-sans overflow-x-hidden selection:bg-netflix-red selection:text-white">
      {/* HERO SECTION */}
      <div className="relative min-h-[90vh] flex flex-col justify-between border-b-8 border-[#232323] overflow-hidden">
        {/* Backdrop Background Image with Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black" />

        {/* Top Header Nav */}
        <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-3xl sm:text-4xl tracking-wider text-netflix-red font-['Outfit'] group-hover:scale-105 transition-transform drop-shadow-lg">
              STREAMFLIX
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-black/60 border border-white/30 rounded px-3 py-1 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-gray-300" />
              <select className="bg-transparent text-white focus:outline-none cursor-pointer">
                <option value="en" className="bg-black">English</option>
                <option value="es" className="bg-black">Español</option>
                <option value="fr" className="bg-black">Français</option>
              </select>
            </div>

            <Link
              href="/login"
              className="bg-netflix-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded transition-all shadow-lg hover:shadow-netflix-red/40"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Central Marketing Banner */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 py-16 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
          <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight leading-tight max-w-3xl drop-shadow-2xl">
            Unlimited movies, TV shows, and more.
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-gray-200">
            Watch anywhere. Cancel anytime.
          </p>

          <form onSubmit={handleGetStarted} className="w-full max-w-2xl space-y-4 pt-4">
            <p className="text-sm sm:text-base text-gray-300 font-normal">
              Ready to watch? Enter your email to create or restart your membership.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full sm:flex-1 bg-black/70 border border-gray-600 focus:border-white rounded px-5 py-4 text-white text-base focus:outline-none backdrop-blur-sm transition-all"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-netflix-red hover:bg-red-700 text-white font-bold text-lg sm:text-2xl px-8 py-3.5 rounded flex items-center justify-center gap-2 transition-all shadow-xl shadow-netflix-red/30 group"
              >
                Get Started
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Decorative Curve Line */}
        <div className="relative z-20 w-full h-4" />
      </div>

      {/* FEATURE CARDS SECTION */}
      <div className="divide-y-8 divide-[#232323]">
        {/* Feature 1: Enjoy on your TV */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit']">Enjoy on your TV</h2>
            <p className="text-base sm:text-xl text-gray-300">
              Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.
            </p>
          </div>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800"
                alt="Smart TV Streaming"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <Tv className="w-8 h-8 text-netflix-red" />
                  <span className="font-bold text-sm tracking-wide">StreamFlix Smart TV App</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Download your shows */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:flex-row-reverse">
          <div className="order-2 md:order-1 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800"
                alt="Mobile Download"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 border border-white/20 rounded-lg p-3 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Cyber Sentinel: 2099</p>
                    <p className="text-[10px] text-blue-400 font-semibold">Downloading...</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-netflix-red animate-bounce" />
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit']">Download your shows to watch offline</h2>
            <p className="text-base sm:text-xl text-gray-300">
              Save your favorites easily and always have something to watch when you are on the go.
            </p>
          </div>
        </section>

        {/* Feature 3: Watch everywhere */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit']">Watch everywhere</h2>
            <p className="text-base sm:text-xl text-gray-300">
              Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV without paying more.
            </p>
          </div>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"
                alt="Multi-device"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-amber-400" />
                  <span className="font-bold text-sm tracking-wide">Multi-Device Synchronized Progress</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Create profiles for kids */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="order-2 md:order-1 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800"
                alt="Kids Characters"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <Smile className="w-8 h-8 text-emerald-400" />
                  <span className="font-bold text-sm tracking-wide">StreamFlix Kids Safe Mode</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit']">Create profiles for kids</h2>
            <p className="text-base sm:text-xl text-gray-300">
              Send kids on adventures with their favorite characters in a space made just for them — free with your membership.
            </p>
          </div>
        </section>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-b-8 border-[#232323] space-y-12">
        <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-lg sm:text-2xl font-semibold text-white focus:outline-none"
                >
                  <span>{item.question}</span>
                  {isOpen ? <X className="w-8 h-8 shrink-0 text-netflix-red" /> : <Plus className="w-8 h-8 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-6 pt-0 text-base sm:text-xl text-gray-300 leading-relaxed border-t border-white/10 font-normal">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Email Signup Form repeated at bottom */}
        <form onSubmit={handleGetStarted} className="w-full max-w-2xl mx-auto space-y-4 pt-8 text-center">
          <p className="text-sm sm:text-base text-gray-300">
            Ready to watch? Enter your email to create or restart your membership.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full sm:flex-1 bg-black/70 border border-gray-600 focus:border-white rounded px-5 py-4 text-white text-base focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-netflix-red hover:bg-red-700 text-white font-bold text-lg sm:text-2xl px-8 py-3.5 rounded flex items-center justify-center gap-2 transition-all shadow-xl shadow-netflix-red/30 group"
            >
              Get Started
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 max-w-7xl mx-auto text-xs text-gray-500 space-y-8">
        <p className="hover:underline cursor-pointer text-sm text-gray-400">Questions? Call 1-800-012-3456</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-3">
            <p className="hover:underline cursor-pointer">FAQ</p>
            <p className="hover:underline cursor-pointer">Investor Relations</p>
            <p className="hover:underline cursor-pointer">Privacy</p>
            <p className="hover:underline cursor-pointer">Speed Test</p>
          </div>
          <div className="space-y-3">
            <p className="hover:underline cursor-pointer">Help Center</p>
            <p className="hover:underline cursor-pointer">Jobs</p>
            <p className="hover:underline cursor-pointer">Cookie Preferences</p>
            <p className="hover:underline cursor-pointer">Legal Notices</p>
          </div>
          <div className="space-y-3">
            <p className="hover:underline cursor-pointer">Account</p>
            <p className="hover:underline cursor-pointer">Ways to Watch</p>
            <p className="hover:underline cursor-pointer">Corporate Information</p>
            <p className="hover:underline cursor-pointer">Only on StreamFlix</p>
          </div>
          <div className="space-y-3">
            <p className="hover:underline cursor-pointer">Media Center</p>
            <p className="hover:underline cursor-pointer">Terms of Use</p>
            <p className="hover:underline cursor-pointer">Contact Us</p>
          </div>
        </div>

        <p className="text-gray-600 pt-4">© 2026 StreamFlix, Inc. Production-grade Netflix-inspired platform.</p>
      </footer>
    </div>
  );
}
