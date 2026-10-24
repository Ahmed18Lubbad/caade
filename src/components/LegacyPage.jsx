'use client';

import { useEffect } from 'react';

const scripts = {
  home: ['/header-scroll.js', '/content.js', '/site.js'],
  subpage: ['/header-scroll.js', '/content.js', '/subpage.js'],
  detail: ['/header-scroll.js', '/content.js', '/detail.js'],
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
}

export default function LegacyPage({ html, language, kind }) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.className = html.bodyClass || '';
    let cancelled = false;
    (async () => {
      for (const script of scripts[kind]) {
        if (cancelled) return;
        await loadScript(script);
      }
    })().catch((error) => console.error('Unable to initialize the page:', error));
    return () => { cancelled = true; };
  }, [html.bodyClass, kind, language]);

  return <div dangerouslySetInnerHTML={{ __html: html.body }} />;
}
