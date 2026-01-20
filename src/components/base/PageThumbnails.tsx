import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PageThumbnails({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}) {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="h-28 bg-[#1a1a1a] border-t border-[#2d2d2d] flex items-center">
      {/* Scroll Left */}
      <Button
        variant="ghost"
        size="icon"
        className="h-full w-8 rounded-none text-gray-500 hover:text-white hover:bg-[#252525] flex-shrink-0"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Pages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto flex items-center gap-3 px-3 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={cn(
              "relative flex-shrink-0 cursor-pointer group transition-all",
              currentPageIndex === index && "ring-2 ring-purple-500",
            )}
            onClick={() => onSelectPage(index)}
          >
            {/* Thumbnail */}
            <div
              className={cn(
                "w-16 h-20 bg-[#252525] rounded-md border-2 transition-colors overflow-hidden",
                currentPageIndex === index
                  ? "border-purple-500"
                  : "border-[#3d3d3d] hover:border-gray-500",
              )}
            >
              {/* Mini preview would go here */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-gray-500">
                  Page {index + 1}
                </span>
              </div>
            </div>

            {/* Page Number */}
            <div className="text-center mt-1">
              <span className="text-[10px] text-gray-400">{index + 1}</span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 h-5 w-5 bg-[#252525] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#252525] border-[#3d3d3d]">
                <DropdownMenuItem
                  className="text-gray-300 focus:bg-[#3d3d3d] focus:text-white cursor-pointer text-xs"
                  onClick={() => onDuplicatePage(index)}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 focus:bg-[#3d3d3d] focus:text-red-400 cursor-pointer text-xs"
                  onClick={() => onDeletePage(index)}
                  disabled={pages.length <= 1}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {/* Add Page Button */}
        <Button
          variant="outline"
          className="w-16 h-20 flex-shrink-0 border-dashed border-[#3d3d3d] bg-transparent hover:bg-[#252525] hover:border-gray-500 flex flex-col items-center justify-center gap-1"
          onClick={onAddPage}
        >
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-[9px] text-gray-500">Add</span>
        </Button>
      </div>

      {/* Scroll Right */}
      <Button
        variant="ghost"
        size="icon"
        className="h-full w-8 rounded-none text-gray-500 hover:text-white hover:bg-[#252525] flex-shrink-0"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
