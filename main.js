import Phaser from "phaser";

const sizes = {
  width: 500,
  height: 500,
};

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStarBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");

const speedDown = 300;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 50;
    this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
    this.coinMusic;
    this.bgMusic;
    this.emitter;
    this.adShown = false;
    this.isPaused = false;
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.image("basket", "assets/basket.png");
    this.load.image("apple", "assets/apple.png");
    this.load.image("money", "assets/money.png");
    this.load.audio("coin", "assets/coin.mp3");
    this.load.audio("bgMusic", "assets/bgMusic.mp3");
  }

  create() {
    
    this.coinMusic = this.sound.add("coin");
    this.bgMusic = this.sound.add("bgMusic");
    this.bgMusic.play();
    this.bgMusic.stop();

    this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.player = this.physics.add.image(0, sizes.height - 100, "basket").setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.cursor = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);
    this.target = this.physics.add.image(0, 0, "apple").setOrigin(0, 0);

    this.target.setMaxVelocity(0, speedDown);

    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);
    this.player.setSize(80, 15).setOffset(10, 70);

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      fontSize: "20px",
      fill: "#000",
    });
    this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
      fontSize: "20px",
      fill: "#000",
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);

    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.04,
      duration: 100,
      emitting: false,
    });
    this.emitter.startFollow(this.player, this.player.width / 2, this.player.height / 2, true);

    this.time.delayedCall(100, () => {
      this.scene.pause();
    });
  }

  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`);

    if (Math.round(this.remainingTime) === 20 && !this.adShown) {
      this.pauseGame();
      this.showAdDiv();
      this.adShown = true;
    }

    if (this.isPaused) {
      return;
    }

    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }

    const { left, right } = this.cursor;
    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * 480);
  }

  pauseGame() {
    this.scene.pause("scene-game");
    console.log("Game Paused");
  }

  showAdDiv() {
    const adDiv = document.createElement("div");
    adDiv.id = "adDiv";
    adDiv.innerHTML = `
      <p>This is an ad!</p>
      <img src="assets/best-ad-campaigns-3-20240904-3647677.webp" width="100%" alt="Ad Image">
      <button id="closeAdButton">Close Ad</button>
    `;

    document.body.appendChild(adDiv);

    adDiv.style.position = "fixed";
    adDiv.style.top = "50%";
    adDiv.style.left = "50%";
    adDiv.style.transform = "translate(-50%, -50%)";
    adDiv.style.backgroundColor = "white";
    adDiv.style.padding = "20px";
    adDiv.style.border = "2px solid black";
    adDiv.style.borderRadius = "10px";
    adDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    adDiv.style.zIndex = "1000";

    const closeButton = document.getElementById("closeAdButton");
    closeButton.addEventListener("click", () => {
      this.resumeGame();
      document.body.removeChild(adDiv);
    });
  }

  showEndAdDiv() {
    const EndadDiv = document.createElement("div");
    EndadDiv.id = "EndadDiv";
    EndadDiv.innerHTML = `
      <p lass="endshowadtitle" >This is an ad!</p>
         <video id="adVideo" width="100%" autoplay muted loop>
      <source src="assets/videoplayback.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
      <div class="endshowadcounter" id="countdownTimer">Ad will close in 30 seconds...</div>
    `;
  
    document.body.appendChild(EndadDiv);
  
    EndadDiv.style.position = "fixed";
    EndadDiv.style.top = "50%";
    EndadDiv.style.left = "50%";
    EndadDiv.style.transform = "translate(-50%, -50%)";
    EndadDiv.style.backgroundColor = "white";
    EndadDiv.style.padding = "20px";
    EndadDiv.style.border = "2px solid black";
    EndadDiv.style.borderRadius = "10px";
    EndadDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    EndadDiv.style.zIndex = "1000";
  
    // Start the countdown
    let count = 30; // 30 seconds
    const countdownTimer = document.getElementById("countdownTimer");
  
    const countdownInterval = setInterval(() => {
      countdownTimer.textContent = `Ad will close in ${count} seconds...`;
      count--;
  
      // When the countdown reaches 0, replace the timer with the close button
      if (count < 0) {
        clearInterval(countdownInterval);
        countdownTimer.remove(); // Remove the countdown timer
  
        // Add the close button
        const closeButton = document.createElement("button");
        closeButton.id = "closeEndAdButton";
        closeButton.textContent = "Close Ad";
        EndadDiv.appendChild(closeButton);
  
        // Add event listener to the close button
        closeButton.addEventListener("click", () => {
          document.body.removeChild(EndadDiv);
          gameEndDiv.style.display = "block";
        });
      }
    }, 1000); // Update every 1 second
  }

  resumeGame() {
    const countdownDiv = document.createElement("div");
    countdownDiv.id = "countdownDiv";
    countdownDiv.style.position = "fixed";
    countdownDiv.style.top = "50%";
    countdownDiv.style.left = "50%";
    countdownDiv.style.transform = "translate(-50%, -50%)";
    countdownDiv.style.fontSize = "48px";
    countdownDiv.style.color = "white";
    countdownDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    countdownDiv.style.padding = "20px";
    countdownDiv.style.borderRadius = "10px";
    countdownDiv.style.zIndex = "1000";
    document.body.appendChild(countdownDiv);

    let count = 3;
    const countdownInterval = setInterval(() => {
      countdownDiv.textContent = count;
      count--;

      if (count < 0) {
        clearInterval(countdownInterval);
        document.body.removeChild(countdownDiv);
        this.scene.resume("scene-game");
        console.log("Game Resumed");
      }
    }, 1000);
  }

  targetHit() {
    this.coinMusic.play();
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
    this.emitter.start();
  }

  gameOver() {
    this.sys.game.destroy(true);
    if (this.points >= 10) {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Win";
    } else {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Lose";
    }
    this.showEndAdDiv();
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStarBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";

  if (game.scene.isPaused("scene-game")) {
    console.log("Resuming scene...");
    game.scene.resume("scene-game");
  } else if (!game.scene.isActive("scene-game")) {
    console.log("Scene is not active, restarting...");
    game.scene.start("scene-game");
  } else {
    console.log("Scene is already active and running.");
  }
});