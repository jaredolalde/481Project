import React, { useEffect, useRef, useState } from 'react';
import './GameTreeViz.css';

/**
 * Enhanced Game Tree Visualization Component with cleaner display
 * - Scores only shown on hover
 * - Improved visualization of selected paths
 */
const GameTreeViz = ({ treeData, useAlphaBeta }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [maxDepth, setMaxDepth] = useState(3); // Default depth limit
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  
  // Set canvas dimensions and handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const containerWidth = document.querySelector('.tree-container')?.clientWidth || 800;
      setDimensions({
        width: containerWidth,
        height: 500
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Process tree data and calculate positions
  useEffect(() => {
    if (!treeData || !treeData.root) return;
    
    // Calculate positions
    const positions = [];
    const root = treeData.root;
    
    const processNode = (node, x, y, width, depth, index = 0, parentIndex = -1, pathIndices = []) => {
      if (!node) return;
      
      // Store node information
      const nodeIndex = positions.length;
      const nodeInfo = {
        x,
        y,
        radius: node.isBestMove ? 30 : 25,
        depth,
        node,
        index: nodeIndex,
        parentIndex,
        pathIndices: [...pathIndices, nodeIndex]
      };
      
      positions.push(nodeInfo);
      
      if (!node.children || node.children.length === 0 || depth >= maxDepth) return;
      
      // Calculate positions for children
      const childWidth = width / node.children.length;
      let startX = x - (width / 2) + (childWidth / 2);
      
      node.children.forEach((child, i) => {
        processNode(
          child,
          startX + (i * childWidth),
          y + 150, 
          childWidth,
          depth + 1,
          i,
          nodeIndex,
          nodeInfo.pathIndices
        );
      });
    };
    
    // Start processing from root
    processNode(root, dimensions.width / 2, 70, dimensions.width * 0.8, 0);
    
    // Store calculated positions
    setNodePositions(positions);
    
    // Find best move path
    const bestPath = [];
    let currentNode = positions.find(n => n.parentIndex === -1); // Root
    if (currentNode) bestPath.push(currentNode.index);
    
    while (currentNode) {
      // Find best move child
      const childNodes = positions.filter(n => n.parentIndex === currentNode.index);
      const bestChild = childNodes.find(n => n.node.isBestMove);
      
      if (bestChild) {
        bestPath.push(bestChild.index);
        currentNode = bestChild;
      } else {
        break;
      }
    }
    
    // Set best path as selected by default
    setSelectedPath(bestPath);
    
  }, [treeData, maxDepth, dimensions.width]);
  
  // Update selected path when a node is selected
  useEffect(() => {
    if (selectedNode !== null) {
      const nodeInfo = nodePositions[selectedNode];
      if (nodeInfo) {
        setSelectedPath(nodeInfo.pathIndices);
      }
    }
  }, [selectedNode, nodePositions]);
  
  // Main draw function for canvas
  const drawTree = () => {
    if (!canvasRef.current || nodePositions.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas resolution for sharpness
    canvas.width = dimensions.width * 2;
    canvas.height = dimensions.height * 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    
    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Sort nodes by whether they're in the selected path (to draw last)
    const sortedNodeIndices = nodePositions.map((_, index) => index)
      .sort((a, b) => {
        const aInPath = selectedPath.includes(a);
        const bInPath = selectedPath.includes(b);
        if (aInPath && !bInPath) return 1; // Draw selected path nodes last
        if (!aInPath && bInPath) return -1;
        return 0;
      });
    
    // First draw non-selected connections
    drawConnections(ctx, sortedNodeIndices, false);
    
    // Then draw non-selected nodes
    drawNodes(ctx, sortedNodeIndices, false);
    
    // Draw selected path connections (on top)
    drawConnections(ctx, sortedNodeIndices, true);
    
    // Draw selected path nodes (on top)
    drawNodes(ctx, sortedNodeIndices, true);
    
    // Draw hover effects on top of everything
    if (hoveredNode !== null && nodePositions[hoveredNode]) {
      drawHoverEffect(ctx, nodePositions[hoveredNode]);
    }
    
    // Draw selection effects
    if (selectedNode !== null && nodePositions[selectedNode]) {
      drawSelectionEffect(ctx, nodePositions[selectedNode]);
    }
    
    ctx.restore();
    
    // Request next animation frame for hover pulse effect
    animationRef.current = requestAnimationFrame(drawTree);
  };
  
  // Start/stop animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawTree);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodePositions, hoveredNode, selectedNode, zoom, pan, dimensions, selectedPath, redrawTrigger]);
  
  // Force a redraw every 100ms when a node is hovered for animations
  useEffect(() => {
    let interval;
    if (hoveredNode !== null) {
      interval = setInterval(() => {
        setRedrawTrigger(prev => prev + 1);
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hoveredNode]);
  
  // Draw connections between nodes
  const drawConnections = (ctx, sortedIndices, isSelectedPath) => {
    // Draw parent-child connections
    sortedIndices.forEach(index => {
      const nodeInfo = nodePositions[index];
      
      // Skip if not part of selected path (when drawing selected) or vice versa
      const isInSelectedPath = selectedPath.includes(nodeInfo.index);
      if (isSelectedPath !== isInSelectedPath) return;
      
      if (nodeInfo.parentIndex === -1) return; // Skip root node
      
      const parent = nodePositions[nodeInfo.parentIndex];
      const node = nodeInfo.node;
      
      // Skip pruned branches if Alpha-Beta is enabled and they're pruned
      if (useAlphaBeta && node.pruned) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.setLineDash([5, 3]);
      } else {
        // Color connections based on score and path
        if (isInSelectedPath) {
          ctx.strokeStyle = '#4caf50'; // Green for selected path
        } else {
          const score = node.score || 0;
          if (score > 0) {
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)'; // Light green for positive scores
          } else if (score < 0) {
            ctx.strokeStyle = 'rgba(244, 67, 54, 0.6)'; // Light red for negative scores
          } else {
            ctx.strokeStyle = 'rgba(158, 158, 158, 0.5)'; // Light gray for zero scores
          }
        }
        ctx.setLineDash([]);
      }
      
      // Selected path gets thicker lines
      ctx.lineWidth = isInSelectedPath ? 4 : 1.5;
      
      // Draw the connection
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(nodeInfo.x, nodeInfo.y);
      ctx.stroke();
    });
    
    // Reset line style
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
  };
  
  // Draw all nodes
  const drawNodes = (ctx, sortedIndices, isSelectedPath) => {
    sortedIndices.forEach(index => {
      const nodeInfo = nodePositions[index];
      const { x, y, radius, node, depth } = nodeInfo;
      
      // Skip if not part of selected path (when drawing selected) or vice versa
      const isInSelectedPath = selectedPath.includes(nodeInfo.index);
      if (isSelectedPath !== isInSelectedPath) return;
      
      // Determine if this node is hovered or selected
      const isHovered = hoveredNode === index;
      const isSelected = selectedNode === index;
      
      // Base scale factor for the node
      let scaleFactor = isInSelectedPath ? 1.05 : 1;
      
      // Increase radius for node
      const effectiveRadius = radius * scaleFactor;
      
      // Node background color based on player
      ctx.fillStyle = node.isMaximizing ? '#2196f3' : '#ff9800'; // Blue for X, Orange for O
      
      // Highlight the best move
      if (node.isBestMove) {
        ctx.fillStyle = '#4caf50'; // Green for best move
      }
      
      // Adjust opacity based on path and state
      if (node.pruned) {
        ctx.globalAlpha = 0.5;
      } else if (isInSelectedPath) {
        ctx.globalAlpha = 0.9;
      } else {
        ctx.globalAlpha = 0.75;
      }
      
      // Draw node circle 
      ctx.save();
      
      // Add shadow for selected path
      if (isInSelectedPath) {
        ctx.shadowColor = '#4caf50';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw node border
      ctx.strokeStyle = isInSelectedPath ? '#4caf50' : '#333';
      ctx.lineWidth = isInSelectedPath ? 2.5 : 2;
      ctx.stroke();
      ctx.restore();
      
      // Draw board state in the node
      drawBoardInNode(ctx, node, x, y, effectiveRadius);
      
      // Only draw score for the top 2 levels or for nodes in the selected path
      if (depth < 2 || isInSelectedPath || isHovered || isSelected) {
        ctx.fillStyle = '#000';
        ctx.font = isInSelectedPath ? 'bold 16px Arial' : '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Score: ${node.score !== undefined && node.score !== null ? node.score : '?'}`,
          x,
          y + effectiveRadius + 20
        );
      }
      
      // Reset alpha
      ctx.globalAlpha = 1.0;
    });
  };
  
  // Draw hover effect for a node
  const drawHoverEffect = (ctx, nodeInfo) => {
    if (!nodeInfo) return;
    
    const { x, y, radius } = nodeInfo;
    
    // Create pulsating effect
    const date = new Date();
    const pulseSize = Math.sin(date.getTime() * 0.005) * 5 + 10;
    
    ctx.save();
    // Outer glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius + pulseSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner highlight
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw the enlarged node
    ctx.fillStyle = nodeInfo.node.isMaximizing ? '#2196f3' : '#ff9800';
    if (nodeInfo.node.isBestMove) {
      ctx.fillStyle = '#4caf50';
    }
    
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Redraw the board inside the node
    drawBoardInNode(ctx, nodeInfo.node, x, y, radius * 1.15);
    
    // Show hover tooltip with node info
    drawNodeDetails(ctx, nodeInfo);
    
    ctx.restore();
  };
  
  // Draw selection effect for a node
  const drawSelectionEffect = (ctx, nodeInfo) => {
    if (!nodeInfo) return;
    
    const { x, y, radius } = nodeInfo;
    
    ctx.save();
    // Highlight ring
    ctx.strokeStyle = '#4285f4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw detailed information
    drawNodeDetails(ctx, nodeInfo);
    
    ctx.restore();
  };
  
  // Draw a mini board inside a node
  const drawBoardInNode = (ctx, node, x, y, radius) => {
    if (!node.board) return;
    
    const gridSize = radius * 1.6;
    const cellSize = gridSize / 3;
    const startX = x - gridSize / 2;
    const startY = y - gridSize / 2;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, startY, gridSize, gridSize);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Draw horizontal lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + gridSize, startY + i * cellSize);
      ctx.stroke();
    }
    
    // Draw vertical lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + gridSize);
      ctx.stroke();
    }
    
    // Draw X's and O's
    ctx.font = `bold ${cellSize * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cellValue = node.board[row][col];
        if (cellValue) {
          const cellX = startX + col * cellSize + cellSize / 2;
          const cellY = startY + row * cellSize + cellSize / 2;
          
          if (cellValue === 'X') {
            ctx.fillStyle = '#2196f3'; // Blue for X
          } else {
            ctx.fillStyle = '#ff9800'; // Orange for O
          }
          
          ctx.fillText(cellValue, cellX, cellY);
        }
      }
    }
  };
  
  // Draw detailed information for selected node
  const drawNodeDetails = (ctx, nodeInfo) => {
    const { x, y, radius, node } = nodeInfo;
    
    // Only show details if we have a node with details to show
    if (!node) return;
    
    // Get the move that led to this state
    const moveText = node.move ? `Move: (${node.move[0]},${node.move[1]})` : 'Root';
    
    // Create info box
    const infoWidth = 180;
    const infoHeight = 90;
    const infoX = x + radius + 20;
    const infoY = y - infoHeight / 2;
    
    // If off screen, reposition
    const rightEdge = infoX + infoWidth;
    if (rightEdge > dimensions.width / zoom - pan.x) {
      // Place on left side instead
      const newInfoX = x - radius - 20 - infoWidth;
      // If still off screen, center it
      if (newInfoX < 0) {
        // Center under the node
        const centerX = x - infoWidth / 2;
        const centerY = y + radius + 30;
        drawInfoBox(ctx, centerX, centerY, infoWidth, infoHeight, node, moveText);
      } else {
        drawInfoBox(ctx, newInfoX, infoY, infoWidth, infoHeight, node, moveText);
      }
    } else {
      drawInfoBox(ctx, infoX, infoY, infoWidth, infoHeight, node, moveText);
    }
  };
  
  // Draw info box with node details
  const drawInfoBox = (ctx, x, y, width, height, node, moveText) => {
    // Draw background with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(1, 'rgba(245, 245, 245, 0.95)');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Draw rounded rectangle with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    const radius = 8;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    
    // Add a header
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + 25);
    ctx.lineTo(x, y + 25);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    // Draw header text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Node Details', x + width / 2, y + 16);
    
    // Draw content
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(moveText, x + 10, y + 45);
    ctx.fillText(`Player: ${node.isMaximizing ? 'Maximizing (X)' : 'Minimizing (O)'}`, x + 10, y + 65);
    ctx.fillText(`Score: ${node.score !== null ? node.score : 'Not evaluated'}`, x + 10, y + 85);
  };
  
  // Handle mouse interactions - This is the key function to fix hover issues
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || nodePositions.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse coordinates transformed by zoom and pan
    const mouseX = (e.clientX - rect.left) / zoom - pan.x;
    const mouseY = (e.clientY - rect.top) / zoom - pan.y;
    
    // Check if mouse is over any node - check all nodes
    let found = false;
    
    // First check the selected path nodes (higher priority)
    for (let i = 0; i < selectedPath.length; i++) {
      const nodeIndex = selectedPath[i];
      const nodeInfo = nodePositions[nodeIndex];
      
      if (!nodeInfo) continue;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - nodeInfo.x, 2) + 
        Math.pow(mouseY - nodeInfo.y, 2)
      );
      
      // Use a slightly larger hit area for easier hovering
      if (distance <= nodeInfo.radius + 8) {
        if (hoveredNode !== nodeIndex) {
          setHoveredNode(nodeIndex);
        }
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    
    // If not found in the selected path, check all other nodes
    if (!found) {
      for (let i = 0; i < nodePositions.length; i++) {
        // Skip if already checked in selected path
        if (selectedPath.includes(i)) continue;
        
        const nodeInfo = nodePositions[i];
        const distance = Math.sqrt(
          Math.pow(mouseX - nodeInfo.x, 2) + 
          Math.pow(mouseY - nodeInfo.y, 2)
        );
        
        if (distance <= nodeInfo.radius + 5) {
          if (hoveredNode !== i) {
            setHoveredNode(i);
          }
          canvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
    }
    
    // If mouse is not over any node, clear hover state
    if (!found && hoveredNode !== null) {
      setHoveredNode(null);
      canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
    
    // Handle dragging
    if (isDragging) {
      const deltaX = e.clientX - lastPosition.x;
      const deltaY = e.clientY - lastPosition.y;
      
      setPan(prevPan => ({
        x: prevPan.x + deltaX / zoom,
        y: prevPan.y + deltaY / zoom
      }));
      
      setLastPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle mouse click
  const handleCanvasClick = (e) => {
    // If dragging, don't register a click
    if (Math.abs(e.clientX - startDragPosition.x) > 5 || 
        Math.abs(e.clientY - startDragPosition.y) > 5) {
      return;
    }
    
    // Check if clicked on a node
    if (hoveredNode !== null) {
      setSelectedNode(selectedNode === hoveredNode ? null : hoveredNode);
    } else {
      // Clear selection when clicking empty space
      setSelectedNode(null);
      
      // Reset path to best move path
      const bestPath = [];
      let currentNode = nodePositions.find(n => n.parentIndex === -1); // Root
      if (currentNode) bestPath.push(currentNode.index);
      
      while (currentNode) {
        // Find best move child
        const childNodes = nodePositions.filter(n => n.parentIndex === currentNode.index);
        const bestChild = childNodes.find(n => n.node.isBestMove);
        
        if (bestChild) {
          bestPath.push(bestChild.index);
          currentNode = bestChild;
        } else {
          break;
        }
      }
      
      setSelectedPath(bestPath);
    }
  };
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  
  // Mouse event handlers for panning
  const handleMouseDown = (e) => {
    // Only start dragging if not hovering over a node
    if (hoveredNode === null) {
      setIsDragging(true);
      setLastPosition({ x: e.clientX, y: e.clientY });
      setStartDragPosition({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };
  
  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  };
  
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    
    // Reset to best move path
    const bestPath = [];
    let currentNode = nodePositions.find(n => n.parentIndex === -1); // Root
    if (currentNode) bestPath.push(currentNode.index);
    
    while (currentNode) {
      // Find best move child
      const childNodes = nodePositions.filter(n => n.parentIndex === currentNode.index);
      const bestChild = childNodes.find(n => n.node.isBestMove);
      
      if (bestChild) {
        bestPath.push(bestChild.index);
        currentNode = bestChild;
      } else {
        break;
      }
    }
    
    setSelectedPath(bestPath);
  };
  
  // Handle changing max depth
  const handleDepthChange = (e) => {
    setMaxDepth(parseInt(e.target.value, 10));
  };
  
  // Handle double click to focus on a node
  const handleDoubleClick = (e) => {
    if (hoveredNode !== null) {
      // Center view on the node
      const nodeInfo = nodePositions[hoveredNode];
      setPan({
        x: dimensions.width / 2 / zoom - nodeInfo.x,
        y: dimensions.height / 3 / zoom - nodeInfo.y
      });
      
      // Set zoom level based on depth
      setZoom(Math.max(1, 1.5 - nodeInfo.depth * 0.2));
      
      // Select the node and its path
      setSelectedNode(hoveredNode);
    }
  };
  
  return (
    <div className="tree-container">
      <h3>Minimax Decision Tree {useAlphaBeta ? 'with Alpha-Beta Pruning' : ''}</h3>
      
      <div className="tree-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2196f3' }}></span>
          <span>Maximizing (X)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff9800' }}></span>
          <span>Minimizing (O)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
          <span>Best Move</span>
        </div>
        {useAlphaBeta && (
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'rgba(255,0,0,0.4)', border: '1px dashed #f44336' }}></span>
            <span>Pruned Branch</span>
          </div>
        )}
      </div>
      
      <div className="tree-controls">
        <button onClick={handleZoomIn} className="control-button">
          <span>+</span> Zoom In
        </button>
        <button onClick={handleZoomOut} className="control-button">
          <span>-</span> Zoom Out
        </button>
        <button onClick={handleResetView} className="control-button">
          <span>↻</span> Reset View
        </button>
        <select 
          value={maxDepth} 
          onChange={handleDepthChange}
          className="depth-selector"
        >
          <option value={1}>Depth: 1</option>
          <option value={2}>Depth: 2</option>
          <option value={3}>Depth: 3</option>
          <option value={4}>Depth: 4</option>
          <option value={5}>Depth: All</option>
        </select>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ 
            width: dimensions.width, 
            height: dimensions.height, 
            cursor: isDragging ? 'grabbing' : (hoveredNode !== null ? 'pointer' : 'grab')
          }}
          className="tree-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        />
      </div>
      
      <div className="tree-info">
        <p>The tree shows how the AI evaluates different moves:</p>
        <ul>
          <li>Each node represents a possible board state</li>
          <li>Colors indicate whether the AI is maximizing (X) or minimizing (O)</li>
          <li>Green nodes represent the best move path</li>
          {useAlphaBeta && <li>Red dashed lines show pruned branches that the AI didn't fully explore</li>}
        </ul>
        <p><strong>Tip:</strong> Hover over any node to see details including score, click to highlight its path, and drag to pan the view.</p>
      </div>
    </div>
  );
};

export default GameTreeViz;