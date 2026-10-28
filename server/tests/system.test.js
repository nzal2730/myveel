/* eslint-disable no-console */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const SERVER_DIR = path.join(ROOT, 'server');
const DIST_ENTRY = path.join(SERVER_DIR, 'dist', 'index.js');
const SOURCE_DB = path.join(SERVER_DIR, 'prisma', 'dev.db');

let passed = 0;
const failures = [];

function record(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`  PASS  ${name}`);
    })
    .catch((error) => {
      failures.push({ name, error });
      console.log(`  FAIL  ${name}`);
      console.log(`        ${error.message}`);
    });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, child, logs) {
  const deadline = Date.now() + 25000;
  let lastError = 'no attempt made';
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited early with code ${child.exitCode}.\n${logs.join('')}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return response.json();
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become healthy in time (${lastError}).\n${logs.join('')}`);
}

async function main() {
  if (!fs.existsSync(DIST_ENTRY)) {
    throw new Error('Server build not found. Run "npm run build:server" before "npm test".');
  }
  if (!fs.existsSync(SOURCE_DB)) {
    throw new Error('Prisma dev.db not found. Run "npm --prefix server run prisma:migrate" first.');
  }

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const testDb = path.join(os.tmpdir(), `myveel-test-${process.pid}-${Date.now()}.db`);
  fs.copyFileSync(SOURCE_DB, testDb);

  const logs = [];
  const child = spawn(process.execPath, [DIST_ENTRY], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'development',
      DATABASE_URL: `file:${testDb.replace(/\\/g, '/')}`,
      JWT_SECRET: 'myveel_test_jwt_secret_2026',
      UPLOAD_DIR: './uploads',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `system.test.${suffix}@myveel.dev`;
  const mobile = `9${String(Date.now()).slice(-9)}`;
  const password = 'SystemTest123!';

  let token = '';

  async function request(pathname, options = {}) {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${baseUrl}${pathname}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text();

    if (!response.ok || (payload && payload.success === false)) {
      const message =
        (payload && payload.message) || `${response.status} ${response.statusText}`;
      throw new Error(`${options.method || 'GET'} ${pathname} failed: ${message}`);
    }
    return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
  }

  function expectArray(value, label) {
    assert.ok(Array.isArray(value), `${label} should be an array`);
  }

  try {
    const health = await waitForHealth(baseUrl, child, logs);

    await record('health endpoint is online', async () => {
      assert.equal(health.status, 'online');
      assert.equal(health.version, '1.0.0');
    });

    await record('registration returns development OTPs', async () => {
      const result = await request('/api/auth/register', {
        method: 'POST',
        body: { name: 'System Test', email, mobile, password },
      });
      assert.equal(result.user.email, email);
      assert.ok(result.devOtps && result.devOtps.emailOtp && result.devOtps.smsOtp);
      global.__otps = result.devOtps;
    });

    await record('email and mobile OTP verification succeeds', async () => {
      await request('/api/auth/otp/verify', {
        method: 'POST',
        body: { target: email, type: 'REGISTER_EMAIL', otp: global.__otps.emailOtp },
      });
      await request('/api/auth/otp/verify', {
        method: 'POST',
        body: { target: mobile, type: 'REGISTER_SMS', otp: global.__otps.smsOtp },
      });
    });

    await record('login returns a token and verified user', async () => {
      const result = await request('/api/auth/login', {
        method: 'POST',
        body: { identifier: email, password },
      });
      token = result.token;
      assert.ok(token, 'token should be present');
      assert.equal(result.user.email, email);
      assert.equal(result.user.isEmailVerified, true);
      assert.equal(result.user.isMobileVerified, true);
    });

    await record('authenticated profile endpoint works', async () => {
      const me = await request('/api/auth/me');
      assert.equal(me.email, email);
    });

    await record('unauthenticated requests are rejected', async () => {
      const saved = token;
      token = '';
      try {
        await assert.rejects(() => request('/api/vehicles'), /401|Unauthorized|token/i);
      } finally {
        token = saved;
      }
    });

    await record('settings include profile and preferences', async () => {
      const settings = await request('/api/settings');
      assert.equal(settings.profile.email, email);
      assert.equal(typeof settings.preferences.emailAlerts, 'boolean');
      assert.equal(typeof settings.preferences.currency, 'string');
    });

    await record('sample garage seeds vehicles and related records', async () => {
      const result = await request('/api/seed/sample-garage', { method: 'POST' });
      assert.equal(result.success, true);
    });

    let vehicles = [];
    await record('vehicle list exposes derived summary fields', async () => {
      vehicles = await request('/api/vehicles');
      expectArray(vehicles, 'vehicles');
      assert.ok(vehicles.length >= 1, 'expected at least one seeded vehicle');
      assert.ok('activeInsurance' in vehicles[0]);
      assert.ok('pendingRemindersCount' in vehicles[0]);
    });

    const vehicleId = vehicles[0]?.id;
    assert.ok(vehicleId, 'seeded vehicle id required for remaining checks');

    await record('vehicle detail includes related history', async () => {
      const detail = await request(`/api/vehicles/${vehicleId}`);
      assert.equal(detail.id, vehicleId);
      assert.ok(Array.isArray(detail.serviceRecords));
      assert.ok(Array.isArray(detail.odometerReadings));
      assert.ok(Array.isArray(detail.documents));
    });

    await record('vehicle create, update and delete round-trips', async () => {
      const created = await request('/api/vehicles', {
        method: 'POST',
        body: {
          nickname: 'Test Scooter',
          make: 'Test',
          model: 'Runner',
          year: 2022,
          registrationNumber: `TS${suffix.slice(-8)}`,
          vehicleType: 'TWO_WHEELER',
          fuelType: 'PETROL',
          currentOdometer: 1200,
        },
      });
      assert.equal(created.nickname, 'Test Scooter');

      const updated = await request(`/api/vehicles/${created.id}`, {
        method: 'PUT',
        body: { nickname: 'Test Scooter Updated' },
      });
      assert.equal(updated.nickname, 'Test Scooter Updated');

      await request(`/api/vehicles/${created.id}`, { method: 'DELETE' });
      const after = await request('/api/vehicles');
      assert.ok(!after.some((vehicle) => vehicle.id === created.id));
    });

    await record('odometer summary and readings load', async () => {
      const result = await request(`/api/odometer?vehicleId=${vehicleId}`);
      assert.ok(result.stats && typeof result.stats.currentOdometer === 'number');
      expectArray(result.readings, 'odometer readings');
    });

    await record('service history and reminders load', async () => {
      const services = await request(`/api/services?vehicleId=${vehicleId}`);
      expectArray(services, 'services');
      const reminders = await request('/api/services/reminders');
      expectArray(reminders, 'service reminders');
    });

    await record('documents, insurance and warranties load', async () => {
      const documents = await request(`/api/documents?vehicleId=${vehicleId}`);
      expectArray(documents, 'documents');
      const policies = await request(`/api/insurance?vehicleId=${vehicleId}`);
      expectArray(policies, 'insurance policies');
      const warranties = await request(`/api/warranties?vehicleId=${vehicleId}`);
      expectArray(warranties, 'warranties');
    });

    await record('driving licence endpoint responds', async () => {
      const licence = await request('/api/licence');
      assert.ok(licence === null || typeof licence === 'object');
    });

    await record('tyre and battery records load', async () => {
      const records = await request(`/api/tyre-battery?vehicleId=${vehicleId}`);
      expectArray(records, 'tyre/battery records');
    });

    await record('fuel logs and expense summaries load', async () => {
      const fuel = await request(`/api/fuel-expenses/fuel?vehicleId=${vehicleId}`);
      assert.ok(fuel.metrics && typeof fuel.metrics.totalFuelSpend === 'number');
      expectArray(fuel.logs, 'fuel logs');
      const expenses = await request(`/api/fuel-expenses/expenses?vehicleId=${vehicleId}`);
      assert.ok(expenses.summary && typeof expenses.summary.ytdTotal === 'number');
      expectArray(expenses.expenses, 'expenses');
    });

    await record('care schedule loads', async () => {
      const schedules = await request('/api/care');
      expectArray(schedules, 'care schedules');
    });

    await record('emergency contacts include public helplines', async () => {
      const result = await request('/api/emergency');
      expectArray(result.userContacts, 'user contacts');
      assert.ok(result.publicHelplines.length >= 1, 'expected public helplines');
    });

    await record('notifications sync and load', async () => {
      await request('/api/notifications/sync', { method: 'POST' });
      const result = await request('/api/notifications');
      expectArray(result.notifications, 'notifications');
      assert.equal(typeof result.unreadCount, 'number');
    });

    await record('nearby search and favourites load', async () => {
      const result = await request('/api/nearby/search?lat=12.9716&lng=77.5946&radius=5');
      expectArray(result.places, 'nearby places');
      const favourites = await request('/api/nearby/favourites');
      expectArray(favourites, 'favourite places');
    });

    await record('vehicle PDF report is generated', async () => {
      const response = await fetch(`${baseUrl}/api/reports/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /application\/pdf/);
      const buffer = Buffer.from(await response.arrayBuffer());
      assert.ok(buffer.length > 500, 'PDF should contain data');
      assert.equal(buffer.subarray(0, 4).toString(), '%PDF');
    });

    await record('clearing garage removes seeded vehicles', async () => {
      await request('/api/seed/clear-garage', { method: 'POST' });
      const after = await request('/api/vehicles');
      assert.equal(after.length, 0);
    });

    await record('preferences can be updated', async () => {
      const updated = await request('/api/settings/preferences', {
        method: 'PUT',
        body: {
          emailAlerts: false,
          smsAlerts: true,
          distanceUnit: 'miles',
          currency: '$',
          reminderDaysBefore: '20,10',
        },
      });
      assert.equal(updated.emailAlerts, false);
      assert.equal(updated.distanceUnit, 'miles');
    });

    console.log(`\n${passed} checks passed, ${failures.length} failed.`);
  } finally {
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      fs.rmSync(testDb, { force: true });
    } catch {
      // Ignore cleanup failures on Windows file locks.
    }
  }

  if (failures.length > 0) {
    console.error('\nFailures:');
    failures.forEach(({ name, error }) => console.error(`- ${name}: ${error.stack || error.message}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\nSystem test crashed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
