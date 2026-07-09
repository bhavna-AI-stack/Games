# ChainAegis 🛡️

**ChainAegis** is a premium, high-fidelity Web3 Security Audit & Risk Analytics Dashboard designed for smart contract compliance checking and real-time threat intelligence. Built around modern glassmorphism design parameters and rich data visualizations, it equips developers and security professionals with the tools to review deployed contract architectures, identify vulnerabilities, analyze remediation methods, and simulate static analysis scans.

---

## 🌟 Key Product Features

### 1. Executive Security Dashboard
*   **Unified Risk Indicators**: High-level visual telemetry displaying audited contracts, overall security scores, open findings, and pool mitigation rates.
*   **Threat Breakdown (SVG Radial Donut Chart)**: A custom, lightweight SVG radial visualization categorizing detected vulnerabilities by severity (Critical, High, Medium, Low).
*   **LOC Scan Volume (SVG Line Chart)**: A dynamic SVG area line graph tracking weekly volume of lines of code audited and verified, built without external chart package overhead.
*   **Security Intel Feed**: A real-time stream simulating blockchain block scanning and security log updates.

### 2. Interactive Audit Report Explorer
*   **DeFi & NFT Protocol Coverage**: Deep-dive audit records for core Web3 modules like *MiniDEX*, *Nexora NFT*, and *LendingVault*.
*   **Detailed Vulnerability Analysis**: Individual findings detail the exact file location, impact analysis, and specific remediation guidelines.
*   **Code Review Diff Blocks**: Side-by-side interactive code blocks contrasting original vulnerable Solidity snippets with their secure counterparts.
*   **PDF Export Module**: Built-in CSS variables optimized for printing (`@media print`), enabling immediate report exporting as professional PDF documents.

### 3. Live Contract Risk Simulator
*   **Solidity Code Sandbox**: A simulated code editor allowing users to inspect contract logic or modify active Solidity code files.
*   **Static Scanning State Machine**: Interactive compiler progress indicators tracking AST (Abstract Syntax Tree) generation, signature analysis, and control-flow tests.
*   **Automated Mitigation Engine**: One-click "Apply Auto-Patch" functionality that resolves vulnerabilities (e.g. reentrancy or state-update ordering) by refactoring the contract instantly.

### 4. Web3 Compliance Center
*   **Directive Checklist**: Persistent tracking of critical Web3 safety parameters (Access Controls, Reentrancy Guards, Spot Oracle limits, Gas loops).
*   **Progress Tracking**: Circular gauge measuring audit compliance rates, updated dynamically as items are completed.
*   **State Caching**: Integrated `localStorage` persistence keeping compliance progress synchronized across sessions.

---

## ⚙️ Technology Stack

*   **Core Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) (Client bundling)
*   **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Styling**: Custom CSS with tailored HSL variables, neon glow variables, and glassmorphic card configurations.
*   **Charts**: Custom-drawn high-performance inline SVG paths.

---

## 📂 Codebase Directory Layout

```
ChainAegis/
├── public/                 # Static SVG icons and favicons
├── src/
│   ├── assets/             # Branding and framework assets
│   ├── components/         # Modular layout views
│   │   ├── Sidebar.tsx     # Navigation bar and network statuses
│   │   ├── Header.tsx      # Title and real-time block height tracker
│   │   ├── DashboardView.tsx # Overall telemetry and SVG charts
│   │   ├── ReportsView.tsx  # Vulnerability explorer & diff blocks
│   │   ├── SimulatorView.tsx # VM scan sandbox & Auto-patcher
│   │   └── ComplianceView.tsx # Standards checklist & caching
│   ├── data/
│   │   └── mockData.ts     # Detailed mock findings and compliance list
│   ├── types.ts            # Type definitions for audits and checklist
│   ├── index.css           # Design Tokens, HSL themes, and Keyframes
│   ├── App.tsx             # Main routing and tab selector
│   └── main.tsx            # DOM initialization entrypoint
├── AUDIT.md                # Smart contract security findings report
├── SECURITY.md             # Security policy and disclosure processes
└── vite.config.ts          # Vite bundler properties
```

---

## 🚀 Installation & Local Development

1.  **Clone and navigate to the directory**:
    ```bash
    cd ChainAegis
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start development server**:
    ```bash
    npm run dev
    ```
    *Open [http://localhost:5173/](http://localhost:5173/) in your browser to view the application.*
4.  **Verify compilation & build production package**:
    ```bash
    npm run build
    ```

---

## 🛡️ Security Audit Standards

For comprehensive audit methodology details, see [AUDIT.md](file:///Users/akmishra/.gemini/antigravity/scratch/ChainAegis/AUDIT.md).
For vulnerability disclosure guidelines, see [SECURITY.md](file:///Users/akmishra/.gemini/antigravity/scratch/ChainAegis/SECURITY.md).
