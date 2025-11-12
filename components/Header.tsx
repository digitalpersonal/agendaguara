import React, { useState } from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLoginClick: () => void;
    onSignUpClick: () => void;
    onLogout: () => void;
}

const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-rose-500">
        <path d="M8 2v4"></path>
        <path d="M16 2v4"></path>
        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
        <path d="M3 10h18"></path>
        <path d="m9 16 2 2 4-4"></path>
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onSignUpClick, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navLinks = [
        { name: "Home", href: "#hero-section" },
        { name: "Serviços", href: "#services-section" },
        { name: "Profissionais", href: "#professionals" },
        { name: "Contato", href: "#footer" }
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false); // Close mobile menu on click
    };

    // Handlers to also close mobile menu on action
    const handleLogoutClick = () => {
        onLogout();
        setIsMenuOpen(false);
    }
    
    const handleLoginClick = () => {
        onLoginClick();
        setIsMenuOpen(false);
    }
    
    const handleSignUpClick = () => {
        onSignUpClick();
        setIsMenuOpen(false);
    }


    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <LogoIcon />
                        <h1 className="text-2xl font-bold text-stone-800">AgendaGuara</h1>
                    </div>
                    
                    {/* Desktop nav: only show when not logged in */}
                    {!user && (
                        <nav className="hidden md:flex items-center space-x-8">
                            {navLinks.map(link => (
                                <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-stone-600 hover:text-rose-500 transition-colors duration-300 cursor-pointer">{link.name}</a>
                            ))}
                        </nav>
                    )}
                    
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                             <div className="flex items-center space-x-4">
                                <span className="font-semibold text-stone-700">Olá, {user.name.split(' ')[0]}</span>
                                <button onClick={onLogout} className="text-stone-600 hover:text-rose-500 transition-colors duration-300">Sair</button>
                            </div>
                        ) : (
                            <>
                                <button onClick={onLoginClick} className="text-stone-600 hover:text-rose-500 transition-colors duration-300">Login</button>
                                <button onClick={onSignUpClick} className="bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-transform duration-300 hover:scale-105">Cadastre-se</button>
                            </>
                        )}
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-600 focus:outline-none flex items-center space-x-1">
                            <span className="font-medium">Menu</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4">
                        <nav className="flex flex-col space-y-4">
                            {/* Mobile nav links: only show when not logged in */}
                             {!user && navLinks.map(link => (
                                <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-stone-600 hover:text-rose-500 transition-colors duration-300 cursor-pointer">{link.name}</a>
                            ))}
                            <div className={`flex flex-col space-y-2 pt-4 ${!user ? 'border-t' : ''}`}>
                                {user ? (
                                    <>
                                        <span className="font-semibold text-stone-700 text-left px-1">Olá, {user.name.split(' ')[0]}</span>
                                        <button onClick={handleLogoutClick} className="text-left text-stone-600 hover:text-rose-500 transition-colors duration-300 px-1">Sair</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleLoginClick} className="text-left text-stone-600 hover:text-rose-500 transition-colors duration-300">Login</button>
                                        <button onClick={handleSignUpClick} className="w-full bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-all duration-300">Cadastre-se</button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};