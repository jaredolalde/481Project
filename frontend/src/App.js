import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ApiService from './services/apiService';
import Board from './components/Board';
import Controls from './components/Controls';
import Stats from './components/Stats';
import GameTreeViz from './components/GameTreeViz';
import { calculateWinner, convert2DTo1DBoard, indexToCoords, getGameStatus } from './utils/gameUtils';

/**
 * Main App component for TicTacMaster
 */
function App() {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [aiMode, setAiMode] = useState('human-ai'); // 'human-ai' or 'ai-ai'
  const [aiThinking, setAiThinking] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [stats, setStats] = useState({
    nodesExplored: 0,
    decisionTime: 0,
    useAlphaBeta: true
  });
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  // Handle AI move - using useCallback to memoize the function
  const handleAiMove = useCallback(async () => {
    if (gameOver) return;
    
    setAiThinking(true);
    setError(null);
    
    try {
      // Get the current player
      const player = isXNext ? 'X' : 'O';
      
      // Make the AI move
      const response = await ApiService.aiMakeMove(
        stats.useAlphaBeta,
        player
      );
      
      // Update game state
      const gameState = response.game_state;
      const moveStats = response.stats;
      
      // Store the decision tree data
      setTreeData(response.decision_tree);
      
      // Update the board state
      const newBoard = convert2DTo1DBoard(gameState.board);
      setBoard(newBoard);
      setIsXNext(gameState.current_player === 'X');
      
      // Check for winner using our frontend calculation
      const calculatedWinner = calculateWinner(newBoard);
      if (calculatedWinner) {
        setWinner(calculatedWinner);
        setGameOver(true);
      } else if (gameState.game_over) {
        // If backend says game is over but we didn't detect a winner, it's a draw
        setGameOver(true);
      } else {
        setGameOver(gameState.game_over);
      }
      
      // Update performance stats
      setStats(prevStats => ({
        ...prevStats,
        nodesExplored: moveStats.nodes_explored,
        decisionTime: moveStats.decision_time_ms
      }));
    } catch (err) {
      console.error('Failed to get AI move:', err);
      setError('Failed to get AI move. Please try again.');
    } finally {
      setAiThinking(false);
    }
  }, [gameOver, isXNext, stats.useAlphaBeta, setAiThinking, setError, setTreeData, setBoard, setIsXNext, setWinner, setGameOver, setStats]); // Add all dependencies

  // Reset the game - using useCallback to memoize the function
  const resetGame = useCallback(async () => {
    setAiThinking(true);
    setError(null);
    setTreeData(null);
    
    try {
      await ApiService.resetGame();
      
      // Get the fresh game state
      const response = await ApiService.getGameState();
      const gameState = response.game_state;
      
      setBoard(convert2DTo1DBoard(gameState.board));
      setIsXNext(gameState.current_player === 'X');
      setWinner(null);  // Reset winner explicitly
      setGameOver(gameState.game_over);
      setStats(prevStats => ({
        ...prevStats,
        nodesExplored: 0,
        decisionTime: 0
      }));
    } catch (err) {
      console.error('Failed to reset game:', err);
      setError('Failed to reset game. Please try again.');
    } finally {
      setAiThinking(false);
    }
  }, [setAiThinking, setError, setTreeData, setBoard, setIsXNext, setWinner, setGameOver, setStats]); // Add all dependencies

  // Initialize the game on component mount
  useEffect(() => {
    resetGame();
  }, [resetGame]); // Add resetGame as a dependency

  // Check for a winner after each move
  useEffect(() => {
    const calculatedWinner = calculateWinner(board);
    if (calculatedWinner) {
      setWinner(calculatedWinner);
      setGameOver(true);
    } else if (!board.includes(null)) {
      // Draw game
      setGameOver(true);
    }
  }, [board]);

  // AI move effect
  useEffect(() => {
    if (!isXNext && !gameOver && aiMode === 'human-ai') {
      handleAiMove();
    }
  }, [isXNext, gameOver, aiMode, handleAiMove]); // Add handleAiMove as a dependency

  // Toggle AI mode
  const toggleAiMode = useCallback(() => {
    resetGame();
    setAiMode(prevMode => prevMode === 'human-ai' ? 'ai-ai' : 'human-ai');
  }, [resetGame]);

  // Toggle Alpha-Beta pruning
  const toggleAlphaBeta = useCallback(() => {
    setStats(prevStats => ({ ...prevStats, useAlphaBeta: !prevStats.useAlphaBeta }));
    // Clear tree data when switching pruning mode
    setTreeData(null);
  }, []);

  // Toggle stats display
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Toggle tree visualization
  const toggleTree = useCallback(async () => {
    // If we're hiding the tree, just update the state
    if (showTree) {
      setShowTree(false);
      return;
    }
    
    // If we're showing the tree and don't have data, fetch it
    if (!treeData && !gameOver) {
      setAiThinking(true);
      try {
        const player = isXNext ? 'X' : 'O';
        const response = await ApiService.getDecisionTree(stats.useAlphaBeta, player);
        setTreeData(response.decision_tree);
        
        // Update stats with the tree generation stats
        setStats(prevStats => ({
          ...prevStats,
          nodesExplored: response.stats.nodes_explored,
          decisionTime: response.stats.decision_time_ms
        }));
      } catch (err) {
        console.error('Failed to get decision tree:', err);
        setError('Failed to generate decision tree. Please try again.');
      } finally {
        setAiThinking(false);
      }
    }
    
    setShowTree(true);
  }, [showTree, treeData, gameOver, isXNext, stats.useAlphaBeta, setAiThinking, setTreeData, setStats, setError]);

  // Handle a human player's move
  const handleClick = useCallback(async (index) => {
    // Don't allow moves if the game is over or the cell is already filled
    if (gameOver || board[index] || aiThinking) return;

    // In Human vs AI mode, only allow the human to make moves when it's X's turn
    if (aiMode === 'human-ai' && !isXNext) return;

    setAiThinking(true);
    setError(null);
    
    try {
      const { row, col } = indexToCoords(index);
      const response = await ApiService.makeMove(row, col);
      const gameState = response.game_state;
      
      // Update the board state
      const newBoard = convert2DTo1DBoard(gameState.board);
      setBoard(newBoard);
      setIsXNext(gameState.current_player === 'X');
      
      // Check for winner using our frontend calculation
      // This ensures the winner object has the expected format
      const calculatedWinner = calculateWinner(newBoard);
      if (calculatedWinner) {
        setWinner(calculatedWinner);
        setGameOver(true);
      } else if (gameState.game_over) {
        // If backend says game is over but we didn't detect a winner, it's a draw
        setGameOver(true);
      } else {
        setGameOver(gameState.game_over);
      }
      
      // Clear tree data after a move
      setTreeData(null);
    } catch (err) {
      console.error('Failed to make move:', err);
      setError('Failed to make move. Please try again.');
    } finally {
      setAiThinking(false);
    }
  }, [gameOver, board, aiThinking, aiMode, isXNext]);

  return (
    <div className="app">
      <h1>TicTacMaster</h1>
      <h2>A Minimax-Based AI for Tic-Tac-Toe</h2>
      
      <div className="game">
        <Board 
          board={board}
          onClick={handleClick}
          winner={winner}
          aiThinking={aiThinking}
        />
        
        <div className="game-info">
          <div className="status">
            {getGameStatus(winner, gameOver, aiThinking, isXNext)}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <Controls 
            resetGame={resetGame}
            toggleAiMode={toggleAiMode}
            toggleAlphaBeta={toggleAlphaBeta}
            toggleStats={toggleStats}
            handleAiMove={handleAiMove}
            aiMode={aiMode}
            showStats={showStats}
            useAlphaBeta={stats.useAlphaBeta}
            aiThinking={aiThinking}
            gameOver={gameOver}
          />
          
          <div className="visualization-controls">
            <button 
              onClick={toggleTree} 
              disabled={aiThinking || (gameOver && !treeData)}
              className="viz-button"
            >
              {showTree ? 'Hide Decision Tree' : 'Show Decision Tree'}
            </button>
          </div>
          
          {showStats && (
            <Stats 
              nodesExplored={stats.nodesExplored}
              decisionTime={stats.decisionTime}
              useAlphaBeta={stats.useAlphaBeta}
            />
          )}
        </div>
      </div>
      
      {showTree && treeData && (
        <GameTreeViz 
          treeData={treeData} 
          useAlphaBeta={stats.useAlphaBeta} 
        />
      )}
    </div>
  );
}

export default App;