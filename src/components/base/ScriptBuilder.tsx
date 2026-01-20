import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  FileText,
  MessageSquare,
  User,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScriptBuilder({ script, onUpdateScript }) {
  const [expandedPanels, setExpandedPanels] = useState({});

  const addPanel = () => {
    const newPanel = {
      id: `panel-${Date.now()}`,
      description: "",
      dialogues: [],
      location: "",
      notes: "",
    };
    onUpdateScript([...script, newPanel]);
  };

  const updatePanel = (panelId, updates) => {
    onUpdateScript(
      script.map((p) => (p.id === panelId ? { ...p, ...updates } : p)),
    );
  };

  const deletePanel = (panelId) => {
    onUpdateScript(script.filter((p) => p.id !== panelId));
  };

  const addDialogue = (panelId) => {
    const panel = script.find((p) => p.id === panelId);
    const newDialogue = {
      id: `dialogue-${Date.now()}`,
      character: "",
      text: "",
      type: "speech",
    };
    updatePanel(panelId, {
      dialogues: [...(panel.dialogues || []), newDialogue],
    });
  };

  const updateDialogue = (panelId, dialogueId, updates) => {
    const panel = script.find((p) => p.id === panelId);
    updatePanel(panelId, {
      dialogues: panel.dialogues.map((d) =>
        d.id === dialogueId ? { ...d, ...updates } : d,
      ),
    });
  };

  const deleteDialogue = (panelId, dialogueId) => {
    const panel = script.find((p) => p.id === panelId);
    updatePanel(panelId, {
      dialogues: panel.dialogues.filter((d) => d.id !== dialogueId),
    });
  };

  const togglePanel = (panelId) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelId]: !prev[panelId],
    }));
  };

  return (
    <div className="flex-1 bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Script Builder</h2>
          <span className="text-xs text-gray-500 bg-[#252525] px-2 py-0.5 rounded">
            {script.length} panels
          </span>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={addPanel}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Panel
        </Button>
      </div>

      {/* Script Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {script.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No panels in your script yet</p>
              <Button
                variant="outline"
                className="border-[#3d3d3d] text-gray-300 hover:bg-[#252525]"
                onClick={addPanel}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Panel
              </Button>
            </div>
          ) : (
            script.map((panel, index) => (
              <div
                key={panel.id}
                className="bg-[#1a1a1a] rounded-lg border border-[#2d2d2d] overflow-hidden"
              >
                {/* Panel Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#252525] transition-colors"
                  onClick={() => togglePanel(panel.id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-600 cursor-grab" />
                  {expandedPanels[panel.id] ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-purple-400">
                    Panel {index + 1}
                  </span>
                  <span className="text-xs text-gray-500 flex-1 truncate">
                    {panel.description || "No description"}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-[#252525] px-2 py-0.5 rounded">
                    {(panel.dialogues || []).length} dialogues
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePanel(panel.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Panel Content */}
                {expandedPanels[panel.id] && (
                  <div className="px-4 pb-4 space-y-4 border-t border-[#2d2d2d]">
                    {/* Description */}
                    <div className="pt-4">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">
                        Panel Description
                      </label>
                      <Textarea
                        value={panel.description || ""}
                        onChange={(e) =>
                          updatePanel(panel.id, { description: e.target.value })
                        }
                        placeholder="Describe what happens in this panel..."
                        className="bg-[#252525] border-[#3d3d3d] text-white text-sm min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        value={panel.location || ""}
                        onChange={(e) =>
                          updatePanel(panel.id, { location: e.target.value })
                        }
                        placeholder="Location (optional)"
                        className="flex-1 bg-[#252525] border border-[#3d3d3d] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Dialogues */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Dialogues
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-gray-400 hover:text-white"
                          onClick={() => addDialogue(panel.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {(panel.dialogues || []).map((dialogue, dIndex) => (
                          <div
                            key={dialogue.id}
                            className="flex gap-2 items-start bg-[#252525] rounded-lg p-3"
                          >
                            <div className="flex flex-col gap-2 flex-1">
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-500" />
                                <input
                                  type="text"
                                  value={dialogue.character || ""}
                                  onChange={(e) =>
                                    updateDialogue(panel.id, dialogue.id, {
                                      character: e.target.value,
                                    })
                                  }
                                  placeholder="Character name"
                                  className="flex-1 bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-500"
                                />
                                <select
                                  value={dialogue.type || "speech"}
                                  onChange={(e) =>
                                    updateDialogue(panel.id, dialogue.id, {
                                      type: e.target.value,
                                    })
                                  }
                                  className="bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-white text-xs focus:outline-none"
                                >
                                  <option value="speech">Speech</option>
                                  <option value="thought">Thought</option>
                                  <option value="narration">Narration</option>
                                  <option value="sfx">SFX</option>
                                </select>
                              </div>
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-gray-500 mt-1" />
                                <Textarea
                                  value={dialogue.text || ""}
                                  onChange={(e) =>
                                    updateDialogue(panel.id, dialogue.id, {
                                      text: e.target.value,
                                    })
                                  }
                                  placeholder="Dialogue text..."
                                  className="flex-1 bg-[#1a1a1a] border-[#3d3d3d] text-white text-xs min-h-[60px] resize-none"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-500 hover:text-red-400 flex-shrink-0"
                              onClick={() =>
                                deleteDialogue(panel.id, dialogue.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {(panel.dialogues || []).length === 0 && (
                          <p className="text-xs text-gray-600 text-center py-2">
                            No dialogues yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
