import React from 'react';
import { Airdrop } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Link } from 'react-router-dom';
import { GitFork, Link2, ArrowRight } from 'lucide-react';

interface AirdropDependencyGraphProps {
  currentAirdrop: Airdrop;
  allAirdrops: Airdrop[];
}

export const AirdropDependencyGraph: React.FC<AirdropDependencyGraphProps> = ({ currentAirdrop, allAirdrops }) => {
  const prerequisites = (currentAirdrop.dependentOnAirdropIds || [])
    .map(id => allAirdrops.find(a => a.id === id))
    .filter(Boolean) as Airdrop[];

  const unlocks = (currentAirdrop.leadsToAirdropIds || [])
    .map(id => allAirdrops.find(a => a.id === id))
    .filter(Boolean) as Airdrop[];

  const Node: React.FC<{ airdrop: Airdrop, isCurrent?: boolean }> = ({ airdrop, isCurrent = false }) => (
    <Link to={`/airdrops/${airdrop.id}`}
          className={`p-3 border rounded-lg shadow-sm min-w-[150px] text-center transition-all
                      ${isCurrent 
                        ? 'bg-primary-light dark:bg-primary-dark text-white scale-105 ring-2 ring-offset-2 ring-primary-light dark:ring-offset-gray-800' 
                        : 'bg-card-light dark:bg-card-dark hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
      <p className="font-semibold truncate">{airdrop.projectName}</p>
      <p className="text-xs text-muted-light dark:text-muted-dark">{airdrop.blockchain}</p>
    </Link>
  );

  return (
    <Card title="Airdrop Dependency Visualizer">
      {prerequisites.length === 0 && unlocks.length === 0 ? (
        <p className="text-muted-light dark:text-muted-dark text-center py-4">
          No dependencies defined for this airdrop. You can set them in the 'Edit Airdrop' form.
        </p>
      ) : (
        <div className="space-y-8 flex flex-col items-center">
          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <h4 className="text-md font-semibold text-muted-light dark:text-muted-dark flex items-center"><Link2 size={16} className="mr-2"/>Prerequisites (Depends On)</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {prerequisites.map(dep => (
                  <div key={dep.id} className="flex flex-col items-center">
                    <Node airdrop={dep} />
                    <ArrowRight size={24} className="my-2 text-gray-400 dark:text-gray-500 rotate-90 md:rotate-0"/>
                  </div>
                ))}
              </div>
               {!prerequisites.every(p => !!allAirdrops.find(a => a.id === p.id && (a.leadsToAirdropIds || []).includes(currentAirdrop.id))) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                    Note: Some prerequisite links might be one-way. Ensure dependencies are also set on the other airdrops for a full graph.
                </p>
              )}
            </div>
          )}

          {/* Current Airdrop Node */}
          <div className="my-4 md:my-0">
             <Node airdrop={currentAirdrop} isCurrent />
          </div>


          {/* Unlocks */}
          {unlocks.length > 0 && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <h4 className="text-md font-semibold text-muted-light dark:text-muted-dark flex items-center"><GitFork size={16} className="mr-2"/>Unlocks (Leads To)</h4>
               <div className="flex flex-wrap justify-center gap-4">
                {unlocks.map(dep => (
                  <div key={dep.id} className="flex flex-col items-center">
                     <ArrowRight size={24} className="my-2 text-gray-400 dark:text-gray-500 rotate-90 md:rotate-0"/>
                     <Node airdrop={dep} />
                  </div>
                ))}
              </div>
               {!unlocks.every(u => !!allAirdrops.find(a => a.id === u.id && (a.dependentOnAirdropIds || []).includes(currentAirdrop.id))) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                    Note: Some "leads to" links might be one-way. Ensure dependencies are also set on the other airdrops for a full graph.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted-light dark:text-muted-dark mt-6 text-center">
        This is a simplified visualization. For complex graphs, dedicated tools might be better.
      </p>
    </Card>
  );
};
