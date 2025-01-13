import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilterBar } from './FilterBar';

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
}

export const Search: React.FC<SearchProps> = ({ projects, onSearch, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // 监听 Ctrl/Command + F 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <div className="pt-2">
        <FilterBar onDateRangeChange={setDateRange} />
      </div>

      {/* 关闭按钮 */}
      <button
        className="absolute top-2 right-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        onClick={onClose}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
}; 