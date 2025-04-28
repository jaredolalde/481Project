/**
 * Utility functions for the Tic-Tac-Toe game
 */

/**
 * Convert 1D index to 2D coordinates
 * @param {number} index - The 1D array index (0-8)
 * @returns {Object} An object with row and col properties
 */
export const indexToCoords = (index) => {
  return {
    row: Math.floor(index / 3),
    col: index % 3
  };
};

/**
 * Convert 2D coordinates to 1D index
 * @param {number} row - The row index (0-2)
 * @param {number} col - The column index (0-2)
 * @returns {number} The 1D array index
 */
export const coordsToIndex = (row, col) => {
  return row * 3 + col;
};

/**
 * Convert the backend 2D board to our 1D board
 * @param {Array} board2D - 2D array representing the board
 * @returns {Array} 1D array representation of the board
 */
export const convert2DTo1DBoard = (board2D) => {
  const board1D = Array(9).fill(null);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      board1D[coordsToIndex(row, col)] = board2D[row][col];
    }
  }
  return board1D;
};

/**
 * Convert the frontend 1D board to the backend 2D board
 * @param {Array} board1D - 1D array representing the board
 * @returns {Array} 2D array representation of the board
 */
export const convert1DTo2DBoard = (board1D) => {
  const board2D = Array(3).fill().map(() => Array(3).fill(null));
  for (let index = 0; index < 9; index++) {
    const { row, col } = indexToCoords(index);
    board2D[row][col] = board1D[index];
  }
  return board2D;
};

/**
 * @param {Array} squares - 1D array representing the board
 * @returns {Object|null} Winner object with player and line properties, or null if no winner
 */
export const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: lines[i] };
    }
  }
  
  return null;
};

/**
 * Check if the game is a draw
 * @param {Array} squares - 1D array representing the board
 * @returns {boolean} True if the game is a draw, false otherwise
 */
export const isDraw = (squares) => {
  return !calculateWinner(squares) && !squares.includes(null);
};

/**
 * Generate a game status message
 * @param {Object|null} winner - Winner object or null
 * @param {boolean} gameOver - Whether the game is over
 * @param {boolean} aiThinking - Whether the AI is thinking
 * @param {boolean} isXNext - Whether X is the next player
 * @returns {string} Status message
 */
export const getGameStatus = (winner, gameOver, aiThinking, isXNext) => {
  if (winner && winner.player) {
    return `Winner: ${winner.player}`;
  } else if (gameOver) {
    return 'Game ended in a draw';
  } else if (aiThinking) {
    return 'AI is thinking...';
  } else {
    return `Next player: ${isXNext ? 'X' : 'O'}`;
  }
};