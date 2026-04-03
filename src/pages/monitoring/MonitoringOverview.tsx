import { MachinesPanel } from "./MachinesPanel";
import { GPUPanel } from "./GPUPanel";
import { ContainersPanel } from "./ContainersPanel";
import { ActivepiecesPanel } from "./ActivepiecesPanel";
import { AlertsBanner } from "./AlertsBanner";
import { InfraNetwork } from "../infra/InfraNetwork";

export function MonitoringOverview() {
  return (
    <div className="flex flex-col overflow-auto">
      <AlertsBanner />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <MachinesPanel />
        <GPUPanel />
        <ContainersPanel />
        <ActivepiecesPanel />
        <div className="md:col-span-2">
          <InfraNetwork />
        </div>
      </div>
    </div>
  );
}
