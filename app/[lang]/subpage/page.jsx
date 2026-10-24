import LegacyPage from '../../../src/components/LegacyPage';
import { readTemplate } from '../../../src/lib/templates';

export default async function Subpage({ params }) {
  const { lang } = await params;
  const html = await readTemplate(lang, 'subpage');
  return <LegacyPage html={html} language={lang} kind="subpage" />;
}
