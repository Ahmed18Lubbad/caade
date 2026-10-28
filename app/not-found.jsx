import Link from 'next/link';

export default function NotFound() {
  return <main className="not-found" dir="rtl"><p className="eyebrow">404</p><h1>الصفحة غير موجودة</h1><p>يبدو أن الرابط الذي فتحته غير متاح أو تم نقله.</p><Link className="button" href="/ar/">العودة إلى الرئيسية</Link></main>;
}
