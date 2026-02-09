let states = ["not_started", "pending", "finished"];

let currentGameId = null;
let currentRound = 0;
let rounds = [];
let gameState = states[0];
let playerScore = 0;

let options = ["rock", "paper", "scissors"];

function newGame(){
    const id = Date.now().toString();
    for(let i = 0; i < 5; i++){
        const round = {
            currentGameId: id,
            currentRound: i,
            computerChoice: options[Math.floor(Math.random() * 3)],
            playerChoice: states[1],
            playerScore: 0            
        };
        rounds.push(round);

        fetch('https://restful-api.dev/rounds', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(round)
          })
          .then(response => response.json())
          .then(data => console.log('Round created:', data))
          .catch(error => console.error('Error:', error));
    };  
    document.querySelector('.new__game').classList.add('hidden');
    document.querySelector('.start').classList.remove('hidden');
};

function start(){
    document.querySelector('.start').classList.add('hidden');
    document.querySelector('.game').classList.remove('hidden');

    currentRound = 1;
    gameState = states[1];

    updateDisplay();

    fetch(`https://restful-api.dev/rounds?gameId=${currentGameId}&roundNumber=1`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        let currentRoundData = data;
        // ddot disply
        updateDisplay();
    })
    .catch(error => console.error('Error:', error));
};

function handleChoices(move){
    const roundId = rounds[currentRound - 1].id; 
    const computerMove = rounds[currentRound - 1].computerMove;
    const result = null;

    fetch(`https://restful-api.dev/rounds/${roundId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerMove: move
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Round updated:', data);
    })
    .catch(error => {
      console.error('Error updating round:', error);
    });

    if (move === computerMove) {
      result = "Draw";
    }
    
    if ((move === 'rock' && computerMove === 'scissors') || (move === 'scissors' && computerMove === 'paper') || (move === 'paper' && computerMove === 'rock')) 
    {
      result = "Victory";
      rounds[currentRound - 1].playerScore += 1;
    } 
    else {
      result = "Defeat";
    }

    rounds[currentRound - 1].playerMove = playerChoice;

    updateDisplay();
    showResultModal(result, move, computerMove);
}

function roundProgress(){
  const roundNumber = rounds[currentRound - 1].currentRound += 1;

  if(roundNumber <= 5){
    const nextRoundId = rounds[currentRound - 1].id;
    
    updateDisplay();

    fetch(`YOUR_API_URL/rounds/${nextRoundId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Round ${currentRound} loaded:`, data);
      //clearat display
    })
    .catch(error => {
      console.error('Error fetching next round:', error);
    });
  }
  if (roundNumber > 5){
    gameState = states[2];
    document.querySelector('.game').classList.add('hidden');
    document.querySelector('.result').classList.remove('hidden');
  }
}

function showResult(result, playerChoice, computerChoice) {
  const window = document.querySelector('.result-window');
  const resultText = document.getElementById('result-text');
  const playerChoiceSpan = document.getElementById('player-choice');
  const computerChoiceSpan = document.getElementById('computer-choice');

  resultText.textContent = result + "!";
  playerChoiceSpan.textContent = playerChoice;
  computerChoiceSpan.textContent = computerChoice;

  window.classList.remove('hidden');
}

function reviewGame(){

}

function updateDisplay() {
  const scoreboard = document.querySelector('.scoreboard');
  scoreboard.innerHTML = `
      <div>Round: ${currentRound}</div>
      <div>Score: ${playerScore}</div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.start').classList.add('hidden');
  document.querySelector('.game').classList.add('hidden');
  document.querySelector('.result').classList.add('hidden');
  document.querySelector('.result-window').classList.add('hidden');
  
  const reviewButtons = document.querySelectorAll('.game--button');
  reviewButtons.forEach(button => {
      if(button.textContent === 'Review game') {
          button.parentElement.classList.add('hidden');
      }
  });

  const newGameButton = document.querySelector('.new__game .game--button');
  newGameButton.addEventListener('click', newGame);

  const startButton = document.querySelector('.start .game--button');
  startButton.addEventListener('click', start);

  const optionButtons = document.querySelectorAll('.options button');
  optionButtons[0].addEventListener('click', function() {
      handleChoices('rock');
  });
  optionButtons[1].addEventListener('click', function() {
      handleChoices('paper');
  });
  optionButtons[2].addEventListener('click', function() {
      handleChoices('scissors');
  });

  const continueBtn = document.getElementById('continue-btn');
  continueBtn.addEventListener('click', function() {
      document.querySelector('.result-window').classList.add('hidden');

      roundProgress();
  });
});