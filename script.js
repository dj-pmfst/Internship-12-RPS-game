let states = ["not_started", "pending", "finished"];

let currentGameId = null;
let currentRound = 0;
let rounds = [];
let gameState = states[0];
let playerScore = 0;
let previousGameRounds = [];
let draws = 0;
let scissorsWin = 0;
let rockWin = 0;
let paperWin = 0;

let achievement1 = 0;
let achievement2 = 0;
let achievement3 = 0;

let options = ["rock", "paper", "scissors"];

function newGame(){
    const id = Date.now().toString();
    currentGameId = id;

    if(rounds.length > 0 && gameState === states[2]) {
        previousGameRounds = [...rounds]; 
    }
    
    rounds = []; 
    playerScore = 0; 
    draws = 0;

    rockWin = 0;
    paperWin = 0;
    scissorsWin = 0;
    
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
            playerScore: 0,
            result: null
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
        if(achievement3 > 0){
          unlockLegendarySet();
        }
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

    const bgMusic = document.getElementById('background-music');
    bgMusic.volume = 0.5; 
    bgMusic.play();

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
      draws += 1;
    } else if ((move === 'rock' && computerMove === 'scissors') || 
               (move === 'scissors' && computerMove === 'paper') || 
               (move === 'paper' && computerMove === 'rock')) {
      if(move === 'rock'){rockWin +=1;}
      if(move === 'paper'){paperWin +=1;}
      if(move === 'scissors'){scissorsWin += 1;}  
      result = "Victory";
      playerScore += 1; 
    } else {
      result = "Defeat";
    }

    currentRoundData.playerChoice = move;
    currentRoundData.playerScore = playerScore;
    currentRoundData.result = result; 

    updateDisplay();
    if(currentRound < 5){ 
      showResult(result, move, computerMove);
    }
    else {
      let newAchievements = [];

      if (playerScore === 5 && achievement2 === 0){
        achievement2 = 1;
        newAchievements.push(2);
      }

      if(rockWin > 0 && paperWin > 0 && scissorsWin > 0 && achievement1 === 0){
        achievement1 = 1;
        newAchievements.push(1);
      }

      if(achievement1 > 0 && achievement2 > 0 && achievement3 === 0){
        achievement3 = 1;
        newAchievements.push(3);
      }

      if(newAchievements.length > 0){
        achievementHandle(newAchievements);
      }
      
      showFinalResult(playerScore);
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
  let result = "";
  let computerScore = 5 - playerScore - draws;

  if(playerScore > computerScore){
    document.getElementById('lose').classList.add('hidden');
    document.getElementById('win').classList.remove('hidden');
    document.querySelector('.final-result-window-content').style.backgroundColor = "rgb(178, 247, 161)";  
    result = "You win";
    const winSound = document.getElementById('win-sound');
    winSound.play();
  }
  else if(draws ===5 || playerScore === computerScore){
    document.getElementById('lose').classList.add('hidden');
    document.getElementById('win').classList.add('hidden'); 
    document.querySelector('.final-result-window-content').style.backgroundColor =  "rgb(253, 249, 231)";
    result = "Draw";
  }
  else{
    document.getElementById('win').classList.add('hidden');
    document.getElementById('lose').classList.remove('hidden');
    document.querySelector('.final-result-window-content').style.backgroundColor = "rgb(247, 161, 161)";  
    result = "You lose";
    const loseSound = document.getElementById('lose-sound');
    loseSound.play();
  }

  resultText.textContent = result + "!";
  score.textContent = playerScore + '-' + computerScore;

  window.classList.remove('hidden');
}

function reviewGame(){
    const reviewDiv = document.getElementById('rounds-review');
    const roundsToReview = previousGameRounds.length > 0 ? previousGameRounds : rounds;
    
    if(roundsToReview.length === 0 || !roundsToReview[0].playerChoice || roundsToReview[0].playerChoice === "pending") {
        reviewDiv.innerHTML = '<p>No completed game to review yet. Play a game first!</p>';
    } else {
        let reviewHTML = '';
        
        roundsToReview.forEach((round, index) => {
            const resultClass = round.result ? round.result.toLowerCase() : '';
            
            reviewHTML += `
                <div class="round-item ${resultClass}">
                    <h3>Round ${round.currentRound}</h3>
                    <p><strong>Your choice:</strong> ${round.playerChoice}</p>
                    <p><strong>Computer choice:</strong> ${round.computerChoice}</p>
                    <p><strong>Result:</strong> ${round.result}</p>
                    <p><strong>Score after round:</strong> ${round.playerScore}</p>
                </div>
            `;
        });
        
        reviewDiv.innerHTML = reviewHTML;
    }
    
    document.querySelector('.review-window').classList.remove('hidden');
}

function resetToHome() {
  document.querySelector('.start').classList.add('hidden');
  document.querySelector('.game').classList.add('hidden');
  document.querySelector('.result-window').classList.add('hidden');
  document.querySelector('.final-result-window').classList.add('hidden');
  
  document.querySelector('.new__game').classList.remove('hidden');

  const reviewButtons = document.querySelectorAll('.game--button');
  reviewButtons.forEach(button => {
      if(button.textContent === 'Review game') {
          button.parentElement.classList.remove('hidden');
      }
  });

  currentRound = 0;
  gameState = states[0];

  const bgMusic = document.getElementById('background-music');
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function updateDisplay() {
  const scoreboard = document.querySelector('.scoreboard');
  scoreboard.innerHTML = `
      <div>Round: ${currentRound}</div>
      <div>Score: ${playerScore}</div>
  `;
}

function achievementHandle(newAchievements){
  const text = document.getElementById('achievement-popup-list');
  let achievementText = "";

  newAchievements.forEach(ach => {
    if(ach === 1){
      achievementText += "\nWin with rock, paper and scissors!\n";
      document.getElementById('a2').style.backgroundColor = "rgb(178, 247, 161)";
    }
    if(ach === 2){
      achievementText += "\nWin all 5 rounds!\n";
      document.getElementById('a1').style.backgroundColor = "rgb(178, 247, 161)";
    }
    if(ach === 3){
      achievementText += "Gather all achievements! \nReward: Legendary Set!\n";
      document.getElementById('a3').style.backgroundColor = "rgb(178, 247, 161)";
    }
  });
  
  text.textContent = achievementText;
  document.querySelector('.achievement-popup').classList.remove('hidden');
}

function unlockLegendarySet(){
  const image = document.getElementById('rock');
  image.src = 'media/gold.png';
  const image2 = document.getElementById('paper');
  image2.src = 'media/gold-paper.png';
  const image3 = document.getElementById('scissors');
  image3.src = 'media/scissors_gold.png';
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.start').classList.add('hidden');
  document.querySelector('.game').classList.add('hidden');
  document.querySelector('.result-window').classList.add('hidden');
  document.querySelector('.final-result-window').classList.add('hidden');
  document.querySelector('.review-window').classList.add('hidden');
  
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
  const hoverSounds = ['hover-rock-sound', 'hover-paper-sound', 'hover-scissors-sound'];
  const choices = ['rock', 'paper', 'scissors'];
  
  optionButtons.forEach((button, index) => {
    button.addEventListener('mouseenter', function() {
      const sound = document.getElementById(hoverSounds[index]);
      sound.currentTime = 0;
      sound.play();
    });

    button.addEventListener('click', function() {
      handleChoices(choices[index]);
    });
  });

  const achievementsToggle = document.getElementById('achievements-toggle');
  const achievementList = document.querySelector('.achievement-list');
  
  achievementsToggle.addEventListener('click', function() {
      achievementList.classList.toggle('hidden');
  });

  const continueBtn = document.getElementById('continue-btn');
  continueBtn.addEventListener('click', function() {
      document.querySelector('.result-window').classList.add('hidden');
      roundProgress();
  });
  
  const finalContinueBtn = document.getElementById('final-continue-btn');
  finalContinueBtn.addEventListener('click', resetToHome);
  
  const reviewGameButton = document.querySelector('.game--button');
  const allButtons = document.querySelectorAll('.game--button');
  allButtons.forEach(button => {
      if(button.textContent.trim() === 'Review game') {
          button.addEventListener('click', reviewGame);
      }
  });
  
  const reviewCloseBtn = document.getElementById('review-close-btn');
  reviewCloseBtn.addEventListener('click', function() {
      document.querySelector('.review-window').classList.add('hidden');
  });

  const achievementCloseBtn = document.getElementById('achievement-popup-close');
  achievementCloseBtn.addEventListener('click', function() {
    document.querySelector('.achievement-popup').classList.add('hidden');

    if(achievement3 > 0){
      unlockLegendarySet();
    }
  });
});