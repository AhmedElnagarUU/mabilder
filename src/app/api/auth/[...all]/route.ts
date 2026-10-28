import { getAuth } from "@/features/auth/auth";

export const dynamic = "force-dynamic";

async function handle(request: Request): Promise<Response> {
  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
