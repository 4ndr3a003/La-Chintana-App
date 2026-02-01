import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    Calendar,
    Users,
    Truck,
    Plus,
    Menu,
    Settings,
    LogOut
} from 'lucide-react';

const AppLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Bacheca', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Eventi', href: '/events', icon: Calendar },
        { name: 'Volontari', href: '/volunteers', icon: Users },
        { name: 'Logistica', href: '/logistics', icon: Truck },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-surface w-full">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Navigation Rail / Drawer */}
            <aside
                className={`
          fixed md:static inset-y-0 left-0 z-50
          w-20 md:w-24 lg:w-28
          flex flex-col items-center py-6
          bg-surface-container border-r border-slate-200
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="mb-6 flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary font-bold text-xl">
                        LC
                    </div>
                </div>

                {/* FAB - Primary Action */}
                <button
                    onClick={() => console.log('New Event')} // Placeholder
                    className="mb-8 w-12 h-12 md:w-14 md:h-14 bg-secondary-container text-on-secondary-container rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center group"
                    title="Nuovo Evento"
                >
                    <Plus className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:rotate-90" />
                </button>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-3 w-full px-2">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                  relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all w-full
                  ${active ? 'text-on-secondary-container' : 'text-slate-600 hover:text-slate-900'}
                `}
                            >
                                {/* Active Indicator */}
                                {active && (
                                    <div className="absolute inset-x-0 top-0 bottom-0 bg-secondary-container rounded-xl -z-10 animate-in fade-in zoom-in duration-200" />
                                )}

                                <item.icon className="w-6 h-6 mb-1 z-0 relative" strokeWidth={active ? 2.5 : 2} />
                                <span className={`text-[10px] font-medium truncate w-full text-center z-0 relative ${active ? 'font-bold' : ''}`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Avatar / Profile */}
                <div className="mt-auto pt-4 flex flex-col items-center gap-4">
                    <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface shadow-sm hover:ring-2 hover:ring-primary transition-all">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                {/* Mobile Header */}
                <header className="md:hidden h-16 px-4 flex items-center justify-between bg-surface-container border-b border-slate-200 flex-shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-slate-800">La Chintana Fenix</span>
                    <div className="w-8" /> {/* Spacer for balance */}
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
