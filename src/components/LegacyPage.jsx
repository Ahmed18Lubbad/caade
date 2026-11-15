"use client";
import { useEffect, useState } from 'react';

const scripts = {
  home: ['/header-scroll.js', '/content.js', '/site.js?v=20261115-github-release'],
  subpage: ['/header-scroll.js', '/content.js', '/subpage.js'],
  detail: ['/header-scroll.js', '/content.js', '/detail.js'],
};

// Load the legacy page scripts in dependency order after the template mounts.
function loadScript(src) {
  window.__caadeScriptPromises ||= {};
  if (window.__caadeScriptPromises[src]) return window.__caadeScriptPromises[src];
  window.__caadeScriptPromises[src] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-caade-src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.caadeSrc = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.append(script);
  });
  return window.__caadeScriptPromises[src];
}

export default function LegacyPage({ html, language, kind }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    // Keep document language, direction, and body-level page styles in sync.
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.className = html.bodyClass || '';
    let cancelled = false;
    (async () => {
      for (const script of scripts[kind]) {
        if (cancelled) return;
        await loadScript(script);
      }
    })().then(() => { if (!cancelled) setStatus('ready'); }).catch((error) => {
      console.error('Unable to initialize the page:', error);
      if (!cancelled) setStatus('error');
    });
    return () => { cancelled = true; };
  }, [html.bodyClass, kind, language]);

  const isEnglish = language === 'en';
  const [showActions, setShowActions] = useState(false);
  useEffect(() => {
    setShowActions(true);
  }, []);
  return <>
    {status !== 'ready' && <p className={`legacy-status legacy-status--${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
      {status === 'error' ? (isEnglish ? 'The page could not load. Please refresh and try again.' : 'تعذر تحميل الصفحة. يرجى تحديثها والمحاولة مرة أخرى.') : (isEnglish ? 'Loading…' : 'جارٍ تحميل الصفحة…')}
    </p>}
    <div className="legacy-page-shell">
      <div dangerouslySetInnerHTML={{ __html: html.body }} />
      {showActions && (
        <aside className="site-floating-actions" aria-label={isEnglish ? 'Quick actions' : 'إجراءات سريعة'}>
          <a className="floating-action floating-action--primary" href={`/${language}/subpage/?page=support`}>{isEnglish ? 'Support us' : 'ادعمنا'}</a>
          <div className="floating-social-actions" role="group" aria-label={isEnglish ? 'Social media' : 'التواصل الاجتماعي'}>
            <a className="floating-social-link floating-social-link--whatsapp" href="https://wa.me/970599807090" target="_blank" rel="noopener noreferrer" aria-label={isEnglish ? 'Contact us via WhatsApp' : 'تواصل معنا عبر واتساب'} title={isEnglish ? 'WhatsApp' : 'واتساب'}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.04 2a9.96 9.96 0 0 0-8.55 15.07L2.15 22l5.08-1.31A9.96 9.96 0 1 0 12.04 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .78.8-2.92-.2-.3A8.2 8.2 0 1 1 12.04 20.2Z"/><path d="M17.5 14.5l-1.6-.8a.9.9 0 0 0-1 .2l-.7.8a7.7 7.7 0 0 1-3.3-3.3l.8-.7a.9.9 0 0 0 .2-1l-.8-1.6a.9.9 0 0 0-1.1-.4l-.9.3a1 1 0 0 0-.7.9A9.5 9.5 0 0 0 17 18a1 1 0 0 0 .9-.7l.3-.9a.9.9 0 0 0-.7-1.1Z"/></svg>
            </a>
            <a className="floating-social-link floating-social-link--facebook" href="https://www.facebook.com/p/%D8%A7%D9%84%D8%AC%D9%85%D8%B9%D9%8A%D8%A9-%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86%D9%8A%D8%A9-%D9%84%D9%84%D8%AA%D9%86%D9%85%D9%8A%D8%A9-%D8%A7%D9%84%D8%B2%D8%B1%D8%A7%D8%B9%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%A8%D9%8A%D8%A6%D8%A9-%D8%BA%D8%B2%D8%A9-100076959926696" target="_blank" rel="noopener noreferrer" aria-label={isEnglish ? 'Follow us on Facebook' : 'تابعونا على فيسبوك'} title="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.3 24V13.1h3.66l.55-4.25H15.3V6.14c0-1.23.34-2.07 2.1-2.07h2.24V.27C19.25.1 17.9 0 16.34 0c-3.3 0-5.57 2.01-5.57 5.7v3.15H7.03v4.25h3.74V24h4.53Z"/></svg>
            </a>
          </div>
          <button className="floating-action floating-action--top" type="button" aria-label={isEnglish ? 'Back to top' : 'العودة إلى الأعلى'} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
        </aside>
      )}
    </div>
  </>;
}
