import React, { useState } from 'react';
import { BlinkoConfig } from './BlinkoConfig';

interface IntegrationSettingsProps {
  blinkoConfig: {
    domain: string;
    token: string;
  };
  onSaveBlinkoConfig: (config: { domain: string; token: string }) => void;
  onClose: () => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  blinkoConfig,
  onSaveBlinkoConfig,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('blinko');

  return (
    <div className="space-y-4">
      {/* 集成列表 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('blinko')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'blinko'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Blinko
          </button>
          {/* 这里可以添加其他集成的标签 */}
        </nav>
      </div>

      {/* Blinko 设置 */}
      {activeTab === 'blinko' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img src="./project-icons/blinko-logo.png" alt="Blinko Logo" className="w-12 h-12" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Blinko</h3>
              <p className="text-sm text-gray-500">
                开源的个人笔记工具，注重隐私保护
              </p>
              <a
                href="https://github.com/blinko-space/blinko"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1"
              >
                访问项目主页
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          <BlinkoConfig
            config={blinkoConfig}
            onSave={onSaveBlinkoConfig}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}; 