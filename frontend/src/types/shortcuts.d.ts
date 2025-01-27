export interface Shortcut {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  customKey?: string;
}

export interface ShortcutAction {
  type: string;
  payload?: any;
}

export type ShortcutMap = {
  [key: string]: Shortcut;
} 