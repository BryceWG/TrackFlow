import React, { useState } from 'react';
import { useShortcuts } from '../hooks/useShortcuts';

export const ShortcutSettings: React.FC = () => {
  const { shortcuts, updateShortcut, resetShortcut } = useShortcuts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (!recording) return;

    const key = e.key.toUpperCase();
    if (key === 'ESCAPE') {
      setRecording(false);
      setTempKeys([]);
      return;
    }

    if (!tempKeys.includes(key)) {
      setTempKeys(prev => [...prev, key]);
    }
  };

  const handleKeyUp = (id: string) => {
    if (!recording) return;

    const shortcutStr = tempKeys
      .filter(k => k !== 'CONTROL' && k !== 'META' && k !== 'ALT' && k !== 'SHIFT')
      .join('+');
    
    const modifiers = [];
    if (tempKeys.includes('CONTROL')) modifiers.push('CommandOrControl');
    if (tempKeys.includes('ALT')) modifiers.push('Alt');
    if (tempKeys.includes('SHIFT')) modifiers.push('Shift');

    const finalShortcut = [...modifiers, shortcutStr].join('+');
    
    updateShortcut(id, finalShortcut);
    setRecording(false);
    setTempKeys([]);
    setEditingId(null);
  };

  const startRecording = (id: string) => {
    setEditingId(id);
    setRecording(true);
    setTempKeys([]);
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="space-y-6">
        <p className="text-sm text-gray-500">
          点击快捷键按钮进行编辑。按下新的按键组合来设置快捷键，按 ESC 取消编辑。
        </p>
        <div className="space-y-4">
          {Object.values(shortcuts).map(shortcut => (
            <div key={shortcut.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{shortcut.name}</div>
                  <div className="text-sm text-gray-500">{shortcut.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-4 py-2 border rounded-md transition-colors duration-150 ${
                      editingId === shortcut.id
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => startRecording(shortcut.id)}
                    onKeyDown={handleKeyDown}
      onKeyUp={() => handleKeyUp(shortcut.id)}
                  >
                    {editingId === shortcut.id ? (
                      <span className="text-blue-600">按下快捷键...</span>
                    ) : (
                      <span className="font-mono">{shortcut.customKey || shortcut.defaultKey}</span>
                    )}
                  </button>
                  {shortcut.customKey && (
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                      onClick={() => resetShortcut(shortcut.id)}
                    >
                      重置
                    </button>
                  )}
                </div>
              </div>
              {shortcut.customKey && (
                <div className="text-xs text-gray-400">
                  默认快捷键：<span className="font-mono">{shortcut.defaultKey}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
