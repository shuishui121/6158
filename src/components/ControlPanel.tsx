import { Sun, Moon, Play, Home, Navigation, Eye, Users, EyeOff } from "lucide-react";
import type { TimeOfDay } from "@/scene/types";

interface ControlPanelProps {
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  isPointerLocked: boolean;
  onStartRoaming: () => void;
  onResetPosition: () => void;
  onTeleportToHighJump: () => void;
  spectatorCount: number;
  maxSpectatorCount: number;
  onSpectatorCountChange: (count: number) => void;
  spectatorsVisible: boolean;
  onSpectatorsVisibleChange: (visible: boolean) => void;
}

export default function ControlPanel({
  timeOfDay,
  onTimeOfDayChange,
  isPointerLocked,
  onStartRoaming,
  onResetPosition,
  onTeleportToHighJump,
  spectatorCount,
  maxSpectatorCount,
  onSpectatorCountChange,
  spectatorsVisible,
  onSpectatorsVisibleChange,
}: ControlPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 mb-1">光照模式</div>
        <div className="flex gap-1">
          <button
            onClick={() => onTimeOfDayChange("day")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              timeOfDay === "day"
                ? "bg-amber-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Sun className="w-4 h-4" />
            白天
          </button>
          <button
            onClick={() => onTimeOfDayChange("night")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              timeOfDay === "night"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Moon className="w-4 h-4" />
            夜间
          </button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 mb-1">漫游控制</div>
        <button
          onClick={onStartRoaming}
          className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Play className="w-4 h-4" />
          {isPointerLocked ? "漫游中..." : "开始漫游"}
        </button>
        <button
          onClick={onResetPosition}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Home className="w-4 h-4" />
          重置位置
        </button>
        <button
          onClick={onTeleportToHighJump}
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          传送到跳高区
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          虚拟观众
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSpectatorsVisibleChange(!spectatorsVisible)}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              spectatorsVisible
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {spectatorsVisible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            {spectatorsVisible ? "显示" : "隐藏"}
          </button>
          <span className="text-xs text-gray-500">
            {spectatorCount} / {maxSpectatorCount} 人
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">数量</span>
          <input
            type="range"
            min={0}
            max={maxSpectatorCount}
            value={spectatorCount}
            onChange={(e) => onSpectatorCountChange(parseInt(e.target.value))}
            disabled={!spectatorsVisible}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>
        <div className="text-[10px] text-gray-400">
          白天最多 {maxSpectatorCount} 人，夜间最多 20 人
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3">
        <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          操作说明
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 点击场景进入第一人称</p>
          <p>• WASD / 方向键 移动</p>
          <p>• 鼠标控制视角</p>
          <p>• 点击设施查看详情</p>
          <p>• ESC 退出漫游模式</p>
        </div>
      </div>
    </div>
  );
}
