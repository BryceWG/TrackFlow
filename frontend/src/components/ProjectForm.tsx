import { useState } from 'react';

interface ProjectFormProps {
  onSubmit: (project: { name: string; description: string; color: string }) => void;
  onCancel: () => void;
}

// 预设的柔和颜色
const COLOR_OPTIONS = [
  { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', tag: 'bg-blue-100', icon: 'text-blue-600' },
  { bg: 'bg-green-50', hover: 'hover:bg-green-100', tag: 'bg-green-100', icon: 'text-green-600' },
  { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', tag: 'bg-purple-100', icon: 'text-purple-600' },
  { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', tag: 'bg-pink-100', icon: 'text-pink-600' },
  { bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100', tag: 'bg-yellow-100', icon: 'text-yellow-600' },
  { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', tag: 'bg-indigo-100', icon: 'text-indigo-600' },
  { bg: 'bg-red-50', hover: 'hover:bg-red-100', tag: 'bg-red-100', icon: 'text-red-600' },
  { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', tag: 'bg-orange-100', icon: 'text-orange-600' },
];

export function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const color = COLOR_OPTIONS[selectedColorIndex];
    onSubmit({ 
      name, 
      description,
      color: JSON.stringify(color) // 将颜色对象序列化
    });
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          项目名称
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="请输入项目名称"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          项目描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="请输入项目描述（选填）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          项目颜色
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color, index) => (
            <button
              key={index}
              type="button"
              className={`
                w-12 h-12 rounded-lg border-2 transition-all duration-150
                ${color.bg} ${color.hover}
                ${selectedColorIndex === index 
                  ? 'border-blue-500 scale-110' 
                  : 'border-transparent hover:scale-105'
                }
              `}
              onClick={() => setSelectedColorIndex(index)}
            />
          ))}
        </div>
        <div className="mt-2">
          <div className={`
            p-3 rounded-lg transition-colors duration-150
            ${COLOR_OPTIONS[selectedColorIndex].bg}
          `}>
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${COLOR_OPTIONS[selectedColorIndex].tag}
              ${COLOR_OPTIONS[selectedColorIndex].icon}
            `}>
              预览效果
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          创建
        </button>
      </div>
    </form>
  );
} 