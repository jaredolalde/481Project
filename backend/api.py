"""
TicTacMaster - API Bridge

This module serves as an API bridge between the React frontend and the Python backend.
It uses Flask to create a simple REST API.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from game import TicTacToe, TicTacToeAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Game instance for the server
game = TicTacToe()
ai = TicTacToeAI('O')  # AI plays as O by default

@app.route('/api/reset', methods=['POST'])
def reset_game():
    """Reset the game state."""
    game.reset_game()
    return jsonify({"status": "success", "message": "Game reset"})

@app.route('/api/make_move', methods=['POST'])
def make_move():
    """Make a move on the board."""
    data = request.json
    row = data.get('row')
    col = data.get('col')
    
    if row is None or col is None:
        return jsonify({"status": "error", "message": "Row and column are required"}), 400
    
    success = game.make_move(row, col)
    
    if not success:
        return jsonify({"status": "error", "message": "Invalid move"}), 400
    
    return jsonify({
        "status": "success",
        "game_state": game.get_game_state()
    })

@app.route('/api/get_ai_move', methods=['POST'])
def get_ai_move():
    """Get the best move for the AI based on the current game state."""
    data = request.json
    use_alpha_beta = data.get('use_alpha_beta', True)
    player = data.get('player', 'O')
    
    # Update AI player if necessary
    if ai.player != player:
        ai.player = player
        ai.opponent = 'X' if player == 'O' else 'O'
    
    # Record start time for performance measurement
    start_time = time.time()
    
    # FIX: Reset the nodes_explored counter before making calculations
    ai.nodes_explored = 0
    
    # Get best move from AI
    best_move = ai.get_best_move(game, use_alpha_beta)
    
    # FIX: Get the total nodes explored (not the difference)
    nodes_explored = ai.nodes_explored
    
    # Get the decision tree for visualization
    decision_tree = ai.get_decision_tree()
    
    # Calculate time taken
    decision_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    if best_move is None:
        return jsonify({
            "status": "error",
            "message": "No valid moves available"
        }), 400
    
    # Return the best move without making it
    return jsonify({
        "status": "success",
        "move": {
            "row": best_move[0],
            "col": best_move[1]
        },
        "stats": {
            "nodes_explored": nodes_explored,
            "decision_time_ms": decision_time
        },
        "decision_tree": decision_tree
    })

@app.route('/api/ai_make_move', methods=['POST'])
def ai_make_move():
    """Get the best move for the AI and make that move on the board."""
    data = request.json
    use_alpha_beta = data.get('use_alpha_beta', True)
    player = data.get('player', 'O')
    
    # Update AI player if necessary
    if ai.player != player:
        ai.player = player
        ai.opponent = 'X' if player == 'O' else 'O'
    
    # Make sure it's the AI's turn
    if game.current_player != ai.player:
        return jsonify({
            "status": "error",
            "message": f"Not {ai.player}'s turn"
        }), 400
    
    # Record start time for performance measurement
    start_time = time.time()
    
    # FIX: Reset the nodes_explored counter before making calculations
    ai.nodes_explored = 0
    
    # Get best move from AI
    best_move = ai.get_best_move(game, use_alpha_beta)
    
    # FIX: Get the total nodes explored (not the difference)
    nodes_explored = ai.nodes_explored
    
    # Get the decision tree for visualization
    decision_tree = ai.get_decision_tree()
    
    # Calculate time taken
    decision_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    if best_move is None:
        return jsonify({
            "status": "error",
            "message": "No valid moves available"
        }), 400
    
    # Make the move
    row, col = best_move
    success = game.make_move(row, col)
    
    if not success:
        return jsonify({
            "status": "error",
            "message": "Failed to make AI move"
        }), 500
    
    return jsonify({
        "status": "success",
        "move": {
            "row": row,
            "col": col
        },
        "game_state": game.get_game_state(),
        "stats": {
            "nodes_explored": nodes_explored,
            "decision_time_ms": decision_time
        },
        "decision_tree": decision_tree
    })

@app.route('/api/game_state', methods=['GET'])
def get_game_state():
    """Get the current game state."""
    return jsonify({
        "status": "success",
        "game_state": game.get_game_state()
    })

@app.route('/api/decision_tree', methods=['POST'])
def get_decision_tree():
    """
    Generate the decision tree for the current game state.
    This endpoint allows getting the tree without making a move.
    """
    data = request.json
    use_alpha_beta = data.get('use_alpha_beta', True)
    player = data.get('player', game.current_player)
    
    # Update AI player if necessary
    if ai.player != player:
        ai.player = player
        ai.opponent = 'X' if player == 'O' else 'O'
    
    # Record start time for performance measurement
    start_time = time.time()
    
    # FIX: Reset the nodes_explored counter before making calculations
    ai.nodes_explored = 0
    
    # Get best move from AI (this generates the decision tree)
    best_move = ai.get_best_move(game, use_alpha_beta)
    
    # FIX: Get the total nodes explored (not the difference)
    nodes_explored = ai.nodes_explored
    
    # Get the decision tree for visualization
    decision_tree = ai.get_decision_tree()
    
    # Calculate time taken
    decision_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    return jsonify({
        "status": "success",
        "stats": {
            "nodes_explored": nodes_explored,
            "decision_time_ms": decision_time
        },
        "decision_tree": decision_tree
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)