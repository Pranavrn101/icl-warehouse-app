"use client";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignatureSection({ setSignature }: { setSignature: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);


  
  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ratio = window.devicePixelRatio || 1;
  canvas.width = 400 * ratio;
  canvas.height = 150 * ratio;
  canvas.style.width = `400px`;
  canvas.style.height = `150px`;
  canvas.getContext("2d")?.scale(ratio, ratio);

  sigPadRef.current = new SignaturePad(canvas, {
    penColor: "black",
    backgroundColor: "white",
  });
}, []);


  const handleSave = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const trimmed = trimCanvas(canvasRef.current!);
      const dataUrl = trimmed.toDataURL("image/png");
      setSignature(dataUrl);
    }
  };

  const handleClear = () => {
    sigPadRef.current?.clear();
    setSignature(""); // optional: clear stored signature
  };

  return (
    <div>
      <Label>Signature</Label>
      <canvas ref={canvasRef} width={400} height={150} className="border bg-white" />
      <div className="flex gap-4 mt-2">
        <Button type="button" onClick={handleSave} className="bg-black text-white">
          Save Signature
        </Button>
        <Button type="button" onClick={handleClear} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
}
function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);

  let top = null, bottom = null, left = null, right = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (imageData.data[i + 3] > 0) {
        if (top === null) top = y;
        bottom = y;
        if (left === null || x < left) left = x;
        if (right === null || x > right) right = x;
      }
    }
  }

  if (top === null) return canvas; // Empty canvas

  const trimmedWidth = right! - left! + 1;
  const trimmedHeight = bottom! - top! + 1;
  const trimmedData = ctx.getImageData(left!, top!, trimmedWidth, trimmedHeight);

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  trimmedCanvas.getContext("2d")?.putImageData(trimmedData, 0, 0);

  return trimmedCanvas;
}
