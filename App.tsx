
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import bwipjs from 'bwip-js';
import { jsPDF } from 'jspdf';
import { Language, QRType, QRConfig, Theme, AppMode, BarcodeConfig } from './types';
import { TRANSLATIONS, BARCODE_SYMBOLOGIES } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [mode, setMode] = useState<AppMode>('select');
  const [activeTab, setActiveTab] = useState<QRType>(QRType.URL);
  
  const [formData, setFormData] = useState<any>({
    url: 'https://example.com', text: '', phone: '', email: '', emailSubject: '', emailBody: '',
    smsPhone: '', smsMessage: '', wifiSsid: '', wifiPassword: '', wifiEncryption: 'WPA',
    vFirstName: '', vLastName: '', vOrg: '', vPhone: '', vEmail: ''
  });

  const [qrConfig, setQrConfig] = useState<QRConfig>({
    value: 'https://example.com', fgColor: '#000000', bgColor: '#ffffff', size: 1024, includeMargin: true, level: 'H'
  });

  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>({
    symbology: 'ean13', text: '123456789012', scale: 3, height: 15, includetext: true, guardwhitespace: true
  });

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const qrSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (mode === 'barcode' && barcodeRef.current) {
      try {
        bwipjs.toCanvas(barcodeRef.current, {
          bcid: barcodeConfig.symbology,
          text: barcodeConfig.text || '123456',
          scale: barcodeConfig.scale,
          height: barcodeConfig.height,
          includetext: barcodeConfig.includetext,
          textxalign: 'center',
          backgroundcolor: 'ffffff',
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [barcodeConfig, mode, theme]);

  const qrValue = useMemo(() => {
    switch (activeTab) {
      case QRType.URL: return formData.url || ' ';
      case QRType.TEXT: return formData.text || ' ';
      case QRType.CALL: return `tel:${formData.phone}`;
      case QRType.SMS: return `sms:${formData.smsPhone}?body=${encodeURIComponent(formData.smsMessage)}`;
      case QRType.EMAIL: return `mailto:${formData.email}?subject=${encodeURIComponent(formData.emailSubject)}&body=${encodeURIComponent(formData.emailBody)}`;
      case QRType.WIFI: return `WIFI:S:${formData.wifiSsid};T:${formData.wifiEncryption};P:${formData.wifiPassword};;`;
      case QRType.VCARD:
        return `BEGIN:VCARD\nVERSION:3.0\nN:${formData.vLastName};${formData.vFirstName};;;\nFN:${formData.vFirstName} ${formData.vLastName}\nORG:${formData.vOrg}\nTEL;TYPE=CELL:${formData.vPhone}\nEMAIL:${formData.vEmail}\nEND:VCARD`;
      default: return '';
    }
  }, [activeTab, formData]);

  const downloadFile = (data: string, fileName: string, mimeType: string) => {
    const link = document.createElement("a");
    link.href = data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPNG = () => {
    const canvas = document.getElementById(mode === 'qr' ? 'qr-canvas' : 'barcode-canvas') as HTMLCanvasElement;
    if (canvas) {
      downloadFile(canvas.toDataURL("image/png"), `${mode}-code-${Date.now()}.png`, "image/png");
    }
  };

  const handleDownloadSVG = () => {
    if (mode === 'qr') {
      const svg = document.getElementById('qr-svg-hidden') as unknown as SVGSVGElement;
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadFile(svgUrl, `qr-code-${Date.now()}.svg`, "image/svg+xml");
      }
    } else {
      try {
        const svgStr = bwipjs.toSVG({
          bcid: barcodeConfig.symbology,
          text: barcodeConfig.text || '123456',
          scale: barcodeConfig.scale,
          height: barcodeConfig.height,
          includetext: barcodeConfig.includetext,
          textxalign: 'center',
        });
        const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadFile(svgUrl, `barcode-${Date.now()}.svg`, "image/svg+xml");
      } catch (e) {
        console.error("Barcode SVG Error", e);
      }
    }
  };

  const handleDownloadPDF = async () => {
    const canvas = document.getElementById(mode === 'qr' ? 'qr-canvas' : 'barcode-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width + 40, canvas.height + 40]
      });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
      pdf.save(`${mode}-code-${Date.now()}.pdf`);
    }
  };

  const updateFormData = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  const ToolCard = ({ type, title, desc, icon }: { type: AppMode, title: string, desc: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setMode(type)}
      className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-transparent hover:border-blue-600 transition-all group qr-shadow h-full"
    >
      <div className="w-24 h-24 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-3 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{desc}</p>
      <div className="mt-auto pt-6">
        <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest group-hover:bg-blue-700 transition-colors">
          {isRtl ? 'ابدأ الآن' : 'Start Now'}
        </span>
      </div>
    </button>
  );

  const SelectionScreen = () => (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-4xl sm:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
          {t.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
          {t.subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        <ToolCard 
          type="qr" 
          title={t.qrTool} 
          desc={isRtl ? "إنشاء رموز استجابة سريعة (QR) متطورة لكافة الاستخدامات بجودة عالية وتنسيقات متعددة." : "Professional QR Code generator supporting major standards with high resolution output."}
          icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM17 8h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
        />
        <ToolCard 
          type="barcode" 
          title={t.barcodeTool} 
          desc={lang === 'en' ? "Symbologies include EAN, UPC, ISBN, ISSN, GS1-128, Code 39, Code 93, Data Matrix, Aztec Code and more." : "تحميل رموز الباركود العالمية لكافة المنتجات (EAN, UPC, Code 128) بجودة EPS و PDF و PNG."}
          icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
      </div>
      
      <div className="mt-16 max-w-4xl text-center border-t border-gray-200 dark:border-slate-800 pt-8 opacity-70">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Supported Symbologies</h4>
        <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-mono px-4">
          Symbologies include EAN, UPC, QR Code, Micro QR Code, Han Xin Code, DotCode, Ultracode, ISBN, ISMN, ISSN, GS1-128, SSCC-18, EAN-14, Code 39, Code 93, Italian Pharmacode, PZN, ITF-14, GS1 DataBar, GS1 DataBar Coupon, Code 2 of 5, Code 11, Codablock F, Code 16K, Code 49, Codabar, Pharmacode, MSI, Plessey, Telepen, PosiCode, PDF417, MicroPDF417, Data Matrix, GS1 DataMatrix, GS1 QR Code, GS1 Digital Link QR Code, MaxiCode, Aztec Code, Code One, USPS Intelligent Mail, GS1 Composite, HIBC.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 transition-all duration-300">
      <div className="hidden">
        {/* Hidden SVG version for QR Export */}
        <QRCodeSVG 
          id="qr-svg-hidden" 
          value={qrValue} 
          size={qrConfig.size} 
          fgColor={qrConfig.fgColor} 
          bgColor={qrConfig.bgColor} 
          includeMargin={qrConfig.includeMargin} 
          level={qrConfig.level} 
        />
      </div>

      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setMode('select')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black dark:text-white leading-tight">{t.title}</h1>
              {mode !== 'select' && <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{mode === 'qr' ? t.qrTool : t.barcodeTool}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-yellow-400 border border-gray-100 dark:border-slate-700 transition-colors hover:scale-110">
              {theme === 'light' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 9H3m12 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 transition-colors">
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            {mode !== 'select' && (
              <button onClick={() => setMode('select')} className="hidden sm:flex px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-300 text-sm font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-200 transition-colors">
                {isRtl ? 'الرجوع للرئيسية' : 'Home'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {mode === 'select' ? <SelectionScreen /> : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-[2.5rem] qr-shadow border border-gray-100 dark:border-slate-800">
              {mode === 'qr' ? (
                <>
                  <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-8 bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-2xl no-scrollbar">
                    <button onClick={() => setActiveTab(QRType.URL)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.URL ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.242a4 4 0 115.656 5.656l-1.101 1.101m-.758-4.826L12 12" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.link}</span></button>
                    <button onClick={() => setActiveTab(QRType.TEXT)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.TEXT ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.text}</span></button>
                    <button onClick={() => setActiveTab(QRType.WIFI)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.WIFI ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.wifi}</span></button>
                    <button onClick={() => setActiveTab(QRType.EMAIL)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.EMAIL ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.email}</span></button>
                    <button onClick={() => setActiveTab(QRType.SMS)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.SMS ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.sms}</span></button>
                    <button onClick={() => setActiveTab(QRType.VCARD)} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === QRType.VCARD ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-[8px] mt-1 uppercase font-bold">{t.vcard}</span></button>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 text-gray-800 dark:text-white"><span className="w-2 h-8 bg-blue-600 rounded-full"></span>{t.data}</h3>
                    {activeTab === QRType.URL && <input type="url" value={formData.url} onChange={(e) => updateFormData('url', e.target.value)} placeholder={t.placeholderUrl} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />}
                    {activeTab === QRType.TEXT && <textarea value={formData.text} onChange={(e) => updateFormData('text', e.target.value)} placeholder={t.placeholderText} className="w-full p-5 h-40 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all resize-none dark:text-white" />}
                    {activeTab === QRType.WIFI && <div className="grid grid-cols-1 gap-4"><input type="text" value={formData.wifiSsid} onChange={(e) => updateFormData('wifiSsid', e.target.value)} placeholder={t.ssid} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" /><input type="password" value={formData.wifiPassword} onChange={(e) => updateFormData('wifiPassword', e.target.value)} placeholder={t.password} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" /></div>}
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  <h3 className="text-xl font-black flex items-center gap-3 text-gray-800 dark:text-white"><span className="w-2 h-8 bg-indigo-600 rounded-full"></span>{t.barcodeTool}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-500">{t.barcodeSymbology}</label>
                      <select 
                        value={barcodeConfig.symbology} 
                        onChange={(e) => setBarcodeConfig(p => ({ ...p, symbology: e.target.value }))}
                        className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none text-gray-800 dark:text-white appearance-none cursor-pointer"
                      >
                        {BARCODE_SYMBOLOGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-500">{t.barcodeValue}</label>
                      <input 
                        type="text" 
                        value={barcodeConfig.text} 
                        onChange={(e) => setBarcodeConfig(p => ({ ...p, text: e.target.value }))}
                        className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{t.showText}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={barcodeConfig.includetext} onChange={(e) => setBarcodeConfig(p => ({ ...p, includetext: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-12 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-gray-800 dark:text-white"><span className="w-2 h-8 bg-green-500 rounded-full"></span>{t.downloadQuality}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[512, 1024, 2048, 4096].map(sz => (
                    <button key={sz} onClick={() => mode === 'qr' ? setQrConfig(p => ({...p, size: sz})) : setBarcodeConfig(p => ({...p, scale: sz/256}))} className={`p-4 rounded-2xl border-2 transition-all ${((mode === 'qr' && qrConfig.size === sz) || (mode === 'barcode' && Math.round(barcodeConfig.scale * 256) === sz)) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-transparent hover:border-blue-200'}`}>
                      <span className="block text-[10px] font-black uppercase">{sz === 512 ? t.low : sz === 1024 ? t.high : sz === 2048 ? t.ultra : t.max}</span>
                      <span className="text-xs">{sz}px</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={handleDownloadPNG} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    PNG
                  </button>
                  <button onClick={handleDownloadSVG} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    SVG (Vector)
                  </button>
                  <button onClick={handleDownloadPDF} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] qr-shadow border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                <div className="mb-6 w-full flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>{t.livePreview}</span>
                  <span className="text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-inner flex items-center justify-center min-h-[300px] w-full transition-all">
                  {mode === 'qr' ? (
                    <QRCodeCanvas id="qr-canvas" value={qrValue} size={qrConfig.size} fgColor={qrConfig.fgColor} bgColor={qrConfig.bgColor} includeMargin={qrConfig.includeMargin} level={qrConfig.level} style={{ width: '100%', height: 'auto', maxWidth: '300px' }} />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full">
                      <canvas id="barcode-canvas" ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <span className="text-[10px] font-mono text-gray-400">{mode === 'qr' ? `QR Engine v3.15` : `Symbology: ${barcodeConfig.symbology.toUpperCase()}`}</span>
                </div>
              </div>

              <article className="bg-blue-50/30 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50">
                <h4 className="font-black text-blue-900 dark:text-blue-300 mb-4">{isRtl ? 'حول منصتنا العالمية' : 'About Global Platform'}</h4>
                <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed mb-4">
                  {mode === 'qr' ? (isRtl ? 'نحن نقدم أسرع وأسهل طريقة لإنشاء رموز QR احترافية بجودة عالية وتشفير آمن.' : 'The world\'s most capable free web-based online QR Code and Barcode generator.') : t.barcodeDesc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {['#Universal', '#Scalable', '#Secure', '#HD_Output', '#Free'].map(tag => <span key={tag} className="text-[9px] font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">{tag}</span>)}
                </div>
              </article>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 border-t border-gray-100 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
            <span>Online Barcode Generator</span>
            <span>EAN-13 Maker</span>
            <span>UPC Generator</span>
            <span>GS1-128 Standard</span>
            <span>Professional QR Creator</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {isRtl ? 'كافة الحقوق محفوظة 2025 | adelawad1@gmail.com' : 'All Rights Reserved 2025 | adelawad1@gmail.com'}
          </p>
          <div className="mt-4 text-[10px] text-gray-400 opacity-60 font-mono">
             Developed with Love for Global Trade & Logistics
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
