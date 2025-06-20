import React from 'react';
import { LearningResource } from '../../types';
import { Card } from '../../design-system/components/Card';

interface GuideReaderProps {
  guide: LearningResource;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide }) => {
  return (
    <Card>
      <h3 className="text-2xl font-semibold text-primary-light dark:text-primary-dark mb-3">{guide.title}</h3>
      {guide.category && <p className="text-sm text-muted-light dark:text-muted-dark mb-4">Category: {guide.category}</p>}
      <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark">
        {/* For more complex content, consider a markdown parser or dangerouslySetInnerHTML if content is trusted HTML */}
        {guide.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </Card>
  );
};
