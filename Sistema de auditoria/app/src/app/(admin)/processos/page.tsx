import { listProcessos } from "@/modules/processos/queries";
import { ProcessosClient } from "./processos-client";

export const dynamic = "force-dynamic";

export default async function ProcessosPage() {
  const processos = await listProcessos();
  return <ProcessosClient processos={processos} />;
}
