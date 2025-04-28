import React from 'react';
import Square from './Square';

const Board = ({ board, onClick, winner, aiThinking }) => {
  // Determine if a square is part of the winning line
  const isWinningSquare = (index) => {
    return winner && winner.line && winner.line.includes(index);
  };

  // Render a square with the appropriate props
  const renderSquare = (index) => {
    return (
      <Square
        key={index}
        value={board[index]}
        onClick={() => onClick(index)}
        isWinning={isWinningSquare(index)}
        disabled={aiThinking || board[index] !== null}
      />
    );
  };

  // Create the 3x3 grid
  const renderBoard = () => {
    const rows = [];
    for (let row = 0; row < 3; row++) {
      const squares = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        squares.push(renderSquare(index));
      }
      rows.push(
        <div key={row} className="board-row">
          {squares}
        </div>
      );
    }
    return rows;
  };

  return <div className="game-board">{renderBoard()}</div>;
};

export default Board;