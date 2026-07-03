import React, { useState, useEffect } from "react";
import PatternList from "./components/PatternList.tsx";
import PriceActionChart from "./components/PriceActionChart.tsx";
import ChallengeMode from "./components/ChallengeMode.tsx";
import { Candle, DetectedPattern, SupportResistanceZone, MarketTrend, SPXDataResponse } from "./types.js";
import { SlidersHorizontal, BookOpen, GraduationCap, Flame, RefreshCw, BarChart3, HelpCircle, Layers, Eye, EyeOff, ChevronDown, Check, Filter } from "lucide-react";

const PATTERN_CATEGORIES = [
  { val: "ALL", label: "全部形态" },
  { val: "NONE", label: "无 (不显示形态)" },
  { val: "PIN_BAR", label: "针形 K线 (Pin Bar)" },
  { val: "ENGULFING", label: "吞没 K线 (Engulfing)" },
  { val: "STAR", label: "星体反转 (Star)" },
  { val: "DOJI", label: "十字星 (Doji)" },
  { val: "DOUBLE", label: "双顶双底 (Double)" },
  { val: "HEAD_SHOULDERS", label: "头肩结构 (H&S)" },
  { val: "TRIANGLE", label: "收敛整理 (Triangle)" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"review" | "challenge">("review");
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "4h" | "1d">("1d"); // Default to "1d" (日K)
  const [candles, setCandles] = useState<Candle[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [zones, setZones] = useState<SupportResistanceZone[]>([]);
  const [trend, setTrend] = useState<MarketTrend>({ direction: "SIDEWAYS", strength: 50, labels: [] });
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const [syncing, setSyncing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Intraday drilldown states
  const [drilldownDay, setDrilldownDay] = useState<string | null>(null);
  const [drilldownCandles, setDrilldownCandles] = useState<Candle[]>([]);
  const [drilldownPatterns, setDrilldownPatterns] = useState<DetectedPattern[]>([]);
  const [drilldownZones, setDrilldownZones] = useState<SupportResistanceZone[]>([]);
  const [drilldownTrend, setDrilldownTrend] = useState<MarketTrend>({ direction: "SIDEWAYS", strength: 50, labels: [] });
  const [drilldownLoading, setDrilldownLoading] = useState<boolean>(false);

  // Pattern Filter Selection state
  const [patternFilters, setPatternFilters] = useState<string[]>(["ENGULFING", "PIN_BAR"]);

  // Visibility toggles
  const [showPatterns, setShowPatterns] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Dropdown states & helpers
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  const getCategoryCount = (val: string) => {
    if (val === "ALL") return patterns.length;
    if (val === "NONE") return 0;
    return patterns.filter(p => {
      if (val === "PIN_BAR") return p.type.includes("PIN_BAR");
      if (val === "ENGULFING") return p.type.includes("ENGULFING");
      if (val === "STAR") return p.type.includes("STAR");
      if (val === "DOJI") return p.type === "DOJI";
      if (val === "DOUBLE") return p.type.includes("DOUBLE");
      if (val === "HEAD_SHOULDERS") return p.type.includes("HEAD_AND_SHOULDERS") || p.type.includes("INVERSE_HEAD_AND_SHOULDERS");
      if (val === "TRIANGLE") return p.type.includes("TRIANGLE");
      return false;
    }).length;
  };

  const getDropdownButtonLabel = () => {
    if (patternFilters.includes("ALL")) return "全部形态";
    if (patternFilters.includes("NONE")) return "无 (未选形态)";
    if (patternFilters.length === 0) return "无选择";
    const selectedLabels = PATTERN_CATEGORIES
      .filter(c => patternFilters.includes(c.val) && c.val !== "ALL" && c.val !== "NONE")
      .map(c => c.label.split(" ")[0]); // E.g., "针形", "吞没"
    return selectedLabels.join(" + ");
  };

  const handleTogglePatternFilter = (val: string) => {
    setShowPatterns(true); // Always enable pattern markings when filtering
    if (val === "ALL") {
      setPatternFilters(["ALL"]);
    } else if (val === "NONE") {
      setPatternFilters(["NONE"]);
    } else {
      setPatternFilters(prev => {
        const withoutAllOrNone = prev.filter(x => x !== "ALL" && x !== "NONE");
        if (withoutAllOrNone.includes(val)) {
          const updated = withoutAllOrNone.filter(x => x !== val);
          return updated.length === 0 ? ["ALL"] : updated;
        } else {
          return [...withoutAllOrNone, val];
        }
      });
    }
  };

  // Filter detected patterns based on user's active dropdown choice
  const filteredPatterns = patterns.filter(p => {
    if (patternFilters.includes("ALL")) return true;
    if (patternFilters.includes("NONE")) return false;
    if (patternFilters.length === 0) return false;
    return patternFilters.some(filter => {
      if (filter === "PIN_BAR") return p.type.includes("PIN_BAR");
      if (filter === "ENGULFING") return p.type.includes("ENGULFING");
      if (filter === "STAR") return p.type.includes("STAR");
      if (filter === "DOJI") return p.type === "DOJI";
      if (filter === "DOUBLE") return p.type.includes("DOUBLE");
      if (filter === "HEAD_SHOULDERS") return p.type.includes("HEAD_AND_SHOULDERS") || p.type.includes("INVERSE_HEAD_AND_SHOULDERS");
      if (filter === "TRIANGLE") return p.type.includes("TRIANGLE");
      return false;
    });
  });

  // Fetch SPX data from full-stack backend
  const fetchData = async (tfStr = timeframe) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spx-data?timeframe=${tfStr}`);
      if (!res.ok) throw new Error("Failed to load SPX historical data");
      
      const payload: SPXDataResponse = await res.json();
      setCandles(payload.candles);
      setPatterns(payload.patterns);
      setZones(payload.zones);
      setTrend(payload.trend);
      setLastUpdated(payload.lastUpdated);
      
      // Find the latest (most recent) Engulfing pattern and select it by default to ensure the viewport centers on the T-1 day range
      const defaultEngulfing = [...payload.patterns].reverse().find(p => p.type.includes("ENGULFING"));
      if (defaultEngulfing) {
        setSelectedPattern(defaultEngulfing);
        if (defaultEngulfing.candleIndices.length > 0) {
          const sortedIdxs = [...defaultEngulfing.candleIndices].sort((a, b) => a - b);
          const mid = sortedIdxs[Math.floor(sortedIdxs.length / 2)];
          setFocusIndex(mid);
        } else {
          setFocusIndex(null);
        }
      } else {
        setSelectedPattern(null);
        setFocusIndex(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrilldownDay = async (dayStr: string) => {
    setDrilldownLoading(true);
    try {
      const res = await fetch(`/api/spx-data?timeframe=5m&day=${dayStr}`);
      if (!res.ok) throw new Error("Failed to load intraday drilldown data");
      const payload: SPXDataResponse = await res.json();
      setDrilldownCandles(payload.candles);
      setDrilldownPatterns(payload.patterns);
      setDrilldownZones(payload.zones);
      setDrilldownTrend(payload.trend);
    } catch (err) {
      console.error("Error fetching drilldown data:", err);
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleCandleClick = (candle: Candle) => {
    if (timeframe !== "1d") return; // Only drill down when in daily (1d) view
    
    // Convert candle time to NY Date
    const dateNYStr = new Date(candle.time).toLocaleString("en-US", { timeZone: "America/New_York" });
    const dateNY = new Date(dateNYStr);
    const yyyy = dateNY.getFullYear();
    const mm = String(dateNY.getMonth() + 1).padStart(2, "0");
    const dd = String(dateNY.getDate()).padStart(2, "0");
    const dayStr = `${yyyy}-${mm}-${dd}`;
    
    setDrilldownDay(dayStr);
    fetchDrilldownDay(dayStr);
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  // Handle active manual sync pull to Yahoo Finance
  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/spx-sync", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync database");
      
      const payload = await res.json();
      setLastUpdated(payload.lastUpdated);
      // Re-fetch current visible timeline
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Center chart and coach on selected pattern
  const handleSelectPattern = (pattern: DetectedPattern | null) => {
    setSelectedPattern(pattern);
    if (pattern && pattern.candleIndices.length > 0) {
      // Find middle index of pattern to focus
      const sortedIdxs = [...pattern.candleIndices].sort((a, b) => a - b);
      const mid = sortedIdxs[Math.floor(sortedIdxs.length / 2)];
      setFocusIndex(mid);
    } else {
      setFocusIndex(null);
    }
  };

  const latestCandle = candles[candles.length - 1];
  const priceChange = latestCandle && candles.length > 1
    ? latestCandle.close - candles[candles.length - 2].close
    : 0;
  const priceChangePct = latestCandle && candles.length > 1 && candles[candles.length - 2].close > 0
    ? (priceChange / candles[candles.length - 2].close) * 100
    : 0;

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      
      {/* 1. Global Navigation Header */}
      <header className="bg-black/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* App Branding */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Premium Custom SVG Price Action Compass Logo */}
              <div className="relative w-9 h-9 flex items-center justify-center bg-[#0d0d11] border border-neutral-800 hover:border-[#00c805]/50 transition-colors duration-300">
                {/* Visual compass markings on corners */}
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-neutral-600"></div>
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-neutral-600"></div>
                <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-neutral-600"></div>
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-neutral-600"></div>
                
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Compass Dial */}
                  <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1" className="text-neutral-800" />
                  {/* Neon Green Dashboard Ring Segment */}
                  <circle cx="12" cy="12" r="9.5" stroke="#00c805" strokeWidth="1.2" strokeDasharray="12 40" strokeDashoffset="5" className="animate-pulse" />
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" className="text-neutral-700" />
                  
                  {/* Candlestick compass needle pointing North-East (representing bullish S&P breakout) */}
                  <g transform="rotate(45 12 12)">
                    {/* Shadow wick */}
                    <line x1="12" y1="4" x2="12" y2="20" stroke="#00c805" strokeWidth="1" />
                    {/* Real body of bull bar */}
                    <rect x="10.5" y="8" width="3" height="8" fill="#00c805" rx="0.3" />
                    {/* Accent glowing dot in center of compass */}
                    <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
                  </g>
                </svg>
              </div>
              <span className="font-bold text-sm text-white tracking-widest font-mono uppercase">
                SPX Price Action Compass
              </span>
            </div>
          </div>

          {/* Mode Tabs Switch */}
          <div className="flex items-center bg-[#0d0d11] p-1 rounded-none border border-neutral-800">
            <button
              onClick={() => setActiveTab("review")}
              className={`px-4 py-1.5 rounded-none text-xs font-bold tracking-widest transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "review"
                  ? "bg-white text-black font-black border border-white shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                  : "bg-transparent text-slate-400 hover:text-white border border-transparent hover:border-neutral-700"
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${activeTab === "review" ? "text-black" : "text-slate-400"}`} />
              价格行为诊断
            </button>
            <button
              onClick={() => {
                setActiveTab("challenge");
                setSelectedPattern(null);
                setFocusIndex(null);
              }}
              className={`px-4 py-1.5 rounded-none text-xs font-bold tracking-widest transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "challenge"
                  ? "bg-white text-black font-black border border-white shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                  : "bg-transparent text-slate-400 hover:text-white border border-transparent hover:border-neutral-700"
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${activeTab === "challenge" ? "text-black" : "text-slate-400"}`} />
              实战模拟
            </button>
          </div>

          {/* Live Price Display */}
          {latestCandle && (
            <div className="hidden lg:flex flex-col items-end gap-0.5 px-3 py-1 rounded-lg border border-neutral-800 bg-[#0d0d11]">
              <div className="text-[10px] font-mono text-slate-400 font-bold">
                {(() => {
                  try {
                    const dateNYStr = new Date(latestCandle.time).toLocaleString("en-US", { timeZone: "America/New_York" });
                    const dateNY = new Date(dateNYStr);
                    const yyyy = dateNY.getFullYear();
                    const mm = String(dateNY.getMonth() + 1).padStart(2, "0");
                    const dd = String(dateNY.getDate()).padStart(2, "0");
                    const hh = String(dateNY.getHours()).padStart(2, "0");
                    const min = String(dateNY.getMinutes()).padStart(2, "0");
                    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
                  } catch (e) {
                    return "";
                  }
                })()}
              </div>
              <div className="text-sm font-mono font-extrabold leading-none text-[#00c805]">
                {latestCandle.close.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Dashboard Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        
        {loading && candles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-t-2 border-blue-500 border-r-2 border-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-slate-400 font-mono">正在加载 SPX 历史行情数据...</p>
          </div>
        ) : (
          <>
            {activeTab === "review" ? (
              /* TAB 1: INTERACTIVE PRICE ACTION REVIEW */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Column 1: Interactive SVG Candlestick Chart Stage */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  
                  {/* Chart Utility Toolbar - Clean, flat, borderless bar with NO nested cards */}
                  <div className="flex flex-wrap items-center justify-between gap-4 py-2 px-1">
                    {/* Timeframe picker - sleek flat group */}
                    <div className="flex items-center gap-0.5 bg-[#0d0d11] p-0.5 rounded-none border border-neutral-800">
                      {[
                        { label: "1 min K", val: "1m" },
                        { label: "5 min K", val: "5m" },
                        { label: "15 min K", val: "15m" },
                        { label: "4h K", val: "4h" },
                        { label: "日 K", val: "1d" },
                      ].map(t => (
                        <button
                          key={t.val}
                          onClick={() => {
                            setTimeframe(t.val as any);
                            setDrilldownDay(null); // Reset drilldown when switching timeframe
                          }}
                          className={`px-3 py-1.5 rounded-none text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            timeframe === t.val
                              ? "bg-white text-black font-black border border-white"
                              : "text-slate-400 hover:text-white hover:bg-neutral-950"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Visibility Switches - sleek flat buttons */}
                    <div className="flex items-center gap-2">
                      {/* Support & Resistance Bands */}
                      <button
                        onClick={() => setShowZones(!showZones)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[10px] font-bold transition-all cursor-pointer ${
                          showZones
                            ? "bg-white border-white text-black font-black"
                            : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900"
                        }`}
                        title="显示/隐藏压力支撑带"
                      >
                        {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        支撑/阻力
                      </button>

                      {/* Show/Hide Pattern Markings */}
                      <button
                        onClick={() => setShowPatterns(!showPatterns)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[10px] font-bold transition-all cursor-pointer ${
                          showPatterns
                            ? "bg-white border-white text-black font-black"
                            : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900"
                        }`}
                        title="显示/隐藏图上形态标记"
                      >
                        {showPatterns ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        图上形态
                      </button>

                      {/* Pattern Filter Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[10px] font-bold transition-all cursor-pointer ${
                            showFilterDropdown
                              ? "bg-white border-white text-black font-black"
                              : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900"
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                          <span>形态: {getDropdownButtonLabel()}</span>
                          <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                        </button>

                        {showFilterDropdown && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowFilterDropdown(false)}
                            />
                            <div className="absolute right-0 mt-1 rounded-none bg-black border border-neutral-700 p-1.5 shadow-2xl z-50 animate-fade-in w-56 max-h-[300px] overflow-y-auto">
                              <div className="px-2 py-1 text-[9px] font-mono text-slate-500 uppercase tracking-wider border-b border-neutral-800 mb-1 text-left">
                                选择要研究的形态 (多选)
                              </div>
                              {PATTERN_CATEGORIES.map(cat => {
                                const isSelected = cat.val === "ALL" 
                                  ? patternFilters.includes("ALL")
                                  : patternFilters.includes(cat.val);
                                const count = getCategoryCount(cat.val);
                                return (
                                  <button
                                    key={cat.val}
                                    onClick={() => handleTogglePatternFilter(cat.val)}
                                    className={`w-full text-left px-2 py-1.5 rounded-none text-[10px] font-bold transition-colors flex items-center justify-between ${
                                      isSelected
                                        ? "bg-white text-black font-black"
                                        : "text-slate-400 hover:bg-neutral-900 hover:text-white"
                                    }`}
                                  >
                                    <span>{cat.label} ({count})</span>
                                    {isSelected && <Check className="w-3 h-3 text-black" />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Trend Pivots */}
                      <button
                        onClick={() => setShowTrends(!showTrends)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[10px] font-bold transition-all cursor-pointer ${
                          showTrends
                            ? "bg-white border-white text-black font-black"
                            : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900"
                        }`}
                        title="显示/隐藏趋势标定"
                      >
                        {showTrends ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        HH / LL
                      </button>

                      {/* Volume toggler */}
                      <button
                        onClick={() => setShowVolume(!showVolume)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[10px] font-bold transition-all cursor-pointer ${
                          showVolume
                            ? "bg-white border-white text-black font-black"
                            : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900"
                        }`}
                        title="显示/隐藏成交量"
                      >
                        {showVolume ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        成交量
                      </button>
                    </div>
                  </div>

                  {/* Main Price Action SVG Chart */}
                  <PriceActionChart
                    candles={candles}
                    patterns={filteredPatterns}
                    zones={zones}
                    trend={trend}
                    selectedPattern={selectedPattern}
                    onSelectPattern={handleSelectPattern}
                    showPatterns={showPatterns}
                    showZones={showZones}
                    showTrends={showTrends}
                    showVolume={showVolume}
                    focusIndex={focusIndex}
                    onCandleClick={handleCandleClick}
                    timeframe={timeframe}
                  />

                  {timeframe === "1d" && (
                    <div className="mt-2 text-center text-xs text-slate-500 font-sans italic">
                      💡 提示：在上方 **日 K** 视图下，点击任何一根 K 线即可在下方加载并查看那一天的 **5分钟日内精细分时走势图**
                    </div>
                  )}

                  {/* 5-minute Intraday Drilldown Section */}
                  {timeframe === "1d" && drilldownDay && (
                    <div className="bg-black border border-neutral-800 rounded-none p-6 shadow-2xl mt-4 animate-fade-in flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-white text-black text-[10px] font-mono font-bold rounded-none border border-white uppercase">
                            日内分时 (5m)
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 font-sans">
                            SPX 5分钟走势分析 - <span className="text-white font-mono font-bold">{drilldownDay}</span>
                          </h3>
                        </div>
                        <button
                          onClick={() => setDrilldownDay(null)}
                          className="px-3 py-1.5 bg-black hover:bg-neutral-900 active:scale-[0.98] border border-neutral-700 text-slate-200 rounded-none text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          收起日内图 (Close)
                        </button>
                      </div>

                      {drilldownLoading ? (
                        <div className="h-[250px] flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-t-2 border-white border-r-2 border-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-xs text-slate-400 font-mono">正在抓取并组装该交易日5分钟精细 K 线...</p>
                        </div>
                      ) : drilldownCandles.length === 0 ? (
                        <div className="h-[120px] flex items-center justify-center text-xs text-slate-500 font-sans border border-dashed border-neutral-800 rounded-none">
                          ⚠️ 未找到该交易日的日内5分钟数据（请点击近2个月内的有效美股交易日 K 线）
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {/* Intraday summary statistics card */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black p-4 rounded-none border border-neutral-800">
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">日内开盘</div>
                              <div className="text-xs font-bold text-slate-200 font-mono">${drilldownCandles[0]?.open.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">日内收盘</div>
                              <div className="text-xs font-bold text-slate-200 font-mono">${drilldownCandles[drilldownCandles.length - 1]?.close.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">日内最高</div>
                              <div className="text-xs font-bold text-[#00c805] font-mono">${Math.max(...drilldownCandles.map(c => c.high)).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">日内最低</div>
                              <div className="text-xs font-bold text-[#ff3b30] font-mono">${Math.min(...drilldownCandles.map(c => c.low)).toFixed(2)}</div>
                            </div>
                          </div>

                          {/* 5-minute Intraday sub-chart */}
                          <PriceActionChart
                            candles={drilldownCandles}
                            patterns={drilldownPatterns}
                            zones={drilldownZones}
                            trend={drilldownTrend}
                            selectedPattern={null}
                            onSelectPattern={() => {}}
                            showPatterns={showPatterns}
                            showZones={showZones}
                            showTrends={showTrends}
                            showVolume={showVolume}
                            timeframe="5m"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 2: Patterns Sidebar & Trend Diagnostics (Right Sidebar matching trading conventions) */}
                <div className="lg:col-span-1 h-full">
                  <PatternList
                    patterns={filteredPatterns}
                    allPatterns={patterns}
                    patternFilters={patternFilters}
                    setPatternFilters={setPatternFilters}
                    showPatterns={showPatterns}
                    setShowPatterns={setShowPatterns}
                    zones={zones}
                    trend={trend}
                    selectedPattern={selectedPattern}
                    onSelectPattern={handleSelectPattern}
                    onTriggerSync={handleTriggerSync}
                    syncing={syncing}
                    lastUpdated={lastUpdated}
                    timeframe={timeframe}
                  />
                </div>
              </div>
            ) : (
              /* TAB 2: INTERACTIVE BLIND CHALLENGE */
              <div className="animate-fade-in">
                <ChallengeMode
                  candles={candles}
                  patterns={patterns}
                  zones={zones}
                  trend={trend}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Global Sleek Status Bar Footer */}
      <footer className="h-10 bg-black border-t border-neutral-800 flex items-center justify-between px-6 text-[10px] text-slate-500 mt-auto font-mono">
        <div className="flex items-center gap-4">
          <span>数据源: SPX 实时行情 (t-1)</span>
          <span className="text-neutral-800">|</span>
          <span>价格行为分析引擎: <span className="text-slate-400 font-sans">Al Brooks & Bob Volman 金融量化体系</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span>最后同步: <span className="text-slate-400">{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "未同步"}</span></span>
          <span className="text-neutral-800">|</span>
          <span className="text-neutral-600">本工具仅供学术研究，不构成任何投资建议</span>
        </div>
      </footer>
    </div>
  );
}
