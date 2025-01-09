import { useState } from 'react'
import { PlusIcon, CalendarIcon, FolderIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { Modal } from './components/Modal'
import { ProjectForm } from './components/ProjectForm'
import { EntryForm } from './components/EntryForm'
import { FilterBar } from './components/FilterBar'
import { useLocalStorage } from './hooks/useLocalStorage'

interface Project {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface Entry {
  id: string;
  title: string;
  content: string;
  projectId: string;
  timestamp: string;
}

interface DateRange {
  start: string | null;
  end: string | null;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [entries, setEntries] = useLocalStorage<Entry[]>('entries', []);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const handleCreateProject = (projectData: { name: string; description: string }) => {
    const newProject = {
      id: Date.now().toString(),
      order: projects.length,
      ...projectData,
    };
    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleCreateEntry = (entryData: { title: string; content: string; projectId: string }) => {
    if (editingEntry) {
      // 编辑模式
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...entryData }
          : entry
      );
      setEntries(updatedEntries);
      setEditingEntry(null);
    } else {
      // 创建模式
      const newEntry = {
        id: Date.now().toString(),
        ...entryData,
        timestamp: new Date().toISOString(),
      };
      setEntries([newEntry, ...entries]);
    }
    setIsEntryModalOpen(false);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    setEntries(entries.filter(entry => entry.id !== entryId));
  };

  const handleDeleteProject = (projectId: string) => {
    if (!window.confirm('确定要删除这个项目吗？相关的记录也会被删除。')) return;
    
    setProjects(projects.filter(p => p.id !== projectId));
    setEntries(entries.filter(e => e.projectId !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const handleMoveProject = (projectId: string, direction: 'up' | 'down') => {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (
      (direction === 'up' && projectIndex === 0) || 
      (direction === 'down' && projectIndex === projects.length - 1)
    ) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? projectIndex - 1 : projectIndex + 1;
    
    [newProjects[projectIndex], newProjects[targetIndex]] = 
    [newProjects[targetIndex], newProjects[projectIndex]];
    
    newProjects.forEach((p, index) => {
      p.order = index;
    });
    
    setProjects(newProjects);
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || '';
  };

  const filteredEntries = entries
    .filter(entry => {
      // 项目筛选
      if (selectedProjectId && entry.projectId !== selectedProjectId) {
        return false;
      }
      
      // 日期范围筛选
      if (dateRange.start && dateRange.end) {
        const entryDate = new Date(entry.timestamp);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        if (entryDate < start || entryDate > end) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className={`w-64 bg-white shadow-lg ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">项目列表</h2>
          <button 
            className="mt-4 flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => {
              setEditingEntry(null);
              setIsProjectModalOpen(true);
            }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            新建项目
          </button>
        </div>
        <nav className="mt-4">
          <div className="px-4 py-2 text-sm font-medium text-gray-600">
            {sortedProjects.map((project, index) => (
              <div 
                key={project.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer group hover:bg-gray-100 ${
                  selectedProjectId === project.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedProjectId(project.id === selectedProjectId ? null : project.id)}
                title={project.description}
              >
                <div className="flex items-center space-x-2">
                  <FolderIcon className={`w-5 h-5 ${
                    selectedProjectId === project.id ? 'text-blue-600' : ''
                  }`} />
                  <span className={selectedProjectId === project.id ? 'text-blue-600' : ''}>
                    {project.name}
                  </span>
                </div>
                <div className="hidden group-hover:flex items-center space-x-1">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveProject(project.id, 'up');
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      ↑
                    </button>
                  )}
                  {index < projects.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveProject(project.id, 'down');
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                暂无项目，点击上方按钮创建
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {selectedProjectId ? `${getProjectName(selectedProjectId)}的时间轴` : '所有记录'}
              </h1>
              <FilterBar onDateRangeChange={setDateRange} />
            </div>
            <button 
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setEditingEntry(null);
                setIsEntryModalOpen(true);
              }}
              disabled={projects.length === 0}
              title={projects.length === 0 ? "请先创建项目" : ""}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              新建记录
            </button>
          </div>

          {/* 时间轴 */}
          <div className="space-y-6">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="flex group">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200"></div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-4 group-hover:ring-1 group-hover:ring-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{entry.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getProjectName(entry.projectId)}
                      </span>
                      <div className="hidden group-hover:flex items-center space-x-1">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          title="编辑"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                          title="删除"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{entry.content}</p>
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {selectedProjectId ? '该项目暂无记录' : '暂无记录'}，点击右上角按钮创建
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 新建项目弹窗 */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="新建项目"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsProjectModalOpen(false)}
        />
      </Modal>

      {/* 记录表单弹窗 */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        title={editingEntry ? "编辑记录" : "新建记录"}
      >
        <EntryForm
          projects={projects}
          onSubmit={handleCreateEntry}
          onCancel={() => {
            setIsEntryModalOpen(false);
            setEditingEntry(null);
          }}
          mode={editingEntry ? 'edit' : 'create'}
          initialData={editingEntry ? {
            title: editingEntry.title,
            content: editingEntry.content,
            projectId: editingEntry.projectId,
          } : undefined}
        />
      </Modal>
    </div>
  )
}

export default App
