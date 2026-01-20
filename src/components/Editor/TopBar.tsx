import { Button } from "@/components/ui/button";
import {
  Menu,
  Share2,
  Play,
  Layout,
  MessageSquare,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 border-b border-sidebar-border bg-sidebar flex items-center px-4 justify-between z-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Untitled Project
            </span>
            <span className="text-[10px] text-muted-foreground">
              Auto-saved 10:35 AM
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-sidebar-accent/50 p-1 rounded-lg border border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs font-medium"
        >
          <Layout className="h-3.5 w-3.5" />
          Design
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs font-medium text-muted-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Prototype
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center mr-4 gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">100%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-sidebar-border bg-sidebar hover:bg-sidebar-accent"
        >
          <Play className="h-3.5 w-3.5" />
          Preview
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <Share2 className="h-3.5 w-3.5" />
          Publish
        </Button>
      </div>
    </header>
  );
}
