'use client';

import React, { useState } from 'react';
import { Beneficiary } from '../../types/gvg';
import { MessageSquare, Send, CheckCircle2, Phone, UserCheck, Bot } from 'lucide-react';

interface WhatsAppSimulatorProps {
  beneficiaries: Beneficiary[];
  onBeneficiarySelfConfirm: (beneficiaryId: string, isRunning: boolean) => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  beneficiaries,
  onBeneficiarySelfConfirm,
}) => {
  const [selectedBenId, setSelectedBenId] = useState<string>(beneficiaries[0]?.id || '');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '🇳🇬 NSIPA GVG Self Check-in Assistant\n\nWelcome! Please reply with a number:\n\n1️⃣ My business is STILL RUNNING & machine is working\n2️⃣ My business is STOPPED or machine needs repair\n3️⃣ I want to speak to my LGA Field Agent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const selectedBen = beneficiaries.find((b) => b.id === selectedBenId);

  const handleSendChoice = (option: string) => {
    if (!option) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsgs = [...messages, { sender: 'user' as const, text: option, time }];

    if (option === '1') {
      newMsgs.push({
        sender: 'bot',
        text: `✅ Thank you, ${selectedBen?.full_name || 'Beneficiary'}! Your status has been confirmed as ACTIVE. Keep up the great work!`,
        time,
      });
      if (selectedBen) onBeneficiarySelfConfirm(selectedBen.id, true);
    } else if (option === '2') {
      newMsgs.push({
        sender: 'bot',
        text: `⚠️ Thank you for letting us know. An automatic support ticket has been flagged for your LGA Field Agent (${selectedBen?.assigned_agent_name || 'Agent'}). They will contact you shortly.`,
        time,
      });
      if (selectedBen) onBeneficiarySelfConfirm(selectedBen.id, false);
    } else if (option === '3') {
      newMsgs.push({
        sender: 'bot',
        text: `📞 Your assigned LGA Field Agent is ${selectedBen?.assigned_agent_name || 'LGA Officer'}. We have notified them to reach out to ${selectedBen?.phone_number || 'your phone'}.`,
        time,
      });
    } else {
      newMsgs.push({
        sender: 'bot',
        text: '❌ Invalid option. Please reply 1, 2, or 3.',
        time,
      });
    }

    setMessages(newMsgs);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 transition-colors">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> WhatsApp Cloud API Bot Simulator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lightweight self-checkin channel for digitally capable beneficiaries.
          </p>
        </div>
        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-lg text-[11px] font-bold">
          WhatsApp Bot API
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-1 text-xs">
        <label className="block text-slate-500 dark:text-slate-400 font-semibold">Simulate Beneficiary Session:</label>
        <select
          value={selectedBenId}
          onChange={(e) => setSelectedBenId(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg p-2 focus:outline-none font-bold"
        >
          {beneficiaries.map((b) => (
            <option key={b.id} value={b.id}>
              {b.full_name} ({b.phone_number}) • {b.lga}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 h-80 overflow-y-auto space-y-3 font-sans">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          Simulated WhatsApp Number Replies:
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSendChoice('1')}
            className="bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 p-2.5 rounded-xl text-xs font-bold transition"
          >
            Reply 1 (Running)
          </button>
          <button
            onClick={() => handleSendChoice('2')}
            className="bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-700 p-2.5 rounded-xl text-xs font-bold transition"
          >
            Reply 2 (Stopped)
          </button>
          <button
            onClick={() => handleSendChoice('3')}
            className="bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 p-2.5 rounded-xl text-xs font-bold transition"
          >
            Reply 3 (Agent)
          </button>
        </div>
      </div>
    </div>
  );
};
