import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface AIAnalysisProps {
  entries: Array<{
    id: string;
    title: string;
    content: string;
    projectId: string;
    timestamp: string;
  }>;
  projectName: string;
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
  onError: (message: string) => void;
}

export function AIAnalysis({ entries, projectName, dateRange, config, onError }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // 准备发送给 AI 的数据
      const prompt = `以下是项目"${projectName}"从 ${
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
              content: config.systemPrompt,
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
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {entries.length} 条记录
          {dateRange.start && dateRange.end && (
            <span className="ml-2">
              {new Date(dateRange.start).toLocaleDateString()} 至{' '}
              {new Date(dateRange.end).toLocaleDateString()}
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