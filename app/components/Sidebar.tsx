import { useState } from 'react';

interface Tab {
    id: string;
    label: string;
}

interface SidebarProps {
    tabs: Tab[];
    onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tabs, onTabChange }) => {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onTabChange(tabId);
    };

    return (
        <div className="w-fit h-screen bg-gray-800 text-white flex flex-col items-center p-2">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={`p-2 cursor-pointer ${activeTab === tab.id ? 'bg-gray-600' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                >
                    {tab.label}
                </div>
            ))}
        </div>
    );
};
