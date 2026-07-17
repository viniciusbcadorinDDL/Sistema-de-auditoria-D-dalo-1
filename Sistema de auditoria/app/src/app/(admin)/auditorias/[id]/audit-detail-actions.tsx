"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cancelAudit, reassignLeader } from "@/modules/audits/actions";

export function AuditDetailActions({
  id,
  status,
  currentLeaderId,
  auditores,
}: {
  id: string;
  status: string;
  currentLeaderId: string;
  auditores: { userId: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reassignOpen, setReassignOpen] = useState(false);
  const [novoLider, setNovoLider] = useState(currentLeaderId);

  const podeCancelar = status !== "CONCLUIDA" && status !== "CANCELADA";

  function handleCancel() {
    if (!confirm("Cancelar esta auditoria?")) return;
    startTransition(async () => {
      const res = await cancelAudit(id);
      if (res.ok) {
        toast.success("Auditoria cancelada.");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function handleReassign() {
    startTransition(async () => {
      const res = await reassignLeader(id, novoLider);
      if (res.ok) {
        toast.success("Líder reatribuído e notificado.");
        setReassignOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setReassignOpen(true)}>
        Reatribuir líder
      </Button>
      {podeCancelar && (
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={handleCancel}
          disabled={pending}
        >
          Cancelar auditoria
        </Button>
      )}

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reatribuir auditor líder</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Novo líder</Label>
            <Select value={novoLider} onValueChange={setNovoLider}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {auditores.map((a) => (
                  <SelectItem key={a.userId} value={a.userId}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleReassign} disabled={pending || novoLider === currentLeaderId}>
              {pending ? "Salvando..." : "Reatribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
