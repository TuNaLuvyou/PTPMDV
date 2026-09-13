import { IconDeviceMobile, IconInfoCircle } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function WifiInstructionCard() {
  return (
    <Card className="border-info-200">
      <CardBody>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <span className="w-12 h-12 rounded-xl bg-info-100 text-info-700 flex items-center justify-center shrink-0">
            <IconDeviceMobile size={24} />
          </span>
          <div className="flex-1">
            <h6 className="font-semibold text-gray-800 mb-2">Wi-Fi chỉ được cấu hình trên App Mobile</h6>
            <p className="text-sm text-gray-600 mb-3">
              Trình duyệt Web không đọc được SSID/BSSID của Wi-Fi nên việc quét / chọn Wi-Fi để chấm công được thực hiện trên <b>App Mobile</b>. Vui lòng thực hiện theo các bước:
            </p>
            <ol className="text-sm text-gray-600 flex flex-col gap-1.5 list-decimal list-inside">
              <li>Mở <b>App Mobile → Cấu hình Văn phòng</b></li>
              <li>Chọn <b>Quét Wi-Fi gần đó</b></li>
              <li>Chọn Wi-Fi của văn phòng</li>
              <li>Chọn chi nhánh tương ứng</li>
              <li>Bấm <b>Lưu</b></li>
            </ol>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <IconInfoCircle size={14} /> App cần quyền Location để đọc được Wi-Fi gần đó.
            </div>
          </div>
          <Button variant="dark">Mở App để cấu hình</Button>
        </div>
      </CardBody>
    </Card>
  );
}
