o:\fluxreve.com\app\api\ai-generator\provider\wavespeed 新增API 接口 

## text-to-image

````

curl --location --request POST 'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4.5' \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${WAVESPEED_API_KEY}" \
--data-raw '{
  "enable_base64_output": false,
  "enable_sync_mode": false,
  "prompt": "Nighttime outdoor photoshoot: A young man standsinside a public phone booth, holding a blue phonereceiver to his ear. One hand is casually tucked into his pocket, and he strikes a relaxed posture. He wears a white T-shirt with a pattern, loose brown pants, and jacket draped over his arm. The booth's glass reflects city streetlights with a bokeh effect, creating a vintage film style.",
  "size": "2048*2048"
}'
````

## image-image

````

curl --location --request POST 'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4.5/edit' \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${WAVESPEED_API_KEY}" \
--data-raw '{
  "enable_base64_output": false,
  "enable_sync_mode": false,
  "images": [
    "https://d1q70pf5vjeyhc.cloudfront.net/media/92d2d4ca66f84793adcb20742b15d262/images/1764761316371833793_r5ZX531Z.jpeg"
  ],
  "prompt": "Keep the model's pose and the flowing shape of the liquid clothing unchanged. Change the clothing material from silver metal to completely transparent clear water (or glass). Through the liquid water flow, the details of the model's skin can be seen. The light and shadow change from reflection to refraction."
}'
````

目录名称为 `seedream-v4.5`，每次生成消耗配额`30`
