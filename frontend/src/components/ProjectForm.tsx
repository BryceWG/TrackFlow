import { useState } from 'react';

const EMOJI_OPTIONS = [
  { emoji: '📝', label: '笔记' },
  { emoji: '💻', label: '编程' },
  { emoji: '📚', label: '学习' },
  { emoji: '🎯', label: '目标' },
  { emoji: '🎨', label: '设计' },
  { emoji: '🎮', label: '游戏' },
  { emoji: '🏃', label: '运动' },
  { emoji: '🎵', label: '音乐' },
  { emoji: '🎬', label: '视频' },
  { emoji: '📷', label: '摄影' },
  { emoji: '🍳', label: '烹饪' },
  { emoji: '🛠️', label: '工具' },
];

const COLOR_OPTIONS = [
  {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    tag: 'bg-blue-100',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    label: '蓝色'
  },
  {
    bg: 'bg-green-50',
    hover: 'hover:bg-green-100',
    tag: 'bg-green-100',
    icon: 'text-green-600',
    border: 'border-green-200',
    label: '绿色'
  },
  {
    bg: 'bg-yellow-50',
    hover: 'hover:bg-yellow-100',
    tag: 'bg-yellow-100',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
    label: '黄色'
  },
  {
    bg: 'bg-red-50',
    hover: 'hover:bg-red-100',
    tag: 'bg-red-100',
    icon: 'text-red-600',
    border: 'border-red-200',
    label: '红色'
  },
  {
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
    tag: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    label: '紫色'
  },
  {
    bg: 'bg-pink-50',
    hover: 'hover:bg-pink-100',
    tag: 'bg-pink-100',
    icon: 'text-pink-600',
    border: 'border-pink-200',
    label: '粉色'
  },
];

interface ProjectFormProps {
  onSubmit: (data: { name: string; description: string; color: string; emoji: string }) => void;
  onCancel: () => void;
}

export function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0].emoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      color: JSON.stringify(selectedColor),
      emoji: selectedEmoji,
    });
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          项目图标
        </label>
        <div className="mt-1 relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="text-xl mr-2">{selectedEmoji}</span>
            <span>选择图标</span>
          </button>
          {showEmojiPicker && (
            <div className="absolute z-10 mt-1 w-60 bg-white rounded-md shadow-lg">
              <div className="p-2 grid grid-cols-6 gap-1">
                {EMOJI_OPTIONS.map((option, index) => (
                  <button
                    key={`${option.emoji}-${index}`}
                    type="button"
                    onClick={() => {
                      setSelectedEmoji(option.emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
                    title={option.label}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          项目颜色
        </label>
        <div className="mt-1 grid grid-cols-6 gap-2">
          {COLOR_OPTIONS.map((color, index) => (
            <button
              key={`${color.label}-${index}`}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-transform duration-200
                ${color.bg}
                ${selectedColor === color ? 'scale-110 ' + color.border : 'border-transparent'}
              `}
              title={color.label}
            />
          ))}
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
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          创建
        </button>
      </div>
    </form>
  );
} 