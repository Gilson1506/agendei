import 'dotenv/config';
import { hashPassword } from "../server/auth";

(async () => {
    const hash = await hashPassword("mussol22");
    console.log("HASH_RESULT:" + hash);
})();
