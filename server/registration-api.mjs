import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const registrationsFile = join(dataDir, 'registrations.json');
const picsDir = join(dataDir, 'pics');
const signature1Dir = join(dataDir, 'signature1');
const signature2Dir = join(dataDir, 'signature2');
const port = Number(process.env.REGISTRATION_API_PORT || 5174);

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(picsDir, { recursive: true });
  await mkdir(signature1Dir, { recursive: true });
  await mkdir(signature2Dir, { recursive: true });
  try {
    await readFile(registrationsFile, 'utf8');
  } catch {
    await writeFile(registrationsFile, '[]\n', 'utf8');
  }
}

async function readRegistrations() {
  await ensureDataFile();
  const raw = await readFile(registrationsFile, 'utf8');
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeFileName(value) {
  return String(value || 'delegate')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'delegate';
}

function extensionFromDataUrl(dataUrl, fallback = '.png') {
  const mime = String(dataUrl || '').match(/^data:([^;]+);base64,/i)?.[1];
  const extensions = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return extensions[mime] || fallback;
}

function extensionFromUpload(photo) {
  const fromName = extname(photo?.name || '').toLowerCase();
  if (fromName) return fromName;
  return extensionFromDataUrl(photo?.dataUrl, '.png');
}

async function saveDataUrl(dataUrl, folder, fileName) {
  const match = String(dataUrl || '').match(/^data:[^;]+;base64,(.+)$/);
  if (!match) return '';

  const filePath = join(folder, fileName);
  await writeFile(filePath, Buffer.from(match[1], 'base64'));
  return filePath;
}

async function saveRegistrationFiles(registration) {
  const delegateName = sanitizeFileName(registration.delegate.fullName);
  const uniquePrefix = `${delegateName}-${registration.id}`;
  const photo = registration.delegate.photo;
  const indemnitySignature = registration.agreements.indemnitySignature;
  const safetySignature = registration.agreements.safetySignature;

  const files = {
    photo: '',
    signature1: '',
    signature2: '',
  };

  if (photo?.dataUrl) {
    files.photo = await saveDataUrl(
      photo.dataUrl,
      picsDir,
      `${uniquePrefix}-pic${extensionFromUpload(photo)}`
    );
  }

  if (indemnitySignature) {
    files.signature1 = await saveDataUrl(
      indemnitySignature,
      signature1Dir,
      `${uniquePrefix}-sig1${extensionFromDataUrl(indemnitySignature)}`
    );
  }

  if (safetySignature) {
    files.signature2 = await saveDataUrl(
      safetySignature,
      signature2Dir,
      `${uniquePrefix}-sig2${extensionFromDataUrl(safetySignature)}`
    );
  }

  return files;
}

function createDatabaseRecord(registration, files) {
  return {
    ...registration,
    delegate: {
      ...registration.delegate,
      photo: registration.delegate.photo
        ? {
            name: registration.delegate.photo.name,
            type: registration.delegate.photo.type,
            size: registration.delegate.photo.size,
            file: files.photo,
          }
        : null,
    },
    agreements: {
      ...registration.agreements,
      indemnitySignature: files.signature1,
      safetySignature: files.signature2,
    },
    files,
  };
}

async function saveRegistration(registration) {
  const files = await saveRegistrationFiles(registration);
  const databaseRecord = createDatabaseRecord(registration, files);
  const registrations = await readRegistrations();
  registrations.push(databaseRecord);
  await writeFile(registrationsFile, `${JSON.stringify(registrations, null, 2)}\n`, 'utf8');
  return {
    record: databaseRecord,
    total: registrations.length,
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 8 * 1024 * 1024) {
        reject(new Error('Payload is too large.'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function normalizeRegistrationCode(value) {
  return String(value || '').trim().toUpperCase();
}

function registrationCodesFor(entry) {
  if (!entry || typeof entry !== 'object') return [];

  return [
    entry.id,
    entry.code,
    entry.registrationCode,
    entry.registration_code,
    entry.accessKey,
    entry.access_key,
    entry.delegate?.id,
    entry.delegate?.code,
    entry.delegate?.registrationCode,
    entry.delegate?.registration_code,
    entry.delegate?.accessKey,
    entry.delegate?.access_key,
  ]
    .map(normalizeRegistrationCode)
    .filter(Boolean);
}

function delegateFromRegistration(match) {
  return {
    id:
      match.id ||
      match.registration_code ||
      match.registrationCode ||
      match.access_key ||
      match.accessKey ||
      match.delegate?.id ||
      '',
    full_name: match.full_name || match.delegate?.fullName || match.delegate?.full_name || '',
    email: match.email || match.delegate?.email || '',
    nickname: match.nickname || match.delegate?.nickname || '',
  };
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.url === '/api/registrations' && request.method === 'GET') {
    const registrations = await readRegistrations();
    sendJson(response, 200, { registrations, file: registrationsFile });
    return;
  }

  if (request.url?.startsWith('/api/registrations/verify') && request.method === 'GET') {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      const code = normalizeRegistrationCode(url.searchParams.get('code'));
      if (!code) {
        sendJson(response, 200, { valid: false, error: 'Missing registration code.' });
        return;
      }

      const registrations = await readRegistrations();
      const match = registrations.find((entry) => registrationCodesFor(entry).includes(code));
      if (!match) {
        sendJson(response, 200, { valid: false, error: 'Registration code not found.' });
        return;
      }

      sendJson(response, 200, {
        valid: true,
        delegate: delegateFromRegistration(match),
      });
    } catch (error) {
      console.error('Registration verification error:', error);
      sendJson(response, 200, {
        valid: false,
        error: 'Could not verify registration code.',
      });
    }
    return;
  }

  if (request.url === '/api/registrations' && request.method === 'POST') {
    try {
      const submission = JSON.parse(await readBody(request));
      if (!submission?.id || !submission?.delegate?.fullName || !submission?.delegate?.email) {
        sendJson(response, 400, { error: 'Registration is missing required fields.' });
        return;
      }

      const result = await saveRegistration(submission);
      sendJson(response, 201, {
        ok: true,
        total: result.total,
        file: registrationsFile,
        record: result.record,
        folders: {
          pics: picsDir,
          signature1: signature1Dir,
          signature2: signature2Dir,
        },
      });
    } catch (error) {
      sendJson(response, 500, { error: error.message || 'Could not save registration.' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

await ensureDataFile();
server.listen(port, '127.0.0.1', () => {
  console.log(`Registration API writing to ${registrationsFile}`);
  console.log(`Registration API ready on http://127.0.0.1:${port}`);
});
