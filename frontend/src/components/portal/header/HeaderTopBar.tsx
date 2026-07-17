import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface HeaderTopBarProps {
  lang: "ID" | "EN";
  setLang: (l: "ID" | "EN") => void;
  currentTime: string;
}

export default function HeaderTopBar({ lang, setLang, currentTime }: HeaderTopBarProps) {
  return (
    <div className="hidden md:flex w-full bg-[#0D2B5C] text-white py-2 px-4 sm:px-6 lg:px-8 text-xs flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] opacity-90">{currentTime}</span>
        <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse"></span>
        <span className="hidden md:inline text-[11px] opacity-90 text-[#D71920] font-medium">Enterprise News Room Active</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <button 
          id="lang-toggle"
          onClick={() => setLang(lang === "ID" ? "EN" : "ID")}
          className="flex items-center gap-1 hover:text-[#D71920] transition-colors bg-white/10 px-2 py-0.5 rounded cursor-pointer"
        >
          <Globe size={12} />
          <span className="font-bold tracking-wider">{lang}</span>
        </button>
      </div>
    </div>
  );
}
