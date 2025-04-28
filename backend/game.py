"""
TicTacMaster - A Minimax-Based AI for Tic-Tac-Toe
Backend Logic Module

This module contains the core game logic and AI implementation using
the Minimax algorithm with Alpha-Beta pruning.
"""
import copy

class TicTacToe:
    """
    Represents the Tic-Tac-Toe game state and rules.
    """
    
    def __init__(self):
        """Initialize an empty 3x3 game board."""
        # Board is represented as a 3x3 grid:
        # None = empty cell
        # 'X' or 'O' = cell taken by respective player
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'  # X always goes first in traditional rules
        self.winner = None
        self.game_over = False
        self.moves_made = 0
    
    def reset_game(self):
        """Reset the game state to start a new game."""
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.winner = None
        self.game_over = False
        self.moves_made = 0
    
    def make_move(self, row, col):
        """
        Attempt to make a move at the specified position.
        
        Args:
            row: Row index (0-2)
            col: Column index (0-2)
            
        Returns:
            bool: True if the move was valid and made, False otherwise
        """
        # Check if the move is valid
        if (not 0 <= row <= 2) or (not 0 <= col <= 2) or \
           self.board[row][col] is not None or self.game_over:
            return False
        
        # Make the move
        self.board[row][col] = self.current_player
        self.moves_made += 1
        
        # Check for win or draw
        if self._check_winner():
            self.winner = self.current_player
            self.game_over = True
        elif self.moves_made == 9:  # All cells filled
            self.game_over = True
        
        # Switch current player
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        
        return True
    
    def _check_winner(self):
        """
        Check if the current state of the board has a winner.
        
        Returns:
            bool: True if there is a winner, False otherwise
        """
        # Check rows
        for row in range(3):
            if self.board[row][0] == self.board[row][1] == self.board[row][2] != None:
                return True
        
        # Check columns
        for col in range(3):
            if self.board[0][col] == self.board[1][col] == self.board[2][col] != None:
                return True
        
        # Check diagonals
        if self.board[0][0] == self.board[1][1] == self.board[2][2] != None:
            return True
        if self.board[0][2] == self.board[1][1] == self.board[2][0] != None:
            return True
        
        return False
    
    def get_available_moves(self):
        """
        Get all available moves on the current board.
        
        Returns:
            list: List of (row, col) tuples representing empty cells
        """
        moves = []
        for row in range(3):
            for col in range(3):
                if self.board[row][col] is None:
                    moves.append((row, col))
        return moves
    
    def get_game_state(self):
        """
        Get a dictionary representing the current game state.
        
        Returns:
            dict: Game state information
        """
        return {
            'board': [row[:] for row in self.board],  # Deep copy
            'current_player': self.current_player,
            'winner': self.winner,
            'game_over': self.game_over,
            'moves_made': self.moves_made
        }


class TreeNode:
    """
    Represents a node in the game decision tree.
    """
    def __init__(self, board, is_maximizing, move=None, parent=None):
        self.board = board
        self.isMaximizing = is_maximizing
        self.move = move  # The move that led to this state
        self.parent = parent
        self.children = []
        self.score = None
        self.pruned = False
        self.isBestMove = False
        # Positions will be calculated during visualization
        self.x = 0
        self.y = 0
        self.depth = 0
    
    def add_child(self, child):
        self.children.append(child)
    
    def to_dict(self):
        """Convert the node to a dictionary for JSON serialization."""
        result = {
            'board': self.board,
            'isMaximizing': self.isMaximizing,
            'score': self.score,
            'pruned': self.pruned,
            'isBestMove': self.isBestMove,
            'move': self.move
        }
        
        if self.children:
            result['children'] = [child.to_dict() for child in self.children]
        
        return result


class TicTacToeAI:
    """
    AI player for Tic-Tac-Toe using the Minimax algorithm
    with Alpha-Beta pruning.
    """
    
    def __init__(self, player='O'):
        """
        Initialize the AI player.
        
        Args:
            player: The AI's player symbol ('X' or 'O')
        """
        self.player = player
        self.opponent = 'X' if player == 'O' else 'O'
        # Count nodes explored for performance evaluation
        self.nodes_explored = 0
        # Root of the decision tree for visualization
        self.decision_tree = None
        self.max_depth_seen = 0
    
    def get_best_move(self, game, use_alpha_beta=True):
        """
        Get the best move for the AI based on the current game state.
        
        Args:
            game: TicTacToe instance
            use_alpha_beta: Whether to use Alpha-Beta pruning
            
        Returns:
            tuple: (row, col) representing the best move
        """
        # Reset counter and tree
        # FIX: Explicitly set to 0 rather than incrementing/decrementing
        self.nodes_explored = 0
        self.decision_tree = None
        self.max_depth_seen = 0
        
        available_moves = game.get_available_moves()
        
        if not available_moves:
            return None
        
        # For the first move as 'O', a common strategy is to take the center
        # if it's available or a corner if the center is taken
        if game.moves_made <= 1 and self.player == 'O':
            # Try to take center
            if (1, 1) in available_moves:
                return (1, 1)
            # Otherwise take a corner
            for corner in [(0, 0), (0, 2), (2, 0), (2, 2)]:
                if corner in available_moves:
                    return corner
        
        best_score = float('-inf')
        best_move = available_moves[0]  # Default to first available move
        
        # Create the root node of the decision tree
        root_node = TreeNode(
            [row[:] for row in game.board],
            True,  # AI is maximizing at the root
            None,  # No move has been made yet
            None   # No parent for the root
        )
        self.decision_tree = root_node
        
        # Initialize nodes_explored to 1 for the root node
        self.nodes_explored = 1
        
        # Create a copy of the game to simulate moves
        for move in available_moves:
            row, col = move
            
            # Create a child node for this move
            child_node = TreeNode(
                [row[:] for row in game.board],
                False,  # Child nodes are minimizing if root is maximizing
                move,
                root_node
            )
            root_node.add_child(child_node)
            
            # Simulate the move
            game_copy = self._copy_game(game)
            game_copy.make_move(row, col)
            
            # Update the child's board with the move
            child_node.board = [row[:] for row in game_copy.board]
            
            # Increment nodes_explored for the child node
            self.nodes_explored += 1
            
            # Calculate score for this move
            if use_alpha_beta:
                score = self._minimax_alpha_beta(game_copy, 0, False, float('-inf'), float('inf'), child_node)
            else:
                score = self._minimax(game_copy, 0, False, child_node)
            
            # Update the child's score
            child_node.score = score
            
            # Update best move if this score is better
            if score > best_score:
                best_score = score
                best_move = move
        
        # Mark the best move in the tree
        for child in root_node.children:
            if child.move == best_move:
                child.isBestMove = True
                self._mark_best_path(child)
                break
        
        return best_move
    
    def _mark_best_path(self, node):
        """Mark the path of the best move through the tree."""
        if not node.children:
            return
            
        best_child = None
        best_score = float('-inf') if node.isMaximizing else float('inf')
        
        for child in node.children:
            if child.pruned:
                continue
                
            if node.isMaximizing:
                if child.score > best_score:
                    best_score = child.score
                    best_child = child
            else:
                if child.score < best_score:
                    best_score = child.score
                    best_child = child
        
        if best_child:
            best_child.isBestMove = True
            self._mark_best_path(best_child)
    
    def _copy_game(self, game):
        """Create a deep copy of the game state for simulation."""
        new_game = TicTacToe()
        state = game.get_game_state()
        new_game.board = state['board']
        new_game.current_player = state['current_player']
        new_game.winner = state['winner']
        new_game.game_over = state['game_over']
        new_game.moves_made = state['moves_made']
        return new_game
    
    def _evaluate_board(self, game):
        """
        Evaluate the board state from the AI's perspective.
        
        Args:
            game: TicTacToe instance
            
        Returns:
            int: Score for the current board state
                 +10 if AI wins
                 -10 if opponent wins
                 0 for a draw or ongoing game
        """
        if game.winner == self.player:
            return 10
        elif game.winner == self.opponent:
            return -10
        else:
            return 0
    
    def _minimax(self, game, depth, is_maximizing, node):
        """
        Standard Minimax algorithm implementation with tree tracking.
        
        Args:
            game: TicTacToe instance
            depth: Current depth in the game tree
            is_maximizing: Whether this is a maximizing or minimizing node
            node: The current TreeNode
            
        Returns:
            int: Best score for the current board state
        """
        # FIX: Only increment the counter, never decrement
        self.nodes_explored += 1
        self.max_depth_seen = max(self.max_depth_seen, depth)
        
        # Terminal state check
        if game.game_over:
            score = self._evaluate_board(game)
            node.score = score
            return score
        
        available_moves = game.get_available_moves()
        
        if is_maximizing:
            best_score = float('-inf')
            for move in available_moves:
                row, col = move
                
                # Create a child node
                child_node = TreeNode(
                    [row[:] for row in game.board],
                    not is_maximizing,
                    move,
                    node
                )
                node.add_child(child_node)
                
                game_copy = self._copy_game(game)
                game_copy.make_move(row, col)
                
                # Update the child's board with the move
                child_node.board = [row[:] for row in game_copy.board]
                
                score = self._minimax(game_copy, depth + 1, False, child_node)
                child_node.score = score
                best_score = max(score, best_score)
                
            node.score = best_score
            return best_score
        else:
            best_score = float('inf')
            for move in available_moves:
                row, col = move
                
                # Create a child node
                child_node = TreeNode(
                    [row[:] for row in game.board],
                    not is_maximizing,
                    move,
                    node
                )
                node.add_child(child_node)
                
                game_copy = self._copy_game(game)
                game_copy.make_move(row, col)
                
                # Update the child's board with the move
                child_node.board = [row[:] for row in game_copy.board]
                
                score = self._minimax(game_copy, depth + 1, True, child_node)
                child_node.score = score
                best_score = min(score, best_score)
                
            node.score = best_score
            return best_score
    
    def _minimax_alpha_beta(self, game, depth, is_maximizing, alpha, beta, node):
        """
        Minimax algorithm with Alpha-Beta pruning and tree tracking.
        
        Args:
            game: TicTacToe instance
            depth: Current depth in the game tree
            is_maximizing: Whether this is a maximizing or minimizing node
            alpha: Alpha value for pruning
            beta: Beta value for pruning
            node: The current TreeNode
            
        Returns:
            int: Best score for the current board state
        """
        # FIX: Only increment the counter, never decrement
        self.nodes_explored += 1
        self.max_depth_seen = max(self.max_depth_seen, depth)
        
        # Terminal state check
        if game.game_over:
            score = self._evaluate_board(game)
            node.score = score
            return score
        
        available_moves = game.get_available_moves()
        
        # Consider center and corners first for better pruning
        if depth == 0:
            # Order moves: center, corners, then edges for better pruning
            ordered_moves = []
            # First center
            if (1, 1) in available_moves:
                ordered_moves.append((1, 1))
            # Then corners
            for move in [(0, 0), (0, 2), (2, 0), (2, 2)]:
                if move in available_moves and move not in ordered_moves:
                    ordered_moves.append(move)
            # Then edges
            for move in [(0, 1), (1, 0), (1, 2), (2, 1)]:
                if move in available_moves and move not in ordered_moves:
                    ordered_moves.append(move)
            available_moves = ordered_moves
        
        if is_maximizing:
            best_score = float('-inf')
            for move in available_moves:
                row, col = move
                
                # Create a child node
                child_node = TreeNode(
                    [row[:] for row in game.board],
                    not is_maximizing,
                    move,
                    node
                )
                node.add_child(child_node)
                
                game_copy = self._copy_game(game)
                game_copy.make_move(row, col)
                
                # Update the child's board with the move
                child_node.board = [row[:] for row in game_copy.board]
                
                score = self._minimax_alpha_beta(game_copy, depth + 1, False, alpha, beta, child_node)
                child_node.score = score
                best_score = max(score, best_score)
                alpha = max(alpha, best_score)
                
                if beta <= alpha:
                    # Mark remaining moves as pruned
                    for remaining_move in available_moves:
                        if remaining_move != move:
                            pruned_node = TreeNode(
                                [row[:] for row in game.board],
                                not is_maximizing,
                                remaining_move,
                                node
                            )
                            pruned_node.pruned = True
                            node.add_child(pruned_node)
                    break  # Beta cutoff
                    
            node.score = best_score
            return best_score
        else:
            best_score = float('inf')
            for move in available_moves:
                row, col = move
                
                # Create a child node
                child_node = TreeNode(
                    [row[:] for row in game.board],
                    not is_maximizing,
                    move,
                    node
                )
                node.add_child(child_node)
                
                game_copy = self._copy_game(game)
                game_copy.make_move(row, col)
                
                # Update the child's board with the move
                child_node.board = [row[:] for row in game_copy.board]
                
                score = self._minimax_alpha_beta(game_copy, depth + 1, True, alpha, beta, child_node)
                child_node.score = score
                best_score = min(score, best_score)
                beta = min(beta, best_score)
                
                if beta <= alpha:
                    # Mark remaining moves as pruned
                    for remaining_move in available_moves:
                        if remaining_move != move:
                            pruned_node = TreeNode(
                                [row[:] for row in game.board],
                                not is_maximizing,
                                remaining_move,
                                node
                            )
                            pruned_node.pruned = True
                            node.add_child(pruned_node)
                    break  # Alpha cutoff
                    
            node.score = best_score
            return best_score
    
    def get_decision_tree(self):
        """
        Get the decision tree for visualization.
        
        Returns:
            dict: Tree data in a format suitable for frontend visualization
        """
        if not self.decision_tree:
            return None
            
        return {
            'root': self.decision_tree.to_dict(),
            'maxDepth': self.max_depth_seen
        }


# Simple text-based console implementation for testing
def play_console_game():
    """Run a text-based version of the game for testing."""
    game = TicTacToe()
    ai = TicTacToeAI('O')  # AI plays as O
    
    print("TicTacMaster - Console Test")
    print("You are X, AI is O")
    
    while not game.game_over:
        # Print the current board
        print("\nCurrent Board:")
        for row in range(3):
            print(" | ".join([cell if cell else " " for cell in game.board[row]]))
            if row < 2:
                print("-" * 9)
        
        if game.current_player == 'X':
            # Human player's turn
            while True:
                try:
                    move = input("\nEnter your move (row,col) [0-2,0-2]: ")
                    row, col = map(int, move.split(','))
                    if game.make_move(row, col):
                        break
                    else:
                        print("Invalid move. Try again.")
                except (ValueError, IndexError):
                    print("Invalid input. Use format: row,col (e.g., 0,0)")
        else:
            # AI's turn
            print("\nAI is thinking...")
            # FIX: Store the current count not the difference
            ai.nodes_explored = 0  # Reset before calculating
            move = ai.get_best_move(game)
            nodes_explored = ai.nodes_explored  # Get the total count
            print(f"AI explored {nodes_explored} nodes")
            row, col = move
            game.make_move(row, col)
            print(f"AI chose: {row},{col}")
    
    # Game over
    print("\nFinal Board:")
    for row in range(3):
        print(" | ".join([cell if cell else " " for cell in game.board[row]]))
        if row < 2:
            print("-" * 9)
    
    if game.winner:
        print(f"\nWinner: {game.winner}")
    else:
        print("\nGame ended in a draw")


if __name__ == "__main__":
    play_console_game()