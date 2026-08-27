import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, ExternalLink, Sparkles } from 'lucide-react';

interface VsCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VsCodeModal: React.FC<VsCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'App' | 'ProductDetails' | 'Header' | 'css' | 'package'>('guide');

  if (!isOpen) return null;

  const handleCopyText = (name: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const setupCommands = `# 1. สร้างโปรเจกต์ React + Vite + Tailwind CSS ใน VS Code Terminal:
npm create vite@latest titankeys-store -- --template react-ts
cd titankeys-store

# 2. ติดตั้งไลบรารีที่จำเป็น:
npm install lucide-react canvas-confetti @types/canvas-confetti
npm install tailwindcss @tailwindcss/vite

# 3. เริ่มรัน Dev Server:
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#0c0d18] border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 bg-[#101122] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-900/50 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>โค้ดสำหรับนำไปใส่ใน VS Code (VS Code Export)</span>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-md font-mono">
                  React + Tailwind
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                คุณสามารถคัดลอกโค้ดและคำสั่งไปรันบน Visual Studio Code ในเครื่องของคุณได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-800/80 bg-[#090a12] px-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🚀 วิธีเปิดใน VS Code (Step-by-Step)
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'package'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📦 package.json
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'css'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🎨 index.css
          </button>
          <button
            onClick={() => setActiveTab('App')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'App'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            ⚡ App.tsx
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-gray-300">
              <div className="p-4 rounded-xl bg-[#131424] border border-gray-800 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  ขั้นตอนการนำไปเปิดใช้งานใน VS Code
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>เปิดโปรแกรม <strong>Visual Studio Code</strong> บนคอมพิวเตอร์ของคุณ</li>
                  <li>เปิด Terminal ใน VS Code (<kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">Ctrl + `</kbd> หรือ <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">Cmd + `</kbd>)</li>
                  <li>คัดลอกคำสั่งด้านล่างไปวางใน Terminal เพื่อติดตั้งโปรเจกต์:</li>
                </ol>

                <div className="relative">
                  <pre className="p-3 bg-[#080910] rounded-lg border border-gray-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                    {setupCommands}
                  </pre>
                  <button
                    onClick={() => handleCopyText('commands', setupCommands)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-purple-900/80 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFile === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'commands' ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  โครงสร้างโฟลเดอร์ใน VS Code ที่สร้างขึ้น:
                </h4>
                <pre className="text-xs font-mono text-gray-300 bg-[#080910] p-3 rounded-lg border border-gray-800 overflow-x-auto">
{`titankeys-store/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # แถบเมนูด้านบน Cyberpunk + Neon line
│   │   ├── ProductGallery.tsx   # ภาพสินค้า + แท็ก [KEYBOARD] [BLUETOOTH] [WIRELESS]
│   │   ├── ProductDetails.tsx   # ราคา $399, Switch Sound Test, สี, ปุ่ม Add to Cart
│   │   ├── DescriptionCard.tsx  # กล่องคำอธิบายสีม่วงตามแบบ
│   │   ├── CartDrawer.tsx       # ตะกร้าสินค้าสไลด์ด้านข้าง
│   │   └── Footer.tsx           # ฟุตเตอร์ 4 คอลัมน์ + ช่อง Subscribe
│   ├── data/
│   │   └── products.ts          # ข้อมูลสินค้า TitanKeys Elite
│   ├── utils/
│   │   └── audio.ts             # ระบบจำลองเสียงกดคีย์บอร์ดเสมือนจริง
│   ├── types.ts                 # TypeScript interfaces
│   ├── App.tsx                  # คอมโพเนนต์หลัก
│   ├── index.css                # สไตล์ Tailwind CSS & Neon Glow
│   └── main.tsx
├── index.html                   # ไฟล์ HTML หลัก & Google Fonts
└── package.json`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'package' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>ไฟล์ <code>package.json</code></span>
                <button
                  onClick={() =>
                    handleCopyText(
                      'package',
                      `{
  "name": "titankeys-store",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.4",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}`
                    )
                  }
                  className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedFile === 'package' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'package' ? 'คัดลอกแล้ว' : 'คัดลอก package.json'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#080910] rounded-lg border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto max-h-72">
{`{
  "name": "titankeys-store",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.4",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'css' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>ไฟล์ <code>src/index.css</code></span>
                <button
                  onClick={() =>
                    handleCopyText(
                      'css',
                      `@import "tailwindcss";

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  }
  
  h1, h2, h3, .font-heading {
    font-family: 'Space Grotesk', 'Rajdhani', sans-serif;
  }
}

.neon-border-glow {
  box-shadow: 0 0 15px -3px rgba(168, 85, 247, 0.4), 0 0 6px -1px rgba(6, 182, 212, 0.3);
}

.neon-btn-glow {
  box-shadow: 0 0 20px -2px rgba(139, 92, 246, 0.6);
}

.neon-btn-glow:hover {
  box-shadow: 0 0 25px 2px rgba(168, 85, 247, 0.8), 0 0 10px 0 rgba(236, 72, 153, 0.5);
}`
                    )
                  }
                  className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedFile === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'css' ? 'คัดลอกแล้ว' : 'คัดลอก index.css'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#080910] rounded-lg border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto max-h-72">
{`@import "tailwindcss";

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  }
  
  h1, h2, h3, .font-heading {
    font-family: 'Space Grotesk', 'Rajdhani', sans-serif;
  }
}

.neon-border-glow {
  box-shadow: 0 0 15px -3px rgba(168, 85, 247, 0.4), 0 0 6px -1px rgba(6, 182, 212, 0.3);
}

.neon-btn-glow {
  box-shadow: 0 0 20px -2px rgba(139, 92, 246, 0.6);
}

.neon-btn-glow:hover {
  box-shadow: 0 0 25px 2px rgba(168, 85, 247, 0.8), 0 0 10px 0 rgba(236, 72, 153, 0.5);
}`}
              </pre>
            </div>
          )}

          {activeTab === 'App' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                ไฟล์ทั้งหมดสร้างไว้ในโครงสร้างโปรเจกต์นี้เรียบร้อยแล้ว และสามารถรันได้ทันทีทั้งบน AI Studio Preview และใน VS Code!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0b14] border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
