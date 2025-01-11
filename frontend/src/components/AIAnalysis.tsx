import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Preset } from './PromptPresets';

interface AIAnalysisProps {
  entries: Array<{
    id: string;
    title: string;
    content: string;
    projectId: string;
    timestamp: string;
  }>;
  projectName: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  config: {
    apiKey: string;
    apiUrl: string;
    model: string;
    temperature: number;
    systemPrompt: string;
  };
  presets: Preset[];
  onError: (message: string) => void;
}

export function AIAnalysis({ entries, projectName, dateRange: initialDateRange, config, presets, onError }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const handleAnalyze = async () => {
    if (!config.apiKey) {
      onError('请先配置 AI 服务');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // 准备发送给 AI 的数据
      const scopeText = projectName ? `项目"${projectName}"` : '全部记录';
      const prompt = `以下是${scopeText}从 ${
        dateRange.start ? new Date(dateRange.start).toLocaleDateString() : '开始'
      } 到 ${
        dateRange.end ? new Date(dateRange.end).toLocaleDateString() : '现在'
      } 的所有记录：\n\n`;

      const records = entries.map(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        return `时间：${date}\n标题：${entry.title}\n内容：${entry.content}\n---`;
      }).join('\n');

      // 发送请求到 AI 服务
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: selectedPreset ? selectedPreset.prompt : config.systemPrompt,
            },
            {
              role: 'user',
              content: prompt + records,
            },
          ],
          temperature: config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 服务请求失败');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('AI 响应格式错误');
      }

      setResult(aiResponse);
    } catch (error) {
      onError(error instanceof Error ? error.message : '分析过程中出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <input
            type="date"
            value={dateRange.start || ''}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <span className="text-gray-500">至</span>
          <input
            type="date"
            value={dateRange.end || ''}
            min={dateRange.start || undefined}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedPreset(null)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors
                ${!selectedPreset 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
            >
              默认提示词
            </button>
            {presets.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors
                  ${selectedPreset?.id === preset.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-blue-500 hover:text-blue-600'
                  }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {entries.length} 条记录
            {dateRange.start && dateRange.end && (
              <span className="ml-2">
                {new Date(dateRange.start).toLocaleDateString()} 至{' '}
                {new Date(dateRange.end).toLocaleDateString()}
              </span>
            )}
            {selectedPreset && (
              <span className="ml-2">
                使用"{selectedPreset.name}"分析
              </span>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || entries.length === 0}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                分析中...
              </>
            ) : (
              '开始分析'
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200">
          <div className="prose max-w-none">
            {result.split('\n').map((line, index) => (
              <p key={index} className="mb-2">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 