import React, { useState } from 'react';

interface BlinkoConfigProps {
  config: {
    domain: string;
    token: string;
  };
  onSave: (config: { domain: string; token: string }) => void;
  onClose: () => void;
}

export const BlinkoConfig: React.FC<BlinkoConfigProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [domain, setDomain] = useState(config.domain);
  const [token, setToken] = useState(config.token);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ domain, token });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
          Blinko 域名
        </label>
        <input
          type="text"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="例如: https://your-blinko-domain.com"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
          API Token
        </label>
        <input
          type="password"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="输入你的 Blinko API Token"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          保存
        </button>
      </div>
    </form>
  );
}; 