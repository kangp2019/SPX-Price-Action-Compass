import React from "react";
import { Candle, DetectedPattern } from "../types.js";
import { X, TrendingUp, Sparkles, HelpCircle } from "lucide-react";

interface DiagnosticModalProps {
  pattern: DetectedPattern | null | undefined;
  onClose: () => void;
  candles?: Candle[];
  isChineseStyle?: boolean;
}

const getPatternDisplayLabel = (type: string, name: string): string => {
  if (!type) return name || "未知形态";
  switch (type) {
    case "PIN_BAR_BULLISH": return "看涨 Pin Bar (锤子线)";
    case "PIN_BAR_BEARISH": return "看跌 Pin Bar (流星线)";
    case "ENGULFING_BULLISH": return "看涨吞没 (Bullish Engulfing)";
    case "ENGULFING_BEARISH": return "看跌吞没 (Bearish Engulfing)";
    case "MORNING_STAR": return "启明星反转 (Morning Star)";
    case "EVENING_STAR": return "黄昏星反转 (Evening Star)";
    case "DOJI": return "十字星 (Doji)";
    case "INSIDE_BAR": return "内含线 (Inside Bar)";
    case "DOUBLE_TOP": return "双顶结构 (Double Top)";
    case "DOUBLE_BOTTOM": return "双底结构 (Double Bottom)";
    case "HEAD_AND_SHOULDERS": return "头肩顶 (Head & Shoulders)";
    case "INVERSE_HEAD_AND_SHOULDERS": return "逆头肩底 (Inverse H&S)";
    case "FLAG_BULLISH": return "看涨旗形 (Bullish Flag)";
    case "FLAG_BEARISH": return "看跌旗形 (Bearish Flag)";
    case "TRIANGLE_ASCENDING": return "上升三角形 (Ascending Triangle)";
    case "TRIANGLE_DESCENDING": return "下降三角形 (Descending Triangle)";
    case "TRIANGLE_SYMMETRICAL": return "对称三角形 (Symmetrical Triangle)";
    default: return (name || "").split(" (")[0] || type;
  }
};

interface PatternDiagramProps {
  type: string;
  pattern: DetectedPattern;
  candles?: Candle[];
  isChineseStyle?: boolean;
}

function renderStaticDiagram(type: string, isChineseStyle: boolean) {
  const isBullColor = isChineseStyle ? "#ff3b30" : "#00c805";
  const isBearColor = isChineseStyle ? "#00c805" : "#ff3b30";

  if (type.includes("PIN_BAR_BULLISH")) {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-slate-500 font-mono mb-2">前序跌势</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-2" style={{ backgroundColor: `${isBearColor}80` }} />
            <div className="w-3 h-5 border" style={{ backgroundColor: `${isBearColor}20`, borderColor: `${isBearColor}80` }} />
            <div className="w-0.5 h-2" style={{ backgroundColor: `${isBearColor}80` }} />
          </div>
        </div>
        <div className="text-sm text-neutral-600 font-mono">→</div>
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBullColor }}>看涨 Pin Bar (锤子线)</div>
          <div className="flex flex-col items-center h-16 w-8 justify-start">
            <div className="w-0.5 h-1" style={{ backgroundColor: isBullColor }} />
            <div className="w-4 h-3 border" style={{ backgroundColor: isBullColor, borderColor: isBullColor }} />
            <div className="w-0.5 h-10" style={{ backgroundColor: isBullColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (type.includes("PIN_BAR_BEARISH")) {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-slate-500 font-mono mb-2">前序涨势</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-2" style={{ backgroundColor: `${isBullColor}80` }} />
            <div className="w-3 h-5 border" style={{ backgroundColor: `${isBullColor}20`, borderColor: `${isBullColor}80` }} />
            <div className="w-0.5 h-2" style={{ backgroundColor: `${isBullColor}80` }} />
          </div>
        </div>
        <div className="text-sm text-neutral-600 font-mono">→</div>
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBearColor }}>看跌 Pin Bar (流星线)</div>
          <div className="flex flex-col items-center h-16 w-8 justify-end">
            <div className="w-0.5 h-10" style={{ backgroundColor: isBearColor }} />
            <div className="w-4 h-3 border" style={{ backgroundColor: isBearColor, borderColor: isBearColor }} />
            <div className="w-0.5 h-1" style={{ backgroundColor: isBearColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (type.includes("ENGULFING_BULLISH")) {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBearColor }}>1. 跌势阴线</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-2" style={{ backgroundColor: isBearColor }} />
            <div className="w-4 h-6 border" style={{ backgroundColor: isBearColor, borderColor: isBearColor }} />
            <div className="w-0.5 h-2" style={{ backgroundColor: isBearColor }} />
          </div>
        </div>
        <div className="text-sm text-neutral-600 font-mono">+</div>
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBullColor }}>2. 反向吞没</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-1" style={{ backgroundColor: isBullColor }} />
            <div className="w-5 h-12 border" style={{ backgroundColor: isBullColor, borderColor: isBullColor }} />
            <div className="w-0.5 h-1" style={{ backgroundColor: isBullColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (type.includes("ENGULFING_BEARISH")) {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBullColor }}>1. 升势阳线</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-2" style={{ backgroundColor: isBullColor }} />
            <div className="w-4 h-6 border" style={{ backgroundColor: isBullColor, borderColor: isBullColor }} />
            <div className="w-0.5 h-2" style={{ backgroundColor: isBullColor }} />
          </div>
        </div>
        <div className="text-sm text-neutral-600 font-mono">+</div>
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2" style={{ color: isBearColor }}>2. 反向吞没</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-1" style={{ backgroundColor: isBearColor }} />
            <div className="w-5 h-12 border" style={{ backgroundColor: isBearColor, borderColor: isBearColor }} />
            <div className="w-0.5 h-1" style={{ backgroundColor: isBearColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (type.includes("STAR") || type.includes("MORNING") || type.includes("EVENING")) {
    const isBullish = type.includes("BULLISH") || type.includes("MORNING");
    return (
      <div className="flex items-center justify-center gap-4 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[8px] text-slate-500 font-mono mb-1">1. 前序趋势</div>
          <div className="w-3.5 h-10" style={{ backgroundColor: isBullish ? isBearColor : isBullColor }} />
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[8px] text-slate-400 font-mono mb-1">2. 十字/孕星</div>
          <div className="w-2.5 h-2.5 bg-neutral-700 mt-4" />
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[8px] font-mono mb-1" style={{ color: isBullish ? isBullColor : isBearColor }}>3. 趋势转向</div>
          <div className="w-3.5 h-10" style={{ backgroundColor: isBullish ? isBullColor : isBearColor }} />
        </div>
      </div>
    );
  }

  if (type === "DOJI") {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono mb-2 text-slate-400">十字星 (僵局)</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-4 h-0.5 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "INSIDE_BAR") {
    return (
      <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-slate-500 font-mono mb-2">1. 强力母线</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-1" style={{ backgroundColor: isBullColor }} />
            <div className="w-5 h-14 border" style={{ backgroundColor: isBullColor, borderColor: isBullColor }} />
            <div className="w-0.5 h-1" style={{ backgroundColor: isBullColor }} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-slate-300 font-mono mb-2">2. 内含子线</div>
          <div className="flex flex-col items-center h-16 w-8 justify-center">
            <div className="w-0.5 h-2 bg-slate-500" />
            <div className="w-3 h-6 border bg-slate-500/20 border-slate-500" />
            <div className="w-0.5 h-2 bg-slate-500" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "DOUBLE_TOP") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 50 L 40 10 L 80 40 L 120 10 L 150 50" fill="none" stroke={isBearColor} strokeWidth="2" />
          <line x1="20" y1="40" x2="140" y2="40" stroke="#6366f1" strokeDasharray="4,2" />
          <text x="80" y="55" fill="#818cf8" fontSize="8px" textAnchor="middle">颈线 (Neckline)</text>
          <circle cx="40" cy="10" r="3" fill={isBearColor} />
          <circle cx="120" cy="10" r="3" fill={isBearColor} />
        </svg>
      </div>
    );
  }

  if (type === "DOUBLE_BOTTOM") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 10 L 40 50 L 80 20 L 120 50 L 150 10" fill="none" stroke={isBullColor} strokeWidth="2" />
          <line x1="20" y1="20" x2="140" y2="20" stroke="#6366f1" strokeDasharray="4,2" />
          <text x="80" y="12" fill="#818cf8" fontSize="8px" textAnchor="middle">颈线 (Neckline)</text>
          <circle cx="40" cy="50" r="3" fill={isBullColor} />
          <circle cx="120" cy="50" r="3" fill={isBullColor} />
        </svg>
      </div>
    );
  }

  if (type === "HEAD_AND_SHOULDERS") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 50 L 35 25 L 60 40 L 80 5 L 100 40 L 125 25 L 150 50" fill="none" stroke={isBearColor} strokeWidth="2" />
          <line x1="20" y1="40" x2="140" y2="40" stroke="#6366f1" strokeDasharray="4,2" />
          <text x="80" y="55" fill="#818cf8" fontSize="8px" textAnchor="middle">颈线 (Neckline)</text>
        </svg>
      </div>
    );
  }

  if (type === "INVERSE_HEAD_AND_SHOULDERS") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 10 L 35 35 L 60 20 L 80 55 L 100 20 L 125 35 L 150 10" fill="none" stroke={isBullColor} strokeWidth="2" />
          <line x1="20" y1="20" x2="140" y2="20" stroke="#6366f1" strokeDasharray="4,2" />
          <text x="80" y="12" fill="#818cf8" fontSize="8px" textAnchor="middle">颈线 (Neckline)</text>
        </svg>
      </div>
    );
  }

  if (type === "FLAG_BULLISH") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 50 L 40 10 L 60 25 L 80 15 L 100 30 L 120 20 L 150 5" fill="none" stroke={isBullColor} strokeWidth="2" />
          <line x1="30" y1="5" x2="130" y2="15" stroke="#6366f1" strokeDasharray="3,3" />
          <line x1="45" y1="35" x2="115" y2="40" stroke="#6366f1" strokeDasharray="3,3" />
        </svg>
      </div>
    );
  }

  if (type === "FLAG_BEARISH") {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 10 L 40 50 L 60 35 L 80 45 L 100 30 L 120 40 L 150 55" fill="none" stroke={isBearColor} strokeWidth="2" />
          <line x1="30" y1="55" x2="130" y2="45" stroke="#6366f1" strokeDasharray="3,3" />
          <line x1="45" y1="25" x2="115" y2="20" stroke="#6366f1" strokeDasharray="3,3" />
        </svg>
      </div>
    );
  }

  if (type.includes("TRIANGLE")) {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full relative">
        <svg width="160" height="60" className="overflow-visible">
          <path d="M 10 50 L 40 10 L 70 40 L 100 20 L 120 35 L 135 25" fill="none" stroke="#eab308" strokeWidth="2" />
          <line x1="20" y1="5" x2="150" y2="30" stroke="#6366f1" strokeDasharray="3,3" />
          <line x1="20" y1="55" x2="150" y2="30" stroke="#6366f1" strokeDasharray="3,3" />
        </svg>
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="flex flex-col items-center justify-center py-5 bg-neutral-900/60 rounded-xl border border-neutral-800 w-full">
      <div className="w-32 h-12 flex items-end justify-center gap-1.5">
        <div className="w-2 h-6" style={{ backgroundColor: `${isBearColor}60` }} />
        <div className="w-2 h-10" style={{ backgroundColor: isBullColor }} />
        <div className="w-2 h-8 bg-neutral-800" />
      </div>
      <div className="text-[8px] text-slate-500 font-mono mt-2">形态结构示意</div>
    </div>
  );
}

function PatternDiagram({ type, pattern, candles, isChineseStyle = false }: PatternDiagramProps) {
  const indices = pattern?.candleIndices || [];
  
  // Verify if we have valid candles and indices to render the actual historical candles
  const hasValidCandles = 
    candles && 
    candles.length > 0 && 
    indices.length > 0 && 
    indices.every(idx => idx >= 0 && idx < candles.length);

  return (
    <div className="space-y-4">
      {hasValidCandles && candles && (
        <div className="flex flex-col items-center justify-center p-4 bg-neutral-950 rounded-xl border border-neutral-800/80 shadow-inner w-full">
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <svg width="360" height="150" className="overflow-visible mx-auto">
              {/* Subtle horizontal grid guide lines */}
              {(() => {
                const minIdx = Math.min(...indices);
                const maxIdx = Math.max(...indices);
                const startIdx = Math.max(0, minIdx - 2);
                const endIdx = Math.min(candles.length - 1, maxIdx + 2);
                const subCandles = candles.slice(startIdx, endIdx + 1);
                const highs = subCandles.map(c => c.high);
                const lows = subCandles.map(c => c.low);
                const highest = Math.max(...highs);
                const lowest = Math.min(...lows);
                const range = highest - lowest || 1;
                const padding = range * 0.15;
                const yMin = lowest - padding;
                const yMax = highest + padding;
                const width = 360;
                const height = 150;
                const paddingLeft = 30;
                const paddingRight = 45;
                const paddingTop = 25;
                const paddingBottom = 30;
                const chartWidth = width - paddingLeft - paddingRight;
                const chartHeight = height - paddingTop - paddingBottom;
                const colWidth = chartWidth / subCandles.length;
                const bodyWidth = Math.max(8, colWidth * 0.5);
                const getY = (val: number) => paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;

                return (
                  <>
                    <line x1={paddingLeft} y1={getY(highest)} x2={width - paddingRight} y2={getY(highest)} stroke="#202020" strokeDasharray="3,3" />
                    <line x1={paddingLeft} y1={getY(lowest)} x2={width - paddingRight} y2={getY(lowest)} stroke="#202020" strokeDasharray="3,3" />
                    
                    {pattern.price && pattern.price >= yMin && pattern.price <= yMax && (
                      <g>
                        <line x1={paddingLeft} y1={getY(pattern.price)} x2={width - paddingRight} y2={getY(pattern.price)} stroke="#6366f1" strokeWidth={1} strokeDasharray="4,2" className="opacity-75" />
                        <text x={width - paddingRight + 5} y={getY(pattern.price) + 3} fill="#818cf8" fontSize="8px" fontFamily="monospace" textAnchor="start">
                          ${pattern.price.toFixed(2)}
                        </text>
                      </g>
                    )}

                    {subCandles.map((c, i) => {
                      const globalIdx = startIdx + i;
                      const isPart = indices.includes(globalIdx);
                      const x = paddingLeft + (i + 0.5) * colWidth;
                      const yHigh = getY(c.high);
                      const yLow = getY(c.low);
                      const yOpen = getY(c.open);
                      const yClose = getY(c.close);
                      const isBullish = c.close >= c.open;
                      const isBullColor = isChineseStyle ? "#ff3b30" : "#00c805";
                      const isBearColor = isChineseStyle ? "#00c805" : "#ff3b30";
                      const candleColor = isBullish ? isBullColor : isBearColor;
                      const topY = Math.min(yOpen, yClose);
                      const bottomY = Math.max(yOpen, yClose);
                      const bodyHeight = Math.max(1.5, bottomY - topY);

                      return (
                        <g key={i}>
                          {isPart && (
                            <rect x={x - colWidth / 2} y={paddingTop - 10} width={colWidth} height={chartHeight + 15} fill="#6366f1" fillOpacity={0.06} stroke="#6366f1" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2,2" rx={2} />
                          )}
                          <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth={1.5} />
                          <rect x={x - bodyWidth / 2} y={topY} width={bodyWidth} height={bodyHeight} fill={isBullish ? "none" : candleColor} stroke={candleColor} strokeWidth={1.5} rx={1} />
                          {isPart && (
                            <g>
                              <circle cx={x} cy={paddingTop + chartHeight + 8} r={2.5} fill="#818cf8" />
                              {indices[indices.length - 1] === globalIdx && (
                                <text x={x} y={paddingTop + chartHeight + 18} fill="#818cf8" fontSize="8px" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">形态区间</text>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center gap-1.5 justify-center">
            <span className="inline-block w-2.5 h-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-sm" />
            <span>阴影标记为当前识别出的真实 K 线组合 (共 {indices.length} 根)</span>
          </div>
        </div>
      )}

      {/* Static Schematic Diagram */}
      <div className="space-y-2 pt-2 border-t border-neutral-900/50">
        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 px-1">
          <HelpCircle className="w-3 h-3" />
          标准形态示意图
        </div>
        {renderStaticDiagram(type, isChineseStyle)}
      </div>
    </div>
  );
}

export default function DiagnosticModal({ pattern, onClose, candles, isChineseStyle = false }: DiagnosticModalProps) {
  // Prevent crash if pattern is null or undefined
  if (!pattern) return null;

  const patternType = pattern.type || "UNKNOWN";
  const patternName = pattern.name || "未知形态";
  const displayLabel = getPatternDisplayLabel(patternType, patternName);
  const confidence = pattern.confidence !== undefined ? pattern.confidence : 0.5;
  const price = pattern.price !== undefined ? pattern.price : 0;
  const description = pattern.description || "无详细描述信息。";

  // Upper boundary color indicator
  const isUpTrend = patternType.includes("BULLISH") || patternType.includes("BOTTOM") || patternType.includes("MORNING");
  const isDownTrend = patternType.includes("BEARISH") || patternType.includes("TOP") || patternType.includes("EVENING");
  
  const headerBandColor = isUpTrend
    ? (isChineseStyle ? "bg-[#ff3b30]" : "bg-[#00c805]")
    : isDownTrend
      ? (isChineseStyle ? "bg-[#00c805]" : "bg-[#ff3b30]")
      : "bg-indigo-500";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative z-50 flex flex-col max-h-[85vh] animate-zoom-in">
        
        {/* Decorative upper color band depending on trend direction */}
        <div className={`h-1 w-full ${headerBandColor}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">
              价格行为形态分析
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          
          {/* Signal Header Section */}
          <div>
            <span className="inline-block px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-[9px] text-slate-400 font-mono rounded mb-1.5 font-bold">
              {patternType}
            </span>
            <h2 className="text-base font-black text-white font-sans flex items-center gap-2">
              <span>{displayLabel}</span>
            </h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
            <div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">信号置信度</div>
              <div className="text-sm font-black text-yellow-500 font-mono mt-0.5">
                {Math.round(confidence * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">参考价</div>
              <div className="text-sm font-black text-white font-mono mt-0.5">
                ${price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Pattern Schema Diagram */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>形态图解</span>
            </div>
            <PatternDiagram 
              type={patternType} 
              pattern={pattern} 
              candles={candles} 
              isChineseStyle={isChineseStyle} 
            />
          </div>

          {/* Game Theory Text Box */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>多空博弈与动能分析</span>
            </div>
            <div className="bg-neutral-900/30 p-4 border border-neutral-900 rounded-xl leading-relaxed text-xs text-slate-300 font-sans whitespace-pre-wrap">
              {description}
            </div>
          </div>

        </div>

        {/* Action / Dismiss Button */}
        <div className="px-5 py-4 border-t border-neutral-900 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer rounded-lg text-center"
          >
            关闭
          </button>
        </div>

      </div>
    </div>
  );
}
