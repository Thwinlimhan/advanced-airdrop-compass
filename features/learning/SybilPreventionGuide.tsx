import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { ShieldCheck, AlertTriangle, Users, Globe, Shuffle, DollarSign, MessageSquare, CheckCircle, WalletCards, RefreshCw } from 'lucide-react';

const GuideSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <Card className="mb-6">
    <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-3 flex items-center">
      <Icon size={22} className="mr-2" /> {title}
    </h3>
    <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark space-y-2">
      {children}
    </div>
  </Card>
);

export const SybilPreventionGuidePage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <ShieldCheck size={32} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Sybil Prevention Best Practices</h2>
      </div>
      <AlertMessage
        type="warning"
        title="Important Disclaimer"
        message="This guide provides general information and common practices. It is NOT exhaustive and does NOT guarantee airdrop eligibility or immunity from Sybil detection. Airdrop criteria are project-specific and can change. Always do your own thorough research (DYOR)."
        className="mb-6"
      />

      <GuideSection title="Wallet Uniqueness & History" icon={Users}>
        <p>Airdrop projects often look for genuine users. Using fresh wallets for every airdrop without any prior organic activity can be a red flag.</p>
        <ul>
          <li><strong>Unique Wallets:</strong> Ideally, use distinct wallets for high-priority airdrops to avoid linking your activities if one wallet gets flagged.</li>
          <li><strong>Organic Activity:</strong> Wallets with some history of varied transactions (swaps, NFT trades, DeFi interactions not solely related to the airdrop) tend to look more organic.</li>
          <li><strong>Avoid Direct Linking:</strong> Do NOT send funds directly from one farming wallet to another. Use centralized exchanges (CEXs) or privacy-preserving methods as intermediaries if you need to move funds between your own wallets participating in the same airdrop.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Wallet Generation & Funding Strategies" icon={WalletCards}>
        <p>How you create and fund your wallets is crucial.</p>
        <ul>
          <li><strong>Fresh Wallets:</strong> For high-value airdrops, consider generating truly new wallets (new seed phrases) rather than just new accounts under an existing seed.</li>
          <li><strong>Funding Sources:</strong>
            <ul>
                <li><strong>CEX Withdrawals:</strong> Funding directly from reputable Centralized Exchanges (CEXs) is a common and generally safer method. Withdraw different, slightly varied amounts of native tokens for gas.</li>
                <li><strong>Avoid Direct Cluster Funding:</strong> Do not fund multiple farming wallets from a single source wallet in a way that creates an obvious on-chain link (e.g., one wallet sending funds to 10 new wallets).</li>
                <li><strong>"Seasoning" Wallets:</strong> Some users "season" new wallets by performing a few small, unrelated transactions (e.g., small DEX swap, NFT mint on a different chain) over a period before engaging with the target airdrop protocol. This makes them look less like single-purpose airdrop wallets.</li>
            </ul>
          </li>
           <li><strong>Batching Transactions:</strong> Avoid performing the exact same sequence of transactions on multiple wallets at the exact same times. Vary your timing and the order of operations if possible.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Transaction Behavior" icon={Shuffle}>
        <p>Robotic, repetitive transaction patterns are a common Sybil indicator.</p>
        <ul>
          <li><strong>Varied Amounts:</strong> Don't use the exact same small amounts for every swap or interaction. Vary amounts slightly (e.g., $10.50, $12.30, $9.80 instead of always $10.00).</li>
          <li><strong>Varied Timings:</strong> Spread out your interactions over time. Don't perform all tasks back-to-back in a few minutes. Mimic natural usage patterns.</li>
          <li><strong>Diverse Interactions:</strong> If a protocol has multiple features (swap, lend, stake, bridge), try to use a few different ones rather than just a single type of transaction repeatedly.</li>
          <li><strong>Minimums:</strong> Be aware of rumored or official minimum transaction volumes/counts if applicable.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Technical & Operational Security" icon={Globe}>
        <p>Projects may look for technical indicators of coordinated activity.</p>
        <ul>
          <li><strong>IP Address Diversity:</strong> If farming with multiple wallets for the same airdrop and concerned about IP tracking, consider using reputable VPNs or proxies to vary your IP address for critical interactions. Be cautious as some projects might flag VPN usage.</li>
          <li><strong>Browser Fingerprinting:</strong> Using different browser profiles or anti-detect browsers can help if a project employs advanced fingerprinting techniques (less common but possible).</li>
        </ul>
      </GuideSection>

      <GuideSection title="Community & Social Engagement" icon={MessageSquare}>
        <p>Some projects value genuine community participation.</p>
        <ul>
          <li><strong>Active Participation:</strong> If feasible and genuine, engaging in the project's Discord, Telegram, or forums can sometimes be a positive signal. Avoid spammy or low-effort engagement.</li>
          <li><strong>Social Tasks:</strong> Complete official social tasks (Twitter follows, retweets, Discord roles via Guild.xyz, Zealy, Galxe etc.) if they are part of the criteria.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Key Takeaways" icon={CheckCircle}>
         <p>The goal is to appear as a unique, genuine, and active user of the protocol or ecosystem.</p>
        <ul>
          <li><strong>Quality over Quantity:</strong> Thoughtful interaction with a few wallets often yields better results than spamming with hundreds of low-effort wallets.</li>
          <li><strong>Stay Informed:</strong> Follow project announcements closely for official criteria.</li>
          <li><strong>Risk Management:</strong> Understand that airdrop farming involves risks, including the possibility of not receiving an airdrop despite efforts.</li>
          <li><strong>Document Everything:</strong> Use tools like this Airdrop Compass to keep track of your actions, wallets, and associated transactions.</li>
        </ul>
      </GuideSection>
    </PageWrapper>
  );
};
