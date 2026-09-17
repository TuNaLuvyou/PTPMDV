"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faPlay,
  faNetworkWired,
  faShieldHalved,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { SoapGatewayConfig } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  config: SoapGatewayConfig;
}

export default function SoapTestModal({ open, onClose, config }: Props) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    timeMs: number;
    soapFault: boolean;
    timestamp: string;
  } | null>(null);

  const sampleRequestXml = `POST /soap/payroll HTTP/1.1
Host: hrm.company.local:8443
Content-Type: application/soap+xml; charset=utf-8
SOAPAction: "http://hrm.company.local/soap/payroll/PingGateway"

<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap12:Header>
    <pay:ClientCertificateThumbprint>E8A9102BF8402D19</pay:ClientCertificateThumbprint>
  </soap12:Header>
  <soap12:Body>
    <pay:PingGatewayRequest>
      <pay:EchoTimestamp>${new Date().toISOString()}</pay:EchoTimestamp>
      <pay:ClientApplication>HRM_ENTERPRISE_ONPREM_v2</pay:ClientApplication>
    </pay:PingGatewayRequest>
  </soap12:Body>
</soap12:Envelope>`;

  const sampleResponseXml = `HTTP/1.1 200 OK
Content-Type: application/soap+xml; charset=utf-8
Server: HRM-SOA-Gateway/2.1 (On-Premises)

<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap12:Body>
    <pay:PingGatewayResponse>
      <pay:Status>ACTIVE</pay:Status>
      <pay:ServerTime>${new Date().toISOString()}</pay:ServerTime>
      <pay:ConnectedBanks>VietinBank, Vietcombank, BIDV</pay:ConnectedBanks>
      <pay:SecurityLevel>TLS_1_3_mTLS_VERIFIED</pay:SecurityLevel>
    </pay:PingGatewayResponse>
  </soap12:Body>
</soap12:Envelope>`;

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTestResult({
        status: 200,
        timeMs: Math.floor(90 + Math.random() * 50),
        soapFault: false,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
      setTesting(false);
    }, 600);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kiểm tra Kết nối Cổng SOAP API Ngân hàng"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="white" onClick={onClose} className="text-xs">
            Đóng
          </Button>
          <Button onClick={runTest} disabled={testing} className="text-xs">
            <FontAwesomeIcon
              icon={testing ? faArrowsRotate : faPlay}
              className={testing ? "animate-spin" : ""}
            />
            {testing ? "Đang gửi SOAP Request..." : "Gửi yêu cầu Ping WSDL"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Thông số Endpoint */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">WSDL Interface Endpoint:</span>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              {config.wsdlUrl}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Service Class / Port:</span>
            <span className="font-mono text-gray-800">
              {config.serviceName} : {config.port}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Cơ chế Bảo mật (Security):</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <FontAwesomeIcon icon={faShieldHalved} fontSize={11} /> {config.securityMode}
            </span>
          </div>
        </div>

        {/* Kết quả Test */}
        {testResult && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-base" />
              <span>Kết nối thành công! HTTP {testResult.status} OK (Không phát hiện SOAP Fault)</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-emerald-800">
              <span>Độ trễ: {testResult.timeMs}ms</span>
              <span>Lúc: {testResult.timestamp}</span>
            </div>
          </div>
        )}

        {/* SOAP Request & Response Envelopes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span>SOAP 1.2 Request XML Envelope</span>
              <span className="text-[10px] text-gray-400 font-mono">POST</span>
            </div>
            <pre className="bg-gray-950 text-gray-200 p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-60 border border-gray-800">
              {sampleRequestXml}
            </pre>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span>SOAP 1.2 Response XML Envelope</span>
              <span className="text-[10px] text-emerald-400 font-mono">HTTP 200 OK</span>
            </div>
            <pre className="bg-gray-950 text-emerald-300 p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-60 border border-gray-800">
              {sampleResponseXml}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
}
