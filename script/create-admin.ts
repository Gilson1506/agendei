process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";
import { createInterface } from "readline";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    console.log("🔐 Criando usuário Admin...");

    try {
        const username = await question("Username: ");
        const password = await question("Password: ");

        if (!username || !password) {
            console.error("❌ Username e password são obrigatórios!");
            process.exit(1);
        }

        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
            console.error("❌ Usuário já existe!");
            process.exit(1);
        }

        const hashedPassword = await hashPassword(password);

        await storage.createUser({
            username,
            password: hashedPassword
        });

        console.log("✅ Admin criado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao criar admin:", error);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();
