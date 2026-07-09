import { getLogtoContext, getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '../app/logto';
import { client } from './generated/client.gen';

export const getServerClient = async () => {
    // getLogtoContext безопасен для Server Components (только чтение)
    const { isAuthenticated, } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated) {
        throw new Error('User is not authenticated');
    }
    const resource = logtoConfig.resources?.[0];
    const accessToken = await getAccessToken(logtoConfig, resource);
    // ВАЖНО: В Next.js App Router accessToken может быть null, 
    // если сессия еще не содержит токена для конкретного ресурса.
    if (!accessToken) {
        console.warn("Access token is missing. Try re-logging or checking Logto scopes.");
        throw new Error('Unauthorized: No access token found');
    }

    // Настраиваем сгенерированный клиент
    client.setConfig({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return client;
};