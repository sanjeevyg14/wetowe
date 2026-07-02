import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Map, Tent, Mountain, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Launch: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white relative overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-brand-sage selection:text-white">
            <SEO title="Exclusive Launch | Wheels to Wilderness" description="Private access to our next big adventure." url="/launch" />

            {/* Background Layer with Parallax */}
            <motion.div 
                className="absolute inset-0 z-0 opacity-40"
                animate={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -2
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
                <img src="https://picsum.photos/id/1036/1920/1080" alt="Background" className="w-full h-full object-cover scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-black/30 via-brand-black/80 to-brand-black"></div>
            </motion.div>

            {/* Floating Elements (Background Decor) */}
            <motion.div 
                className="absolute top-1/4 left-[15%] text-brand-sage opacity-30 blur-[2px]" 
                animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Mountain size={80} />
            </motion.div>
            <motion.div 
                className="absolute bottom-1/4 right-[15%] text-brand-sage/20 blur-[1px]" 
                animate={{ y: [0, 40, 0], rotate: [0, -15, 15, 0] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <Compass size={120} />
            </motion.div>

            {/* Content Layer */}
            <motion.div 
                className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl">
                    <Lock size={14} className="text-brand-sage" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-300 mt-[2px]">Private Access</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black font-serif mb-6 leading-tight tracking-tight drop-shadow-2xl">
                    THE WILD <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-[#a8c3a7] to-white">
                        AWAITS
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 mb-14 max-w-2xl leading-relaxed font-light drop-shadow-md">
                    Something extraordinary is on the horizon. A new way to experience the world, built exclusively for true explorers.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center relative">
                    {/* Glowing effect behind button */}
                    <div className="absolute inset-0 bg-brand-sage/30 blur-3xl rounded-full scale-110"></div>
                    
                    <Link to="/" className="relative z-10 group flex items-center justify-center gap-3 w-full bg-brand-sage text-white font-bold px-8 py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-[#628061] shadow-[0_0_40px_rgba(115,144,114,0.3)] hover:shadow-[0_0_60px_rgba(115,144,114,0.6)]">
                        <span className="relative z-10 uppercase tracking-[0.2em] text-sm mt-[2px]">Enter the Portal</span>
                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                        
                        {/* Sweeping glow hover effect */}
                        <div className="absolute inset-0 bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-50">
                    {[
                        { icon: Map, label: "Uncharted" },
                        { icon: Tent, label: "Immersive" },
                        { icon: Compass, label: "Curated" },
                        { icon: Mountain, label: "Limitless" }
                    ].map((feature, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
                            <feature.icon size={26} className="text-brand-sage" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">{feature.label}</span>
                        </div>
                    ))}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Launch;
