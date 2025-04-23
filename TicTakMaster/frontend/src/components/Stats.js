import React from 'react';

const Stats = ({ nodesExplored, decisionTime, useAlphaBeta }) => {
  return (
    <div className="stats">
      <h3>Performance Stats</h3>
      <p>Nodes Explored: {nodesExplored}</p>
      <p>Decision Time: {decisionTime.toFixed(2)} ms</p>
      <p>Algorithm: Minimax {useAlphaBeta ? 'with Alpha-Beta Pruning' : 'without pruning'}</p>
    </div>
  );
};

export default Stats;