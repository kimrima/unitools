import { useState, useCallback } from 'react';

const STORAGE_KEY = 'unitools_feature_votes';

interface FeatureVotes {
  [toolId: string]: number;
}

export function useFeatureVote() {
  const [votedTools, setVotedTools] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user votes:', error);
    }
    return new Set();
  });

  const voteForFeature = useCallback((toolId: string) => {
    if (votedTools.has(toolId)) {
      return false;
    }

    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      const votes: FeatureVotes = storedVotes ? JSON.parse(storedVotes) : {};
      votes[toolId] = (votes[toolId] || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));

      const newVotedTools = new Set(votedTools);
      newVotedTools.add(toolId);
      setVotedTools(newVotedTools);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(Array.from(newVotedTools)));

      console.log(`[Feature Vote] Tool: ${toolId}, Total votes: ${votes[toolId]}`);
      return true;
    } catch (error) {
      console.error('Failed to save feature vote:', error);
      return false;
    }
  }, [votedTools]);

  const hasVoted = useCallback((toolId: string) => {
    return votedTools.has(toolId);
  }, [votedTools]);

  const getVoteCount = useCallback((toolId: string) => {
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      const votes: FeatureVotes = storedVotes ? JSON.parse(storedVotes) : {};
      return votes[toolId] || 0;
    } catch (error) {
      return 0;
    }
  }, []);

  return { voteForFeature, hasVoted, getVoteCount };
}
