import LegacyPage from '../../../src/components/LegacyPage';
import { readTemplate } from '../../../src/lib/templates';

export default async function DetailPage({ params }) {
  const { lang } = await params;
  const html = await readTemplate(lang, 'detail');
  return <LegacyPage html={html} language={lang} kind="detail" />;
}
