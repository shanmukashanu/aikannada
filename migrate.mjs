import { v2 as oldCloudinary } from 'cloudinary';
import { v2 as newCloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// 1. Old Cloudinary credentials
oldCloudinary.config({
  cloud_name: 'dizzyhird',
  api_key: '644853658274247',
  api_secret: '6HjBg1Nuc8xTlq4-1Nsabh96Deo'
});

// 2. New Cloudinary credentials
newCloudinary.config({
  cloud_name: 'dqzl1lmbn',
  api_key: '133541661653391',
  api_secret: 'EZwjOrviehOkTtm0YSNHIZQSLZI'
});

// 3. Temp folder to download images
const TEMP_DIR = './tmp';
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

async function migrateResources() {
  try {
    console.log('🔍 Fetching resources from old account...');
    let nextCursor = null;
    let count = 0;

    do {
      const response = await oldCloudinary.api.resources({
        type: 'upload',
        max_results: 100,
        next_cursor: nextCursor
      });

      for (const resource of response.resources) {
        const { public_id, secure_url, resource_type } = resource;
        const ext = path.extname(secure_url).split('?')[0] || '.jpg';
        const tempFile = `${TEMP_DIR}/${public_id.replace(/\//g, '_')}${ext}`;

        console.log(`⬇️ Downloading: ${public_id}`);
        const writer = fs.createWriteStream(tempFile);
        const res = await axios.get(secure_url, { responseType: 'stream' });
        res.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(`⬆️ Uploading to new account as: ${public_id}`);
        await newCloudinary.uploader.upload(tempFile, {
          public_id: public_id,
          resource_type: resource_type,
          folder: '', // will retain original path
          use_filename: false,
          overwrite: true
        });

        fs.unlinkSync(tempFile);
        count++;
      }

      nextCursor = response.next_cursor;
    } while (nextCursor);

    console.log(`✅ Migration completed: ${count} files copied.`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

migrateResources();
