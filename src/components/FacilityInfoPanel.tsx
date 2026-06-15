import { X, Ruler, Package, Info } from "lucide-react";
import type { FacilityInfo } from "@/scene/types";

interface FacilityInfoPanelProps {
  facility: FacilityInfo | null;
  onClose: () => void;
}

export default function FacilityInfoPanel({ facility, onClose }: FacilityInfoPanelProps) {
  if (!facility) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-20 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">设施详情</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{facility.name}</h3>
          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {facility.type}
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {facility.description}
        </p>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">技术参数</span>
          </div>
          <div className="space-y-2">
            {Object.entries(facility.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{key}</span>
                <span className="text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Package className="w-3 h-3" />
            <span>点击场景中其他设施查看详情</span>
          </div>
        </div>
      </div>
    </div>
  );
}
