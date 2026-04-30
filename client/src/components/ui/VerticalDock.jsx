import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

function DockItem({
  children,
  className = '',
  onClick,
  mouseY,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseY, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      y: 0,
      height: baseItemSize
    };
    return val - rect.y - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl border shadow-sm cursor-pointer transition-colors ${
        isActive ? 'bg-dark text-white border-dark' : 'bg-white text-muted border-border hover:bg-off hover:text-dark'
      } ${className}`}
      tabIndex={0}
      role="button"
    >
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child, { isHovered })
          : child
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = '', isHovered }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className={`absolute left-full top-1/2 -translate-y-1/2 ml-5 w-fit whitespace-nowrap rounded-md bg-dark px-3 py-1.5 text-xs font-bold text-white shadow-lg z-[100] ${className}`}
          role="tooltip"
        >
          {/* pointer triangle */}
          <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-dark" />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function VerticalDock({
  items,
  activeId,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 64,
  distance = 150,
  panelWidth = 72,
  baseItemSize = 48
}) {
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxWidth = useMemo(() => Math.max(panelWidth, magnification + 20), [magnification, panelWidth]);
  const widthCol = useTransform(isHovered, [0, 1], [panelWidth, maxWidth]);
  const width = useSpring(widthCol, spring);

  return (
    <motion.div 
      style={{ width, scrollbarWidth: 'none' }} 
      className={`flex flex-col items-center ${className}`}
    >
      <motion.div
        onMouseMove={({ pageY }) => {
          isHovered.set(1);
          mouseY.set(pageY);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseY.set(Infinity);
        }}
        className="flex flex-col items-center gap-4 rounded-full border border-border bg-white py-6 px-2 shadow-sm"
        style={{ width: width }}
        role="toolbar"
        aria-label="Admin navigation dock"
      >
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <DockItem
              key={item.id || index}
              onClick={item.onClick}
              className={item.className}
              mouseY={mouseY}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              isActive={activeId === item.id}
            >
              <DockIcon>
                <IconComponent className="w-5 h-5" />
              </DockIcon>
              <DockLabel>
                <div>
                  <p>{item.label}</p>
                  {item.desc && <p className="text-[10px] text-white/70 font-medium">{item.desc}</p>}
                </div>
              </DockLabel>
            </DockItem>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
