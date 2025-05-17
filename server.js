// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:3001"], // Your React app's URL
    methods: ["GET", "POST"]
  }
});

// Game state
const games = {};
const players = {};

// Card generation function
function generatePlayerCards() {
  const cricketers = [
    { playerName: "Virat Kohli", matches: 254, runs: 12000, centuries: 43, wickets: 4 },
    { playerName: "Rohit Sharma", matches: 227, runs: 9283, centuries: 29, wickets: 8 },
    { playerName: "Joe Root", matches: 232, runs: 10203, centuries: 26, wickets: 18 },
    { playerName: "Steve Smith", matches: 214, runs: 9662, centuries: 30, wickets: 17 },
    { playerName: "Kane Williamson", matches: 188, runs: 7659, centuries: 24, wickets: 7 },
    { playerName: "Ben Stokes", matches: 164, runs: 5703, centuries: 12, wickets: 187 },
    { playerName: "Jasprit Bumrah", matches: 156, runs: 245, centuries: 0, wickets: 290 },
    { playerName: "Pat Cummins", matches: 165, runs: 988, centuries: 0, wickets: 250 },
    { playerName: "R Ashwin", matches: 189, runs: 2685, centuries: 5, wickets: 442 },
    { playerName: "Shakib Al Hasan", matches: 213, runs: 6903, centuries: 13, wickets: 328 },
    { playerName: "MS Dhoni", matches: 350, runs: 10773, centuries: 16, wickets: 1 },
    { playerName: "Babar Azam", matches: 195, runs: 8786, centuries: 19, wickets: 0 }
  ];
  
  // Randomly select 10 unique cards
  const shuffled = [...cricketers].sort(() => 0.5 - Math.random());
  const selectedCards = shuffled.slice(0, 10);
  
  // Add unique IDs to cards
  return selectedCards.map((card, index) => ({
    id: `card-${index}`,
    ...card
  }));
}

// Generate a unique game ID
function generateUniqueGameId() {
  return Math.random().toString(36).substring(2, 9);
}

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Store player connection
  players[socket.id] = {
    id: socket.id,
    inGame: false
  };
  
  // Create game
  socket.on('create_game', () => {
    const gameId = generateUniqueGameId();
    
    games[gameId] = {
      id: gameId,
      players: [socket.id],
      turn: socket.id,
      cards: {},
      selectedCards: {},
      currentAttribute: null,
      score: { [socket.id]: 0 }
    };
    
    // Set player in game
    players[socket.id].inGame = true;
    players[socket.id].gameId = gameId;
    
    // Join game room
    socket.join(gameId);
    
    // Send response to client
    socket.emit('game_created', {
      gameId: gameId,
      playerId: socket.id
    });
    
    console.log(`Game created: ${gameId} by player ${socket.id}`);
  });
  
  // Join game
socket.on('join_game', (data) => {
  const { gameId } = data;
  
  // Check if game exists
  if (!games[gameId]) {
    socket.emit('error', { message: 'Game not found' });
    return;
  }
  
  // Check if game is full
  if (games[gameId].players.length >= 2) {
    socket.emit('error', { message: 'Game is full' });
    return;
  }
  
  // Add player to game
  games[gameId].players.push(socket.id);
  games[gameId].score[socket.id] = 0;
  
  // Set player in game
  players[socket.id].inGame = true;
  players[socket.id].gameId = gameId;
  
  // Generate cards for both players
  const player1Id = games[gameId].players[0];
  const player2Id = socket.id;
  
  games[gameId].cards[player1Id] = generatePlayerCards();
  games[gameId].cards[player2Id] = generatePlayerCards();
  
  // Set initial turn - important to give it to the first player
  games[gameId].turn = player1Id;
  
  // Join game room
  socket.join(gameId);
  
  // Notify both players with IDENTICAL turn information
  io.to(player1Id).emit('game_joined', {
    gameId: gameId,
    playerId: player1Id,
    opponentId: player2Id,
    cards: games[gameId].cards[player1Id],
    turn: games[gameId].turn  // Both players will receive the same turn ID
  });
  
  socket.emit('game_joined', {
    gameId: gameId,
    playerId: player2Id,
    opponentId: player1Id,
    cards: games[gameId].cards[player2Id],
    turn: games[gameId].turn  // Both players will receive the same turn ID
  });
  
  console.log(`Player ${socket.id} joined game ${gameId}, first turn: ${games[gameId].turn}`);
});
  
  // In server.js, update the select_card handler

socket.on('select_card', (data) => {
  const { gameId, playerId, card } = data;
  
  if (!games[gameId]) {
    console.log(`Game ${gameId} not found for card selection`);
    return;
  }
  
  console.log(`Player ${playerId} selected card ${card.playerName} in game ${gameId}`);
  
  // Store the selected card
  games[gameId].selectedCards[playerId] = card;
  
  // Notify opponent that a card was selected (without revealing details)
  const opponentId = games[gameId].players.find(p => p !== playerId);
  
  if (opponentId) {
    socket.to(opponentId).emit('opponent_selected_card', {
      card: { id: card.id, playerName: card.playerName }
    });
  }
  
  // Check if both players have selected cards
  const allPlayersSelected = games[gameId].players.every(
    playerId => !!games[gameId].selectedCards[playerId]
  );
  
  // If both players have selected cards, make sure turn is set to the player whose turn it is
  if (allPlayersSelected) {
    console.log(`Both players have selected cards in game ${gameId}`);
    
    // Make sure the turn information is broadcast to all players
    io.to(gameId).emit('turn_update', {
      turn: games[gameId].turn
    });
    
    console.log(`Turn updated: ${games[gameId].turn} in game ${gameId}`);
  }
});
  
  // Handle attribute selection
  // In server.js, update the select_attribute handler

socket.on('select_attribute', (data) => {
  const { gameId, playerId, attribute } = data;
  
  console.log(`Player ${playerId} selected attribute ${attribute} in game ${gameId}`);
  
  if (!games[gameId]) {
    console.error(`Game ${gameId} not found for attribute selection`);
    return;
  }
  
  games[gameId].currentAttribute = attribute;
  
  // Get both selected cards
  const player1Id = games[gameId].players[0];
  const player2Id = games[gameId].players[1];
  
  const card1 = games[gameId].selectedCards[player1Id];
  const card2 = games[gameId].selectedCards[player2Id];
  
  if (!card1 || !card2) {
    console.error(`Missing cards for game ${gameId}`, { card1, card2 });
    return;
  }
  
  // Notify both players about the selected attribute
  io.to(gameId).emit('attribute_selected', {
    attribute: attribute,
    playerId: playerId
  });
  
  console.log(`Attribute selected: ${attribute} in game ${gameId}`);
  
  // Determine winner
  let winningPlayerId = null;
  let nextTurn = null;
  
  if (card1[attribute] > card2[attribute]) {
    winningPlayerId = player1Id;
    games[gameId].score[player1Id] = (games[gameId].score[player1Id] || 0) + 1;
    nextTurn = player1Id;
  } else if (card2[attribute] > card1[attribute]) {
    winningPlayerId = player2Id;
    games[gameId].score[player2Id] = (games[gameId].score[player2Id] || 0) + 1;
    nextTurn = player2Id;
  } else {
    // It's a draw
    winningPlayerId = null;
    nextTurn = games[gameId].turn; // Keep same turn on draw
  }
  
  games[gameId].turn = nextTurn;
  
  // Critical: Log the result calculation
  console.log(`Round result calculation:`, {
    attribute,
    card1Value: card1[attribute],
    card2Value: card2[attribute],
    winningPlayerId,
    player1Id,
    player2Id,
    nextTurn
  });
  
  // Send result to both players (with short delay for dramatic effect)
  setTimeout(() => {
    // For player 1: win if they're the winner, lose if the other player is the winner, draw otherwise
    io.to(player1Id).emit('round_result', {
      result: winningPlayerId === player1Id ? 'win' : 
              winningPlayerId === player2Id ? 'lose' : 'draw',
      score: {
        player: games[gameId].score[player1Id] || 0,
        opponent: games[gameId].score[player2Id] || 0
      },
      nextTurn: games[gameId].turn,
      attribute: attribute
    });
    
    // For player 2: win if they're the winner, lose if the other player is the winner, draw otherwise
    io.to(player2Id).emit('round_result', {
      result: winningPlayerId === player2Id ? 'win' : 
              winningPlayerId === player1Id ? 'lose' : 'draw',
      score: {
        player: games[gameId].score[player2Id] || 0,
        opponent: games[gameId].score[player1Id] || 0
      },
      nextTurn: games[gameId].turn,
      attribute: attribute
    });
    
    console.log(`Round results sent for game ${gameId}: winner is ${winningPlayerId || 'draw'}, next turn: ${nextTurn}`);
  }, 1000);
});
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const player = players[socket.id];
    
    if (player && player.inGame) {
      const gameId = player.gameId;
      
      if (games[gameId]) {
        // Notify other player of disconnect
        const otherPlayerId = games[gameId].players.find(p => p !== socket.id);
        
        if (otherPlayerId) {
          io.to(otherPlayerId).emit('opponent_disconnected');
        }
        
        // Remove game
        delete games[gameId];
      }
    }
    
    // Remove player
    delete players[socket.id];
  });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});