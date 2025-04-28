import React from 'react';

/**
 * Component to display performance statistics
 */
const Stats = ({ nodesExplored, decisionTime, useAlphaBeta }) => {
  // Ensure nodesExplored is always a positive number
  const displayNodes = Math.max(0, nodesExplored || 0);
  
  return (
    <div className="stats">
      <h3>Performance Stats</h3>
      <p>Nodes Explored: {displayNodes}</p>
      <p>Decision Time: {decisionTime.toFixed(2)} ms</p>
      <p>Algorithm: Minimax {useAlphaBeta ? 'with Alpha-Beta Pruning' : 'without pruning'}</p>
    </div>
  );
};

export default Stats;