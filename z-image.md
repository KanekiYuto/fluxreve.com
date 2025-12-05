```
A distilled version of Z-Image with strong capabilities in photorealistic image generation, accurate rendering of both Chinese and English text, and robust adherence to bilingual instructions. It achieves performance comparable to or exceeding leading competitors with only 8 steps.
```

````
The Z-Image model adopts a Single-Stream Diffusion Transformer architecture. This design unifies the processing of various conditional inputs (like text and image embeddings) with the noisy image latents into a single sequence, which is then fed into the Transformer backbone.
````

`````
Z-Image-Turbo excels at producing images with photography-level realism, demonstrating fine control over details, lighting, and textures. It balances high fidelity with strong aesthetic quality in composition and overall mood. The generated images are not only realistic but also visually appealing.
`````

````
Z-Image-Turbo can accurately render Chinese and English text while preserving facial realism and overall aesthetic composition, with results comparable to top-tier closed-source models. In poster design, it demonstrates strong compositional skills and a good sense of typography. It can render high-quality text even in challenging scenarios with small font sizes, delivering designs that are both textually precise and visually compelling.
````

````
The powerful prompt enhancer (PE) uses a structured reasoning chain to inject logic and common sense, enabling the model to handle complex tasks like the "chicken-and-rabbit problem" or visualizing classical Chinese poetry. In editing tasks, even when faced with ambiguous user instructions, the model can apply its reasoning capabilities to infer the underlying intent and ensure a logically coherent result.
````

````
🚀 Z-Image-Turbo – A distilled version of Z-Image that matches or exceeds leading competitors with only 8 NFEs (Number of Function Evaluations). It offers ⚡️sub-second inference latency⚡️ on enterprise-grade H800 GPUs and fits comfortably within 16G VRAM consumer devices. It excels in photorealistic image generation, bilingual text rendering (English & Chinese), and robust instruction adherence.
````

````
📸 Photorealistic Quality: Z-Image-Turbo delivers strong photorealistic image generation while maintaining excellent aesthetic quality.
````

````
📖 Accurate Bilingual Text Rendering: Z-Image-Turbo excels at accurately rendering complex Chinese and English text.
````

````
💡 Prompt Enhancing & Reasoning: Prompt Enhancer empowers the model with reasoning capabilities, enabling it to transcend surface-level descriptions and tap into underlying world knowledge.
````

````
🧠 Creative Image Editing: Z-Image-Edit shows a strong understanding of bilingual editing instructions, enabling imaginative and flexible image transformations.
````

````
We adopt a Scalable Single-Stream DiT (S3-DiT) architecture. In this setup, text, visual semantic tokens, and image VAE tokens are concatenated at the sequence level to serve as a unified input stream, maximizing parameter efficiency compared to dual-stream approaches.
````

````
According to the Elo-based Human Preference Evaluation (on Alibaba AI Arena), Z-Image-Turbo shows highly competitive performance against other leading models, while achieving state-of-the-art results among open-source models.
````

`````
For a 6-billion parameter model, it performs good in image generation. The model truly lives up to its name; during testing on the ModelScope platform (which uses NVIDIA A10 GPUs), most generations took a maximum of only 2 seconds. All images were generated just 9 steps. On high-end consumer GPUs (like an RTX 3090 or 4090), I this this would take roughly 2 to 3 seconds, while mid-range cards might take 4 to 5 seconds.
`````

