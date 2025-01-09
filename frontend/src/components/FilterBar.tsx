import { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
}

const QUICK_RANGES = [
  { label: '今天', days: 0 },
  { label: '最近7天', days: 7 },
  { label: '最近30天', days: 30 },
  { label: '最近90天', days: 90 },
];

export function FilterBar({ onDateRangeChange }: FilterBarProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(start.getDate() - days + 1);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange({ start: null, end: null });
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      onDateRangeChange({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <FunnelIcon className="w-4 h-4 mr-1" />
        筛选
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">时间范围</h3>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                清除筛选
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_RANGES.map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => handleQuickRange(days)}
                  className="px-3 py-1 text-sm rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 