import { useState } from 'react';

interface AIConfigProps {
  config: {
    apiKey: string;
    apiUrl: string;
    model: string;
    temperature: number;
    systemPrompt: string;
  };
  onSave: (config: {
    apiKey: string;
    apiUrl: string;
    model: string;
    temperature: number;
    systemPrompt: string;
  }) => void;
  onClose: () => void;
}

const DEFAULT_SYSTEM_PROMPT = `你是一个专业的时间记录分析助手。请根据用户提供的时间记录数据，帮助用户进行以下分析：
1. 总结这段时间内的主要活动和成就
2. 分析时间分配情况
3. 发现潜在的改进机会
4. 对未来工作提出建议

请用清晰的结构和友好的语气进行回复。`;

export function AIConfig({ config, onSave, onClose }: AIConfigProps) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiUrl, setApiUrl] = useState(config.apiUrl || 'https://api.openai.com/v1/chat/completions');
  const [model, setModel] = useState(config.model || 'gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(config.temperature || 0.7);
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt || DEFAULT_SYSTEM_PROMPT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiKey,
      apiUrl,
      model,
      temperature,
      systemPrompt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
          API Key <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
          API URL
        </label>
        <input
          type="url"
          id="apiUrl"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="https://api.openai.com/v1/chat/completions"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          模型
        </label>
        <input
          type="text"
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="gpt-3.5-turbo"
        />
      </div>

      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
          温度 ({temperature})
        </label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
          系统提示词
        </label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  );
} 