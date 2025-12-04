// 外部模块类型声明

declare module 'face-api.js' {
  const faceapi: any;
  export = faceapi;
}

declare module 'postprocessing' {
  export class EffectComposer {
    constructor(renderer: any);
    addPass(pass: any): void;
    render(deltaTime?: number): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }

  export class RenderPass {
    constructor(scene: any, camera: any);
  }

  export class EffectPass {
    constructor(camera: any, ...effects: any[]);
    renderToScreen: boolean;
  }

  export class BloomEffect {
    constructor(options?: any);
    blendMode: { opacity: { value: number } };
  }

  export class ChromaticAberrationEffect {
    constructor(options?: any);
    offset: { set(x: number, y: number): void };
  }
}
