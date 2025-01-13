import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        if (showDatePicker) {
          setShowDatePicker(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDatePicker]);

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
    setShowDatePicker(false);
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
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
        <div className="text-sm text-gray-500">
          找到 {resultCount} 条相关记录
        </div>
      )}

      {/* 筛选条件 */}
      <div className="flex flex-wrap gap-2">
        {/* 项目筛选 */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              !selectedProjectId
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                hover: 'hover:bg-blue-200'
              };
            }
            return (
              <button
                key={project.id}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1
                  ${selectedProjectId === project.id
                    ? colorObj.bg + ' ' + colorObj.text
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <span>{project.emoji}</span>
                <span>{project.name}</span>
              </button>
            );
          })}
        </div>

        {/* 时间范围筛选 */}
        <div className="relative">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1
              ${dateRange.start ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>
              {dateRange.start
                ? new Date(dateRange.start).toLocaleDateString()
                : '时间范围'}
            </span>
          </button>

          {/* 时间选择下拉菜单 */}
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => handleDateRangeSelect('today')}
              >
                今天
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => handleDateRangeSelect('yesterday')}
              >
                昨天
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => handleDateRangeSelect('week')}
              >
                最近7天
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => handleDateRangeSelect('month')}
              >
                最近30天
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => handleDateRangeSelect('all')}
              >
                全部时间
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 