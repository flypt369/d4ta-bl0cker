import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { GlitchProcessor } from "@/lib/glitchProcessor";

interface EffectParams {
  effectType: "chromatic" | "fractal" | "cellular" | "wave" | "noise";
  intensity: number;
  scale: number;
  iterations: number;
  seed: number;
}

const DEFAULT_PARAMS: EffectParams = {
  effectType: "chromatic",
  intensity: 50,
  scale: 50,
  iterations: 8,
  seed: 42,
};

const PRESETS: Record<string, EffectParams> = {
  "Chromatic Rift": {
    effectType: "chromatic",
    intensity: 85,
    scale: 60,
    iterations: 16,
    seed: 42,
  },
  "Mandelbrot Decay": {
    effectType: "fractal",
    intensity: 75,
    scale: 120,
    iterations: 32,
    seed: 123,
  },
  "Cellular Bloom": {
    effectType: "cellular",
    intensity: 90,
    scale: 50,
    iterations: 12,
    seed: 456,
  },
  "Harmonic Distortion": {
    effectType: "wave",
    intensity: 80,
    scale: 40,
    iterations: 20,
    seed: 789,
  },
  "Perlin Corruption": {
    effectType: "noise",
    intensity: 70,
    scale: 100,
    iterations: 8,
    seed: 999,
  },
};

export default function Home() {
  const [step, setStep] = useState<"landing" | "editor" | "export">("landing");
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [params, setParams] = useState<EffectParams>(DEFAULT_PARAMS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg">("png");

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setStep("editor");
        setParams(DEFAULT_PARAMS);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const processImage = async () => {
    if (!sourceImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const processor = new GlitchProcessor(sourceImage, canvasRef.current);
      await processor.process(params);
      toast.success("Effect applied!");
    } catch (error) {
      toast.error("Error processing image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (step === "editor" && sourceImage) {
      processImage();
    }
  }, [params, step, sourceImage]);

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setParams(preset);
    }
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL(
      exportFormat === "png" ? "image/png" : "image/jpeg",
      0.95
    );
    link.download = `glitch-art.${exportFormat}`;
    link.click();
    toast.success("Image exported successfully");
    setStep("landing");
  };

  if (step === "landing") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⚡ Data-Blocker
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Transform your images with glitch art effects
            </p>
            <p className="text-gray-400">
              Create unique, isolated glitch effects with real-time editing. Export as standalone art or use as assets for your projects.
            </p>
          </div>

          <div
            className="border-2 border-dashed border-cyan-500/50 rounded-lg p-12 mb-12 text-center cursor-pointer hover:border-cyan-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Drag and drop your image
            </h2>
            <p className="text-gray-400">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🌈</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Chromatic Aberration
              </h3>
              <p className="text-sm text-gray-400">
                Multi-channel color separation and displacement
              </p>
            </div>
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Fractal Displacement
              </h3>
              <p className="text-sm text-gray-400">
                Mandelbrot-based spatial distortion
              </p>
            </div>
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🧬</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Cellular Automata
              </h3>
              <p className="text-sm text-gray-400">
                Conway's Game of Life evolution
              </p>
            </div>
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">〰️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Wave Distortion
              </h3>
              <p className="text-sm text-gray-400">
                Multi-frequency harmonic warping
              </p>
            </div>
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">☁️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Perlin Noise
              </h3>
              <p className="text-sm text-gray-400">
                Organic procedural glitch generation
              </p>
            </div>
            <div className="border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                5 Presets
              </h3>
              <p className="text-sm text-gray-400">
                Curated algorithmic combinations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "editor" && sourceImage) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Effect Editor</h1>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("landing");
                  setSourceImage(null);
                }}
              >
                ← Back
              </Button>
              <Button
                className="bg-cyan-500 hover:bg-cyan-600"
                onClick={() => setStep("export")}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/20">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border border-cyan-500/30"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/20">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ✨ Presets
                </h2>
                <div className="space-y-2">
                  {Object.keys(PRESETS).map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      className="w-full justify-start text-left text-sm h-auto py-2 border-cyan-500/30 hover:bg-cyan-500/10"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/20">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300">Effect Type</label>
                    <Select
                      value={params.effectType}
                      onValueChange={(v) =>
                        setParams({
                          ...params,
                          effectType: v as any,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 bg-gray-800 border-cyan-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-cyan-500/30">
                        <SelectItem value="chromatic">Chromatic Aberration</SelectItem>
                        <SelectItem value="fractal">Fractal Displacement</SelectItem>
                        <SelectItem value="cellular">Cellular Automata</SelectItem>
                        <SelectItem value="wave">Wave Distortion</SelectItem>
                        <SelectItem value="noise">Perlin Noise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">
                      Intensity: {params.intensity}%
                    </label>
                    <Slider
                      value={[params.intensity]}
                      onValueChange={(v) =>
                        setParams({ ...params, intensity: v[0] })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">
                      Scale: {params.scale}
                    </label>
                    <Slider
                      value={[params.scale]}
                      onValueChange={(v) =>
                        setParams({ ...params, scale: v[0] })
                      }
                      min={10}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">
                      Iterations: {params.iterations}
                    </label>
                    <Slider
                      value={[params.iterations]}
                      onValueChange={(v) =>
                        setParams({ ...params, iterations: v[0] })
                      }
                      min={1}
                      max={64}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-cyan-500/30 hover:bg-cyan-500/10"
                    onClick={() => setParams(DEFAULT_PARAMS)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "export") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Dialog open={true} onOpenChange={() => setStep("editor")}>
          <DialogContent className="bg-gray-900 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                Export Your Glitch Art
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Format
                </label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <SelectTrigger className="bg-gray-800 border-cyan-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-cyan-500/30">
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Compressed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="w-full border-cyan-500/30"
                onClick={() => setStep("editor")}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
