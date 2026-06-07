/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Search, 
  User, 
  Briefcase, 
  Sparkles, 
  History, 
  Layers, 
  Filter, 
  Navigation, 
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import DeviceSimulator from "./components/DeviceSimulator";
import CompanyMap from "./components/CompanyMap";
import FresherProfileForm from "./components/FresherProfileForm";
import CompanyEnrichmentPanel from "./components/CompanyEnrichmentPanel";
import { CandidateProfile, CityHub, PlaceSuggestion, SavedReachout, CompanyClass } from "./types";

// Standard popular Indian tech clusters representing geographic centers
const INDIAN_CITY_HUBS: CityHub[] = [
  { name: "Bengaluru", label: "Bengaluru (Silicon Valley of India)", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", label: "Hyderabad (Cyberabad Tech Sector)", state: "Telangana", lat: 17.4483, lng: 78.3741 },
  { name: "Gurgaon", label: "Gurgaon (NCR Startup Hub)", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Mumbai", label: "Mumbai (Financial & FinTech Center)", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Pune", label: "Pune (Hinjewadi IT Cluster)", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
];

export default function App() {
  // Candidate baseline profile (persisted in localStorage)
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem("fresher_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      name: "Rohan Kumar",
      education: "B.Tech in Computer Science, Tier-3 College Karnataka",
      graduationYear: "2025",
      targetRole: "Associate Frontend Developer",
      skills: "React.js, Javascript, Tailwind CSS, HTML5, SQL fundamentals, Git",
      projects: "1. FoodMart App (custom grocery react application with localStorage persistence) 2. Personal portfolio utilizing high contrast elements",
      currentCity: "Bengaluru"
    };
  });

  // Current selected city or coordinates
  const [currentCity, setCurrentCity] = useState<CityHub>(INDIAN_CITY_HUBS[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Search keyword filters & company classification
  const [searchTerm, setSearchTerm] = useState("");
  const [companyClass, setCompanyClass] = useState<CompanyClass>("All");

  // Places list populated from Google Maps Places platform or local mock fallback
  const [placesList, setPlacesList] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);

  // Layout dashboard tabs
  const [activeTab, setActiveTab] = useState<"finder" | "profile" | "history">("finder");
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Application history records
  const [savedLogs, setSavedLogs] = useState<SavedReachout[]>(() => {
    const saved = localStorage.getItem("fresher_outreaches");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist profile updates
  const handleProfileSave = (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("fresher_profile", JSON.stringify(updatedProfile));
  };

  // Persist new Outreach Logs
  const handleSaveOutreachHistory = (outreach: {
    companyName: string;
    recruiterName: string;
    jobTitle: string;
    draftedMessage: string;
    subject?: string;
  }) => {
    const newLog: SavedReachout = {
      id: Math.random().toString(),
      companyName: outreach.companyName,
      recruiterName: outreach.recruiterName,
      jobTitle: outreach.jobTitle,
      draftedMessage: outreach.draftedMessage,
      subject: outreach.subject,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata"
      }) + " IST"
    };

    const updated = [newLog, ...savedLogs];
    setSavedLogs(updated);
    localStorage.setItem("fresher_outreaches", JSON.stringify(updated));
  };

  // Delete an item from applied history logs
  const handleDeleteLog = (id: string) => {
    const updated = savedLogs.filter(log => log.id !== id);
    setSavedLogs(updated);
    localStorage.setItem("fresher_outreaches", JSON.stringify(updated));
  };

  // Live Location lookup action
  const handleGeoLocationLookUp = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser / iframe sandbox.");
      return;
    }
    
    setIsLocating(true);
    setLocationStatus("Accessing live coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveHub: CityHub = {
          name: "Live Coordinates",
          label: "Your Live Location (GPS Area)",
          state: "Detected Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentCity(liveHub);
        setLocationStatus("Centered around your live spot!");
        setIsLocating(false);
        // Clear message after 3 seconds
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        setLocationStatus("Denied/Locked. Defaulting to India's major Silicon valley Bengaluru.");
        setIsLocating(false);
        setTimeout(() => setLocationStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Double trigger lookup centered around the state
  const handleCitySelectChange = (cityName: string) => {
    const found = INDIAN_CITY_HUBS.find(hub => hub.name === cityName);
    if (found) {
      setCurrentCity(found);
      setSelectedPlace(null);
    }
  };

  // Filter listings by classification MNC vs Startup vs Local options
  const getFilteredPlaces = () => {
    if (companyClass === "All") return placesList;
    
    return placesList.filter(place => {
      const nameLower = place.displayName.toLowerCase();
      
      if (companyClass === "MNC") {
        return nameLower.includes("tcs") || 
               nameLower.includes("mnc") || 
               nameLower.includes("corporate") || 
               nameLower.includes("microsoft") || 
               nameLower.includes("cisco") || 
               nameLower.includes("infosys") || 
               nameLower.includes("consultancy") || 
               nameLower.includes("persistent") || 
               nameLower.includes("reliance") || 
               nameLower.includes("jio") || 
               nameLower.includes("systems");
      }
      
      if (companyClass === "Startup") {
        return nameLower.includes("startup") || 
               nameLower.includes("hub") || 
               nameLower.includes("razorpay") || 
               nameLower.includes("zomato") || 
               nameLower.includes("unicorn") || 
               nameLower.includes("swiggy") || 
               nameLower.includes("dream11") || 
               nameLower.includes("darwinbox") || 
               nameLower.includes("firstcry") || 
               nameLower.includes("mindbowser") || 
               nameLower.includes("bookmyshow") || 
               nameLower.includes("paytm");
      }
      
      // Local Companies - catch anything not strictly matching common names or fallback matching
      const hasStrictCorporateTag = nameLower.includes("tcs") || nameLower.includes("microsoft") || nameLower.includes("cisco") || nameLower.includes("co") || nameLower.includes("startup") || nameLower.includes("hub");
      return !hasStrictCorporateTag;
    });
  };

  const filteredPlaces = getFilteredPlaces();

  return (
    <DeviceSimulator>
      <div className="w-full h-full bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-900">
        
        {/* Main Body Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left Panel: Filters, Listings & Forms */}
          <div className="w-full md:w-[420px] shrink-0 border-r border-slate-205 bg-white flex flex-col overflow-hidden">
            
            {/* Quick tabs selector */}
            <div className="flex bg-slate-50 border-b border-slate-200 shrink-0 p-1 gap-1">
              <button
                id="tab-btn-finder"
                onClick={() => setActiveTab("finder")}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 rounded-lg transition-all ${
                  activeTab === "finder"
                    ? "bg-indigo-650 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Directories</span>
              </button>
              
              <button
                id="tab-btn-profile"
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 rounded-lg transition-all ${
                  activeTab === "profile"
                    ? "bg-indigo-650 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </button>
              
              <button
                id="tab-btn-history"
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 rounded-lg transition-all ${
                  activeTab === "history"
                    ? "bg-indigo-650 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <History className="h-4 w-4" />
                <span>Logs ({savedLogs.length})</span>
              </button>
            </div>

            {/* Tab Contents Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {activeTab === "finder" && (
                <>
                  {/* Geographic Hub Target and Live GPS Location */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <span>Select Placement Hub</span>
                      </div>
                      
                      <button
                        onClick={handleGeoLocationLookUp}
                        disabled={isLocating}
                        className="text-[10px] bg-indigo-50 border border-indigo-120 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg inline-flex items-center space-x-1 active:scale-95 transition-all text-xs font-bold"
                        title="Use GPS Coordinates"
                      >
                        <Navigation className={`h-3 w-3 ${isLocating ? "animate-pulse" : ""}`} />
                        <span>{isLocating ? "Scanning GPS..." : "GPS Spot"}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <select
                        id="hub-city-select"
                        value={currentCity.name !== "Live Coordinates" ? currentCity.name : ""}
                        onChange={(e) => handleCitySelectChange(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-550"
                      >
                        {currentCity.name === "Live Coordinates" && (
                          <option value="">🛰️ Custom GPS Position ({currentCity.lat.toFixed(4)}, {currentCity.lng.toFixed(4)})</option>
                        )}
                        {INDIAN_CITY_HUBS.map((hub) => (
                          <option key={hub.name} value={hub.name}>
                            🇮🇳 {hub.label}
                          </option>
                        ))}
                      </select>
                      
                      {locationStatus && (
                        <p className="text-[10px] text-indigo-750 flex items-center space-x-1 mt-1 font-mono font-bold leading-none">
                          <AlertCircle className="h-3 w-3 text-indigo-600" />
                          <span>{locationStatus}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Filters: Search Keywords & Company Classification Toggles */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-850 font-bold border-b border-slate-200/60 pb-2">
                      <Filter className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Fresher Classification Filter</span>
                    </div>

                    {/* Company Classification Pills */}
                    <div className="grid grid-cols-4 gap-1">
                      {(["All", "MNC", "Startup", "Local"] as CompanyClass[]).map((cls) => (
                        <button
                          key={cls}
                          id={`class-filter-${cls}`}
                          onClick={() => {
                            setCompanyClass(cls);
                            setSelectedPlace(null);
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all ${
                            companyClass === cls
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                          }`}
                        >
                          {cls === "All" ? "All" : cls === "Local" ? "Local" : cls}
                        </button>
                      ))}
                    </div>

                    {/* Search Role filter keyword */}
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedPlace(null);
                          }}
                          placeholder="Type keywords (e.g. Frontend, Analyst, Intern)..."
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 pl-8 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-505"
                        />
                        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {/* Company Listings list results based on search parameters */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Workspaces in area ({filteredPlaces.length})
                      </span>
                      <span className="text-[9.5px] text-indigo-600 font-bold font-mono">
                        Tap map markers for details
                      </span>
                    </div>

                    {filteredPlaces.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
                        <Briefcase className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                        No companies found matching current filters in this radius. Clear search query or toggle classification keys.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredPlaces.map((place) => {
                          const isSelected = selectedPlace && selectedPlace.id === place.id;
                          const isMNC = place.displayName.toLowerCase().match(/(tcs|corporate|microsoft|cisco|infosys|consultancy|persistent|reliance|jio|systems)/);
                          const isStartup = place.displayName.toLowerCase().match(/(startup|hub|razorpay|zomato|unicorn|swiggy|dream11|darwinbox|firstcry|mindbowser|bookmyshow|paytm)/);
                          const companyTypeLabel = isMNC ? "MNC" : isStartup ? "STARTUP" : "LOCAL CO";
                          
                          // Different badges depending on selected active background
                          const companyBadgeColor = isSelected
                            ? "text-white border-white/20 bg-white/20"
                            : isMNC 
                            ? "text-indigo-700 border-indigo-100 bg-indigo-50" 
                            : isStartup 
                            ? "text-orange-700 border-orange-100 bg-orange-50" 
                            : "text-slate-650 border-slate-200 bg-slate-100";

                          return (
                             <button
                              key={place.id}
                              id={`item-co-${place.id}`}
                              onClick={() => setSelectedPlace(place)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between gap-3 shadow-xs ${
                                isSelected
                                  ? "bg-indigo-600 border-indigo-650 text-white shadow-md ring-1 ring-indigo-505/20"
                                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-850"
                              }`}
                            >
                              <div className="space-y-1.5 max-w-[80%]">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded ${companyBadgeColor}`}>
                                    {companyTypeLabel}
                                  </span>
                                  {place.rating && (
                                    <span className={`text-[9.5px] font-bold ${isSelected ? "text-yellow-300" : "text-amber-500"}`}>
                                      ⭐ {place.rating}
                                    </span>
                                  )}
                                </div>
                                <h4 className={`text-xs font-bold line-clamp-1 ${isSelected ? "text-white font-bold" : "text-slate-900"}`}>
                                  {place.displayName}
                                </h4>
                                <p className={`text-[10px] line-clamp-1 leading-normal ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                                  📍 {place.formattedAddress}
                                </p>
                              </div>
                              <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border ${
                                isSelected 
                                  ? "bg-white/10 border-white/15 text-white" 
                                  : "bg-slate-50 border-slate-200 text-slate-400"
                              }`}>
                                <Building2 className={`h-4 w-4 ${isSelected ? "text-white animate-pulse" : "text-slate-450"}`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "profile" && (
                <FresherProfileForm
                  profile={profile}
                  onProfileSave={handleProfileSave}
                />
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Saved Outreaches History logs
                    </span>
                    <span className="text-[10px] font-mono text-indigo-650 font-bold">
                      {savedLogs.length} Applications tracked
                    </span>
                  </div>

                  {savedLogs.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs shadow-xs">
                      <History className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                      Your saved drafts will show up here. Go to Finder, select any tech space, create custom cold letters, and hit "Log to Saved Jobs"!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedLogs.map((log) => (
                        <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs text-slate-800">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="bg-indigo-50 text-indigo-700 text-[8.5px] font-mono px-1.5 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wider">
                                {log.jobTitle}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{log.companyName}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold">Recruiter: {log.recruiterName}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold transition-all"
                            >
                              Dismiss Line
                            </button>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10.5px] text-slate-700 line-clamp-3 font-mono leading-relaxed whitespace-pre-line shadow-inner">
                            {log.draftedMessage}
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-slate-450 border-t border-slate-100 pt-2 font-mono">
                            <span>Saved: {log.timestamp}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(log.draftedMessage);
                                setCopiedLogId(log.id);
                                setTimeout(() => setCopiedLogId(null), 2000);
                              }}
                              className="text-indigo-650 hover:underline hover:text-indigo-850 font-bold cursor-pointer transition-all"
                            >
                              {copiedLogId === log.id ? "✓ Copied!" : "Quick Copy"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Google Map on top, Selected company AI Insight Panel on bottom */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            
            {/* Split layout: Interactive Google Map */}
            <div className={`p-4 ${selectedPlace ? "h-[35%] min-h-[220px]" : "h-full"} transition-all shrink-0 border-b border-slate-200 bg-slate-100`}>
              <CompanyMap
                currentCity={currentCity}
                searchTerm={profile.targetRole}
                placesList={placesList}
                setPlacesList={setPlacesList}
                selectedPlace={selectedPlace}
                onPlaceSelect={(place) => {
                  setSelectedPlace(place);
                  setActiveTab("finder"); // pull Finder list focused
                }}
              />
            </div>

            {/* Split layout: Recruiter Enrichment detailing candidate profiles */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
              {selectedPlace ? (
                <CompanyEnrichmentPanel
                  selectedPlace={selectedPlace}
                  profile={profile}
                  onSaveOutreach={handleSaveOutreachHistory}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-slate-50">
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-md shadow-xs space-y-4 relative overflow-hidden text-slate-800">
                    {/* Visual glowing border */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600" />
                    
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                      <Sparkles className="h-5.5 w-5.5 text-indigo-600 animate-pulse" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                        Interactive Placement Hub
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Explore local corporate clusters, startups or MNC tech offices in India. Tap any company's marker on the screen above, or choose an office from the left directory to run AI candidate matching!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left pt-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center shadow-xs">
                        <div className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Active Hub</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap overflow-hidden text-clip">{currentCity.name}</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center shadow-xs">
                        <div className="text-[8px] font-bold text-orange-600 uppercase tracking-widest font-mono">Matching Target</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{profile.targetRole}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-mono pt-1">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-550" />
                      <span>Curated placement data for freshers in India</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Dynamic Geometric Balances footer */}
        <footer className="h-8 bg-slate-900 text-slate-400 px-4 md:px-6 flex items-center justify-between text-[9px] uppercase tracking-widest shrink-0 border-t border-slate-800 font-mono select-none">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
              GPS ACTIVE: {currentCity.name.toUpperCase()}
            </span>
            <span className="hidden sm:inline text-slate-500">SYNCING: GOOGLE MAPS SERVICE</span>
          </div>
          <div className="flex gap-4 font-mono text-[9px] shrink-0">
            <span>V1.3.0-STABLE</span>
            <span className="text-slate-300">CANDIDATE: {profile.name.toUpperCase()}</span>
          </div>
        </footer>

      </div>
    </DeviceSimulator>
  );
}
