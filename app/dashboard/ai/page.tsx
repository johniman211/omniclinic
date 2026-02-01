"use client";

import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "../../../App";

export default function AIAssistantPage() {
  const { clinic, lang } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text?: string, error?: string } | null>(null);

  const handleAsk = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are a senior clinical consultant for OmniClinic SaaS. 
          Current Clinic: ${clinic?.name || "OmniClinic Facility"}. 
          Locale: ${lang === 'ar' ? 'Arabic' : 'English'}.
          
          Guidelines:
          1. Provide high-precision clinical reasoning.
          2. Use professional medical terminology.
          3. If medical risks are detected, clearly flag them.
          4. Format output in clean Markdown.
          5. Never give a final diagnosis; only provide differential support and clinical insights.`
        }
      });

      const text = response.text || "The model returned an empty response.";
      setResult({ text });
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setResult({ error: err.message || "An unexpected AI failure occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-brain text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter mb-4">Clinical Intelligence</h1>
          <p className="text-indigo-100 font-medium max-w-lg">Advanced clinical reasoning and medical analysis powered by Gemini 3 Pro.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Query</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 min-h-[150px] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none"
            placeholder="e.g., Based on a patient presenting with high fever, neck stiffness, and photophobia, what are the primary differentials and recommended urgent tests?"
          />
        </div>

        <button
          onClick={handleAsk}
          disabled={loading || !prompt}
          className="bg-slate-900 text-white px-12 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-3 active:scale-95"
        >
          {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sparkles text-indigo-400"></i>}
          {loading ? "Analyzing..." : "Analyze Case"}
        </button>
      </div>

      {result && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-800">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Consultant Report</h3>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-black uppercase">Gemini 3 Pro Engine</span>
          </div>
          <div className="prose prose-invert max-w-none">
            {result.error ? (
              <div className="flex items-center gap-3 text-rose-400 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <i className="fas fa-exclamation-triangle"></i>
                <p className="font-bold">{result.error}</p>
              </div>
            ) : (
              <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium text-slate-200">
                {result.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}