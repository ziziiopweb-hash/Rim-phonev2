import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useRimPhone } from '../context/RimPhoneContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const { lang } = useRimPhone();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
      return;
    }
    setShowIOSGuide(true);
  };

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-500/40 text-xs font-bold text-amber-400 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        title={lang === 'ar' ? 'تثبيت تطبيق Rim Phone' : 'Install Rim Phone App'}
      >
        <Download className="w-3.5 h-3.5 text-orange-400" />
        <span className="hidden sm:inline">
          {lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
        </span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#141210] border border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://img.icons8.com/color/192/phone.png"
                  alt="Rim Phone Icon"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg"
                />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar'
                    ? 'تثبيت Rim Phone على الهاتف'
                    : 'Install Rim Phone on Home Screen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
              {lang === 'ar' ? (
                <>
                  <p>1. اضغط على زر <strong>مشاركة (Share)</strong> في متصفح الهاتف.</p>
                  <p>2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> لتثبيت التطبيق بأيقونة Rim Phone.</p>
                </>
              ) : (
                <>
                  <p>1. Tap the <strong>Share</strong> button in your browser toolbar.</p>
                  <p>2. Select <strong>Add to Home Screen</strong> to install the Rim Phone app.</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
            >
              {lang === 'ar' ? 'حسناً' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
