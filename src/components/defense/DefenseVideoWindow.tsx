import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Award,
  Sparkles,
  ShieldCheck,
  Radio,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { VirtualJudge } from './defenseTypes';

export interface DefenseVideoWindowProps {
  mode?: 'presenter' | 'judge' | 'dual';
  activeJudge?: VirtualJudge;
  isJudgeSpeaking?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  className?: string;
  isFloating?: boolean;
  onClose?: () => void;
}

export default function DefenseVideoWindow({
  mode = 'dual',
  activeJudge,
  isJudgeSpeaking = false,
  onToggleExpand,
  className = '',
  isFloating = false,
  onClose
}: DefenseVideoWindowProps) {
  const [viewMode, setViewMode] = useState<'presenter' | 'judge' | 'dual'>(mode);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(45);
  const [postureFeedback, setPostureFeedback] = useState('眼神聚焦评委席 · 仪态端正');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Request actual camera stream with graceful fallback
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCamera() {
      if (!isCameraOn) {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          setStream(null);
        }
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const media = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false
          });
          localStream = media;
          setStream(media);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = media;
          }
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn('Camera access not granted or iframe restricted, falling back to simulated high-res feed:', err);
        setHasCameraPermission(false);
      }
    }

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraOn]);

  // Attach stream to video tag whenever stream or viewMode changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, viewMode, isMinimized]);

  // Audio level & AI posture inspection ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (isMicOn) {
        setAudioLevel(Math.floor(25 + Math.random() * 55));
      } else {
        setAudioLevel(0);
      }
    }, 400);

    const postureTimer = setInterval(() => {
      const tips = [
        '眼神聚焦评委席 · 仪态端正',
        '建议保持头部稳定 · 避免频繁点头',
        '视线平视摄像头 · 气场饱满自信',
        '面部表情自然 · 保持从容微笑'
      ];
      setPostureFeedback(tips[Math.floor(Math.random() * tips.length)]);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearInterval(postureTimer);
    };
  }, [isMicOn]);

  const defaultJudge: VirtualJudge = activeJudge || {
    id: 'lead_judge',
    name: '张怀德',
    title: '院士团队学术带头人 · 国赛总审组长',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    role: '组长·高校泰斗',
    interestFocus: '微米级光学干涉壁垒、自主可控',
    mood: isJudgeSpeaking ? 'questioning' : 'focused',
    reactionText: isJudgeSpeaking ? '正在对项目第3页核心指标进行深度追问' : '认真聆听答辩阐述并核验发票明细',
    satisfactionScore: 89
  };

  if (isMinimized) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">实训视讯已开启</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="展开视讯窗口"
          >
            <Maximize2 size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="关闭视讯"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all ${className}`}>
      {/* Top Header Controls Bar */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Radio size={13} className="text-purple-400" />
            <span>国赛全真实战视讯舱</span>
          </div>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            HD 1080P
          </span>
        </div>

        {/* View Mode Segment Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              viewMode === 'dual' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            双向连线
          </button>
          <button
            onClick={() => setViewMode('presenter')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              viewMode === 'presenter' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            答辩镜面
          </button>
          <button
            onClick={() => setViewMode('judge')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              viewMode === 'judge' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            主审视角
          </button>
        </div>

        {/* Window Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="最小化视讯窗口"
          >
            <Minimize2 size={13} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-base leading-none font-bold"
              title="关闭视讯窗口"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Video Screens Arena */}
      <div className={`p-2.5 grid gap-2.5 ${viewMode === 'dual' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Screen 1: Presenter Camera (答辩人镜面出镜视窗) */}
        {(viewMode === 'dual' || viewMode === 'presenter') && (
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex flex-col justify-between p-3 select-none group">
            {/* Live Camera Feed or Virtual Fallback Avatar */}
            {hasCameraPermission && isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              /* High-tech Virtual Presenter Fallback */
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg border border-purple-400/40">
                    <UserCheck size={28} />
                  </div>
                  {isCameraOn && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white tracking-wide">答辩第一负责人 · 数字出镜</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isCameraOn ? '模拟答辩人高清视讯镜像 (摄像头就绪)' : '摄像头已关闭 (隐私保护模式)'}
                </div>
              </div>
            )}

            {/* Top Overlay Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>答辩人 · 线上实测</span>
              </span>

              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] text-slate-300 border border-white/10">
                <Mic size={10} className={isMicOn ? 'text-emerald-400' : 'text-slate-500'} />
                <div className="w-10 bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-150"
                    style={{ width: `${isMicOn ? audioLevel : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Overlay: AI Real-time Posture Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="px-2 py-0.5 rounded-md bg-indigo-950/80 backdrop-blur-xs border border-indigo-500/40 text-[10px] font-medium text-indigo-200 flex items-center gap-1">
                <Eye size={11} className="text-indigo-400 shrink-0" />
                <span className="truncate max-w-[170px]">{postureFeedback}</span>
              </div>

              {/* Mirror toggle */}
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className="p-1 rounded-md bg-black/60 hover:bg-black/80 text-slate-300 text-[10px] flex items-center gap-1 transition-colors border border-white/10"
                title="镜像反转"
              >
                <FlipHorizontal size={11} />
                <span className="text-[9px]">镜像</span>
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Lead Judge Live Feed (国赛主审专家视讯连线窗) */}
        {(viewMode === 'dual' || viewMode === 'judge') && (
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex flex-col justify-between p-3 select-none">
            {/* Judge Avatar / Video Backdrop */}
            <img
              src={defaultJudge.avatar}
              alt={defaultJudge.name}
              className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/40" />

            {/* Top Overlay Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-purple-900/80 backdrop-blur-xs text-[10px] font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isJudgeSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>主审席连线中 · {defaultJudge.role}</span>
              </span>

              <span className="text-[10px] font-mono font-bold text-purple-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                专注度 96%
              </span>
            </div>

            {/* Judge Live Reaction / Speaking state indicator */}
            <div className="relative z-10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{defaultJudge.name}</span>
                  <span className="text-[10px] text-slate-300 font-normal truncate max-w-[130px]">{defaultJudge.title}</span>
                </div>
                {isJudgeSpeaking && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-400/30 animate-pulse">
                    正在提问
                  </span>
                )}
              </div>

              <div className="bg-black/70 backdrop-blur-xs border border-white/10 rounded-lg p-1.5 text-[10px] text-slate-200 leading-snug flex items-start gap-1">
                <Sparkles size={11} className="text-purple-400 shrink-0 mt-0.5" />
                <span className="truncate italic">"{defaultJudge.reactionText}"</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tool Bar: Device controls & AI coaching trigger */}
      <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {/* Toggle Camera */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCameraOn
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            {isCameraOn ? <Camera size={13} /> : <CameraOff size={13} />}
            <span>{isCameraOn ? '摄像机 开' : '摄像机 关'}</span>
          </button>

          {/* Toggle Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isMicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            {isMicOn ? <Mic size={13} /> : <MicOff size={13} />}
            <span>{isMicOn ? '麦克风 开' : '静音'}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck size={13} />
          <span>合规双盲实训录制中</span>
        </div>
      </div>
    </div>
  );
}
