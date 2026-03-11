require('dotenv').config({ path: '.env.local' });

async function test() {
    const token = process.env.VERCEL_TOKEN;
    const teamId = 'team_yhwls-projects';
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Vercel might want ISO 8601 with Z
    const fromStr = from.toISOString();
    const toStr = now.toISOString();

    const urls = [
        `https://api.vercel.com/v1/usage?teamId=${teamId}&from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`,
    ];
    for (const url of urls) {
        try {
            console.log('Fetching', url);
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            console.log("Response:", res.status);
            console.log(JSON.stringify(data).slice(0, 500));
        } catch (e) {
            console.log("Error", url, e.message);
        }
    }
}
test();
