import Canvas from "./canvas.js";
import Config from "./config.js";
import RefreshGame from "./gameFeatures.js";

export default class Pipe {
  constructor() {
    this.pipeUp = new Image();
    this.pipeUp.src = "Images/pipeUp.png";

    this.pipeBottom = new Image();
    this.pipeBottom.src = "Images/pipeBottom.png";

    this.canvas = new Canvas();
    this.config = new Config();
    this.refreshGame = new RefreshGame();

    this.newPipeAdded = false;
    this.hasBeenScored = false;
    this.gap = 130;

    const isMobile = window.innerWidth < 768;

    this.speed = isMobile
      ? Math.floor(this.canvas.element.width / 100)
      : Math.floor(this.canvas.element.width / 200);
    this.spaceBetweenPipe = isMobile
      ? this.canvas.element.width / 4
      : this.canvas.element.width / 1.3;

    this.pipes = [
      {
        x: this.canvas.element.width,
        y: 0,
      },
    ];

    this.btnRestart = document.querySelector(".btn-flappy-dante");

    this.danteCollisionPositionY = 485;
  }

  didCollide(dante, pipe) {
    const scaledForegroundHeight =
      this.canvas.foreground.height * this.canvas.scaleFactor;

    const danteBottomEdge = dante.dantePositionY + dante.danteHeight;

    const playableAreaHeight =
      (this.canvas.element.height - scaledForegroundHeight) /
      this.canvas.scaleFactor;

    const hitGround = danteBottomEdge >= playableAreaHeight;

    const danteHitsPipeHorizontally =
      dante.dantePositionX + dante.danteWidth * this.canvas.scaleFactor >=
        pipe.x && dante.dantePositionX <= pipe.x + this.pipeUp.width;
    const danteHitsTopPipeVertically =
      dante.dantePositionY <= pipe.y - 5 + this.pipeUp.height - 200;
    const danteHitsBottomPipeVertically =
      dante.dantePositionY + dante.danteHeight >=
      pipe.y + this.pipeUp.height + this.gap - 200;
    return (
      (danteHitsPipeHorizontally &&
        (danteHitsTopPipeVertically || danteHitsBottomPipeVertically)) ||
      hitGround
    );
  }

  doGameOver(gameLoop, dante, score, windowGameOver, medal) {
    gameLoop.cancelAnimation();

    document.addEventListener("click", () => {
      dante.flyDante.pause();
    });

    document.addEventListener("touchstart", () => {
      dante.flyDante.pause();
    });

    dante.dantePositionY = this.danteCollisionPositionY;
    dante.dieDante.play();

    score.bestScoreRecord();
    windowGameOver.draw(score._score, score._bestScore, medal);
    score._score = "";

    this.btnRestart.classList.add("active");
    this.btnRestart.addEventListener("click", this.refreshGame.restart);

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.refreshGame.restart();
      }
    });
  }

  update(dante, gameLoop, windowGameOver, score, medal) {
    this.pipes.forEach((pipe) => {
      pipe.x -= this.speed;
      if (pipe.x < this.spaceBetweenPipe && !pipe.newPipeAdded) {
        this.pipes.push({
          x: this.canvas.element.width,
          y:
            Math.floor(Math.random() * (this.pipeUp.height - 100)) -
            (this.pipeUp.height - 300),
        });
        pipe.newPipeAdded = true;
      }

      if (pipe.x + this.pipeUp.width * this.canvas.scaleFactor <= 0) {
        this.pipes.shift();
      }

      if (pipe.x < dante.dantePositionX && !pipe.hasBeenScored) {
        score.increaseScore();
        score.audioScore.play();
        pipe.hasBeenScored = true;
      }

      const didCollide = this.didCollide(dante, pipe);

      if (didCollide) {
        this.doGameOver(gameLoop, dante, score, windowGameOver, medal);
      }
    });
  }

  draw() {
    this.config.index += 0.3;
    this.canvas.backgroundX = -(
      (this.config.index * this.config.speedBackground) %
      this.canvas.element.width
    );
    this.canvas.context.drawImage(
      this.canvas.background,
      this.canvas.backgroundX,
      0,
      this.canvas.element.width,
      this.canvas.element.height
    );
    if (this.canvas.backgroundX < 0) {
      this.canvas.context.drawImage(
        this.canvas.background,
        this.canvas.backgroundX + this.canvas.element.width,
        0,
        this.canvas.element.width,
        this.canvas.element.height
      );
    }

    this.pipes.forEach((pipe) => {
      let scaledGap = this.gap * this.canvas.scaleFactor;
      let pipeYPosition = (pipe.y - 200) * this.canvas.scaleFactor; // Example adjustment

      this.canvas.context.drawImage(
        this.pipeUp,
        pipe.x,
        pipeYPosition,
        this.pipeUp.width * this.canvas.scaleFactor,
        this.pipeUp.height * this.canvas.scaleFactor
      );
      this.canvas.context.drawImage(
        this.pipeBottom,
        pipe.x,
        pipeYPosition +
          this.pipeUp.height * this.canvas.scaleFactor +
          scaledGap,
        this.pipeBottom.width * this.canvas.scaleFactor,
        this.pipeBottom.height * this.canvas.scaleFactor
      );
    });

    let scaledForegroundHeight =
      this.canvas.foreground.height * this.canvas.scaleFactor;
    let foregroundYPosition =
      this.canvas.element.height - scaledForegroundHeight;

    this.canvas.context.drawImage(
      this.canvas.foreground,
      this.canvas.backgroundX,
      foregroundYPosition,
      this.canvas.element.width,
      scaledForegroundHeight
    );
    if (this.canvas.backgroundX < 0) {
      this.canvas.context.drawImage(
        this.canvas.foreground,
        this.canvas.backgroundX + this.canvas.element.width,
        foregroundYPosition,
        this.canvas.element.width,
        scaledForegroundHeight
      );
    }
  }
}
