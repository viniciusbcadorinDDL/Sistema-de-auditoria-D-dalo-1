import { listNormas } from "@/modules/normas/queries";
import { NormasClient } from "./normas-client";

export const dynamic = "force-dynamic";

export default async function NormasPage() {
  const normas = await listNormas();
  return <NormasClient normas={normas} />;
}
