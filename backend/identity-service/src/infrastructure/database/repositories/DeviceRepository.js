"use strict";

// Repository quản lý phiên thiết bị đăng nhập của người dùng.
// Hỗ trợ hiển thị danh sách thiết bị trên Mobile/Web và gỡ phiên từ xa.

const userDevices = new Map();

function parseClientInfo(req) {
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
  
  let deviceName = req.headers["x-device-name"];
  let deviceType = req.headers["x-device-type"];
  let osInfo = req.headers["x-os-info"];

  if (!deviceName) {
    if (ua.includes("iPhone")) {
      deviceName = "iPhone 15 Pro Max";
      deviceType = "phone";
      osInfo = "iOS 18.0 • HRM Mobile";
    } else if (ua.includes("iPad")) {
      deviceName = "iPad Pro 11\"";
      deviceType = "tablet";
      osInfo = "iPadOS 17.5 • HRM Mobile";
    } else if (ua.includes("Android")) {
      deviceName = "Samsung Galaxy S24";
      deviceType = "phone";
      osInfo = "Android 14 • HRM Mobile";
    } else if (ua.includes("Macintosh")) {
      deviceName = "MacBook Pro 14\"";
      deviceType = "desktop";
      osInfo = "macOS Sonoma • Chrome 127";
    } else if (ua.includes("Windows")) {
      deviceName = "Windows PC";
      deviceType = "desktop";
      osInfo = "Windows 11 • Edge 127";
    } else {
      deviceName = "Trình duyệt Web";
      deviceType = "desktop";
      osInfo = "Web Portal";
    }
  }

  return {
    deviceName,
    deviceType: deviceType || "desktop",
    osInfo: osInfo || "HRM System",
    location: "Hà Nội, Việt Nam",
    ipAddress: typeof ip === "string" ? ip.split(",")[0].trim() : "127.0.0.1",
  };
}

function initDefaultDevices(userId) {
  return [
    {
      id: "dev-01",
      deviceName: "iPhone 15 Pro Max",
      deviceType: "phone",
      osInfo: "iOS 18.0 • Ứng dụng HRM Mobile",
      location: "Hà Nội, Việt Nam",
      ipAddress: "113.161.45.120",
      lastActive: "Đang hoạt động",
      isCurrent: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "dev-02",
      deviceName: "iPad Pro 11\"",
      deviceType: "tablet",
      osInfo: "iPadOS 17.5 • Ứng dụng HRM Mobile",
      location: "Hà Nội, Việt Nam",
      ipAddress: "113.161.45.120",
      lastActive: "2 giờ trước",
      isCurrent: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "dev-03",
      deviceName: "MacBook Pro 14\"",
      deviceType: "desktop",
      osInfo: "macOS Sonoma • Chrome 127",
      location: "Hà Nội, Việt Nam",
      ipAddress: "14.241.224.89",
      lastActive: "Hôm qua lúc 18:30",
      isCurrent: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

async function getDevicesByUserId(userId) {
  if (!userDevices.has(userId)) {
    userDevices.set(userId, initDefaultDevices(userId));
  }
  return userDevices.get(userId);
}

async function registerDevice(userId, req) {
  const client = parseClientInfo(req);
  const devices = await getDevicesByUserId(userId);
  
  // Đánh dấu các thiết bị cũ không còn là current
  devices.forEach((d) => (d.isCurrent = false));

  // Kiểm tra thiết bị trùng loại
  const existingIndex = devices.findIndex(
    (d) => d.deviceName === client.deviceName && d.ipAddress === client.ipAddress
  );

  const newDevice = {
    id: existingIndex >= 0 ? devices[existingIndex].id : `dev-${Date.now().toString().slice(-4)}`,
    deviceName: client.deviceName,
    deviceType: client.deviceType,
    osInfo: client.osInfo,
    location: client.location,
    ipAddress: client.ipAddress,
    lastActive: "Đang hoạt động",
    isCurrent: true,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    devices[existingIndex] = newDevice;
  } else {
    devices.unshift(newDevice);
  }

  userDevices.set(userId, devices);
  return newDevice;
}

async function removeDevice(userId, deviceId) {
  const devices = await getDevicesByUserId(userId);
  const filtered = devices.filter((d) => d.id !== deviceId);
  userDevices.set(userId, filtered);
  return { removed: true, remainingCount: filtered.length };
}

module.exports = { getDevicesByUserId, registerDevice, removeDevice };
