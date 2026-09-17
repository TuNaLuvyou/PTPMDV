const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// ---- Dữ liệu mẫu trong bộ nhớ (đồng bộ Web Portal + Mobile App) ----
const branches = [
  { id: "01", slug: "hn-1", code: "HN-1", name: "Chi nhánh Hoàn Kiếm", address: "12 Tràng Thi, Hoàn Kiếm, Hà Nội" },
  { id: "02", slug: "hn-2", code: "HN-2", name: "Chi nhánh Cầu Giấy", address: "88 Cầu Giấy, Q. Cầu Giấy, Hà Nội" },
  { id: "03", slug: "dn-1", code: "DN-1", name: "Chi nhánh Đà Nẵng", address: "120 Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng" },
];

const users = [
  { id: "e-admin", name: "Trần Minh Tuấn", email: "admin@company.com", role: "admin", roleTitle: "Quản trị viên", branchSlug: "hn-1" },
  { id: "e-mgr-hn1", name: "Vũ Thành Công", email: "manager@company.com", role: "manager", roleTitle: "Quản lý Chi nhánh", branchSlug: "hn-1" },
  { id: "e-staff-hn1", name: "Nguyễn Thu Hà", email: "nhanvien@company.com", role: "staff", roleTitle: "Nhân viên", branchSlug: "hn-1" },
];

const bankAccounts = [
  { id: "ba-vtb", bankName: "VietinBank", accountNumber: "102008899776", balance: 2500000000, isPrimary: true },
  { id: "ba-vcb", bankName: "Vietcombank", accountNumber: "0011009998888", balance: 1800000000, isPrimary: false },
];

const payouts = [];
let payoutSeq = 1;
const nextPayoutId = () => `TXN-${String(payoutSeq++).padStart(6, "0")}`;

// ---- WSDL tối giản cho cổng chi lương SOAP ----
const WSDL = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:tns="http://hrm.company.local/soap/payroll"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  targetNamespace="http://hrm.company.local/soap/payroll">
  <types>
    <xsd:schema targetNamespace="http://hrm.company.local/soap/payroll">
      <xsd:element name="PayoutRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="idempotencyKey" type="xsd:string"/>
            <xsd:element name="debitAccount" type="xsd:string"/>
            <xsd:element name="content" type="xsd:string"/>
            <xsd:element name="totalAmount" type="xsd:double"/>
            <xsd:element name="beneficiaryCount" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="PayoutResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="transactionId" type="xsd:string"/>
            <xsd:element name="bankReference" type="xsd:string"/>
            <xsd:element name="status" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>
  <message name="PayoutInput"><part name="parameters" element="tns:PayoutRequest"/></message>
  <message name="PayoutOutput"><part name="parameters" element="tns:PayoutResponse"/></message>
  <portType name="PayrollPort">
    <operation name="CreatePayout">
      <input message="tns:PayoutInput"/>
      <output message="tns:PayoutOutput"/>
    </operation>
  </portType>
  <binding name="PayrollBinding" type="tns:PayrollPort">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="CreatePayout">
      <soap:operation soapAction="CreatePayout"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  <service name="PayrollService">
    <port name="PayrollPort" binding="tns:PayrollBinding">
      <soap:address location="/soap/payroll"/>
    </port>
  </service>
</definitions>`;

const tagValue = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
};

const buildResponse = ({ transactionId, bankReference, status }) => `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PayoutResponse xmlns="http://hrm.company.local/soap/payroll">
      <transactionId>${transactionId}</transactionId>
      <bankReference>${bankReference}</bankReference>
      <status>${status}</status>
    </PayoutResponse>
  </soap:Body>
</soap:Envelope>`;

const buildFault = (message) => `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>${message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

// Tạo lệnh chi dùng chung cho REST và SOAP. Chống trùng bằng idempotencyKey.
function createPayout({ idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount }) {
  if (!idempotencyKey || !debitAccount || !totalAmount) return { error: 400 };
  const existing = payouts.find((p) => p.idempotencyKey === idempotencyKey);
  if (existing) return { payout: existing, deduped: true };
  const account = bankAccounts.find((a) => a.accountNumber === debitAccount);
  if (!account) return { error: 404 };
  if (account.balance < totalAmount) return { error: 422 };
  account.balance -= totalAmount;
  const payout = {
    id: nextPayoutId(),
    bankReference: `BANK-${Date.now().toString().slice(-8)}`,
    idempotencyKey,
    debitAccount,
    content: content || "",
    totalAmount,
    beneficiaryCount: beneficiaryCount || 0,
    status: "Thành công",
    createdAt: new Date().toISOString(),
  };
  payouts.unshift(payout);
  return { payout };
}

// ---- App ----
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hrm-backend", time: new Date().toISOString() });
});

app.get("/api/branches", (req, res) => res.json({ data: branches }));
app.get("/api/branches/:slug", (req, res) => {
  const branch = branches.find((b) => b.slug === req.params.slug || b.id === req.params.slug);
  if (!branch) return res.status(404).json({ error: "Không tìm thấy chi nhánh" });
  res.json({ data: branch });
});

app.get("/api/employees", (req, res) => {
  const { branchSlug } = req.query;
  res.json({ data: branchSlug ? users.filter((u) => u.branchSlug === branchSlug) : users });
});
app.get("/api/employees/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id || u.email === req.params.id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy nhân sự" });
  res.json({ data: user });
});

app.get("/api/payroll/bank-accounts", (req, res) => res.json({ data: bankAccounts }));
app.get("/api/payroll/payouts", (req, res) => res.json({ data: payouts }));
app.post("/api/payroll/payouts", (req, res) => {
  const result = createPayout(req.body || {});
  if (result.error === 400) return res.status(400).json({ error: "Thiếu idempotencyKey, debitAccount hoặc totalAmount" });
  if (result.error === 404) return res.status(404).json({ error: "Không tìm thấy tài khoản trích nợ" });
  if (result.error === 422) return res.status(422).json({ error: "Số dư không đủ để giải ngân" });
  if (result.deduped) return res.json({ data: result.payout, deduped: true });
  res.status(201).json({ data: result.payout });
});

// Cổng SOAP cho Ngân hàng gọi trực tiếp.
app.get("/soap/payroll", (req, res) => {
  if (req.query.wsdl === undefined) return res.status(400).send("Thiếu tham số ?wsdl");
  res.type("text/xml").send(WSDL);
});
app.post(
  "/soap/payroll",
  express.text({ type: ["text/xml", "application/soap+xml", "application/xml", "*/*"] }),
  (req, res) => {
    const xml = req.body || "";
    const result = createPayout({
      idempotencyKey: tagValue(xml, "idempotencyKey"),
      debitAccount: tagValue(xml, "debitAccount"),
      content: tagValue(xml, "content"),
      totalAmount: Number(tagValue(xml, "totalAmount")),
      beneficiaryCount: Number(tagValue(xml, "beneficiaryCount")) || 0,
    });
    if (result.error) {
      const msg =
        result.error === 404 ? "Khong tim thay tai khoan trich no" : result.error === 422 ? "So du khong du" : "Thieu du lieu";
      return res.status(result.error).type("text/xml").send(buildFault(msg));
    }
    const p = result.payout;
    res.type("text/xml").send(buildResponse({ transactionId: p.id, bankReference: p.bankReference, status: p.status }));
  }
);

app.use((req, res) => res.status(404).json({ error: "Không tìm thấy endpoint" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
});

module.exports = app;
