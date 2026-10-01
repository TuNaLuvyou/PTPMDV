"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

test("CRUD branches + employees validation", async () => {
  const app = require("../../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  let res = await fetch(`${base}/api/branches`);
  let body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 3);

  res = await fetch(`${base}/api/employees?systemRole=staff`);
  body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.data.every((e) => e.systemRole === "staff"));

  // Email trùng -> 409
  res = await fetch(`${base}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Trùng", email: "admin@company.com", systemRole: "staff" }),
  });
  assert.equal(res.status, 409);

  // systemRole sai -> 400
  res = await fetch(`${base}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Sai", email: "sai@company.com", systemRole: "boss" }),
  });
  assert.equal(res.status, 400);

  server.close();
});
