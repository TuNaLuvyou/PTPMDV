"use client";

import { useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { wifiConfigs, type WifiConfig } from "@/mock-data/portal";
import WifiInstructionCard from "@/features/hr/wifi/components/WifiInstructionCard";
import WifiTableSection from "@/features/hr/wifi/components/WifiTableSection";

export default function HRWifiPage() {
  const [configs, setConfigs] = useState<WifiConfig[]>(wifiConfigs);

  return (
    <div>
      <PageHeader
        title="Cấu hình Wi-Fi"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Wi-Fi chấm công" }]}
        actions={
          <Button variant="white" onClick={() => setConfigs([...configs])}>
            <IconRefresh size={16} /> Làm mới danh sách
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <WifiInstructionCard />
        <WifiTableSection configs={configs} />
      </div>
    </div>
  );
}
