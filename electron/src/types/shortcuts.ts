export interface Shortcut {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  customKey?: string;
}

export interface ShortcutMap {
  [key: string]: Shortcut;
} 