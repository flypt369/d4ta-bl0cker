import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload, RotateCcw, Zap } from "lucide-react";
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
      <div className="min-h-screen wear-texture" style={{background: 'linear-gradient(135deg, rgba(5, 15, 30, 0.98) 0%, rgba(10, 25, 40, 0.95) 100%)'}}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-900/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl"></div>
        </div>

        <div className="relative flex flex-col items-center justify-center px-4 py-16 min-h-screen">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-16">
              <div className="mb-6 inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
                  <Zap className="w-16 h-16 relative text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-black mb-4 mecha-title tracking-tighter">
                DATA·BLOCKER
              </h1>

              <div className="h-1 w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              <p className="text-lg md:text-xl text-cyan-100 mb-3 font-light tracking-wide">
                Algorithmic Glitch Art Generator
              </p>
              <p className="text-sm md:text-base text-cyan-300/80 font-light max-w-2xl mx-auto leading-relaxed">
                Five genuine mathematical algorithms. Real-time parameter control. Isolated effect export.
                Transform images into state-of-the-art glitch art assets.
              </p>
            </div>

            <div
              className="mecha-panel corner-accent relative rounded-sm mb-12 p-8 cursor-pointer group transition-all duration-300 hover:shadow-2xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"></div>

              <div className="relative text-center">
                <div className="mb-6 inline-block relative">
                  <div className="absolute inset-0 text-cyan-400/20 animate-pulse text-5xl">⬇</div>
                  <Upload className="w-20 h-20 text-cyan-400 relative group-hover:scale-110 transition-transform" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-cyan-200 mb-2 glow-accent">
                  Initialize Processing
                </h2>
                <p className="text-cyan-400/80 text-sm md:text-base">
                  Drag an image or click to select from disk
                </p>
              </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { title: "Chromatic Rift", desc: "Multi-channel RGB displacement", icon: "🌈" },
                { title: "Mandelbrot Decay", desc: "Fractal set calculations", icon: "🔮" },
                { title: "Cellular Bloom", desc: "Conway's Game of Life", icon: "🧬" },
                { title: "Harmonic Distortion", desc: "Multi-frequency waves", icon: "〰️" },
                { title: "Perlin Corruption", desc: "Procedural noise warping", icon: "☁️" },
                { title: "5 Presets", desc: "Curated combinations", icon: "⚙️" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="mecha-panel relative rounded-sm p-5 group hover:border-cyan-400/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"></div>
                  <div className="relative">
                    <div className="text-3xl mb-3 group-hover:scale-125 transition-transform inline-block">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-cyan-200 mb-1 uppercase tracking-wider">
                      {item.title}
                    </h3>
                    <p className="text-xs text-cyan-400/70 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "editor" && sourceImage) {
    return (
      <div className="min-h-screen wear-texture" style={{background: 'linear-gradient(135deg, rgba(5, 15, 30, 0.98) 0%, rgba(10, 25, 40, 0.95) 100%)'}}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-900/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl"></div>
        </div>

        <div className="relative p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mecha-title">
                PROCESSING ENGINE
              </h1>
              <div className="flex gap-3">
                <Button
                  className="mecha-button rounded-sm px-4"
                  onClick={() => {
                    setStep("landing");
                    setSourceImage(null);
                  }}
                >
                  ← ABORT
                </Button>
                <Button
                  className="mecha-button rounded-sm px-4 bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 border-green-400/50"
                  onClick={() => setStep("export")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  EXPORT
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="mecha-panel rounded-sm p-6 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-sm border border-cyan-400/30 mecha-glow relative z-10"
                    style={{boxShadow: '0 0 20px rgba(102, 204, 255, 0.1), inset 0 0 10px rgba(102, 204, 255, 0.05)'}}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="mecha-panel rounded-sm p-5 relative">
                  <h3 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-widest glow-accent">
                    ⚙️ Algorithmic Presets
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(PRESETS).map((preset) => (
                      <Button
                        key={preset}
                        className="mecha-button rounded-sm w-full justify-start text-left text-xs h-auto py-2.5 px-3"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mecha-panel rounded-sm p-5 relative">
                  <h3 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-widest glow-accent">
                    🎯 Parameters
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-cyan-300/80 uppercase tracking-wider block mb-2">
                        Effect Type
                      </label>
                      <Select
                        value={params.effectType}
                        onValueChange={(v) =>
                          setParams({
                            ...params,
                            effectType: v as any,
                          })
                        }
                      >
                        <SelectTrigger className="mecha-input rounded-sm text-xs py-2 h-auto bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="mecha-input rounded-sm bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/30">
                          <SelectItem value="chromatic">Chromatic Rift</SelectItem>
                          <SelectItem value="fractal">Mandelbrot Decay</SelectItem>
                          <SelectItem value="cellular">Cellular Bloom</SelectItem>
                          <SelectItem value="wave">Harmonic Distortion</SelectItem>
                          <SelectItem value="noise">Perlin Corruption</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-cyan-300/80 uppercase tracking-wider flex justify-between mb-2">
                        <span>Intensity</span>
                        <span className="text-cyan-400 font-bold">{params.intensity}%</span>
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
                      <label className="text-xs text-cyan-300/80 uppercase tracking-wider flex justify-between mb-2">
                        <span>Scale</span>
                        <span className="text-cyan-400 font-bold">{params.scale}</span>
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
                      <label className="text-xs text-cyan-300/80 uppercase tracking-wider flex justify-between mb-2">
                        <span>Iterations</span>
                        <span className="text-cyan-400 font-bold">{params.iterations}</span>
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
                      className="mecha-button rounded-sm w-full mt-2 text-xs"
                      onClick={() => setParams(DEFAULT_PARAMS)}
                    >
                      <RotateCcw className="w-3 h-3 mr-2" />
                      RESET
                    </Button>
                  </div>
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
      <div className="min-h-screen wear-texture flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, rgba(5, 15, 30, 0.98) 0%, rgba(10, 25, 40, 0.95) 100%)'}}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-900/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl"></div>
        </div>

        <Dialog open={true} onOpenChange={() => setStep("editor")}>
          <DialogContent className="mecha-panel rounded-sm border-cyan-400/40 shadow-2xl max-w-md p-0 overflow-hidden">
            <DialogHeader className="mecha-panel rounded-none border-0 border-b border-cyan-400/20 p-6">
              <DialogTitle className="mecha-title text-xl font-bold uppercase tracking-wider">
                ⬇️ Data Export
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-3">
                  Output Format
                </label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <SelectTrigger className="mecha-input rounded-sm text-sm py-2.5 h-auto bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="mecha-input rounded-sm bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/30">
                    <SelectItem value="png">PNG • Lossless</SelectItem>
                    <SelectItem value="jpeg">JPEG • Compressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Button
                  className="mecha-button rounded-sm w-full py-3 text-sm font-bold uppercase tracking-wider bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 border-green-400/50"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  className="mecha-button rounded-sm w-full py-3 text-sm font-bold uppercase tracking-wider"
                  onClick={() => setStep("editor")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
