import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToR2 } from '@/lib/storage/r2';
import { validateFile, FileType, getAllowedTypesDescription, FILE_LIMITS, formatFileSize } from '@/lib/storage/validation';

/**
 * POST /api/upload
 * 上传文件到 R2 存储
 *
 * 支持的查询参数:
 * - type: 限制允许的文件类型 (image, video, audio, document)，多个类型用逗号分隔
 * - prefix: 文件存储路径前缀
 *
 * 请求体: FormData
 * - file: 要上传的文件
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type');
    const prefix = searchParams.get('prefix') || 'uploads';

    // 解析允许的文件类型
    const allowedTypes = typeParam
      ? (typeParam.split(',').filter(Boolean) as FileType[])
      : undefined;

    // 3. 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 4. 验证文件
    const validation = validateFile(
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      allowedTypes
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          allowed_types: getAllowedTypesDescription(allowedTypes),
        },
        { status: 400 }
      );
    }

    // 5. 将文件转换为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 6. 上传到 R2
    const uploadResult = await uploadToR2({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      prefix,
    });

    // 7. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
        file_type: validation.fileType,
        file_name: file.name,
        content_type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * 获取上传配置信息
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 返回上传配置信息 (从 FILE_LIMITS 构建)
    const allowedTypes = Object.entries(FILE_LIMITS).reduce((acc, [type, config]) => {
      acc[type] = {
        extensions: config.extensions,
        mime_types: config.mimeTypes,
        max_size: formatFileSize(config.maxSize),
        max_size_bytes: config.maxSize,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        allowed_types: allowedTypes,
      },
    });
  } catch (error) {
    console.error('Get upload config error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get upload config',
      },
      { status: 500 }
    );
  }
}
