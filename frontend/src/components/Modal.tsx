import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* 弹窗内容 */}
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
          {/* 标题栏 */}
          <div className="bg-white px-4 py-3 sm:px-6 flex justify-between items-center border-b">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="bg-white px-4 py-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 