import React from 'react';

interface DarkModeToggleProps {
  toggle: () => void;
  isDark: boolean;
}

export default function DarkModeToggle({ toggle, isDark }: DarkModeToggleProps) {
  return (
    <button
      onClick={toggle}
      aria-label="Alternar modo escuro"
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-900 dark:text-gray-100">
          <path d="M12 2a9.931 9.931 0 0 0-7.071 2.929A9.931 9.931 0 0 0 2 12c0 2.761 1.067 5.263 2.929 7.071A9.931 9.931 0 0 0 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-900 dark:text-gray-100">
          <path d="M12 4.354a7.646 7.646 0 1 0 0 15.292 7.646 7.646 0 0 0 0-15.292zM12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" />
        </svg>
      )}
    </button>
  );
}
