import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';

export interface Preset {
  id: string;
  name: string;
  prompt: string;
}

interface PromptPresetsProps {
  presets: Preset[];
  onSave: (presets: Preset[]) => void;
  onClose: () => void;
}

export function PromptPresets({ presets: initialPresets, onSave, onClose }: PromptPresetsProps) {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [newPreset, setNewPreset] = useState(false);

  const handleAddPreset = () => {
    setNewPreset(true);
    setEditingPreset({
      id: Date.now().toString(),
      name: '',
      prompt: '',
    });
  };

  const handleEditPreset = (preset: Preset) => {
    setNewPreset(false);
    setEditingPreset(preset);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  const handleSavePreset = () => {
    if (!editingPreset || !editingPreset.name.trim() || !editingPreset.prompt.trim()) return;

    if (newPreset) {
      setPresets([...presets, editingPreset]);
    } else {
      setPresets(presets.map(p => p.id === editingPreset.id ? editingPreset : p));
    }
    setEditingPreset(null);
    setNewPreset(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(presets);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">提示词预设</h3>
        <button
          type="button"
          onClick={handleAddPreset}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          添加预设
        </button>
      </div>

      {/* 预设列表 */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {presets.map(preset => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <span className="font-medium">{preset.name}</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleEditPreset(preset)}
                className="p-1 text-gray-600 hover:text-gray-900"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeletePreset(preset.id)}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          保存
        </button>
      </div>

      {/* 编辑预设的Modal */}
      <Modal
        isOpen={editingPreset !== null}
        onClose={() => {
          setEditingPreset(null);
          setNewPreset(false);
        }}
        title={newPreset ? '添加预设' : '编辑预设'}
      >
        {editingPreset && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                预设名称
              </label>
              <input
                type="text"
                value={editingPreset.name}
                onChange={e => setEditingPreset({ ...editingPreset, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="例如：周报总结"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                提示词内容
              </label>
              <textarea
                value={editingPreset.prompt}
                onChange={e => setEditingPreset({ ...editingPreset, prompt: e.target.value })}
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="请输入提示词内容..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingPreset(null);
                  setNewPreset(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </Modal>
    </form>
  );
} 