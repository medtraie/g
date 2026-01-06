import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}




export function StockPage() {
  const { t } = useTranslation();
  return (
    <ComingSoonPage
      title={t('nav.stock')}
      description="Gestion des pièces, consommables et fournisseurs. En cours de développement."
    />
  );
}

export function FinancePage() {
  const { t } = useTranslation();
  return (
    <ComingSoonPage
      title={t('nav.finance')}
      description="Suivi des dépenses et analyse des coûts. En cours de développement."
    />
  );
}

export function ReportsPage() {
  const { t } = useTranslation();
  return (
    <ComingSoonPage
      title={t('nav.reports')}
      description="Rapports PDF et exports Excel. En cours de développement."
    />
  );
}

export function AlertsPage() {
  const { t } = useTranslation();
  return (
    <ComingSoonPage
      title={t('nav.alerts')}
      description="Centre de notification et gestion des alertes. En cours de développement."
    />
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  return (
    <ComingSoonPage
      title={t('nav.settings')}
      description="Paramètres de l'entreprise, utilisateurs et rôles. En cours de développement."
    />
  );
}
