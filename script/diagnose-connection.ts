import 'dotenv/config';
import { URL } from 'url';

try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log("❌ DATABASE_URL is not set");
    } else {
        const url = new URL(dbUrl);
        console.log(`✅ Configured Hostname: ${url.hostname}`);
        console.log(`ℹ️  Protocol: ${url.protocol}`);
    }
} catch (error) {
    console.error("❌ Error parsing DATABASE_URL:", error);
}
