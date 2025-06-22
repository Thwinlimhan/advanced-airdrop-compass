import React, { useState } from 'react';
import { Card, CardHeader } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Settings, 
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Github,
  Mail,
  Users
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I add my first airdrop?",
    answer: "Click the 'Add Airdrop' button on the dashboard or go to the Airdrops page. Fill in the project details including name, blockchain, and status. You can also add tasks to track your progress.",
    category: "Getting Started"
  },
  {
    question: "What are recurring tasks?",
    answer: "Recurring tasks are activities you need to do regularly for airdrop farming, like daily logins, weekly interactions, or monthly transactions. They help you stay organized and consistent.",
    category: "Tasks"
  },
  {
    question: "How do I prevent Sybil detection?",
    answer: "Use different wallets, browsers, and devices. Avoid using the same patterns across multiple accounts. Check our Sybil Prevention Guide in the Learning section for detailed strategies.",
    category: "Security"
  },
  {
    question: "Can I use multiple wallets?",
    answer: "Yes! Add multiple wallets in the Wallet Manager. Each wallet can be used for different projects to avoid detection and maximize your chances across various airdrops.",
    category: "Wallets"
  },
  {
    question: "How does the AI assistant work?",
    answer: "The AI can help you create strategies, analyze tasks, and provide suggestions. You can use OpenAI, Google Gemini, or Ollama (local) as your AI provider in Settings.",
    category: "AI Features"
  },
  {
    question: "What are achievements?",
    answer: "Achievements are badges you earn by completing tasks, maintaining streaks, and reaching milestones. They help track your progress and motivate consistent participation.",
    category: "Gamification"
  },
  {
    question: "How do I export my data?",
    answer: "Go to Settings > Data Management. You can export your airdrops, tasks, and other data as JSON files for backup or migration purposes.",
    category: "Data Management"
  },
  {
    question: "Can I customize the interface?",
    answer: "Yes! Go to Settings to change themes, colors, font sizes, and other preferences. You can also customize the dashboard layout and notifications.",
    category: "Customization"
  }
];

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [...new Set(faqData.map(item => item.category))];
  
  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFAQ = categories.reduce((acc, category) => {
    acc[category] = filteredFAQ.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const quickActions = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of airdrop farming',
      icon: BookOpen,
      action: () => window.open('/learning', '_blank')
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: Video,
      action: () => window.open('https://youtube.com', '_blank')
    },
    {
      title: 'AI Assistant',
      description: 'Get help from our AI',
      icon: MessageSquare,
      action: () => {
        // This would typically open the AI chatbot
        console.log('Open AI Assistant');
      }
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: Settings,
      action: () => window.location.href = '/settings'
    }
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-8">
        <HelpCircle className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('help_title', { defaultValue: 'Help & Support' })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('help_subtitle', { defaultValue: 'Find answers to common questions, learn how to use features, and get the most out of your airdrop farming journey.' })}
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={action.action}
            >
              <action.icon className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <Card>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader title="Frequently Asked Questions" />
        <div className="p-6 space-y-4">
          {Object.entries(groupedFAQ).map(([category, items]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
                {expandedCategory === category ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedCategory === category && (
                <div className="px-4 pb-4 space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.question}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Contact & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Contact Support" />
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-gray-600 dark:text-gray-400">support@airdropcompass.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Github className="h-5 w-5 text-primary" />
              <span className="text-gray-600 dark:text-gray-400">GitHub Issues</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-gray-600 dark:text-gray-400">Community Discord</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Additional Resources" />
          <div className="p-6 space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/learning', '_blank')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Center
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/settings/design-system', '_blank')}>
              <Settings className="h-4 w-4 mr-2" />
              Design System
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://github.com', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub Repository
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage; 