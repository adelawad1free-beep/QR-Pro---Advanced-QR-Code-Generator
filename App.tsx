
import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Language, QRType, QRConfig, Theme } from './types';
import { TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<QRType>(QRType.URL);
  const [formData, setFormData] = useState<any>({
    url: 'https://example.com',
    text: '',
    phone: '',
    email: '',
    emailSubject: '',
    emailBody: '',
    smsPhone: '',
    smsMessage: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    vFirstName: '',
    vLastName: '',
    vOrg: '',
    vPhone: '',
    vEmail: ''
  });

  const [config, setConfig] = useState<QRConfig>({
    value: 'https://example.com',
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 1024,
    includeMargin: true,
    level: 'H'
  });

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const TabButton = ({ type, icon, label }: { type: QRType, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 gap-1 border-2 ${
        activeTab === type 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' 
          : 'bg-white dark:bg-slate-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
      }`}
    >
      <div className="text-lg sm:text-xl">{icon}</div>
      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-wide text-center leading-tight">
        {label}
      </span>
    </button>
  );

  return (
    <div className={`min-h-screen pb-20 transition-all duration-300`}>
      {/* Extended Header / Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM17 8h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {t.title}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-600 dark:text-yellow-400 transition-all border border-gray-100 dark:border-slate-700"
              title={theme === 'light' ? t.darkMode : t.lightMode}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-bold transition-colors border border-blue-100 dark:border-blue-900/50"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-[2.5rem] qr-shadow border border-gray-100 dark:border-slate-800 transition-colors">
            
            {/* Tabs Grid - Fixed without scrollbar */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-8 bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
              <TabButton type={QRType.URL} label={t.link} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.242a4 4 0 115.656 5.656l-1.101 1.101m-.758-4.826L12 12" /></svg>} />
              <TabButton type={QRType.TEXT} label={t.text} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>} />
              <TabButton type={QRType.WIFI} label={t.wifi} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>} />
              <TabButton type={QRType.EMAIL} label={t.email} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
              <TabButton type={QRType.SMS} label={t.sms} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} />
              <TabButton type={QRType.VCARD} label={t.vcard} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  {t.data}
                </h3>

                <div className="space-y-4">
                  {activeTab === QRType.URL && (
                    <div className="relative group">
                      <input 
                        type="url" 
                        value={formData.url}
                        onChange={(e) => updateFormData('url', e.target.value)}
                        placeholder={t.placeholderUrl}
                        className="w-full p-5 pr-14 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white dark:placeholder-gray-500"
                      />
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-5' : 'right-5'} text-gray-400 group-focus-within:text-blue-500 transition-colors`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.242a4 4 0 115.656 5.656l-1.101 1.101m-.758-4.826L12 12" /></svg>
                      </div>
                    </div>
                  )}

                  {activeTab === QRType.TEXT && (
                    <textarea 
                      value={formData.text}
                      onChange={(e) => updateFormData('text', e.target.value)}
                      placeholder={t.placeholderText}
                      className="w-full p-5 h-40 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all resize-none dark:text-white dark:placeholder-gray-500"
                    />
                  )}
                  {activeTab === QRType.SMS && (
                    <div className="space-y-4">
                      <input type="tel" value={formData.smsPhone} onChange={(e) => updateFormData('smsPhone', e.target.value)} placeholder={t.placeholderPhone} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <textarea value={formData.smsMessage} onChange={(e) => updateFormData('smsMessage', e.target.value)} placeholder={t.body} className="w-full p-5 h-24 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all resize-none dark:text-white" />
                    </div>
                  )}
                  {activeTab === QRType.EMAIL && (
                    <div className="space-y-4">
                      <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} placeholder="example@mail.com" className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <input type="text" value={formData.emailSubject} onChange={(e) => updateFormData('emailSubject', e.target.value)} placeholder={t.subject} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <textarea value={formData.emailBody} onChange={(e) => updateFormData('emailBody', e.target.value)} placeholder={t.body} className="w-full p-5 h-24 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all resize-none dark:text-white" />
                    </div>
                  )}
                  {activeTab === QRType.WIFI && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input type="text" value={formData.wifiSsid} onChange={(e) => updateFormData('wifiSsid', e.target.value)} placeholder={t.ssid} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      </div>
                      <input type="password" value={formData.wifiPassword} onChange={(e) => updateFormData('wifiPassword', e.target.value)} placeholder={t.password} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <select value={formData.wifiEncryption} onChange={(e) => updateFormData('wifiEncryption', e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white appearance-none cursor-pointer">
                        <option value="WPA" className="dark:bg-slate-900">WPA/WPA2</option>
                        <option value="WEP" className="dark:bg-slate-900">WEP</option>
                        <option value="nopass" className="dark:bg-slate-900">None</option>
                      </select>
                    </div>
                  )}
                  {activeTab === QRType.VCARD && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={formData.vFirstName} onChange={(e) => updateFormData('vFirstName', e.target.value)} placeholder={t.firstName} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <input type="text" value={formData.vLastName} onChange={(e) => updateFormData('vLastName', e.target.value)} placeholder={t.lastName} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <input type="text" value={formData.vOrg} onChange={(e) => updateFormData('vOrg', e.target.value)} placeholder={t.org} className="md:col-span-2 w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <input type="tel" value={formData.vPhone} onChange={(e) => updateFormData('vPhone', e.target.value)} placeholder={t.placeholderPhone} className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                      <input type="email" value={formData.vEmail} onChange={(e) => updateFormData('vEmail', e.target.value)} placeholder="Email" className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white" />
                    </div>
                  )}
                </div>
              </section>

              {/* Design Section */}
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                  🎨 {t.design}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{t.bgColor}</span>
                    <input type="color" value={config.bgColor} onChange={(e) => setConfig(prev => ({ ...prev, bgColor: e.target.value }))} className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent" />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{t.fgColor}</span>
                    <input type="color" value={config.fgColor} onChange={(e) => setConfig(prev => ({ ...prev, fgColor: e.target.value }))} className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent" />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{t.removeMargin}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Safe zone padding</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={!config.includeMargin} onChange={(e) => setConfig(prev => ({ ...prev, includeMargin: !e.target.checked }))} className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Quality Section */}
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                  ⬇️ {t.downloadQuality}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[512, 1024, 2048, 4096].map((sz) => (
                    <button key={sz} onClick={() => setConfig(prev => ({ ...prev, size: sz }))} className={`p-4 rounded-2xl transition-all border-2 flex flex-col items-center justify-center gap-1 ${config.size === sz ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'}`}>
                      <span className="text-[10px] font-black uppercase opacity-80">{sz === 512 ? t.low : sz === 1024 ? t.high : sz === 2048 ? t.ultra : t.max}</span>
                      <span className="text-xs font-mono">{sz}px</span>
                    </button>
                  ))}
                </div>
                <button onClick={handleDownload} className="w-full py-5 mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span className="text-lg">{t.downloadBtn}</span>
                </button>
              </section>
            </div>
          </div>

          {/* Preview Panel & SEO Footer Content */}
          <div className="lg:col-span-5 flex flex-col gap-8 sticky top-28">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] qr-shadow border border-gray-100 dark:border-slate-800 flex flex-col items-center transition-colors">
               <div className="mb-8 w-full flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t.livePreview}</span>
                    <span className="text-xs text-blue-500 font-bold">Real-time update</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-500 font-bold uppercase">Ready</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  </div>
               </div>
               
               <div className="relative p-8 bg-white rounded-[2.5rem] shadow-inner-lg border border-gray-50 dark:border-white transition-all duration-300">
                  <QRCodeCanvas id="qr-canvas" value={qrValue} size={config.size} fgColor={config.fgColor} bgColor={config.bgColor} includeMargin={config.includeMargin} level={config.level} style={{ width: '100%', height: 'auto', maxWidth: '340px' }} />
               </div>

               <div className="mt-10 text-center w-full">
                  <div className="inline-block px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 mb-4">
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">Engine: V-PRO 3.14.0 | Mod: {activeTab}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 px-6 break-all leading-relaxed font-mono">
                    {qrValue.length > 80 ? qrValue.substring(0, 80) + '...' : qrValue}
                  </p>
               </div>
            </div>

            {/* Semantic SEO Section - Important for Search Engines */}
            <article className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                {isRtl ? 'حول مولد رموز QR المطور' : 'About Advanced QR Generator'}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
                <p>
                  {isRtl 
                    ? 'يعتبر مولد رموز QR المطور الأداة الأفضل لإنشاء باركود سريع واحترافي. سواء كنت تبحث عن إنشاء رمز لموقعك الإلكتروني، أو شبكة الواي فاي الخاصة بك، أو حتى بطاقة عمل رقمية (vCard)، فإن منصتنا توفر لك كافة الأدوات اللازمة وبجودة تصل إلى 4K.' 
                    : 'The Advanced QR Generator is the leading tool for creating fast and professional barcodes. Whether you are looking to create a code for your website, your WiFi network, or even a digital business card (vCard), our platform provides all the necessary tools with quality up to 4K.'
                  }
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400">
                  <span>#QR_Generator</span>
                  <span>#إنشاء_باركود</span>
                  <span>#WiFi_QR</span>
                  <span>#Business_QR</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="mt-20 border-t border-gray-100 dark:border-slate-800 py-10 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
            <span>Free QR Code</span>
            <span>مولد باركود مجاني</span>
            <span>QR for Business</span>
            <span>باركود روابط</span>
            <span>Secure QR Encoding</span>
          </div>
          
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
            {isRtl ? 'كافة الحقوق محفوظة 2025 | adelawad1@gmail.com' : 'All Rights Reserved 2025 | adelawad1@gmail.com'}
          </p>
          
          <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-600 opacity-60">
             QR Pro Advanced Generator Engine v3.14
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
