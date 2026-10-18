const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx');
const User = require('../Models/models.customer');

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const allowedOrigins = [
    'https://kidzflix.betech.lk',
    'https://begames.betech.lk',
    'https://vibebox.betech.lk'
];

// helper: insert in chunks
const bulkInsertInBatches = async (data, batchSize = 1000) => {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await User.bulkCreate(batch, {
            ignoreDuplicates: true
        });
    }
};

const uploadXlsxMsisdn = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Excel file required' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path, {
            cellDates: false,
            cellText: false
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false
        });

        if (!rows.length) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Excel sheet is empty' });
        }

        const insertData = [];

        for (const row of rows) {
            const firstKey = Object.keys(row)[0];
            const msisdn = row[firstKey]?.toString().trim();

            if (!msisdn) continue;

            for (const origin of allowedOrigins) {
                insertData.push({
                    msisdn,
                    origin,
                    referer: origin,
                    client_ip: null
                });
            }
        }

        if (!insertData.length) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No MSISDN found' });
        }

        // 🔥 BATCH INSERT
        await bulkInsertInBatches(insertData, 1000);

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            message: 'Excel uploaded successfully',
            total_msisdn: rows.length,
            total_records_inserted: insertData.length
        });

    } catch (err) {
        console.error(err);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(500).json({
            message: 'Excel processing failed',
            error: err.message
        });
    }
};

module.exports = { upload, uploadXlsxMsisdn };
