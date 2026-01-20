import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Page } from "@/types";

export interface PagesTabsProps {
  pages: Page[];
  active: number;
  onChange: (i: number) => void;
  onAdd: () => void;
}

export const PagesTabs: React.FC<PagesTabsProps> = ({
  pages,
  active,
  onChange,
  onAdd,
}) => (
  <Tabs value={String(active)} onValueChange={(v) => onChange(Number(v))}>
    <TabsList>
      {pages.map((p, i) => (
        <TabsTrigger key={p.id} value={String(i)}>
          Page {i + 1}
        </TabsTrigger>
      ))}
      <Button size="sm" variant="ghost" onClick={onAdd}>
        <Plus size={14} />
      </Button>
    </TabsList>
  </Tabs>
);
