"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RefreshCw, Download, Music, Video, FileAudio, CheckCircle2, ArrowRight, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";

interface ConversionResult {
  message: string;
  fileName: string;
  format: string;
  url: string;
  size: number;
}

export default function MediaConverterPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("mp3");
  const [bitrate, setBitrate] = useState<string>("192k");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setErrorMsg("");
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a video or audio file to convert.");
      return;
    }

    setIsConverting(true);
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("targetFormat", targetFormat);
    formData.append("bitrate", bitrate);

    try {
      const res = await api.post("/converter/convert", formData);
      setResult(res.data);
    } catch (err: any) {
      console.error("Conversion failed:", err);
      setErrorMsg(err.message || "Failed to convert media file. Please check file format.");
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent/80 text-primary-foreground flex items-center justify-center mx-auto shadow-xl">
          <RefreshCw className="w-7 h-7 animate-spin-slow" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Universal Media Converter</h1>
        <p className="text-sm text-secondary max-w-lg mx-auto">
          Convert video & audio files (<code className="text-accent font-semibold">MP4</code>, <code className="text-accent font-semibold">MKV</code>, <code className="text-accent font-semibold">WEBM</code>, <code className="text-accent font-semibold">WAV</code>) directly into <code className="text-accent font-semibold font-bold">MP3</code>, <code className="text-accent font-semibold">WAV</code>, or <code className="text-accent font-semibold">AAC</code> streams.
        </p>
      </div>

      {/* Main Studio Converter Card */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Dropzone */}
        <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-8 text-center bg-muted/20 transition-colors">
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="media-file-input"
          />
          <label htmlFor="media-file-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
            {selectedFile ? (
              <div>
                <p className="font-semibold text-primary text-base">{selectedFile.name}</p>
                <p className="text-xs text-tertiary">{formatFileSize(selectedFile.size)} • Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-primary">Choose a Video or Audio File</p>
                <p className="text-xs text-tertiary">Drag & drop or browse MP4, MOV, MKV, WEBM, WAV, M4A, FLAC</p>
              </div>
            )}
          </label>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Target Output Format
            </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mp3">MP3 (Universal Audio)</option>
              <option value="wav">WAV (Uncompressed PCM Studio Audio)</option>
              <option value="aac">AAC / M4A (Advanced Audio Coding)</option>
              <option value="flac">FLAC (Lossless Audio)</option>
              <option value="mp4">MP4 (Video Container)</option>
              <option value="webm">WEBM (Web Video)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Audio Bitrate / Quality
            </label>
            <select
              value={bitrate}
              onChange={(e) => setBitrate(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="128k">128 kbps (Standard Quality)</option>
              <option value="192k">192 kbps (High Quality)</option>
              <option value="256k">256 kbps (Very High Quality)</option>
              <option value="320k">320 kbps (Studio Master Quality)</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {/* Convert Action Button */}
        <button
          onClick={handleConvert}
          disabled={!selectedFile || isConverting}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl text-base shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isConverting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> Converting Media with FFmpeg...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Convert File Now
            </>
          )}
        </button>

        {/* Result Card */}
        {result && (
          <div className="p-6 bg-accent/10 border border-accent/30 rounded-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-accent font-bold text-base">
              <CheckCircle2 className="w-5 h-5" /> {result.message}
            </div>

            <div className="p-3 bg-background/80 rounded-lg text-xs font-mono text-secondary space-y-1">
              <p>File Name: <span className="text-primary font-semibold">{result.fileName}</span></p>
              <p>Format: <span className="uppercase text-accent font-semibold">{result.format}</span></p>
              <p>Size: <span className="text-primary font-semibold">{formatFileSize(result.size)}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={result.url}
                download={result.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Converted File
              </a>

              <Link
                href={`/admin?audioUrl=${encodeURIComponent(result.url)}`}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-accent/20 text-accent border border-accent/40 font-semibold rounded-xl text-sm hover:bg-accent/30 transition flex items-center justify-center gap-2"
              >
                <Music className="w-4 h-4" /> Publish directly to Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
