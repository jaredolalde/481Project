import React from 'react';

const Controls = ({
  resetGame,
  toggleAiMode,
  toggleAlphaBeta,
  toggleStats,
  handleAiMove,
  aiMode,
  showStats,
  useAlphaBeta,
  aiThinking,
  gameOver
}) => {
  return (
    <div className="controls">
      <button onClick={resetGame} disabled={aiThinking}>
        Reset Game
      </button>
      
      <button onClick={toggleAiMode} disabled={aiThinking}>
        {aiMode === 'human-ai' ? 'Switch to AI vs AI' : 'Switch to Human vs AI'}
      </button>
      
      {aiMode === 'ai-ai' && !gameOver && (
        <button onClick={handleAiMove} disabled={aiThinking}>
          Make AI Move
        </button>
      )}
      
      <button onClick={toggleStats} disabled={aiThinking}>
        {showStats ? 'Hide Stats' : 'Show Stats'}
      </button>
      
      <label>
        <input 
          type="checkbox" 
          checked={useAlphaBeta} 
          onChange={toggleAlphaBeta} 
          disabled={aiThinking}
        />
        Use Alpha-Beta Pruning
      </label>
    </div>
  );
};

export default Controls;