# SPX Price Action Compass

<p align="center">
  <a href="./README.md">简体中文</a> | <b>English</b> | <a href="./README_JA.md">日本語</a> | <a href="./README_KO.md">한국어</a>
</p>

---

`SPX Price Action Compass` is a highly interactive Price Action deep analysis and review system custom-tailored for the S&P 500 Index (SPX). It integrates multi-timeframe brokerage-grade charts, fine-grained intraday price action drilldown, automatic price action pattern recognition, and dynamic support/resistance (S&R) detection, helping investors quickly master market structure.

This project is completely open-source, free from ads or third-party commercial trackers, and designed specifically for traders and researchers who prioritize technical analysis and fluid interactive experiences.

---

## 🌟 Key Features

- **📈 Multi-Timeframe Brokerage-Grade Charts**
  - Supports **1-minute (1m K)**, **5-minute (5m K)**, **15-minute (15m K)**, **4-hour (4h K)**, and **Daily (1d K)** candles.
  - Spliced automatically by the backend to compile accurate, representative price action candles from actual index trading hours.

- **⚡ Instant Daily Incremental Updates & Local Caching**
  - Powered by an intelligent local dual-JSON file caching mechanism where all historical timeframes are cached offline on the server.
  - Automatically triggers an **incremental database update daily** at 16:18 EST (immediately after NYC market close), requiring no frequent external API calls and ensuring lightning-fast chart loading.

- **🔍 Intraday 5m Drilldown from Daily Candles**
  - In Daily (1d) chart mode, click any historical daily candle to command the backend to dynamically fetch and assemble **the exclusive 5-minute ultra-high-resolution intraday trend chart** for that specific trading session.
  - Drilldown sessions feature complete intraday statistics (Open/High/Low/Close) to support granular backtesting and reviews.

- **🎯 Crosshair & Axis Scales**
  - Replicates professional brokerage software interactions with an auto-rendered dotted crosshair tracking the cursor.
  - The left and bottom axes dynamically highlight the current **Price** and a precise **Time Badge** corresponding to the cursor's location.

- **🏷️ Automated Price Action Metric Labeling**
  - Uses highly precise mathematical geometric rules to detect candlestick and chartist price action structures in real-time (100% offline, highly performant, and zero dependency on external heavy AI models).
  - Automatically labels structural swing points: Swing Highs (HH, LH) and Swing Lows (LL, HL).
  - Dynamically calculates and highlights Support & Resistance Zones (S&R) based on historical swing density.

---

## 📱 Product Modules

To provide a complete cycle of learning and practice, the application features two main interactive spaces:

### 1. 📈 Price Action Review
* **Description**: Tailored for historical multi-timeframe review. It applies our quantitative pattern recognition algorithms to highlight swing extreme points (HH/LH/HL/LL), core S&R zones, and classic candlestick shapes right on the custom vector SVG chart. A sidebar panel organizes detected structures, enabling single-click navigation, zooming, and deep intraday drilldowns—a powerful educational sandbox for price action theories.
* **Preview**:
  ![Price Action Review](./pa-review.png)

### 2. ⚡ Real-time Challenge
* **Description**: A practice-focused trading simulator and performance diagnostics sandbox. The system picks a random historical segment of the SPX chart, hiding the subsequent price action. Users must analyze the chartist layout, support/resistance zones, and price/volume momentum to make rapid decisions: Buy (Long), Sell (Short), or Skip. The system then plays out the future trend, updating account equity and historical win rates to sharpen trading muscle memory.
* **Preview**:
  ![Real-time Challenge](./pa-exam.png)

---

## 🔬 Price Action Detection Algorithms

Designed strictly around the classic teachings of **Al Brooks** and **Bob Volman**, our backend features deterministic, low-latency analysis algorithms. The primary logic is declared inside `/src/utils/patternDetector.ts`:

### 1. Swing Points Detection
* **Methodology**: Operates forward-looking and backward-looking rolling windows (Lookback/Lookforward) to isolate local maximums and minimums.
* **Criteria**: A candle is marked as a **Swing High** if its `high` is strictly greater than the `high` of the $N$ neighboring candles to its left and right. Conversely, it is marked as a **Swing Low** if its `low` is strictly lower than the `low` of the surrounding $N$ candles.

### 2. Market Structure Classification
* **HH (Higher High)**: Current Swing High is higher than the preceding Swing High.
* **LH (Lower High)**: Current Swing High is lower than the preceding Swing High.
* **HL (Higher Low)**: Current Swing Low is higher than the preceding Swing Low.
* **LL (Lower Low)**: Current Swing Low is lower than the preceding Swing Low.
* **Trend Analysis**: Sifts through recent swing sequences and average candle slopes to dynamically output the current trend direction (Bullish, Bearish, or Sideways Range) and its underlying momentum.

### 3. Dynamic Support & Resistance Clustering
* **Methodology**: Maps all historical swing points onto a 1-dimensional coordinate.
* **Clustering**: Employs an approximate 1D Agglomerative Hierarchical Clustering algorithm. If multiple historical extremes fall within a microscopic tolerance percentage (e.g., $0.12\% - 0.15\%$), they are grouped into a single price cluster.
* **Typing & Filtering**:
  - **Resistance**: Price cluster containing primarily Swing Highs.
  - **Support**: Price cluster containing primarily Swing Lows.
  - **Flip (S/R Flip)**: Price cluster housing both Swing Highs and Swing Lows.
  - **Cleanliness**: Filters out noise zones touched less than twice, plotting only the Top 8 most validated levels to keep the user interface uncluttered.

### 4. Chartist Candlestick Pattern Recognition
Formulas are strictly constrained by geometric ratios involving **the body size, upper/lower shadow ratios, and relative volatility (approximate ATR ratios)**:
* **Doji**: The candle body represents a microscopic share of the range (`body / range < 8%`) within a normal volatility profile, representing absolute equilibrium.
* **Pin Bar**:
  - **Bullish Pin Bar**: Long lower shadow (`lowerShadow > range * 60%`), negligible upper shadow (`upperShadow < 15%`), and a compressed body size (`bodyRatio < 30%`). Indicates massive lower buying pressure rejecting low prices.
  - **Bearish Pin Bar**: Long upper shadow (`upperShadow > range * 60%`), negligible lower shadow (`lowerShadow < 15%`), and a compressed body size (`bodyRatio < 30%`). Represents high-altitude selling pressure rejecting high prices.
* **Inside Bar**: The High and Low of the current candle are entirely nested inside the high-low boundaries of the immediate preceding candle. Signals compressed volatility, which often precedes explosive breakouts.
* **Engulfing**: The current candle body completely covers the body of the preceding candle in the opposite direction, backed by an expansion in overall range.
* **Morning/Evening Star**: Classic three-bar reversal setups evaluated by tracking the direction of the first wide candle, a small-bodied transition candle (star), and a deeply penetrating counter-trend third candle.

### 5. Multi-Candle Pattern Recognition
* **Double Top / Double Bottom**: Isolates two consecutive Swing Highs or Swing Lows whose price differences fall within a tiny margin, separated by a reasonable time window ($8 - 40$ candles) to exclude micro-consolidation noise.
* **Head & Shoulders**: Analyzes three consecutive Swing Highs where the central extreme (Head) is prominently taller than the adjacent boundaries (Left Shoulder, Right Shoulder) with symmetric horizontal distributions.
* **Symmetrical Triangle**: Checked when 3 consecutive local highs exhibit descending slopes while 3 consecutive local lows exhibit ascending slopes. Flat borders trigger Rising/Falling Triangles.

---

## 🤝 Contributions Welcome!

Our deterministic algorithms are highly accurate in normal environments, but financial markets are incredibly fluid. Static parameters (such as shadow percentages and clustering tolerances) can behave differently across market regimes and timeframes.

**We highly welcome developers, mathematicians, and traders to tune, optimize, or overhaul our indicators:**
- **Advanced Clustering**: Introduce 1D DBSCAN or grid density clustering to elevate support/resistance zone precision.
- **Dynamic Thresholds**: Incorporate an ATR-based self-adaptive scaler to fine-tune Pin Bar and Engulfing definitions.
- **Modern Concepts**: Add support for modern Price Action concepts like FVG (Fair Value Gaps) and OB (Order Blocks).

If you spot any edge-case mislabels or have a superior geometric formula to suggest, feel free to contribute!

---

## 🏗️ Architecture & Live Demo

The SPX Price Action Compass is engineered with a high-fidelity full-stack architecture:

- **🌐 Live Demo**: [https://spx-price-action-compass-773950940183.europe-west2.run.app/](https://spx-price-action-compass-773950940183.europe-west2.run.app/)
- **📑 Architecture Manual**: For in-depth codebase breakdowns, refer to [ARCHITECTURE.md](ARCHITECTURE.md) at the project root, detailing our custom SVG graphic renderer, agglomerative clustering logic, and offline pattern parsers.

---

## 🔄 CI/CD Pipeline

This project features **100% automated Continuous Integration and Continuous Deployment (CI/CD)** via **GitHub**, **Google Cloud Build**, and **Google Cloud Run**:

- **⚡ Continuous Integration**:
  Pushing or merging code into the GitHub `main` branch automatically triggers our native Google Cloud Build pipeline through secure webhooks.
- **🐳 Multi-Stage Docker Builds**:
  - Automatically compiles using the lightweight `node:22-alpine` environment outlined in our `Dockerfile`.
  - **Builder Stage**: Installs dependencies and bundles assets (`npm run build`). Compiles the Express TypeScript server into a self-contained, single-file CommonJS module (`dist/server.cjs`) for instant startup.
  - **Runner Stage**: Retains only compiled assets (`dist/`) and local data storage (`data/`), dropping build utilities and dev dependency footprints to keep images lean.
- **🚀 Rolling Cloud Deployment**:
  Pushes built containers to the **Google Artifact Registry** and roll-deploys to **Google Cloud Run** with zero-downtime rolling updates and scale-to-zero efficiency.

### Tech Stack

- **Frontend:**
  - **React 18** & **TypeScript** — for component-driven modularity and strict type safety.
  - **Tailwind CSS** — for a high-contrast, beautiful Dark Slate developer visual identity.
  - **Custom SVG Candle Engine** — shuns heavy, bloated chart libraries in favor of a lightweight, highly responsive, hand-crafted vector viewport supporting seamless pan and zoom.

- **Backend:**
  - **Node.js** & **Express** — coordinates multi-timeframe candle stream distribution and local sync.
  - **Yahoo Finance API Proxy** — proxies market inquiries securely and aggregates granular lower-timeframe charts into 4-hour candles.
  - **Cron-like Scheduler** — runs the offline daily incremental data caching scheduler.

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure **Node.js (v18+)** is installed on your machine.

### 2. Install Dependencies
Run the following in the project root:
```bash
npm install
```

### 3. Spin Up Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to begin exploring!

### 4. Build for Production
```bash
npm run build
```
Generates production-grade assets and compiles the backend into the `dist/` directory.

---

## 📜 License

This project is open-source and licensed under the [MIT License](LICENSE). Feel free to clone, modify, distribute, or utilize this workspace for commercial training.
