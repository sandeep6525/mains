/**
 * paperRegistry.js
 * Centralized Canonical Paper Code Normalization
 */
import { MAINS_PAPERS } from '../data/syllabusData.js';


export function normalizePaperCode(input) {
    if (!input) return null;
    let c = String(input).toUpperCase().replace(/\s+/g, '');
    
    // GS Mappings
    if (c === 'GS1' || c === 'GSI' || c === 'GS-1' || c.includes('PAPER-II(GS-I)')) return 'GS-I';
    if (c === 'GS2' || c === 'GSII' || c === 'GS-2' || c.includes('PAPER-III(GS-II)')) return 'GS-II';
    if (c === 'GS3' || c === 'GSIII' || c === 'GS-3' || c.includes('PAPER-IV(GS-III)')) return 'GS-III';
    if (c === 'GS4' || c === 'GSIV' || c === 'GS-4' || c.includes('PAPER-V(GS-IV)')) return 'GS-IV';
    
    // Essay Mapping
    if (c === 'PAPER-I' || c === 'ESSAY') return 'ESSAY';
    
    // Qualifying Languages
    if (c === 'PAPER-A') return 'PAPER-A';
    if (c === 'PAPER-B') return 'PAPER-B';

    // Normalizing known optional aliases/typos
    if (c.startsWith('OPT-SOC-')) c = c.replace('OPT-SOC-', 'OPT-SOCIO-');
    if (c.startsWith('OPT-COMMERCE-')) c = c.replace('OPT-COMMERCE-', 'OPT-COMM-');
    if (c === 'ECONOMICS(P1&P2)') c = 'OPT-ECON';

    // Reject unknown formats gracefully but allow valid GS, Essay, Optionals
    if (c.startsWith('GS-') && ['GS-I', 'GS-II', 'GS-III', 'GS-IV'].includes(c)) return c;
    if (c === 'ESSAY') return c;
    
    // For Optionals, we STRICTLY enforce P1/P2
    if (/^OPT-[A-Z-]+-P[12]$/.test(c)) return c;
    
    // If it's an optional base code without P1/P2, it's ambiguous where a full paper identity is required
    if (c.startsWith('OPT-') && !c.includes('-P')) {
        return 'AMBIGUOUS_OPTIONAL_PAPER_PART';
    }

    return 'UNSUPPORTED_PAPER_CODE';
}

export function getBasePaperCode(input) {
    if (!input) return null;
    let c = String(input).toUpperCase().replace(/\s+/g, '');
    if (c === 'ECONOMICS(P1&P2)') c = 'OPT-ECON';
    
    const normalized = normalizePaperCode(c);
    if (!normalized || normalized === 'UNSUPPORTED_PAPER_CODE') return normalized;
    if (normalized === 'AMBIGUOUS_OPTIONAL_PAPER_PART') return c; // c is already the base code like OPT-ECON
    
    const baseCodeMatch = normalized.match(/^(OPT-[A-Z-]+)-P[12]$/);
    return baseCodeMatch ? baseCodeMatch[1] : normalized;
}

export function getCanonicalPaperChoices() {
    const choices = [];
    MAINS_PAPERS.forEach(p => {
        if (p.code.includes('GS-I)')) choices.push({ code: 'GS-I', label: 'GS-I' });
        else if (p.code.includes('GS-II)')) choices.push({ code: 'GS-II', label: 'GS-II' });
        else if (p.code.includes('GS-III)')) choices.push({ code: 'GS-III', label: 'GS-III' });
        else if (p.code.includes('GS-IV)')) choices.push({ code: 'GS-IV', label: 'GS-IV (Ethics)' });
        else if (p.code === 'PAPER-I') choices.push({ code: 'ESSAY', label: 'Essay' });
        else if (p.code.startsWith('OPT-')) {
            let cleanTitle = p.title.replace('Optional: ', '').replace(/\s*\(Paper I & II\)\s*/i, '').trim();
            choices.push({ code: p.code, label: cleanTitle + ' (P1 & P2)' });
        }
    });
    return choices;
}

