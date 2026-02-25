import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
}

const Skeleton = ({ className = '', variant = 'rect', width, height }: SkeletonProps) => {
    const baseClasses = "bg-gray-200 animate-pulse relative overflow-hidden";

    const variantClasses = {
        text: "h-3 w-full rounded",
        rect: "rounded-lg",
        circle: "rounded-full"
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
    );
};

export default Skeleton;
