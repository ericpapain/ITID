import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ContentNavigatorProps {
  items: any[];
  placeholder: string;
  onSelect: (item: any, index: number) => void;
  theme?: 'light' | 'dark';
}

export function ContentNavigator({ items, placeholder, onSelect, theme = 'dark' }: ContentNavigatorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const showSearch = items.length >= 10;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const itemElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (itemElement) {
        itemElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleSelect = (selectedItem: any) => {
    const originalIndex = items.findIndex(t => t.title === selectedItem.title);
    onSelect(selectedItem, originalIndex);
    setIsOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative w-full max-w-md mx-auto z-40" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 ${
          isDark 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/80 border-[#1a3a5c]/20 text-[#1a3a5c] hover:bg-white focus:ring-2 focus:ring-[#2a9d8f]/50'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-lg">{placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={24} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-3 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl ${
              isDark ? 'bg-[#0a1628]/95 border-white/20' : 'bg-white/95 border-[#1a3a5c]/20'
            }`}
          >
            {showSearch && (
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    autoFocus
                    placeholder={t('common.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-[#48cae4] focus:ring-[#48cae4]/30' 
                        : 'bg-gray-100 border-transparent text-[#1a3a5c] placeholder-gray-500 focus:bg-white focus:border-[#2a9d8f] focus:ring-[#2a9d8f]/20'
                    }`}
                  />
                </div>
              </div>
            )}

            <ul 
              ref={listRef}
              className="max-h-72 overflow-y-auto py-2 px-2 scrollbar-thin"
              role="listbox"
            >
              {filteredItems.length === 0 ? (
                <li className={`px-4 py-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('common.noResult')}
                </li>
              ) : (
                filteredItems.map((item, index) => (
                  <li
                    key={item.title}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-3 cursor-pointer rounded-xl transition-colors flex items-center gap-3 ${
                      highlightedIndex === index 
                        ? (isDark ? 'bg-white/10 text-[#48cae4]' : 'bg-[#1a3a5c]/5 text-[#2a9d8f]')
                        : (isDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100')
                    }`}
                  >
                    {item.icon && <span className="text-xl opacity-70">{item.icon}</span>}
                    <span className="font-medium text-[15px]">{item.title}</span>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
