import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-neutral-400" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-800 mb-2">Tin nhắn</h2>
      <p className="text-sm text-neutral-500 max-w-xs">
        Tính năng nhắn tin đang được phát triển. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
