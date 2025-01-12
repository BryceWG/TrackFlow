import React, { useState } from 'react';
import { useShortcuts } from '../hooks/useShortcuts';

export const ShortcutSettings: React.FC = () => {
  const { shortcuts, updateShortcut, resetShortcut } = useShortcuts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
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

  const handleKeyUp = (e: React.KeyboardEvent, id: string) => {
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
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">快捷键设置</h2>
      <div className="space-y-4">
        {Object.values(shortcuts).map(shortcut => (
          <div key={shortcut.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{shortcut.name}</div>
              <div className="text-sm text-gray-500">{shortcut.description}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 border rounded ${
                  editingId === shortcut.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => startRecording(shortcut.id)}
                onKeyDown={e => handleKeyDown(e, shortcut.id)}
                onKeyUp={e => handleKeyUp(e, shortcut.id)}
              >
                {editingId === shortcut.id ? '按下快捷键...' : shortcut.customKey || shortcut.defaultKey}
              </button>
              {shortcut.customKey && (
                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => resetShortcut(shortcut.id)}
                >
                  重置
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 