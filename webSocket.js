// Dependencies
const io = require('socket.io')(3000);
const Deck = require('./models/deck');
const { v4: uuidv4 } = require('uuid');
const RealPlayer = require('./models/player/realPlayer');
const createSpecialMode = require('./modules/helper').createSpecialMode;
const DEFAULT_COMPARATOR = process.env.DEFAULT_COMPARATOR || 'max';

// Game state
const games = {};
const players = {};

// Generate a unique game ID
function generateUniqueGameId() {
  return uuidv4().split('-')[0];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create real player instance
  players[socket.id] = new RealPlayer(socket.id);

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
      score: {},
      health: {}
    };

    players[socket.id].inGame = true;
    players[socket.id].gameId = gameId;

    socket.join(gameId);

    socket.emit('game_created', {
      gameId: gameId,
      playerId: socket.id
    });

    console.log(`Game created: ${gameId} by player ${socket.id}`);
  });

  // Player selects special mode
  socket.on('select_special_mode', ({ gameId, modeName }) => {
    if (!games[gameId]) return;
    players[socket.id].setSpecialMode(createSpecialMode(modeName));
    socket.emit('special_mode_selected', { mode: modeName });
  });

  // Activate special mode
  socket.on('activate_special_mode', ({ gameId, playerId }) => {
    if (!games[gameId] || !games[gameId].specialModes[playerId]) return;
    const mode = games[gameId].specialModes[playerId];
    if (mode && !mode.activated) {
      // mode.activate();
      players[playerId].updateSpecialModeCounter();
      games[gameId].modeActivated[playerId] = true;
      io.to(gameId).emit('special_mode_activated', { playerId, mode: mode.name });
    }
  });

  // Join game
  socket.on('join_game', (data) => {
    const { gameId } = data;

    if (!games[gameId]) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (games[gameId].players.length >= 2) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }

    games[gameId].players.push(socket.id);

    players[socket.id].inGame = true;
    players[socket.id].gameId = gameId;

    const player1Id = games[gameId].players[0];
    const player2Id = socket.id;

    const deck = new Deck();
    const cards1 = deck.dealCards(10);
    const cards2 = deck.dealCards(10);

    players[player1Id].assignCards(cards1);
    players[player2Id].assignCards(cards2);

    games[gameId].turn = player1Id;
    games[gameId].score[player1Id] = 0;
    games[gameId].score[player2Id] = 0;
    games[gameId].health[player1Id] = 100;
    games[gameId].health[player2Id] = 100;

    socket.join(gameId);

    io.to(player1Id).emit('game_joined', {
      gameId: gameId,
      playerId: player1Id,
      opponentId: player2Id,
      cards: players[player1Id].cards,
      turn: games[gameId].turn
    });

    socket.emit('game_joined', {
      gameId: gameId,
      playerId: player2Id,
      opponentId: player1Id,
      cards: players[player2Id].cards,
      turn: games[gameId].turn
    });

    console.log(`Player ${socket.id} joined game ${gameId}, first turn: ${games[gameId].turn}`);
  });

  // Card selection
  socket.on('select_card', (data) => {
    const { gameId, playerId, card } = data;
    if (!games[gameId]) return;

    console.log(`Player ${playerId} selected card ${card.name} in game ${gameId}`);

    // Remove card from player's deck
    players[playerId].cards = players[playerId].cards.filter(c => c.playerName !== card.playerName);
    games[gameId].selectedCards[playerId] = card;
    const opponentId = games[gameId].players.find(p => p !== playerId);

    if (opponentId) {
      socket.to(opponentId).emit('opponent_selected_card', {
        card: { id: card.id, playerName: card.name }
      });
    }

    const allSelected = games[gameId].players.every(
      pId => !!games[gameId].selectedCards[pId]
    );

    if (allSelected) {
      io.to(gameId).emit('turn_update', {
        turn: games[gameId].turn
      });
    }
  });

  // Attribute selection
  socket.on('select_attribute', (data) => {
    const { gameId, playerId, attribute } = data;

    if (!games[gameId]) return;
    games[gameId].currentAttribute = attribute;

    const [player1Id, player2Id] = games[gameId].players;
    const card1 = games[gameId].selectedCards[player1Id];
    const card2 = games[gameId].selectedCards[player2Id];

    if (!card1 || !card2) return;

    io.to(gameId).emit('attribute_selected', {
      attribute,
      playerId
    });

    let winner = null,activeModeP1 = null,activeModeP2 = null;
    let nextTurn = null;

    const attr1 = card1.attributes[attribute];
    const attr2 = card2.attributes[attribute];
    
    if (!attr1 || !attr2) return;
    
    const comparison = attr1.compare(attr2, DEFAULT_COMPARATOR);
    // const activeModeP1 = games[gameId].modeActivated[player1Id] ? games[gameId].specialModes[player1Id] : null;
    // const activeModeP2 = games[gameId].modeActivated[player2Id] ? games[gameId].specialModes[player2Id] : null;
    
    if (comparison > 0) {
      winner = player1Id;
      games[gameId].score[player1Id] += 1;
      const opponentDamage = activeModeP1 ? activeModeP1.getOpponentDamage() : 10;
      const lossHit = activeModeP2 ? activeModeP2.getLossHit() : 10;
      players[player2Id].loseHealth(opponentDamage>lossHit?opponentDamage:lossHit);
      nextTurn = player1Id;
    } else if (comparison < 0) {
      winner = player2Id;
      games[gameId].score[player2Id] += 1;
      const opponentDamage = activeModeP2 ? activeModeP2.getOpponentDamage() : 10;
      const lossHit = activeModeP1 ? activeModeP1.getLossHit() : 10;
      players[player1Id].loseHealth(opponentDamage>lossHit?opponentDamage:lossHit);
      nextTurn = player2Id;
    } else {
      nextTurn = games[gameId].turn; // draw
    }

    games[gameId].turn = nextTurn;

    setTimeout(() => {
      io.to(player1Id).emit('round_result', {
        result: winner === player1Id ? 'win' : winner === player2Id ? 'lose' : 'draw',
        score: {
          player: games[gameId].score[player1Id],
          opponent: games[gameId].score[player2Id]
        },
        health: {
          player: players[player1Id].health,
          opponent: players[player2Id].health
        },
        nextTurn,
        attribute
      });

      io.to(player2Id).emit('round_result', {
        result: winner === player2Id ? 'win' : winner === player1Id ? 'lose' : 'draw',
        score: {
          player: games[gameId].score[player2Id],
          opponent: games[gameId].score[player1Id]
        },
        health: {
          player: players[player2Id].health,
          opponent: players[player1Id].health
        },
        nextTurn,
        attribute
      });
    }, 1000);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const player = players[socket.id];
    if (player?.inGame) {
      const gameId = player.gameId;
      const game = games[gameId];
      if (game) {
        const opponentId = game.players.find(p => p !== socket.id);
        if (opponentId) {
          io.to(opponentId).emit('opponent_disconnected');
        }
        delete games[gameId];
      }
    }
    delete players[socket.id];
  });
});
