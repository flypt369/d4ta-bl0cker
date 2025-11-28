interface EffectParams {
  effectType: "chromatic" | "fractal" | "cellular" | "wave" | "noise";
  intensity: number;
  scale: number;
  iterations: number;
  seed: number;
}

export class GlitchProcessor {
  private sourceImage: HTMLImageElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private width: number;
  private height: number;

  constructor(sourceImage: HTMLImageElement, canvas: HTMLCanvasElement) {
    this.sourceImage = sourceImage;
    this.canvas = canvas;

    const maxWidth = 800;
    const maxHeight = 600;
    let width = sourceImage.width;
    let height = sourceImage.height;

    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }

    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.drawImage(sourceImage, 0, 0, width, height);
    this.imageData = this.ctx.getImageData(0, 0, width, height);
  }

  async process(params: EffectParams): Promise<void> {
    let workingData = this.ctx.getImageData(
      0,
      0,
      this.width,
      this.height
    );

    switch (params.effectType) {
      case "chromatic":
        workingData = this.applyChromaticAberration(workingData, params);
        break;
      case "fractal":
        workingData = this.applyFractalDisplacement(workingData, params);
        break;
      case "cellular":
        workingData = this.applyCellularAutomata(workingData, params);
        break;
      case "wave":
        workingData = this.applyWaveDistortion(workingData, params);
        break;
      case "noise":
        workingData = this.applyPerlinNoiseGlitch(workingData, params);
        break;
    }

    this.ctx.putImageData(workingData, 0, 0);
  }

  private applyChromaticAberration(
    imageData: ImageData,
    params: EffectParams
  ): ImageData {
    const data = imageData.data;
    const width = this.width;
    const height = this.height;
    const newData = new Uint8ClampedArray(data);

    const offsetAmount = Math.floor(params.intensity * 0.2);
    const iterations = Math.floor(params.iterations);

    for (let i = 0; i < iterations; i++) {
      const offset = Math.floor((offsetAmount * (i + 1)) / iterations);
      const angle = (i / iterations) * Math.PI * 2;
      const dx = Math.round(Math.cos(angle) * offset);
      const dy = Math.round(Math.sin(angle) * offset);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const srcX = (x + dx + width) % width;
          const srcY = (y + dy + height) % height;
          const srcIdx = (srcY * width + srcX) * 4;

          const channel = i % 3;
          if (channel === 0) {
            newData[idx] = Math.round(
              (newData[idx] + data[srcIdx]) / 2
            );
          } else if (channel === 1) {
            newData[idx + 1] = Math.round(
              (newData[idx + 1] + data[srcIdx + 1]) / 2
            );
          } else {
            newData[idx + 2] = Math.round(
              (newData[idx + 2] + data[srcIdx + 2]) / 2
            );
          }
        }
      }
    }

    imageData.data.set(newData);
    return imageData;
  }

  private applyFractalDisplacement(
    imageData: ImageData,
    params: EffectParams
  ): ImageData {
    const data = imageData.data;
    const width = this.width;
    const height = this.height;
    const newData = new Uint8ClampedArray(data);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = params.scale * 0.01;
    const iterations = Math.floor(params.iterations);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let px = (x - centerX) * scale;
        let py = (y - centerY) * scale;

        let mandelbrotValue = 0;
        let zx = 0,
          zy = 0;

        for (let i = 0; i < iterations; i++) {
          const zx2 = zx * zx;
          const zy2 = zy * zy;

          if (zx2 + zy2 > 4) {
            mandelbrotValue = i;
            break;
          }

          const temp = zx2 - zy2 + px;
          zy = 2 * zx * zy + py;
          zx = temp;
          mandelbrotValue = i;
        }

        const displacement = Math.floor(
          (mandelbrotValue / iterations) * params.intensity
        );
        const srcX = (x + displacement) % width;
        const srcY = (y + displacement) % height;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        newData[dstIdx] = data[srcIdx];
        newData[dstIdx + 1] = data[srcIdx + 1];
        newData[dstIdx + 2] = data[srcIdx + 2];
        newData[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    imageData.data.set(newData);
    return imageData;
  }

  private applyCellularAutomata(
    imageData: ImageData,
    params: EffectParams
  ): ImageData {
    const data = imageData.data;
    const width = this.width;
    const height = this.height;

    // Convert to grayscale for cellular automata
    const grid = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      grid[Math.floor(i / 4)] = gray > 0.5 ? 1 : 0;
    }

    // Apply cellular automata rules
    const iterations = Math.floor(params.iterations);
    for (let iter = 0; iter < iterations; iter++) {
      const newGrid = new Uint8Array(grid);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          let neighbors = 0;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              neighbors += grid[(y + dy) * width + (x + dx)];
            }
          }

          // Conway's Game of Life variant
          if (grid[idx] === 1) {
            newGrid[idx] = neighbors === 2 || neighbors === 3 ? 1 : 0;
          } else {
            newGrid[idx] = neighbors === 3 ? 1 : 0;
          }
        }
      }

      grid.set(newGrid);
    }

    // Apply intensity-based color mapping
    const newData = new Uint8ClampedArray(data);
    for (let i = 0; i < grid.length; i++) {
      const idx = i * 4;
      const cellValue = grid[i];
      const intensity = (cellValue * params.intensity) / 100;

      newData[idx] = Math.round(data[idx] * (1 - intensity));
      newData[idx + 1] = Math.round(data[idx + 1] * (1 - intensity));
      newData[idx + 2] = Math.round(data[idx + 2] * (1 - intensity));
    }

    imageData.data.set(newData);
    return imageData;
  }

  private applyWaveDistortion(
    imageData: ImageData,
    params: EffectParams
  ): ImageData {
    const data = imageData.data;
    const width = this.width;
    const height = this.height;
    const newData = new Uint8ClampedArray(data);

    const waveFrequency = params.scale * 0.1;
    const waveAmplitude = params.intensity * 0.1;
    const iterations = Math.floor(params.iterations);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let displaceX = 0;
        let displaceY = 0;

        for (let i = 0; i < iterations; i++) {
          const freq = waveFrequency * (i + 1);
          const amp = waveAmplitude / (i + 1);

          displaceX += Math.sin((y * freq) / height) * amp;
          displaceY += Math.cos((x * freq) / width) * amp;
        }

        const srcX = Math.floor((x + displaceX + width) % width);
        const srcY = Math.floor((y + displaceY + height) % height);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        newData[dstIdx] = data[srcIdx];
        newData[dstIdx + 1] = data[srcIdx + 1];
        newData[dstIdx + 2] = data[srcIdx + 2];
        newData[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    imageData.data.set(newData);
    return imageData;
  }

  private applyPerlinNoiseGlitch(
    imageData: ImageData,
    params: EffectParams
  ): ImageData {
    const data = imageData.data;
    const width = this.width;
    const height = this.height;
    const newData = new Uint8ClampedArray(data);

    // Simple Perlin-like noise using sine waves
    const scale = params.scale * 0.01;
    const iterations = Math.floor(params.iterations);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let noiseValue = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < iterations; i++) {
          const sampleX = (x * frequency * scale) / width;
          const sampleY = (y * frequency * scale) / height;

          noiseValue +=
            amplitude *
            Math.sin(sampleX * Math.PI) *
            Math.cos(sampleY * Math.PI);
          maxValue += amplitude;

          amplitude *= 0.5;
          frequency *= 2;
        }

        noiseValue = (noiseValue / maxValue + 1) / 2;
        const displacement = Math.floor(noiseValue * params.intensity);

        const srcX = (x + displacement) % width;
        const srcY = (y + displacement) % height;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        // Apply color shift based on noise
        const colorShift = Math.floor(noiseValue * 255);
        newData[dstIdx] = Math.min(
          255,
          data[srcIdx] + colorShift * (params.intensity / 100)
        );
        newData[dstIdx + 1] = Math.min(
          255,
          data[srcIdx + 1] + (colorShift * (params.intensity / 100)) / 2
        );
        newData[dstIdx + 2] = Math.min(
          255,
          data[srcIdx + 2] - (colorShift * (params.intensity / 100)) / 2
        );
        newData[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    imageData.data.set(newData);
    return imageData;
  }
}
