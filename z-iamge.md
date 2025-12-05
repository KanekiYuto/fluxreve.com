o:\fluxreve.com\app\api\ai-generator\provider\wavespeed 新增一个api
  curl --location --request POST 'https://api.wavespeed.ai/api/v3/wavespeed-ai/z-image/turbo' \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${WAVESPEED_API_KEY}" \
  --data-raw '{
    "enable_base64_output": false,
    "enable_sync_mode": false,
    "prompt": "Wong Kar-wai film style, a lonely man smoking a cigarette in a narrow Hong Kong hallway, 1990s. Greenish fluorescent lighting, heavy   
  shadows, moody atmosphere. Slight motion blur to create a dreamlike quality. Film grain, vignetting, emotional, cinematic composition, dutch angle  
  shot.",
    "seed": -1,
    "size": "1024*1024"
  }' 目录为 z-image/turbo 