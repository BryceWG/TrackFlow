import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  Bars3Icon,
  XMarkIcon as MenuCloseIcon
} from '@heroicons/react/24/outline'
import { Modal } from './components/Modal'
import { ProjectForm } from './components/ProjectForm'
import { EntryForm } from './components/EntryForm'
import { FilterBar } from './components/FilterBar'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Toast, ToastType } from './components/Toast'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useLocalStorage } from './hooks/useLocalStorage'
import { AIConfig } from './components/AIConfig'
import { AIAnalysis } from './components/AIAnalysis'
import { PromptPresets, Preset } from './components/PromptPresets'
import { Login } from './components/Login'
import { UserManagement } from './components/UserManagement'
import { useAuth } from './hooks/useAuth'
import { WebDAVManager } from './components/WebDAVManager'
import { ShortcutSettings } from './components/ShortcutSettings'

interface Project {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  emoji: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Entry {
  id: string;
  title: string;
  content: string;
  projectId: string;
  timestamp: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DateRange {
  start: string | null;
  end: string | null;
}

interface AIConfigData {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  systemPrompt: string;
}

// 默认颜色对象
const DEFAULT_COLOR = {
  bg: 'bg-blue-50',
  hover: 'hover:bg-blue-100',
  tag: 'bg-blue-100',
  icon: 'text-blue-600',
  border: 'border-blue-200'
};

function App() {
  const {
    users,
    currentUser,
    error: authError,
    isAuthenticated,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
  } = useAuth();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [entries, setEntries] = useLocalStorage<Entry[]>('entries', []);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: ToastType; message: string; show: boolean }>({
    type: 'info',
    message: '',
    show: false,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiConfig, setAIConfig] = useLocalStorage<AIConfigData>('aiConfig', {
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    systemPrompt: '',
  });
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [isPromptPresetsOpen, setIsPromptPresetsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [promptPresets, setPromptPresets] = useLocalStorage<Preset[]>('promptPresets', []);
  const [isWebDAVOpen, setIsWebDAVOpen] = useState(false);

  // 模拟加载效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 添加快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下 Ctrl+N 或 Command+N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault(); // 阻止默认行为
        if (projects.length > 0) {
          handleOpenEntryModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects.length]);

  // 数据迁移：为旧数据添加颜色属性
  useEffect(() => {
    const needsMigration = projects.some(project => !project.color);
    if (needsMigration) {
      const migratedProjects = projects.map(project => ({
        ...project,
        color: project.color || JSON.stringify(DEFAULT_COLOR)
      }));
      setProjects(migratedProjects);
    }
  }, []);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message, show: true });
  };

  const handleCreateProject = (projectData: { name: string; description: string; color: string; emoji: string }) => {
    try {
      const now = new Date().toISOString();
      const newProject = {
        id: Date.now().toString(),
        order: projects.length,
        userId: currentUser!.id,
        createdAt: now,
        updatedAt: now,
        ...projectData,
      };
      setProjects([...projects, newProject]);
      setIsProjectModalOpen(false);
      showToast('success', '项目创建成功');
    } catch (error) {
      showToast('error', '项目创建失败');
    }
  };

  const handleCreateEntry = (entryData: { title: string; content: string; projectId: string; timestamp: string }) => {
    try {
      const now = new Date().toISOString();
      const newEntry = {
        id: Date.now().toString(),
        ...entryData,
        userId: currentUser!.id,
        createdAt: now,
        updatedAt: now,
      };
      setEntries([...entries, newEntry]);
      setIsEntryModalOpen(false);
      showToast('success', '记录创建成功');
    } catch (error) {
      showToast('error', '记录创建失败');
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleUpdateEntry = (entryData: { title: string; content: string; projectId: string; timestamp: string }) => {
    try {
      if (!editingEntry) return;
      const now = new Date().toISOString();
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...entryData, updatedAt: now }
          : entry
      );
      setEntries(updatedEntries);
      setIsEntryModalOpen(false);
      setEditingEntry(null);
      showToast('success', '记录更新成功');
    } catch (error) {
      showToast('error', '记录更新失败');
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除记录',
      message: '确定要删除这条记录吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: () => {
        try {
          setEntries(entries.filter(entry => entry.id !== entryId));
          showToast('success', '记录删除成功');
        } catch (error) {
          showToast('error', '记录删除失败');
        }
      },
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除项目',
      message: '确定要删除这个项目吗？相关的记录也会被删除，此操作无法撤销。',
      type: 'danger',
      onConfirm: () => {
        try {
          setProjects(projects.filter(p => p.id !== projectId));
          setEntries(entries.filter(e => e.projectId !== projectId));
          if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
          }
          showToast('success', '项目删除成功');
        } catch (error) {
          showToast('error', '项目删除失败');
        }
      },
    });
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
      if (entry.userId !== currentUser?.id) {
        return false;
      }
      
      if (selectedProjectId && entry.projectId !== selectedProjectId) {
        return false;
      }
      
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

  const sortedProjects = [...projects]
    .filter(project => project.userId === currentUser?.id)
    .sort((a, b) => a.order - b.order);

  // 获取记录数量最多的项目ID
  const getMostUsedProjectId = () => {
    if (selectedProjectId) return selectedProjectId;

    const projectCounts = entries.reduce((acc, entry) => {
      acc[entry.projectId] = (acc[entry.projectId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 过滤掉已删除的项目
    const validProjectIds = projects.map(p => p.id);
    let maxCount = 0;
    let mostUsedProjectId = projects[0]?.id || '';

    Object.entries(projectCounts).forEach(([projectId, count]) => {
      if (count > maxCount && validProjectIds.includes(projectId)) {
        maxCount = count;
        mostUsedProjectId = projectId;
      }
    });

    return mostUsedProjectId;
  };

  const handleOpenEntryModal = () => {
    setEditingEntry(null);
    setIsEntryModalOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
    handleCloseMobileMenu();
  };

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: '退出登录',
      message: '确定要退出登录吗？',
      type: 'warning',
      onConfirm: () => {
        logout();
        showToast('success', '已退出登录');
      },
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={login} error={authError} />;
  }

  if (isLoading) {
  return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端菜单按钮 */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <MenuCloseIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* 侧边栏 - 在移动端变为抽屉式菜单 */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* 标题和按钮区域 */}
          <div className="p-4">
            {/* 在移动端添加顶部空间，为菜单按钮留位置 */}
            <div className="h-14 lg:h-0" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">项目列表</h2>
              <button 
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => {
                  setEditingEntry(null);
                  setIsProjectModalOpen(true);
                  handleCloseMobileMenu();
                }}
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                新建
              </button>
            </div>
          </div>

          {/* 项目列表 */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-sm font-medium text-gray-600">
              {sortedProjects.map((project, index) => {
                let colorObj;
                try {
                  colorObj = JSON.parse(project.color);
                } catch {
                  colorObj = DEFAULT_COLOR;
                }
                return (
                  <div 
                    key={project.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors duration-150
                      ${colorObj.bg} ${colorObj.hover}
                      ${selectedProjectId === project.id ? `border-2 ${colorObj.border}` : 'border-2 border-transparent'}
                    `}
                    onClick={() => handleProjectSelect(project.id)}
                    title={project.description}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${
                        selectedProjectId === project.id ? colorObj.icon : ''
                      }`}>
                        {project.emoji}
                      </span>
                      <span className={selectedProjectId === project.id ? colorObj.icon : ''}>
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
                );
              })}
              {projects.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  暂无项目，点击上方按钮创建
                </div>
              )}
            </div>
          </nav>

          {/* AI 和用户管理按钮 */}
          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => setIsAIConfigOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              AI 设置
            </button>
            <button
              onClick={() => setIsPromptPresetsOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              提示词预设
            </button>
            <button
              onClick={() => setIsWebDAVOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              数据管理
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                用户管理
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              退出登录
            </button>
          </div>

          <div className="border-t">
            <ShortcutSettings />
          </div>
        </div>
      </aside>

      {/* 移动端菜单遮罩 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pl-12 lg:pl-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">
                {selectedProjectId ? `${getProjectName(selectedProjectId)}的时间轴` : '所有记录'}
              </h1>
              <div className="flex items-center gap-4">
                <FilterBar onDateRangeChange={setDateRange} />
                <button
                  onClick={() => setIsAIAnalysisOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <span className="mr-1">AI 分析</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  handleOpenEntryModal();
                  handleCloseMobileMenu();
                }}
                disabled={projects.length === 0}
                title={projects.length === 0 ? "请先创建项目" : "快捷键：Ctrl/Command + N"}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                新建记录
        </button>
            </div>
          </div>

          {/* 时间轴 */}
          <div className="space-y-4 sm:space-y-6">
            {filteredEntries.map(entry => {
              const project = projects.find(p => p.id === entry.projectId);
              let colorObj;
              try {
                colorObj = project ? JSON.parse(project.color) : null;
              } catch {
                colorObj = project ? DEFAULT_COLOR : null;
              }
              return (
                <div 
                  key={entry.id} 
                  className="flex group"
                  onDoubleClick={() => {
                    handleEditEntry(entry);
                    handleCloseMobileMenu();
                  }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center mr-2 sm:mr-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-lg sm:text-xl ${colorObj?.tag || 'bg-blue-100'}`}>
                      {project?.emoji || '📝'}
                    </div>
                    <div className="h-full w-0.5 bg-gray-200"></div>
                  </div>
                  <div className={`flex-1 rounded-lg shadow p-3 sm:p-4 group-hover:ring-1 group-hover:ring-blue-200 cursor-pointer transition-colors duration-150 border-2
                    ${colorObj?.bg || 'bg-white'}
                    ${colorObj?.border || 'border-blue-200'}
                  `}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                      <div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">{entry.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorObj?.tag || 'bg-blue-100'} ${colorObj?.icon || 'text-blue-600'}`}>
                          {getProjectName(entry.projectId)}
                        </span>
                        <div className="flex sm:hidden group-hover:flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEntry(entry);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                            title="编辑"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-red-600"
                            title="删除"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">{entry.content}</p>
                  </div>
                </div>
              );
            })}
            {filteredEntries.length === 0 && (
              <div className="text-center text-gray-500 py-6 sm:py-8">
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
          onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
          onCancel={() => {
            setIsEntryModalOpen(false);
            setEditingEntry(null);
          }}
          mode={editingEntry ? 'edit' : 'create'}
          initialData={editingEntry ? {
            title: editingEntry.title,
            content: editingEntry.content,
            projectId: editingEntry.projectId,
            timestamp: editingEntry.timestamp
          } : {
            title: '',
            content: '',
            projectId: selectedProjectId || getMostUsedProjectId(),
          }}
        />
      </Modal>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {/* Toast 通知 */}
      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* AI 配置弹窗 */}
      <Modal
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
        title="AI 服务配置"
      >
        <AIConfig
          config={aiConfig}
          onSave={(newConfig) => {
            setAIConfig(newConfig);
            setIsAIConfigOpen(false);
            showToast('success', 'AI 配置已保存');
          }}
          onClose={() => setIsAIConfigOpen(false)}
        />
      </Modal>

      {/* AI 分析弹窗 */}
      <Modal
        isOpen={isAIAnalysisOpen}
        onClose={() => setIsAIAnalysisOpen(false)}
        title="AI 分析"
      >
        <AIAnalysis
          entries={filteredEntries}
          projectName={getProjectName(selectedProjectId || '')}
          dateRange={dateRange}
          config={aiConfig}
          presets={promptPresets}
          onError={(message) => {
            showToast('error', message);
          }}
        />
      </Modal>

      {/* 提示词预设弹窗 */}
      <Modal
        isOpen={isPromptPresetsOpen}
        onClose={() => setIsPromptPresetsOpen(false)}
        title="提示词预设管理"
      >
        <PromptPresets
          presets={promptPresets}
          onSave={(newPresets) => {
            setPromptPresets(newPresets);
            setIsPromptPresetsOpen(false);
            showToast('success', '提示词预设已保存');
          }}
          onClose={() => setIsPromptPresetsOpen(false)}
        />
      </Modal>

      {/* 用户管理弹窗 */}
      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title="用户管理"
      >
        <UserManagement
          users={users}
          currentUser={currentUser!}
          onAddUser={(userData) => {
            try {
              addUser(userData);
              showToast('success', '用户创建成功');
            } catch (error) {
              showToast('error', error instanceof Error ? error.message : '创建用户失败');
            }
          }}
          onUpdateUser={(userId, updates) => {
            try {
              updateUser(userId, updates);
              showToast('success', '用户更新成功');
            } catch (error) {
              showToast('error', error instanceof Error ? error.message : '更新用户失败');
            }
          }}
          onDeleteUser={(userId) => {
            setConfirmDialog({
              isOpen: true,
              title: '删除用户',
              message: '确定要删除这个用户吗？此操作无法撤销。',
              type: 'danger',
              onConfirm: () => {
                try {
                  deleteUser(userId);
                  showToast('success', '用户删除成功');
                } catch (error) {
                  showToast('error', error instanceof Error ? error.message : '删除用户失败');
                }
              },
            });
          }}
          onClose={() => setIsUserManagementOpen(false)}
        />
      </Modal>

      {/* WebDAV 管理弹窗 */}
      <Modal
        isOpen={isWebDAVOpen}
        onClose={() => setIsWebDAVOpen(false)}
        title="数据管理"
      >
        <WebDAVManager
          projects={projects}
          entries={entries}
          users={users}
          promptPresets={promptPresets}
          onRestore={(data) => {
            setConfirmDialog({
              isOpen: true,
              title: '恢复数据',
              message: '确定要恢复数据吗？当前的数据将被覆盖。',
              type: 'warning',
              onConfirm: () => {
                setProjects(data.projects);
                setEntries(data.entries);
                setPromptPresets(data.promptPresets);
                showToast('success', '数据恢复成功');
                setIsWebDAVOpen(false);
              },
            });
          }}
        />
      </Modal>
    </div>
  )
}

export default App
