import { getVersionInfo } from '@/lib/version';

/**
 * GET /api/version
 * 返回当前版本信息
 */
export async function GET() {
  try {
    const versionInfo = getVersionInfo();

    return Response.json({
      success: true,
      data: versionInfo,
    });
  } catch (error) {
    console.error('[API] Failed to get version info:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to get version info',
      },
      { status: 500 }
    );
  }
}
