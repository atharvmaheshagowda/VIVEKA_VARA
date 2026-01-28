import React, { useState } from 'react';
import { X, Settings, Monitor, Volume2, Shield, Bell, Cpu } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'graphics'>('general');

  // Mock State for toggles
  const [settings, setSettings] = useState({
    notifications: true,
    highQuality: true,
    ambientSound: true,
    haptics: false,
    hardwareAccel: true
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'graphics', label: 'Graphics', icon: Monitor },
    { id: 'audio', label: 'Audio', icon: Volume2 },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border-r border-white/5 p-4">
            <h2 className="text-lg font-bold text-white mb-6 px-2 flex items-center gap-2">
                <Settings size={18} className="text-purple-400" /> Settings
            </h2>
            <div className="space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${activeTab === tab.id 
                                ? 'bg-white/10 text-white shadow-inner' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 relative bg-[#121212]">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>

            {activeTab === 'general' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">General Preferences</h3>
                        <p className="text-white/40 text-xs">Manage your account and system notifications.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <ToggleItem 
                            icon={Bell}
                            title="Push Notifications"
                            desc="Receive updates about system status."
                            active={settings.notifications}
                            onClick={() => toggle('notifications')}
                        />
                        <ToggleItem 
                            icon={Shield}
                            title="Privacy Mode"
                            desc="Mask sensitive data on dashboard."
                            active={false}
                            onClick={() => {}}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'graphics' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Graphics & Display</h3>
                        <p className="text-white/40 text-xs">Adjust visual fidelity and performance.</p>
                    </div>

                    <div className="space-y-4">
                        <ToggleItem 
                            icon={Cpu}
                            title="Hardware Acceleration"
                            desc="Use GPU for particle simulations."
                            active={settings.hardwareAccel}
                            onClick={() => toggle('hardwareAccel')}
                        />
                         <ToggleItem 
                            icon={Monitor}
                            title="High Quality Assets"
                            desc="Use 4K textures for environment layers."
                            active={settings.highQuality}
                            onClick={() => toggle('highQuality')}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'audio' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Audio Configuration</h3>
                        <p className="text-white/40 text-xs">Manage sound output and input devices.</p>
                    </div>

                    <div className="space-y-4">
                        <ToggleItem 
                            icon={Volume2}
                            title="Spatial Audio"
                            desc="Enable 3D audio positioning for ambience."
                            active={settings.ambientSound}
                            onClick={() => toggle('ambientSound')}
                        />
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                        <label className="text-xs font-semibold text-white/60 uppercase block mb-3">Master Volume</label>
                        <input type="range" className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-[10px] text-white/40 mt-1">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button Mockup */}
            <div className="absolute bottom-6 right-6">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ icon: Icon, title, desc, active, onClick }: any) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-white/60">
                <Icon size={18} />
            </div>
            <div>
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="text-xs text-white/40">{desc}</div>
            </div>
        </div>
        <button 
            onClick={onClick}
            className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-green-500' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);
