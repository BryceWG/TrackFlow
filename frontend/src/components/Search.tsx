import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface DateRange {
  start: string | null;
  end: string | null;
}

interface SearchProps {
  projects: Project[];
  onSearch: (params: {
    keyword: string;
    projectId: string | null;
    dateRange: DateRange;
  }) => void;
  onClose: () => void;
  resultCount: number;
}

export const Search: React.FC<SearchProps> = ({ projects, onSearch, onClose, resultCount }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 监听 Ctrl/Command + F 和 ESC 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      // 按 ESC 键关闭搜索面板
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 处理搜索
  const handleSearch = () => {
    onSearch({
      keyword,
      projectId: selectedProjectId,
      dateRange,
    });
  };

  // 当任何搜索条件改变时，触发搜索
  useEffect(() => {
    handleSearch();
  }, [keyword, selectedProjectId, dateRange]);

  // 处理时间范围选择
  const handleDateRangeSelect = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(today);

    switch (range) {
      case 'today':
        setDateRange({ start: today.toISOString(), end: now.toISOString() });
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        setDateRange({ start: start.toISOString(), end: today.toISOString() });
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        setDateRange({ start: start.toISOString(), end: now.toISOString() });
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        setDateRange({ start: start.toISOString(), end: now.toISOString() });
        break;
      case 'all':
        setDateRange({ start: null, end: null });
        break;
    }
  };

  // 处理自定义日期范围
  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999); // 设置结束时间为当天最后一秒
      setDateRange({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  };

  // 当自定义日期改变时更新日期范围
  useEffect(() => {
    if (customStartDate && customEndDate) {
      handleCustomDateRange();
    }
  }, [customStartDate, customEndDate]);

  return (
    <div className="flex flex-col h-[80vh] p-4">
      {/* 搜索框 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="search-input"
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="搜索标题或内容..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
        />
        {keyword && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setKeyword('')}
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* 搜索结果计数 */}
      {keyword && (
        <div className="text-sm text-gray-500 flex items-center justify-between mb-4">
          <span>找到 {resultCount} 条相关记录</span>
          <span className="text-blue-600">搜索结果已在主页面显示</span>
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* 左侧：项目筛选 */}
        <div className="w-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">按项目筛选</h3>
          <div className="space-y-2">
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                !selectedProjectId
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedProjectId(null)}
            >
              全部项目
            </button>
            {projects.map((project) => {
              let colorObj;
              try {
                colorObj = JSON.parse(project.color);
              } catch {
                colorObj = {
                  bg: 'bg-blue-50',
                  text: 'text-blue-700',
                };
              }
              return (
                <button
                  key={project.id}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left flex items-center ${
                    selectedProjectId === project.id
                      ? colorObj.bg + ' ' + colorObj.text
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span className="mr-2">{project.emoji}</span>
                  <span>{project.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧：时间范围 */}
        <div className="w-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">按时间筛选</h3>
          
          {/* 自定义日期范围 */}
          <div className="mb-4 space-y-2">
            <h4 className="text-sm text-gray-600">自定义日期范围</h4>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* 快捷时间选项 */}
          <div className="space-y-2">
            <h4 className="text-sm text-gray-600">快捷选项</h4>
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                !dateRange.start ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setDateRange({ start: null, end: null });
                setCustomStartDate('');
                setCustomEndDate('');
              }}
            >
              全部时间
            </button>
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                dateRange.start && new Date(dateRange.start).toDateString() === new Date().toDateString()
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                handleDateRangeSelect('today');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
            >
              今天
            </button>
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                dateRange.start && new Date(dateRange.start).toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleDateRangeSelect('yesterday')}
            >
              昨天
            </button>
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                dateRange.start && new Date(dateRange.start).getTime() === new Date(new Date().setDate(new Date().getDate() - 7)).getTime()
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleDateRangeSelect('week')}
            >
              最近7天
            </button>
            <button
              className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${
                dateRange.start && new Date(dateRange.start).getTime() === new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime()
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleDateRangeSelect('month')}
            >
              最近30天
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 