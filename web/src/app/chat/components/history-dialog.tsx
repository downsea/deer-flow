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
      useStore.setState({
        threadId: id,
        messageIds: messages.map((m) => m.id),
        messages: new Map(messages.map((m) => [m.id, m])),
        researchIds: [],
        researchPlanIds: new Map(),
        researchReportIds: new Map(),
        researchActivityIds: new Map(),
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
