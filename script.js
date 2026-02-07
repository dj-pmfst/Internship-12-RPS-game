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

        fetch('YOUR_API_URL/rounds', {
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
};

function start(){

};
