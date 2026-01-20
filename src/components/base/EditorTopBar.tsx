import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Upload,
  ChevronDown,
  Undo2,
  Redo2,
  Save,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EditorTopBar({
  projectTitle,
  setProjectTitle,
  onSave,
  saving,
  lastSaved,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  onExport,
}) {
  return (
    <div className="h-14 bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center justify-between px-4">
      {/* Left Section - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-white font-semibold hidden sm:block">
            MangaStudio
          </span>
        </div>

        <div className="h-6 w-px bg-[#2d2d2d] hidden sm:block" />

        <div className="flex flex-col">
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent border-none text-white font-medium text-sm h-6 p-0 focus-visible:ring-0 w-32 sm:w-48"
            placeholder="Untitled"
          />
          <span className="text-[10px] text-gray-500">
            {saving
              ? "Saving..."
              : lastSaved
                ? `Auto-saved ${lastSaved}`
                : "Not saved"}
          </span>
        </div>
      </div>

      {/* Center Section - Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-[#2d2d2d] hidden sm:flex"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="border-[#3d3d3d] bg-transparent text-gray-300 hover:text-white hover:bg-[#2d2d2d]"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#252525] border-[#3d3d3d]">
            <DropdownMenuItem
              className="text-gray-300 focus:bg-[#3d3d3d] focus:text-white cursor-pointer"
              onClick={() => onExport("png")}
            >
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-300 focus:bg-[#3d3d3d] focus:text-white cursor-pointer"
              onClick={() => onExport("jpg")}
            >
              Export as JPG
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-300 focus:bg-[#3d3d3d] focus:text-white cursor-pointer"
              onClick={() => onExport("pdf")}
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
