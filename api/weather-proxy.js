export default async function handler(req, res) {
    res.status(200).json({ apiKey: process.env.WEATHER_API_KEY });
}
