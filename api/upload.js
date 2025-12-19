const { put } = require('@vercel/blob');

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Configure to handle multipart form data
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Simple boundary parsing for multipart data
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
    
    if (!boundaryMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid content type. Use multipart/form-data.' 
      });
    }

    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const parts = buffer.toString('binary').split('--' + boundary);
    
    let fileBuffer = null;
    let fileName = 'upload.jpg';
    let mimeType = 'image/jpeg';

    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
        
        const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
        if (contentTypeMatch) {
          mimeType = contentTypeMatch[1].trim();
        }

        // Extract file content (after double CRLF)
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          const content = part.substring(contentStart + 4);
          // Remove trailing boundary markers
          const contentEnd = content.lastIndexOf('\r\n');
          fileBuffer = Buffer.from(content.substring(0, contentEnd), 'binary');
        }
      }
    }
    
    if (!fileBuffer) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(mimeType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      });
    }

    // Validate file size (max 5MB)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = fileName.split('.').pop();
    const newFilename = `team/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(newFilename, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    return res.status(200).json({ 
      success: true, 
      url: blob.url 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to upload file: ' + error.message 
    });
  }
};
