import { useState } from 'react'
import { PlusIcon, CalendarIcon, FolderIcon } from '@heroicons/react/24/outline'
import { Modal } from './components/Modal'
import { ProjectForm } from './components/ProjectForm'
import { EntryForm } from './components/EntryForm'

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Entry {
  id: string;
  title: string;
  content: string;
  projectId: string;
  timestamp: string;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  const handleCreateProject = (projectData: { name: string; description: string }) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
    };
    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleCreateEntry = (entryData: { title: string; content: string; projectId: string }) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entryData,
      timestamp: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    setIsEntryModalOpen(false);
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || '';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className={`w-64 bg-white shadow-lg ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">项目列表</h2>
          <button 
            className="mt-4 flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            新建项目
          </button>
        </div>
        <nav className="mt-4">
          <div className="px-4 py-2 text-sm font-medium text-gray-600">
            {projects.map(project => (
              <div 
                key={project.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                title={project.description}
              >
                <FolderIcon className="w-5 h-5" />
                <span>{project.name}</span>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">时间轴</h1>
            <button 
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => setIsEntryModalOpen(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              新建记录
            </button>
          </div>

          {/* 时间轴 */}
          <div className="space-y-6">
            {entries.map(entry => (
              <div key={entry.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200"></div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-4">
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getProjectName(entry.projectId)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{entry.content}</p>
                </div>
              </div>
            ))}
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

      {/* 新建记录弹窗 */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="新建记录"
      >
        <EntryForm
          projects={projects}
          onSubmit={handleCreateEntry}
          onCancel={() => setIsEntryModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default App
