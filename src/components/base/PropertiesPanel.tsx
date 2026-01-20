import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Trash2,
  Copy,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}) {
  if (!selectedElement) {
    return (
      <div className="w-64 bg-[#1a1a1a] border-l border-[#2d2d2d] p-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">No element selected</p>
          <p className="text-xs mt-1">
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    onUpdateElement(selectedElement.id, { [property]: value });
  };

  const isText = selectedElement.type === "text";
  const isShape = [
    "rectangle",
    "circle",
    "triangle",
    "line",
    "star",
    "polygon",
  ].includes(selectedElement.type);

  return (
    <div className="w-64 bg-[#1a1a1a] border-l border-[#2d2d2d] flex flex-col overflow-hidden">
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <TabsList className="bg-[#252525] mx-3 mt-3 grid grid-cols-2">
          <TabsTrigger
            value="properties"
            className="text-xs data-[state=active]:bg-[#3d3d3d] data-[state=active]:text-white"
          >
            Properties
          </TabsTrigger>
          <TabsTrigger
            value="layout"
            className="text-xs data-[state=active]:bg-[#3d3d3d] data-[state=active]:text-white"
          >
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="properties"
          className="flex-1 overflow-y-auto p-3 space-y-4 mt-0"
        >
          {/* Element Type Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white capitalize">
              {selectedElement.type}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
                onClick={() => onDuplicateElement(selectedElement.id)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-[#2d2d2d]"
                onClick={() => onDeleteElement(selectedElement.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Transform Section */}
          <div className="space-y-3">
            <span className="text-xs text-gray-400 font-medium">Transform</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-gray-500">X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.x || 0)}
                  onChange={(e) =>
                    handleChange("x", parseFloat(e.target.value))
                  }
                  className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.y || 0)}
                  onChange={(e) =>
                    handleChange("y", parseFloat(e.target.value))
                  }
                  className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">W</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.width || 0)}
                  onChange={(e) =>
                    handleChange("width", parseFloat(e.target.value))
                  }
                  className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">H</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.height || 0)}
                  onChange={(e) =>
                    handleChange("height", parseFloat(e.target.value))
                  }
                  className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-gray-500">Rotation</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[selectedElement.rotation || 0]}
                  onValueChange={([val]) => handleChange("rotation", val)}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">
                  {selectedElement.rotation || 0}°
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs bg-[#252525] border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d]"
                onClick={() =>
                  handleChange("scaleX", (selectedElement.scaleX || 1) * -1)
                }
              >
                <FlipHorizontal className="h-3 w-3 mr-1" /> Flip H
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs bg-[#252525] border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d]"
                onClick={() =>
                  handleChange("scaleY", (selectedElement.scaleY || 1) * -1)
                }
              >
                <FlipVertical className="h-3 w-3 mr-1" /> Flip V
              </Button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-3">
            <span className="text-xs text-gray-400 font-medium">
              Appearance
            </span>

            {isShape && (
              <>
                <div>
                  <Label className="text-[10px] text-gray-500">Fill</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="color"
                      value={selectedElement.fill || "#ffffff"}
                      onChange={(e) => handleChange("fill", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#3d3d3d]"
                    />
                    <Input
                      value={selectedElement.fill || "#ffffff"}
                      onChange={(e) => handleChange("fill", e.target.value)}
                      className="h-8 flex-1 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-gray-500">Stroke</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="color"
                      value={selectedElement.stroke || "#000000"}
                      onChange={(e) => handleChange("stroke", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#3d3d3d]"
                    />
                    <Input
                      value={selectedElement.stroke || "#000000"}
                      onChange={(e) => handleChange("stroke", e.target.value)}
                      className="h-8 flex-1 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-gray-500">
                    Stroke Width
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      value={[selectedElement.strokeWidth || 1]}
                      onValueChange={([val]) =>
                        handleChange("strokeWidth", val)
                      }
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-6">
                      {selectedElement.strokeWidth || 1}px
                    </span>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="text-[10px] text-gray-500">Opacity</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[(selectedElement.opacity || 1) * 100]}
                  onValueChange={([val]) => handleChange("opacity", val / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round((selectedElement.opacity || 1) * 100)}%
                </span>
              </div>
            </div>

            {selectedElement.type !== "line" && (
              <div>
                <Label className="text-[10px] text-gray-500">
                  Corner Radius
                </Label>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[selectedElement.cornerRadius || 0]}
                    onValueChange={([val]) => handleChange("cornerRadius", val)}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-6">
                    {selectedElement.cornerRadius || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Typography Section (for text elements) */}
          {isText && (
            <div className="space-y-3">
              <span className="text-xs text-gray-400 font-medium">
                Typography
              </span>

              <div>
                <Label className="text-[10px] text-gray-500">Font</Label>
                <Select
                  value={selectedElement.fontFamily || "Inter"}
                  onValueChange={(val) => handleChange("fontFamily", val)}
                >
                  <SelectTrigger className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252525] border-[#3d3d3d]">
                    <SelectItem value="Inter" className="text-white">
                      Inter
                    </SelectItem>
                    <SelectItem value="Arial" className="text-white">
                      Arial
                    </SelectItem>
                    <SelectItem value="Georgia" className="text-white">
                      Georgia
                    </SelectItem>
                    <SelectItem value="Comic Sans MS" className="text-white">
                      Comic Sans
                    </SelectItem>
                    <SelectItem value="Impact" className="text-white">
                      Impact
                    </SelectItem>
                    <SelectItem value="Courier New" className="text-white">
                      Courier
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-gray-500">Size</Label>
                  <Input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) =>
                      handleChange("fontSize", parseFloat(e.target.value))
                    }
                    className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">Weight</Label>
                  <Select
                    value={selectedElement.fontWeight || "normal"}
                    onValueChange={(val) => handleChange("fontWeight", val)}
                  >
                    <SelectTrigger className="h-8 bg-[#252525] border-[#3d3d3d] text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252525] border-[#3d3d3d]">
                      <SelectItem value="normal" className="text-white">
                        Regular
                      </SelectItem>
                      <SelectItem value="500" className="text-white">
                        Medium
                      </SelectItem>
                      <SelectItem value="600" className="text-white">
                        Semibold
                      </SelectItem>
                      <SelectItem value="bold" className="text-white">
                        Bold
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-gray-500">Color</Label>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={selectedElement.fill || "#ffffff"}
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#3d3d3d]"
                  />
                  <Input
                    value={selectedElement.fill || "#ffffff"}
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="h-8 flex-1 bg-[#252525] border-[#3d3d3d] text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-gray-500">Alignment</Label>
                <div className="flex gap-1 mt-1">
                  {[
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-7 w-7 border-[#3d3d3d]",
                        selectedElement.textAlign === value
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-[#252525] text-gray-400 hover:text-white",
                      )}
                      onClick={() => handleChange("textAlign", value)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-7 w-7 border-[#3d3d3d]",
                    selectedElement.fontStyle === "italic"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-[#252525] text-gray-400 hover:text-white",
                  )}
                  onClick={() =>
                    handleChange(
                      "fontStyle",
                      selectedElement.fontStyle === "italic"
                        ? "normal"
                        : "italic",
                    )
                  }
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-7 w-7 border-[#3d3d3d]",
                    selectedElement.textDecoration === "underline"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-[#252525] text-gray-400 hover:text-white",
                  )}
                  onClick={() =>
                    handleChange(
                      "textDecoration",
                      selectedElement.textDecoration === "underline"
                        ? "none"
                        : "underline",
                    )
                  }
                >
                  <Underline className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="layout"
          className="flex-1 overflow-y-auto p-3 space-y-4 mt-0"
        >
          <div className="space-y-3">
            <span className="text-xs text-gray-400 font-medium">Alignment</span>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-[#252525] border-[#3d3d3d] text-gray-400 hover:text-white text-xs"
              >
                <AlignStartVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-[#252525] border-[#3d3d3d] text-gray-400 hover:text-white text-xs"
              >
                <AlignCenterVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-[#252525] border-[#3d3d3d] text-gray-400 hover:text-white text-xs"
              >
                <AlignEndVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs text-gray-400 font-medium">
              Layer Order
            </span>
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 bg-[#252525] border-[#3d3d3d] text-gray-300 hover:text-white text-xs justify-start"
              >
                Bring to Front
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 bg-[#252525] border-[#3d3d3d] text-gray-300 hover:text-white text-xs justify-start"
              >
                Bring Forward
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 bg-[#252525] border-[#3d3d3d] text-gray-300 hover:text-white text-xs justify-start"
              >
                Send Backward
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 bg-[#252525] border-[#3d3d3d] text-gray-300 hover:text-white text-xs justify-start"
              >
                Send to Back
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
