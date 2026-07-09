# Security Policy

This document outlines the security policies, disclosure procedures, and mitigation strategies for the ChainAegis ecosystem.

---

## 1. Supported Versions

We actively maintain and audit security patches for the following versions:

| Version | Supported |
| :--- | :--- |
| v1.2.x | :white_check_mark: Yes (Active) |
| v1.1.x | :white_check_mark: Yes (Security Patches Only) |
| < v1.0.x | :x: No |

---

## 2. Reporting a Vulnerability

We value security researchers and community feedback. If you discover a security issue, please follow these guidelines:

### 2.1 Guidelines
*   **Do not disclose public issues**: Avoid creating public GitHub issues for security weaknesses.
*   **Encrypted Email**: Send reports directly to our security response desk at `security@chainaegis.io` (optionally using our PGP key).
*   **Provide POC**: Include a clear description of the vulnerability, step-by-step reproduction instructions, and a working Proof of Concept (Solidity test or script) if possible.

### 2.2 Response SLA
*   **Triage**: We aim to triage and acknowledge received vulnerabilities within **24 hours**.
*   **Patch Cycle**: High or Critical issues are prioritized for patch release within **72 hours** of confirmation.

---

## 3. Secure Development Standards

All smart contracts within the ChainAegis repository must comply with these base directives:

1.  **Access Control**: All state-modifying administration methods must use verified owner modifiers (such as OpenZeppelin's `Ownable` or `AccessControl` roles).
2.  **Reentrancy Protections**: Apply the Checks-Effects-Interactions pattern globally. For methods executing external transfers of ETH or ERC-20/721 tokens, deploy `ReentrancyGuard` or custom mutual-exclusion flags.
3.  **Arithmetic Safety**: Standard Solidity compiler assertions (`^0.8.20`) handle overflow checks natively. Ensure `unchecked` blocks are only used for mathematical calculations that have been formally bounds-verified.
4.  **Oracle Security**: Avoid using spot reserves for token pricing. Integrate secure Decentralized Oracles (e.g. Chainlink Data Feeds) or Time-Weighted Average Price (TWAP) calculation steps.
