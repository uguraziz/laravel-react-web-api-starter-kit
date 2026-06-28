import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} />
      
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
      </div>
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
      </div>
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-xl bg-card border border-border shadow-sm" />
      </div>
    </div>
  );
}
