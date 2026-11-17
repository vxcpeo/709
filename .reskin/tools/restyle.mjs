#!/usr/bin/env node
/**
 * Mechanical half of the reskin: rename presentation classes to the Cosmos
 * Orbit vocabulary, drop the old scoped styles, and swap lucide icon components
 * for the dependency-free OrbitGlyph set. Text, bindings, handlers, routes and
 * form fields are left byte-identical.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'E:\\workspace\\chuangye\\ROBIN\\709\\website\\src';
const TARGETS = [
  'views/Locks.vue', 'views/Create.vue', 'views/LockDetail.vue',
  'views/Docs.vue', 'views/Legal.vue', 'views/Home.vue',
  'components/LiveStats.vue', 'components/FlowChart.vue',
  'components/SchedulePreview.vue', 'components/WalletModal.vue',
];

const CLASS_MAP = {
  'action-confirmation': 'orb-detail__confirm',
  'address-heading': 'orb-detail__address',
  'address-terms': 'orb-detail__address-terms',
  'app-shell': 'orb-shell',
  'application-network': 'orb-networkline',
  'badge': 'orb-tag',
  'brand-home': 'orb-brand',
  'brand-lockup': 'orb-lockup',
  'breadcrumb-slash': 'orb-topline__slash',
  'break-address': 'orb-detail__address--break',
  'button': 'orb-btn',
  'button-dark': 'orb-btn--solid',
  'button-outline': 'orb-btn--rim',
  'button-primary': 'orb-btn--beam',
  'chart-topline': 'orb-chart__top',
  'check-label': 'orb-check',
  'code-address': 'orb-code',
  'connected-address': 'orb-address',
  'connection-status': 'orb-connection',
  'container': 'orb-frame',
  'create-layout': 'orb-console',
  'create-step-nav': 'orb-console__rail',
  'creation-heading': 'orb-console__head',
  'demo-slider-label': 'orb-slider-label',
  'detail-action': 'orb-detail__action',
  'detail-claimable': 'orb-detail__claimable',
  'detail-management': 'orb-detail__manage',
  'detail-number': 'orb-detail__number',
  'detail-overview': 'orb-detail__overview',
  'detail-section-heading': 'orb-detail__head',
  'detail-terms': 'orb-detail__terms',
  'docs-content': 'orb-docs__body',
  'docs-layout': 'orb-docs',
  'docs-nav': 'orb-docs__index',
  'download-card': 'orb-download',
  'download-grid': 'orb-downloads',
  'duration-shortcut': 'orb-preset',
  'empty-state': 'orb-empty',
  'empty-workflow': 'orb-empty__steps',
  'error': 'orb-notice--bad',
  'exact-preview': 'orb-exact',
  'example-tag': 'orb-tag--ghost',
  'eyebrow': 'orb-kicker',
  'faq-list': 'orb-faq',
  'faq-number': 'orb-faq__index',
  'field': 'orb-field',
  'field-inline': 'orb-field--inline',
  'field-row': 'orb-field-row',
  'filter-empty': 'orb-empty--filter',
  'flow-chart': 'orb-glyph-chart',
  'footer-separator': 'orb-baseplate__slash',
  'form-hint': 'orb-hint',
  'form-label-line': 'orb-field__label',
  'form-panel': 'orb-panel',
  'form-section': 'orb-panel__section',
  'full-width': 'orb-wide',
  'guide-shortcuts': 'orb-docs__chips',
  'header-actions': 'orb-topline__actions',
  'header-location': 'orb-topline__where',
  'home-command-center': 'orb-core',
  'home-command-heading': 'orb-core__head',
  'home-create-action': 'orb-core__cta',
  'home-lookup': 'orb-lookup',
  'home-lookup-controls': 'orb-lookup__row',
  'home-testnet-note': 'orb-footnote',
  'icon-button': 'orb-icon-btn',
  'info': 'orb-notice--info',
  'inline-link': 'orb-inline-link',
  'journey-grid': 'orb-journey',
  'journey-number': 'orb-journey__index',
  'journey-section': 'orb-band',
  'legal-copy': 'orb-legal',
  'legal-summary': 'orb-legal__summary',
  'live-source-link': 'orb-metrics__source',
  'live-stats-grid': 'orb-metrics__grid',
  'live-stats-heading': 'orb-metrics__head',
  'live-stats-note': 'orb-metrics__note',
  'live-stats-section': 'orb-metrics',
  'loading-state': 'orb-loading',
  'location-brand': 'orb-topline__brand',
  'lock-actions': 'orb-record__actions',
  'lock-amount': 'orb-record__amount',
  'lock-card': 'orb-record',
  'lock-card-top': 'orb-record__top',
  'lock-counterparty': 'orb-record__party',
  'lock-id': 'orb-record__id',
  'lock-progress-caption': 'orb-record__caption',
  'locks-grid': 'orb-records',
  'lookup-error': 'orb-error',
  'lookup-input': 'orb-lookup__field',
  'main-shell': 'orb-body',
  'management-role': 'orb-detail__role',
  'mobile-menu': 'orb-icon-btn--menu',
  'modal-foot': 'orb-dialog__foot',
  'modal-top': 'orb-dialog__top',
  'modal-wallet-icon': 'orb-dialog__glyph',
  'muted': 'orb-dim',
  'nav-plus': 'orb-nav__add',
  'nav-scrim': 'orb-scrim',
  'notice': 'orb-notice',
  'overview-hero': 'orb-hero',
  'overview-page': 'orb-frame',
  'page-intro': 'orb-lede',
  'pagination-row': 'orb-pager',
  'preview-calculation': 'orb-calc',
  'preview-foot': 'orb-footnote',
  'preview-heading': 'orb-preview__head',
  'preview-panel': 'orb-preview',
  'preview-slider': 'orb-range',
  'preview-slider-label': 'orb-range__label',
  'preview-total': 'orb-preview__total',
  'progress-fill': 'orb-track__fill',
  'progress-track': 'orb-track',
  'questions-section': 'orb-band--faq',
  'rail-bottom': 'orb-nav__note',
  'rail-caption': 'orb-nav__caption',
  'rail-external': 'orb-nav__link',
  'rail-nav': 'orb-nav__ring',
  'rail-network': 'orb-nav__chip',
  'rail-note': 'orb-nav__note',
  'rail-note-index': 'orb-nav__index',
  'review-box': 'orb-review',
  'review-confirmation': 'orb-review__confirm',
  'review-heading': 'orb-review__head',
  'review-recipients': 'orb-review__list',
  'rules-art': 'orb-manifest__orbits',
  'rules-banner': 'orb-manifest',
  'rules-checks': 'orb-manifest__checks',
  'rules-copy': 'orb-manifest__copy',
  'schedule-detail': 'orb-detail',
  'schedule-lookup': 'orb-lookup',
  'section-heading': 'orb-band__head',
  'section-side-note': 'orb-band__note',
  'segmented': 'orb-switch-row',
  'side-rail': 'orb-nav',
  'site-footer': 'orb-baseplate',
  'skip-link': 'orb-skip',
  'small': 'orb-small',
  'small-table-wrap': 'orb-table-wrap',
  'sr-only': 'orb-sr',
  'start-banner': 'orb-invite',
  'status-dot': 'orb-pulse',
  'step-number': 'orb-console__index',
  'studio-bottom': 'orb-stage__foot',
  'studio-chart': 'orb-chart',
  'studio-heading': 'orb-stage__head',
  'studio-icon': 'orb-stage__glyph',
  'studio-tabs': 'orb-tabs',
  'studio-title': 'orb-stage__title',
  'subtle-button': 'orb-link--quiet',
  'test-token-row': 'orb-token-row',
  'testnet-pill': 'orb-chip',
  'text-button': 'orb-link',
  'timeline-studio': 'orb-stage',
  'timing-shortcuts': 'orb-timeline-shortcuts',
  'tiny-square': 'orb-spark',
  'token-toggle': 'orb-switch',
  'tool-card': 'orb-format',
  'tool-grid': 'orb-formats',
  'tool-icon': 'orb-format__icon',
  'tool-number': 'orb-format__index',
  'tool-tag': 'orb-format__tag',
  'tool-top': 'orb-format__top',
  'toolbar-actions': 'orb-toolbar__actions',
  'tools-section': 'orb-band',
  'transaction-status': 'orb-tx-status',
  'transaction-step-labels': 'orb-tx-labels',
  'transaction-steps': 'orb-tx-steps',
  'transfer-form': 'orb-transfer',
  'type-option': 'orb-mode',
  'type-picker': 'orb-modes',
  'wallet-button': 'orb-btn--wallet',
  'wallet-connection-steps': 'orb-dialog__steps',
  'wallet-dialog': 'orb-dialog',
  'wallet-empty': 'orb-wallets-empty',
  'wallet-option': 'orb-wallet',
  'wallet-options': 'orb-wallets',
  'workspace-header': 'orb-topline',
  'workspace-filters': 'orb-filters',
  'workspace-search': 'orb-filters__search',
  'workspace-section': 'orb-view',
  'workspace-summary': 'orb-figures',
  'workspace-toolbar': 'orb-toolbar',
};

const GLYPHS = {
  ArrowUpRight: 'arrow',
  Plus: 'plus',
  Check: 'check',
  Timer: 'timer',
  LockKeyhole: 'lock',
  Waves: 'waves',
  Layers3: 'layers',
  ShieldCheck: 'shield',
  MoveRight: 'arrow-right',
  X: 'close',
  Menu: 'menu',
  LayoutDashboard: 'dashboard',
  BookOpen: 'book',
  ExternalLink: 'external',
  Wallet: 'wallet',
  Radio: 'radio',
  RefreshCw: 'refresh',
  LoaderCircle: 'loader',
  Download: 'download',
  Copy: 'copy',
  LogOut: 'logout',
};

function renameClasses(text) {
  return text.replace(/(?<![\w:-])class="([^"]*)"/g, (full, value) => {
    const mapped = value
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => CLASS_MAP[token] || token)
      .join(' ');
    return `class="${mapped}"`;
  });
}

function convertGlyphs(text) {
  let out = text;
  const names = Object.keys(GLYPHS).join('|');
  const tagRe = new RegExp(`<(${names})(\\s[\\s\\S]*?)?\\s*/>`, 'g');
  out = out.replace(tagRe, (full, tag, attrs = '') => {
    const glyph = GLYPHS[tag];
    return `<OrbitGlyph name="${glyph}"${attrs || ''} />`;
  });
  const importRe = /import\s*\{[^}]*\}\s*from\s*["']lucide-vue-next["'];?\s*/g;
  const hasLucide = /from\s*["']lucide-vue-next["']/.test(out);
  if (hasLucide) {
    const isComponent = out.includes('/components/');
    const rel = isComponent ? './OrbitGlyph.vue' : '../components/OrbitGlyph.vue';
    out = out.replace(importRe, `import OrbitGlyph from "${rel}";\n`);
  }
  return out;
}

function stripStyles(text) {
  return text.replace(/\n?<style[^>]*>[\s\S]*?<\/style>\s*$/m, '\n');
}

let changed = [];
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel);
  let source = await fs.readFile(file, 'utf8');
  const before = source;
  source = stripStyles(source);
  source = convertGlyphs(source);
  source = renameClasses(source);
  if (source !== before) {
    await fs.writeFile(file, source, 'utf8');
    changed.push(rel);
  }
}
console.log(JSON.stringify({ changed }, null, 2));
