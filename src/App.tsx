/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronLeft,
  Scan
} from 'lucide-react';
import { detectFabricDefect, DetectionResult } from './services/geminiService';

// --- Types ---
type Page = 'login' | 'dashboard' | 'camera' | 'upload';

interface User {
  username: string;
}

// --- Components ---

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-blue-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent/10 p-4 rounded-full mb-4">
            <ShieldCheck className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">FABRIC GUARD AI</h1>
          <p className="text-slate-500 mt-2">Intelligent Defect Detection System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary justify-center py-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn className="w-5 h-5" />}
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button 
            onClick={() => onLogin({ username: 'Quick User' })}
            className="w-full text-slate-500 hover:text-primary text-sm font-medium transition-colors"
          >
            Quick Login (Demo Mode)
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onNavigate, onLogout }: { user: User, onNavigate: (p: Page) => void, onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-accent w-8 h-8" />
          <span className="font-bold text-xl text-primary">FABRIC GUARD AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 hidden sm:block">Welcome, <span className="font-semibold">{user.username}</span></span>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-2">Select a detection method to begin fabric analysis.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col items-center text-center group cursor-pointer"
            onClick={() => onNavigate('camera')}
          >
            <div className="bg-blue-50 p-6 rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-all">
              <Camera className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Camera Detection</h3>
            <p className="text-slate-500 mb-8">Real-time analysis using your device's webcam. Ideal for continuous monitoring.</p>
            <button className="btn-primary w-full justify-center">Start Live Scan</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col items-center text-center group cursor-pointer"
            onClick={() => onNavigate('upload')}
          >
            <div className="bg-green-50 p-6 rounded-2xl mb-6 group-hover:bg-accent group-hover:text-white transition-all">
              <Upload className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Upload Image Detection</h3>
            <p className="text-slate-500 mb-8">Upload high-resolution photos for detailed defect classification and reporting.</p>
            <button className="btn-accent w-full justify-center">Upload Photo</button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const CameraDetection = ({ onBack }: { onBack: () => void }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    setScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg');
      
      try {
        const res = await detectFabricDefect(base64Image);
        setResult(res);
      } catch (err) {
        setError("Detection failed. Please try again.");
      } finally {
        setScanning(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-4 flex items-center justify-between bg-slate-800/50 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-accent transition-colors">
          <ChevronLeft /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Scan className="text-accent animate-pulse" />
          <span className="font-semibold">Live Scan Mode</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 border-[40px] border-slate-900/40 pointer-events-none">
          <div className="w-full h-full border-2 border-accent/30 rounded-lg relative">
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_15px_rgba(34,197,94,0.8)]"
            />
          </div>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-8 left-8 right-8 glass-card bg-white p-6 text-slate-900"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Detection Result</h4>
                  <div className="flex items-center gap-2">
                    {result.label === 'No defect detected' ? (
                      <CheckCircle2 className="text-accent w-6 h-6" />
                    ) : result.label === 'Not fabric' ? (
                      <AlertCircle className="text-slate-400 w-6 h-6" />
                    ) : (
                      <AlertCircle className="text-red-500 w-6 h-6" />
                    )}
                    <span className="text-2xl font-bold">{result.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Confidence</div>
                  <div className="text-xl font-mono font-bold text-primary">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 bg-slate-900 flex justify-center">
        <button 
          onClick={captureAndDetect}
          disabled={scanning}
          className="w-20 h-20 rounded-full bg-accent hover:bg-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-10 h-10 animate-spin text-white" /> : <Camera className="w-10 h-10 text-white" />}
        </button>
      </div>

      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
};

const UploadDetection = ({ onBack }: { onBack: () => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!image || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await detectFabricDefect(image);
      setResult(res);
    } catch (err) {
      setError("Analysis failed. Please try a different image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-primary transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-xl text-primary">Image Upload Analysis</h2>
      </nav>

      <main className="max-w-4xl mx-auto p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-6 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
              {image ? (
                <img src={image} alt="Upload" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">No image selected</p>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="font-semibold text-primary">Analyzing Fabric...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex-1">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="btn-accent justify-center cursor-pointer py-3">
                  <Upload className="w-5 h-5" /> Select Image
                </div>
              </label>
              <button 
                onClick={handleDetect} 
                disabled={!image || loading}
                className="flex-1 btn-primary justify-center disabled:opacity-50"
              >
                Run Analysis
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 h-full">
              <h3 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">Analysis Report</h3>
              
              {result ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      result.label === 'No defect detected' ? 'bg-green-100 text-green-700' : 
                      result.label === 'Not fabric' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {result.label}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Confidence Score</span>
                      <span className="text-primary">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <span className="text-slate-500 font-medium block mb-2">Detailed Findings</span>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-slate-100">
                      {result.description}
                    </p>
                  </div>

                  <div className="pt-6 flex items-center gap-3 text-sm text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    Verified by Fabric Guard AI Engine
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <Scan className="w-12 h-12 mb-4 opacity-20" />
                  <p>Upload an image and run analysis to see results here.</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  return (
    <div className="antialiased">
      <AnimatePresence mode="wait">
        {page === 'login' && (
          <motion.div key="login" exit={{ opacity: 0 }}>
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        )}
        {page === 'dashboard' && user && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard 
              user={user} 
              onNavigate={setPage} 
              onLogout={handleLogout} 
            />
          </motion.div>
        )}
        {page === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <CameraDetection onBack={() => setPage('dashboard')} />
          </motion.div>
        )}
        {page === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <UploadDetection onBack={() => setPage('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
