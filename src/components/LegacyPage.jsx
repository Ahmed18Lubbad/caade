'use client';

import { useEffect, useState } from 'react';

const scripts = {
  home: ['/header-scroll.js', '/content.js', '/site.js'],
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
  return <>
    {status !== 'ready' && <p className={`legacy-status legacy-status--${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
      {status === 'error' ? (isEnglish ? 'The page could not load. Please refresh and try again.' : 'تعذر تحميل الصفحة. يرجى تحديثها والمحاولة مرة أخرى.') : (isEnglish ? 'Loading…' : 'جارٍ تحميل الصفحة…')}
    </p>}
    <div dangerouslySetInnerHTML={{ __html: html.body }} />
    <aside className="site-floating-actions" aria-label={isEnglish ? 'Quick actions' : 'إجراءات سريعة'}>
      <a className="floating-action floating-action--primary" href={`/${language}/subpage/?page=support`}>{isEnglish ? 'Support us' : 'ادعمنا'}</a>
      <a className="floating-action" href={`/${language}/subpage/?page=contact`}>{isEnglish ? 'Contact us' : 'تواصل معنا'}</a>
      <button className="floating-action floating-action--top" type="button" aria-label={isEnglish ? 'Back to top' : 'العودة إلى الأعلى'} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </aside>
  </>;
}
