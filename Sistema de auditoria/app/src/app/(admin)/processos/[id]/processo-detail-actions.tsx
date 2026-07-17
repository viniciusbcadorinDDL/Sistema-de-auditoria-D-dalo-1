"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteProcesso,
  toggleProcessoAtivo,
} from "@/modules/processos/actions";

export function ProcessoDetailActions({
  id,
  ativo,
  podeExcluir,
}: {
  id: string;
  ativo: boolean;
  podeExcluir: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleProcessoAtivo(id, !ativo);
      if (res.ok) {
        toast.success(ativo ? "Processo inativado." : "Processo reativado.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir este processo? Esta ação não pode ser desfeita.")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProcesso(id);
      if (res.ok) {
        toast.success("Processo excluído.");
        router.push("/processos");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleToggle} disabled={pending}>
        {ativo ? "Inativar" : "Reativar"}
      </Button>
      {podeExcluir && (
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          Excluir
        </Button>
      )}
    </div>
  );
}
