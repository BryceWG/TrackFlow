import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
}

// 添加时区转换函数
const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16); // 只保留到分钟
};

interface EntryFormProps {
  projects: Project[];
  onSubmit: (entry: { title: string; content: string; projectId: string; timestamp: string }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    projectId: string;
    timestamp?: string;
  };
  mode?: 'create' | 'edit';
}

export const EntryForm: React.FC<EntryFormProps> = ({
  projects,
  onSubmit,
  onCancel,
  mode = 'create',
  initialData,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    projectId: initialData?.projectId || '',
    timestamp: initialData?.timestamp || toLocalISOString(new Date()),
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        projectId: initialData.projectId,
        timestamp: initialData.timestamp || toLocalISOString(new Date()),
      });
    } else if (initialData?.projectId) {
      setFormData({
        title: '',
        content: '',
        projectId: initialData.projectId,
        timestamp: toLocalISOString(new Date()),
      });
    }
  }, [mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 检查是否至少填写了标题或内容之一
    if (!formData.title.trim() && !formData.content.trim()) {
      setError('请至少填写标题或内容其中之一');
      return;
    }

    if (!formData.projectId) {
      setError('请选择所属项目');
      return;
    }

    if (!formData.timestamp) {
      setError('请选择记录时间');
      return;
    }

    onSubmit({ 
      title: formData.title.trim(), 
      content: formData.content.trim(), 
      projectId: formData.projectId,
      timestamp: formData.timestamp
    });

    if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        projectId: '',
        timestamp: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          记录标题
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="请输入记录标题"
        />
      </div>

      <div>
        <label htmlFor="project" className="block text-sm font-medium text-gray-700">
          所属项目 <span className="text-red-500">*</span>
        </label>
        <select
          id="project"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">请选择项目</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700">
          记录时间 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="timestamp"
          value={formData.timestamp}
          onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          记录内容
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="请输入记录内容"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-2 text-sm text-gray-500">
        注：标题和内容至少填写一项
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
          {mode === 'create' ? '创建' : '保存'}
        </button>
      </div>
    </form>
  );
}; 