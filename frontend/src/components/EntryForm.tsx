import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface EntryFormProps {
  projects: Project[];
  onSubmit: (entry: { title: string; content: string; projectId: string }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    projectId: string;
  };
  mode?: 'create' | 'edit';
}

export function EntryForm({ projects, onSubmit, onCancel, initialData, mode = 'create' }: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setProjectId(initialData.projectId);
    } else if (initialData?.projectId) {
      setProjectId(initialData.projectId);
    }
  }, [mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 检查是否至少填写了标题或内容之一
    if (!title.trim() && !content.trim()) {
      setError('请至少填写标题或内容其中之一');
      return;
    }

    if (!projectId) {
      setError('请选择所属项目');
      return;
    }

    onSubmit({ 
      title: title.trim(), 
      content: content.trim(), 
      projectId 
    });

    if (mode === 'create') {
      setTitle('');
      setContent('');
      setProjectId('');
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
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
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          记录内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
} 