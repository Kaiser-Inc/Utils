"use client";

import { Button } from "@/components/ui";
import { toast } from "@kaiserinc/react";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("Mensagem padrão do sistema.")}>Default</Button>
      <Button variant="secondary" onClick={() => toast.success("Operação realizada com sucesso!")}>
        Success
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error("Algo deu errado. Tente novamente.")}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("Atenção: esta ação não pode ser desfeita.")}
      >
        Warning
      </Button>
      <Button variant="ghost" onClick={() => toast.info("Dica: configure nas preferências.")}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const id = toast.loading("Processando...");
          setTimeout(() => toast.success("Concluído!", { id }), 2000);
        }}
      >
        Loading → Success
      </Button>
    </div>
  );
}
