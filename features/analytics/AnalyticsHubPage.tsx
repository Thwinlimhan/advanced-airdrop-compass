import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { TrendingContractsWidget } from './TrendingContractsWidget';
import { WhaleWatcherWidget } from './WhaleWatcherWidget';
import { Card } from '../../design-system/components/Card';
import { TestTube2, Users } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const AnalyticsHubPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <TestTube2 size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('analytics_hub_title')}
        </h2>
      </div>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
        {t('analytics_hub_intro')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingContractsWidget />
        <WhaleWatcherWidget />
      </div>

      <Card className="mt-6">
        <div className="flex items-center">
            <Users size={20} className="mr-2 text-purple-500 dark:text-purple-400" />
            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">
                {t('community_alpha_title')}
            </h3>
        </div>
        <p className="text-muted-light dark:text-muted-dark mt-2">
          A dedicated space for users to share and discover early insights, tips, and potential airdrop "alpha". This feature is planned for future development.
        </p>
      </Card>
    </PageWrapper>
  );
};
