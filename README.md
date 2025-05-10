# TicTacMaster: A Minimax-Based AI for Tic-Tac-Toe

TicTacMaster is an advanced implementation of Tic-Tac-Toe featuring an intelligent AI opponent powered by the Minimax algorithm with Alpha-Beta pruning optimization.

## Project Overview

This project demonstrates fundamental AI concepts in game theory and adversarial search, using Tic-Tac-Toe as a practical example. The application includes:

- Unbeatable AI using the Minimax algorithm
- Performance optimization with Alpha-Beta pruning
- Interactive visualization of the AI's decision tree
- Comprehensive performance statistics
- Multiple game modes (Human vs. AI, AI vs. AI)
- Clean, responsive web interface

## Key Features

- **Advanced AI**: Perfect play using Minimax algorithm with Alpha-Beta pruning
- **Interactive Decision Tree**: Visual representation of the AI's decision-making process
- **Performance Metrics**: Detailed statistics on nodes explored and decision time
- **Responsive Design**: Works on desktop and mobile devices
- **Flexible Game Modes**: Play against the AI or watch AI vs. AI matches

## Technologies Used

### Backend
- **Python**: Core logic implementation
- **Flask**: RESTful API server
- **Object-Oriented Design**: Modular game and AI implementation

### Frontend
- **React.js**: Component-based UI architecture
- **JavaScript (ES6+)**: Modern syntax and features
- **CSS3**: Responsive styling with media queries
- **Fetch API**: Asynchronous communication with backend

## Project Structure

```
tictacmaster/
├── api.py                 # Flask API endpoints
├── game.py                # Core game logic and Minimax AI implementation
├── public/                # Static assets
│   └── index.html         # HTML entry point
├── src/
│   ├── App.js             # Main React component
│   ├── App.css            # Main styles
│   ├── index.js           # React entry point
│   ├── index.css          # Global styles
│   ├── components/
│   │   ├── Board.js       # Game board component
│   │   ├── Controls.js    # Game control buttons
│   │   ├── GameTreeViz.js # Decision tree visualization
│   │   ├── Square.js      # Individual board square
│   │   └── Stats.js       # Performance statistics display
│   ├── services/
│   │   └── apiService.js  # API communication service
│   └── utils/
│       └── gameUtils.js   # Game-related utility functions
└── README.md
```

## Implementation Details

### Game Logic (`game.py`)

The core game is implemented using two main classes:

1. **TicTacToe**: Manages the game state, rules, and move validation
2. **TicTacToeAI**: Implements the Minimax algorithm with optional Alpha-Beta pruning

### Minimax Algorithm

The Minimax algorithm works by:

1. Building a game tree of all possible future moves
2. Evaluating terminal states (+10 for AI win, -10 for opponent win, 0 for draw)
3. Working backward from terminal states, maximizing the AI's score while assuming the opponent will minimize it
4. Selecting the move that leads to the highest guaranteed score

### Alpha-Beta Pruning

Alpha-Beta pruning dramatically improves performance by:

1. Tracking the best already explored values for maximizer (alpha) and minimizer (beta)
2. Pruning branches that cannot influence the final decision
3. Significantly reducing the number of nodes explored without affecting the result

### Decision Tree Visualization

The project includes a sophisticated visualization of the AI's decision tree that:

1. Shows all possible moves and their evaluation scores
2. Highlights the best move path
3. Visually indicates pruned branches when using Alpha-Beta pruning
4. Allows interactive exploration through zooming, panning, and node selection

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
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
1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. You play as 'X' (by default) and the AI plays as 'O'
2. Click on any empty cell to make your move
3. The AI will automatically respond with its move
4. The first player to get three in a row (horizontally, vertically, or diagonally) wins
5. If all cells are filled without a winner, the game ends in a draw

## Game Modes

- **Human vs. AI**: Play against the Minimax AI (default mode)
- **AI vs. AI**: Watch two AI players compete against each other (use the "Make AI Move" button to advance)

## Additional Features

- **Alpha-Beta Pruning Toggle**: Enable or disable pruning to observe performance differences
- **Performance Statistics**: View real-time metrics on AI performance
- **Decision Tree Visualization**: Explore the AI's decision-making process

## Achievement Highlights

- Successfully implemented a perfect Tic-Tac-Toe player using Minimax
- Created an interactive visualization of the algorithm's decision tree
- Demonstrated significant performance improvements with Alpha-Beta pruning
- Developed a clean, intuitive user interface
- Built a complete full-stack application with Python backend and React frontend

## Future Enhancements

- Variable difficulty levels by limiting search depth
- Support for larger board sizes (4x4, 5x5)
- Implementation of other game variants (Ultimate Tic-Tac-Toe)
- Machine learning integration to adapt to player strategies

## Authors

- Jared Olalde
- Yuri Pasamonte
- Christopher Contreras

## Acknowledgments

This project was developed as part of CPSC 481 - Artificial Intelligence.
