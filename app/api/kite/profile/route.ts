import { NextResponse } from "next/server";
import { getServerSession, getSafeUserProfile } from "@/lib/auth/session";
import { ApiResponse, UserProfile } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session.isLoggedIn || !session.accessToken) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "KITE_AUTH_EXPIRED",
            message: "Your Kite session has expired. Please login again.",
          },
        },
        { status: 401 }
      );
    }

    const safeProfile = getSafeUserProfile(session);

    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: safeProfile!,
    });
  } catch (error: any) {
    console.error("[Profile API] Error fetching profile:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "PROFILE_ERROR",
          message: error.message || "Failed to retrieve user profile",
        },
      },
      { status: 500 }
    );
  }
}
