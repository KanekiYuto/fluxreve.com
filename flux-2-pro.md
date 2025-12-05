o:\fluxreve.com\app\api\ai-generator\provider\wavespeed 新增API 接口 
curl --location --request POST 'https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-2-pro/text-to-image' \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${WAVESPEED_API_KEY}" \
--data-raw '{
  "enable_base64_output": false,
  "enable_sync_mode": false,
  "prompt": "A photograph of a vintage, beige CRT monitor sitting on a cluttered wooden desk in a dimly lit room. The curved screen glows with        
monochromatic green text. Displayed on the screen is Python code:\n\nimport flux_api\ndef generate_image(prompt):\n    print(f\"Processing: 
{prompt}\")\n    # Connecting to core...\n    return True\n\nBelow the code, a blinking cursor sits next to a command prompt: 
`user@retro-pc:~/dev$ _`. The screen shows scan lines, slight flickering distortion, and reflections of the room lights on the curved glass 
surface. A mechanical keyboard with beige and grey keycaps sits in front of it. Film grain.",
  "seed": -1,
  "size": "1024*1024"
}' 
curl --location --request POST 'https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-2-pro/edit' \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${WAVESPEED_API_KEY}" \
--data-raw '{
  "enable_base64_output": false,
  "enable_sync_mode": false,
  "images": [
    "https://d1q70pf5vjeyhc.cloudfront.net/media/f9753bf06bfa406fbbeacead4edb5069/images/1764096992154115316_k1086420.png"
  ],
  "prompt": "Transform this portrait into a high-end fashion editorial style while keeping the subject’s facial features and natural expression       
unchanged. \nEnhance the lighting with refined directional highlights and deeper soft shadows to create a dramatic, elegant magazine look. \nApply    
 subtle skin refinement without losing natural texture, improving clarity and tonal depth. \nShift the color grading toward warm neutral tones        
with a hint of cinematic contrast, adding a polished professional finish. \nOverall style: Vogue-level editorial portrait, premium natural beauty,    
 sophisticated light shaping, high-fashion atmosphere.\n",
  "seed": -1
}' 目录名称是 flux-2-pro 