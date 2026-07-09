import { getAccessToken, getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';

export async function getAuthApiOptions() {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);
  
  if (!isAuthenticated) return {};

  try {
    const resource = logtoConfig.resources?.[0];
    const token = await getAccessToken(logtoConfig, resource);
    
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Здесь же можно указать baseUrl, если он берется из env
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    };
  } catch (e) {
    console.error("Token fetch failed", e);
    return {};
  }
}