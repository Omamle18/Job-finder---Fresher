import React, { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

export default function DeviceSimulator({ children }: DeviceSimulatorProps) {
  const [device, setDevice] = useState<"desktop" | "android" | "ios">("desktop");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Simulator Control Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm rotate-45 flex items-center justify-center overflow-hidden shrink-0">
            <div className="w-4 h-4 bg-white -rotate-45"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              CareerMap <span className="text-indigo-600">India</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Responsive Multi-Device Simulator
            </p>
          </div>
        </div>

        {/* Device Selection Buttons */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1 space-x-1">
          <button
            id="sim-btn-desktop"
            onClick={() => setDevice("desktop")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "desktop"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Desktop dashboard layout"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop View</span>
          </button>
          
          <button
            id="sim-btn-android"
            onClick={() => setDevice("android")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "android"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Simulate Stock Android Mobile device"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Android View</span>
          </button>
          
          <button
            id="sim-btn-ios"
            onClick={() => setDevice("ios")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "ios"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Simulate iOS iPhone Mobile device"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">iOS View</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-50">
        {device === "desktop" ? (
          /* Full Screen Responsive Layout (Computer Style) */
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
            <div className="flex-1 overflow-auto bg-white">
              {children}
            </div>
          </div>
        ) : device === "android" ? (
          /* Beautiful Simulated Android Phone Bezels */
          <div className="relative mx-auto border-[12px] border-slate-800 rounded-[40px] bg-white shadow-2xl overflow-hidden flex flex-col"
               style={{ width: "375px", height: "760px", maxWidth: "100%" }}>
            
            {/* Status bar */}
            <div className="h-7 bg-slate-100 text-[10px] text-slate-600 font-mono px-6 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
              <span>09:41 AM <span className="text-[9px]">IST</span></span>
              {/* Punch Hole Camera */}
              <div className="w-3 h-3 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-[6px]" />
              <div className="flex items-center space-x-2">
                <span>📶 5G</span>
                <span>🔋 98%</span>
              </div>
            </div>

            {/* App Screen Frame */}
            <div className="flex-1 overflow-auto bg-white flex flex-col relative">
              {children}
            </div>
            
            {/* Home Pill Indicator */}
            <div className="h-4 bg-slate-100 border-t border-slate-250 flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        ) : (
          /* Beautiful Simulated iOS Phone Bezels */
          <div className="relative mx-auto border-[12px] border-slate-900 rounded-[46px] bg-white shadow-2xl overflow-hidden flex flex-col"
               style={{ width: "375px", height: "765px", maxWidth: "100%" }}>
            
            {/* Dynamic Island Status bar */}
            <div className="h-8 bg-slate-100 text-[10px] text-slate-700 font-medium px-6 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
              <span>9:41</span>
              {/* Dynamic Island Bezel */}
              <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-[6px] flex items-center justify-center" />
              <div className="flex items-center space-x-1.5 font-bold">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* App Screen Frame */}
            <div className="flex-1 overflow-auto bg-white flex flex-col relative">
              {children}
            </div>

            {/* Home Bar */}
            <div className="h-5 bg-slate-100 border-t border-slate-250 flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-slate-440 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
