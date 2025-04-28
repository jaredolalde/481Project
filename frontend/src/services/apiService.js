// TicTacMaster API Service
// This service handles the communication between the React frontend and the Python backend

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * API Service for TicTacMaster
 */
class ApiService {
  /**
   * Reset the game state
   * @returns {Promise<Object>} Response from the server
   */
  static async resetGame() {
    try {
      const response = await fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  }

  /**
   * Make a move on the board
   * @param {number} row Row index (0-2)
   * @param {number} col Column index (0-2)
   * @returns {Promise<Object>} Response from the server including updated game state
   */
  static async makeMove(row, col) {
    try {
      const response = await fetch(`${API_BASE_URL}/make_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }

  /**
   * Get the best move for the AI based on the current game state
   * @param {boolean} useAlphaBeta Whether to use Alpha-Beta pruning
   * @param {string} player AI's player symbol ('X' or 'O')
   * @returns {Promise<Object>} Response from the server with the best move
   */
  static async getAiMove(useAlphaBeta = true, player = 'O') {
    try {
      const response = await fetch(`${API_BASE_URL}/get_ai_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ use_alpha_beta: useAlphaBeta, player }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting AI move:', error);
      throw error;
    }
  }

  /**
   * Let the AI make a move
   * @param {boolean} useAlphaBeta Whether to use Alpha-Beta pruning
   * @param {string} player AI's player symbol ('X' or 'O')
   * @returns {Promise<Object>} Response from the server with the move made and updated game state
   */
  static async aiMakeMove(useAlphaBeta = true, player = 'O') {
    try {
      const response = await fetch(`${API_BASE_URL}/ai_make_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ use_alpha_beta: useAlphaBeta, player }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error with AI making move:', error);
      throw error;
    }
  }

  /**
   * Get the current game state
   * @returns {Promise<Object>} Response from the server with the current game state
   */
  static async getGameState() {
    try {
      const response = await fetch(`${API_BASE_URL}/game_state`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  }
  
  /**
   * Get the decision tree for the current game state
   * @param {boolean} useAlphaBeta Whether to use Alpha-Beta pruning
   * @param {string} player Player to calculate the tree for ('X' or 'O')
   * @returns {Promise<Object>} Response with the decision tree data
   */
  static async getDecisionTree(useAlphaBeta = true, player = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/decision_tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          use_alpha_beta: useAlphaBeta,
          player: player 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting decision tree:', error);
      throw error;
    }
  }
}

export default ApiService;