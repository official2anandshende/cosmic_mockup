import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import crypto from 'crypto';
import axios from 'axios';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ASTRO_API_KEY = process.env.ASTRO_API_KEY || 'ak-1255c8e55390b0b0e2f9040139532e4f017a706b';
const tempReportsDir = path.resolve(process.cwd(), 'temp-reports');

fs.mkdirSync(tempReportsDir, { recursive: true });

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getSafeFilePath(fileName) {
  const safeName = path.basename(fileName);
  return path.join(tempReportsDir, safeName);
}

const rootDir = path.resolve(process.cwd());
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.wasm': 'application/wasm'
};

function serveStaticFile(req, res, requestedPath) {
  let safePath = requestedPath;
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(rootDir, decodeURIComponent(safePath));
  if (!filePath.startsWith(rootDir)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendError(res, 404, 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/horoscope') {
    try {
      const rawBody = await getRequestBody(req);
      const payload = JSON.parse(rawBody);

      const requiredStringFields = ['name', 'gender', 'language', 'place', 'chart_style'];
      const requiredNumberFields = ['day', 'month', 'year', 'hour', 'min', 'lat', 'lon', 'tzone'];

      const missingStringField = requiredStringFields.find((key) => !payload?.[key] || String(payload[key]).trim() === '');
      const missingNumberField = requiredNumberFields.find((key) => payload?.[key] == null || Number.isNaN(Number(payload[key])));

      if (!payload || missingStringField || missingNumberField) {
        const field = !payload ? 'payload' : missingStringField || missingNumberField;
        sendError(res, 400, `Missing or invalid required field: ${field}`);
        return;
      }

      const finalPayload = {
        name: String(payload.name).trim(),
        gender: String(payload.gender).trim(),
        day: Number(payload.day),
        month: Number(payload.month),
        year: Number(payload.year),
        hour: Number(payload.hour),
        min: Number(payload.min),
        lat: Number(payload.lat),
        lon: Number(payload.lon),
        language: String(payload.language).trim(),
        tzone: Number(payload.tzone),
        place: String(payload.place).trim(),
        chart_style: String(payload.chart_style).trim(),
        footer_link: 'https://cosmic-mockup.vercel.app/',
        logo_url: 'https://cosmic-mockup.vercel.app/assets/cosmic_logo-DlBRZ7Sr.png',
        company_name: 'COSMIC MIND HUB',
        company_info: 'Your Company Info',
        domain_url: 'https://cosmic-mockup.vercel.app/',
        company_email: 'contact@voltxlabs.com',
        company_landline: '+91-8208519838',
        company_mobile: '+91-8208519838'
      };

      if (ASTRO_API_KEY === '<YOUR_ACCESS_TOKEN>') {
        sendError(res, 500, 'Astrology API key is not configured. Set ASTRO_API_KEY.');
        return;
      }

      const apiConfig = {
        method: 'post',
        url: 'https://pdf.astrologyapi.com/v1/basic_horoscope_pdf',
        headers: {
          'x-astrologyapi-key': ASTRO_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'json',
        data: finalPayload
      };

      console.log("apiConfig");
      console.log(JSON.stringify(apiConfig, null, 2));

      console.log("API Token");
      console.log(ASTRO_API_KEY);

      const apiResponse = await axios(apiConfig);

      if (apiResponse.status !== 200) {
        sendError(res, apiResponse.status, 'Astrology API returned a non-200 response.');
        return;
      }

      let pdfBuffer;
      const responseData = apiResponse.data;

      if (responseData && typeof responseData === 'object' && responseData.pdf_url) {
        const pdfResponse = await axios.get(responseData.pdf_url, { responseType: 'arraybuffer' });
        if (pdfResponse.status !== 200) {
          sendError(res, pdfResponse.status, 'Failed to download PDF from astrology API.');
          return;
        }
        pdfBuffer = pdfResponse.data;
      } else if (responseData && responseData instanceof Buffer) {
        pdfBuffer = responseData;
      } else if (responseData && typeof responseData === 'object' && responseData.data) {
        pdfBuffer = responseData.data;
      } else {
        sendError(res, 500, 'Unable to parse astrology API response.');
        return;
      }

      const fileName = `horoscope-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
      const filePath = path.join(tempReportsDir, fileName);
      fs.writeFileSync(filePath, pdfBuffer);

      sendJson(res, 200, {
        fileUrl: `/reports-temp/${fileName}`,
        fileName
      });
    } catch (error) {
      const message = error?.response?.data || error?.message || 'Unexpected error while generating horoscope report.';
      console.error('Error generating horoscope report:', message);
      sendError(res, 500, String(message));
    }
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname?.startsWith('/reports-temp/')) {
    const fileName = parsedUrl.pathname.replace('/reports-temp/', '');
    const filePath = getSafeFilePath(fileName);

    if (!fs.existsSync(filePath)) {
      sendError(res, 404, 'Report not found.');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (req.method === 'GET') {
    serveStaticFile(req, res, parsedUrl.pathname || '/');
    return;
  }

  sendError(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Horoscope backend listening on http://localhost:${PORT}`);
});
