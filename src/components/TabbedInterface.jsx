import { useState } from 'react';
import CurrencyTokenPanel from './CurrencyTokenPanel';
import NFTPanel from './NFTPanel';
import TransactionsPanel from './TransactionsPanel';

const TabbedInterface = () => {
  const [activeTab, setActiveTab] = useState('currency');

  const tabs = [
    { id: 'currency', label: 'Currency Token', icon: '💰' },
    { id: 'nft', label: 'NFT Token', icon: '🎨' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
  ];

  return (
    <div className="w-full">
      <div className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab tab-lg ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'currency' && <CurrencyTokenPanel />}
        {activeTab === 'nft' && <NFTPanel />}
        {activeTab === 'transactions' && <TransactionsPanel />}
      </div>
    </div>
  );
};

export default TabbedInterface;

