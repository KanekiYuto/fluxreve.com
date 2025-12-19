import os
import re

# 需要处理的文件
files = [
    'components/ai-generator/models/ImageUpscalerGenerator.tsx',
    'components/ai-generator/models/ZImageLoraGenerator.tsx',
    'components/ai-generator/models/GptImage15Generator.tsx',
    'components/ai-generator/models/ZImageGenerator.tsx',
    'components/ai-generator/models/FluxSchnellGenerator.tsx',
    'components/ai-generator/models/Flux2ProGenerator.tsx',
    'components/ai-generator/models/SeedreamGenerator.tsx',
    'components/ai-generator/models/LofiPixelCharacterGenerator.tsx',
    'components/ai-generator/models/NanoBananaProGenerator.tsx',
    'components/ai-generator/models/ImageWatermarkRemoverGenerator.tsx',
]

for file_path in files:
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 移除 credits, isCreditsLoading, onCreditsRefresh 这三行
        # 匹配整行包括缩进
        patterns = [
            r'\s*credits=\{generator\.credits\}\n',
            r'\s*isCreditsLoading=\{generator\.creditsLoading\}\n',
            r'\s*onCreditsRefresh=\{generator\.refreshCredits\}\n',
        ]

        modified = False
        for pattern in patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, '', content)
                modified = True

        if modified:
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {file_path}')
        else:
            print(f'Skipped {file_path} (no changes needed)')

    except FileNotFoundError:
        print(f'Error: File not found {file_path}')
    except Exception as e:
        print(f'Error: Failed to process {file_path}: {str(e)}')

print('\\nDone!')
