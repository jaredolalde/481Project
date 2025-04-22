# TicTacMaster: A Minimax-Based AI for Tic-Tac-Toe

TicTacMaster is an implementation of the classic Tic-Tac-Toe game with an intelligent AI opponent using the Minimax algorithm with Alpha-Beta pruning.

## Project Overview

This project demonstrates fundamental AI concepts in game theory and adversarial search, using Tic-Tac-Toe as a practical example. The key features include:

- Unbeatable AI using Minimax algorithm
- Performance optimization with Alpha-Beta pruning
- Interactive web-based user interface
- Performance statistics visualization
- Ability to toggle between different game modes

## Technologies Used

### Backend
- Python 3.10
- Flask for API endpoints
- Custom game logic using OOP principles

### Frontend
- React.js
- JavaScript (ES6+)
- Material-UI components
- HTML5/CSS3

## Project Structure

```
tictacmaster/
├── backend/
│   ├── game.py         # Core game logic and Minimax implementation
│   └── api.py          # Flask API endpoints
├── frontend/
│   ├── src/
│   │   ├── App.js      # Main React component
│   │   ├── App.css     # Styling
│   │   └── apiService.js # API communication service
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Node.js 14.x or higher
- npm or yarn

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install flask flask-cors
   ```

4. Run the backend server:
   ```
   python api.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. The game starts with an empty 3x3 grid.
2. You play as 'X' and the AI plays as 'O'.
3. Click on any empty cell to make your move.
4. The AI will automatically respond with its move.
5. The first player to get three in a row (horizontally, vertically, or diagonally) wins.
6. If all cells are filled without a winner, the game ends in a draw.

## Game Modes

- **Human vs. AI**: You play against the Minimax AI.
- **AI vs. AI**: Watch two AI players compete against each other.

## Performance Statistics

When enabled, performance statistics show:
- Number of nodes explored in the game tree
- Decision time in milliseconds
- Whether Alpha-Beta pruning is enabled

## Implementation Details

### Minimax Algorithm

The Minimax algorithm works by:
1. Exploring all possible future moves
2. Evaluating terminal states (+10 for AI win, -10 for human win, 0 for draw)
3. Maximizing the AI's score while assuming the opponent will minimize it
4. Choosing the move with the highest score

### Alpha-Beta Pruning

Alpha-Beta pruning optimizes the algorithm by:
1. Tracking the best already explored values for maximizer (alpha) and minimizer (beta)
2. Skipping evaluation of moves that cannot affect the final decision
3. Significantly reducing the number of nodes explored

## Future Enhancements

- Visual representation of the game tree
- Difficulty levels by limiting search depth
- Learning capabilities based on human play data
- Extended board sizes beyond 3x3

## Authors

- Jared Olalde
- Yuri Pasamonte
- Christopher Contreras

## Acknowledgments

This project was developed as part of CPSC 481.
