import { notFound } from "next/navigation";
import { ChallengePage } from "@/features/challenges/components/ChallengePage";
import { getApiV1ChallengesById } from "@/api/generated"; 
import { getServerClient } from "@/api/client";
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  await getServerClient()
  const token = await getAccessToken(logtoConfig, logtoConfig.resources?.[0]);
  try {
    const { data: challenge, error } = await getApiV1ChallengesById({
      path: { id: id },
    });

    if (error || !challenge) return notFound();

    return (
        <ChallengePage challenge={challenge} accessToken={token}/>
    );
  } catch (err) {
    return notFound();
  }
}