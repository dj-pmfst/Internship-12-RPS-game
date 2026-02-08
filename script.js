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
    document.getElementsByClassName('start').disabled = false;
};

document.getElementsByClassName('new__game').addEventListener('click', newGame());

function start(){
    document.getElementsByClassName(start).disabled = false;
    document.getElementsByClassName('new__game').disabled = true;

    currentRound = 1;
    gameState = states[1];

    fetch(`https://restful-api.dev/rounds?gameId=${currentGameId}&roundNumber=1`, {
      method: 'GET'}).then(response => response.json()).then(data => {
          let currentRoundData = data;
          //dodt korisnik display 
      })
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
        playerMove: playerChoice
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
}

document.getElementById('rock-button').addEventListener('click', function() {
  handleChoices('rock');
});

document.getElementById('paper-button').addEventListener('click', function() {
  handleChoices('paper');
});

document.getElementById('scissors-button').addEventListener('click', function() {
  handleChoices('scissors');
});
