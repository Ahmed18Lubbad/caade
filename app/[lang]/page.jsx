import LegacyPage from '../../src/components/LegacyPage';
import { readTemplate } from '../../src/lib/templates';

export default async function HomePage({ params }) {
  const { lang } = await params;
  const html = await readTemplate(lang, 'home');
  return <LegacyPage html={html} language={lang} kind="home" />;
}
