let states = ["not_started", "pending", "finished"];

let currentGameId = null;
let currentRound = 0;
let rounds = [];
let gameState = states[0];
let playerScore = 0;

let options = ["rock", "paper", "scissors"];

function newGame(){
    const id = Date.now().toString();
    currentGameId = id;
    rounds = []; 
    playerScore = 0; 
    
    let promises = []; 
    
    for(let i = 0; i < 5; i++){
        const round = {
            name: `Game ${id} - Round ${i + 1}`, 
            data: {
                currentGameId: id,
                currentRound: i + 1,
                computerChoice: options[Math.floor(Math.random() * 3)],
                playerChoice: "pending",
                playerScore: 0
            }
        };

        const localRound = {
            id: null,
            currentGameId: id,
            currentRound: i + 1,
            computerChoice: round.data.computerChoice,
            playerChoice: "pending",
            playerScore: 0
        };
        rounds.push(localRound);

        const promise = fetch('https://api.restful-api.dev/objects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(round)
          })
          .then(response => response.json())
          .then(data => {
              console.log('Round created:', data);
              rounds[i].id = data.id;
          })
          .catch(error => console.error('Error:', error));
          
        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        console.log('All rounds created:', rounds);
        document.querySelector('.new__game').classList.add('hidden');
        document.querySelector('.start').classList.remove('hidden');
    });
}

function start(){
    document.querySelector('.start').classList.add('hidden');
    document.querySelector('.game').classList.remove('hidden');

    currentRound = 1;
    gameState = states[1];

    updateDisplay();
}

function handleChoices(move){
    const currentRoundData = rounds[currentRound - 1];
    const roundId = currentRoundData.id; 
    const computerMove = currentRoundData.computerChoice;
    let result = "";

    if (roundId) {
        fetch(`https://api.restful-api.dev/objects/${roundId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `Game ${currentGameId} - Round ${currentRound}`,
            data: {
                currentGameId: currentGameId,
                currentRound: currentRound,
                computerChoice: computerMove,
                playerChoice: move,
                playerScore: playerScore
            }
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Round updated:', data);
        })
        .catch(error => {
          console.error('Error updating round:', error);
        });
    }

    if (move === computerMove) {
      result = "Draw";
    } else if ((move === 'rock' && computerMove === 'scissors') || 
               (move === 'scissors' && computerMove === 'paper') || 
               (move === 'paper' && computerMove === 'rock')) {
      result = "Victory";
      playerScore += 1; 
    } else {
      result = "Defeat";
    }

    currentRoundData.playerChoice = move;
    currentRoundData.playerScore = playerScore;

    updateDisplay();
    if(currentRound < 5){ 
      showResult(result, move, computerMove);
    }
    else {
      showFinalResult(playerScore)
    }
}

function roundProgress(){
  if(currentRound < 5){
    currentRound += 1; 
    
    updateDisplay();
  } else {
    gameState = states[2];
    document.querySelector('.game').classList.add('hidden');
    document.querySelector('.final-result-window').classList.remove('hidden');
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

function showFinalResult(playerScore) {
  const window = document.querySelector('.final-result-window');
  const resultText = document.getElementById('final-result-text');
  const score = document.getElementById('score');

  if(playerScore >= 3){
    document.getElementById('lose').classList.add('hidden');
    document.querySelector('.final-result-window-content').style.backgroundColor = "rgb(178, 247, 161)";  
    result = "You win";
  }
  else{
    document.getElementById('win').classList.add('hidden');
    document.querySelector('.final-result-window-content').style.backgroundColor = "rgb(247, 161, 161)";  
    result = "You lose";
  }

  resultText.textContent = result + "!";
  score.textContent = playerScore + '-' + (5-playerScore);

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
  document.querySelector('.result-window').classList.add('hidden');
  document.querySelector('.final-result-window').classList.add('hidden');
  
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