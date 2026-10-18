const hitApiWithHeaders = require('../Utils/hitApiWithHeaders');

const Charging = async (req, res) => {
    try {
        const url = 'https://kidzflix.betech.lk';

        const payload = {
            phone_number: '94785056267'
        };

        const result = await hitApiWithHeaders(url, payload);
        console.log('API response:', result);

        return res.status(200).json({
            message: 'API hit successfully',
            data: result
        });

    } catch (err) {
        console.error('Charging error:', err);

        return res.status(500).json({
            message: 'Failed to hit API',
            error: err.message
        });
    }
};

module.exports = Charging;
