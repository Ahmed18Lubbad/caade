import LegacyPage from '../src/components/LegacyPage';
import { readTemplate } from '../src/lib/templates';

export default async function RootPage() {
  const html = await readTemplate('ar', 'home');
  return <LegacyPage html={html} language="ar" kind="home" />;
}
