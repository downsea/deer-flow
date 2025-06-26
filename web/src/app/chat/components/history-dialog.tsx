"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { fetchHistory, fetchHistoryThread } from "~/core/api/history";
import { useStore } from "~/core/store";
import type { Message } from "~/core/messages";

interface ThreadItem {
  id: string;
  title: string;
}

export function HistoryDialog() {
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ThreadItem[]>([]);

  useEffect(() => {
    if (open) {
      fetchHistory()
        .then(setThreads)
        .catch((e) => console.error(e));
    }
  }, [open]);

  const handleSelect = async (id: string) => {
    try {
      const messages = await fetchHistoryThread(id);

      const messageMap = new Map<string, Message>();
      const messageIds: string[] = [];
      for (const m of messages) {
        messageIds.push(m.id);
        messageMap.set(m.id, { ...m });
      }

      const researchIds: string[] = [];
      const researchPlanIds = new Map<string, string>();
      const researchReportIds = new Map<string, string>();
      const researchActivityIds = new Map<string, string[]>();

      let lastPlanner: string | null = null;
      let currentResearch: string | null = null;

      for (const m of messages) {
        if (m.agent === "planner") {
          lastPlanner = m.id;
        } else if (
          m.agent === "coder" ||
          m.agent === "researcher" ||
          m.agent === "reporter"
        ) {
          if (!currentResearch) {
            currentResearch = m.id;
            researchIds.push(currentResearch);
            const ids = [] as string[];
            if (lastPlanner) {
              researchPlanIds.set(currentResearch, lastPlanner);
              ids.push(lastPlanner);
            }
            ids.push(m.id);
            researchActivityIds.set(currentResearch, ids);
          } else {
            researchActivityIds.get(currentResearch)?.push(m.id);
          }
          if (m.agent === "reporter") {
            researchReportIds.set(currentResearch, m.id);
            currentResearch = null;
          }
        }
      }

      useStore.setState({
        threadId: id,
        messageIds,
        messages: messageMap,
        researchIds,
        researchPlanIds,
        researchReportIds,
        researchActivityIds,
        ongoingResearchId: null,
        openResearchId: null,
      });
    } catch (e) {
      console.error(e);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Clock />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>History</DialogTitle>
        </DialogHeader>
        <ul className="max-h-60 overflow-auto">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                className="w-full text-left py-1 hover:underline"
                onClick={() => handleSelect(t.id)}
              >
                {t.title || t.id}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
