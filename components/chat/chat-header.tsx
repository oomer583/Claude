"use client";

import { EyeOffIcon, FolderKanbanIcon, PanelLeftIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isIncognito = pathname === "/incognito";
  const projectId = isIncognito ? null : searchParams.get("project");
  const projectName = searchParams.get("projectName")?.trim();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center gap-2 bg-sidebar px-3">
      <Button
        className="md:hidden"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      {isIncognito ? (
        <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs">
          <EyeOffIcon className="size-3.5" />
          <span>Incognito</span>
        </div>
      ) : null}

      {projectId ? (
        <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs">
          <FolderKanbanIcon className="size-3.5 shrink-0" />
          <span className="max-w-48 truncate">
            {projectName || "Project chat"}
          </span>
        </div>
      ) : null}

      {!isReadonly && !isIncognito && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
);
