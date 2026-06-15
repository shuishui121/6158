interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
}

export default function LoadingScreen({ isLoading, progress = 0 }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center z-30">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">田径馆虚拟漫游</h2>
          <p className="text-blue-200/70 text-sm">正在加载场景...</p>
        </div>

        <div className="w-64 mx-auto">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-blue-200/50 mt-2">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
