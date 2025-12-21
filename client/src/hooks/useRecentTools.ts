import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'unitools_recent_tools';
const MAX_RECENT_TOOLS = 5;

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentTools(parsed.slice(0, MAX_RECENT_TOOLS));
        }
      }
    } catch (error) {
      console.error('Failed to load recent tools:', error);
    }
  }, []);

  const addRecentTool = useCallback((toolId: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      const updated = [toolId, ...filtered].slice(0, MAX_RECENT_TOOLS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent tools:', error);
      }
      return updated;
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent tools:', error);
    }
  }, []);

  return { recentTools, addRecentTool, clearRecentTools };
}
