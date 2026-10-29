import { requireAdminApi } from "@/features/admin/auth/guards";
import { adminErrorResponse } from "@/features/admin/responses";
import { getPaymentSettings, updatePaymentSettings } from "@/features/billing/settings/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    return Response.json(await getPaymentSettings());
  } catch (error) {
    return adminErrorResponse(error, "Failed to load the settings.", "load_failed");
  }
}

export async function PUT(request: Request) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const body: unknown = await request.json().catch(() => null);
    const saved = await updatePaymentSettings(body);

    if (!saved) {
      return Response.json(
        { error: "Check the wallet numbers and the text lengths.", code: "invalid_request" },
        { status: 400 },
      );
    }

    return Response.json(saved);
  } catch (error) {
    return adminErrorResponse(error, "Failed to save the settings.", "save_failed");
  }
}
