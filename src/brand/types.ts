/**
 * White-label brand contract for the web admin. Mirrors the Flutter app's
 * `BrandConfig` so the same brand key (`lbc`, `acme`, ...) yields a matching
 * identity across mobile and web.
 */
export interface Brand {
  key: string;
  colors: BrandColors;
  copy: BrandCopy;
  font: BrandFont;
  identity: BrandIdentity;
}

export interface BrandColors {
  /** Primary brand color used in dark theme. */
  primary: string;
  /** Primary brand color used in light theme (`[data-theme="light"]`). */
  primaryLight: string;
  /** Semantic status palette (kept brand-overridable, defaults shared). */
  green: string;
  amber: string;
  blue: string;
  purple: string;
  rose: string;
}

export interface BrandCopy {
  /** Full company name, e.g. "LBC Express". */
  companyName: string;
  /** Monogram shown in the logo tile, e.g. "LBC". */
  shortName: string;
  /** Sidebar/login sub-label, e.g. "Admin Panel". */
  panelLabel: string;
  /** Login page sub-heading, e.g. "Operations Admin Panel". */
  loginSubtitle: string;
  /** <title> for the document. */
  pageTitle: string;
  /** <meta name="description">. */
  metaDescription: string;
  /** Login email placeholder, e.g. "admin@lbc.ph". */
  loginEmailHint: string;
  /** Optional demo-credentials hint under the login form. Empty hides it. */
  demoCredentials: string;
  /** Tracking-number input placeholder, e.g. "LBC-2025-XXXX". */
  trackingPlaceholder: string;
}

export interface BrandFont {
  /** CSS font-family applied to `--font-body`. */
  family: string;
}

export interface BrandIdentity {
  /** Optional logo image URL for light backgrounds (falls back to the text monogram). */
  logoUrl?: string;
  /**
   * Optional logo for dark backgrounds. When set, used in dark theme;
   * otherwise `logoUrl` is used in both themes.
   */
  logoDarkUrl?: string;
  /** Optional favicon URL. */
  faviconUrl?: string;
}
