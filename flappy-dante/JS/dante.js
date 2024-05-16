import Canvas from "./canvas.js";
import Config from "./config.js";

export default class dante {
  constructor() {
    this.canvas = new Canvas();
    this.config = new Config();

    this.imageDante = new Image();
    this.imageDante.src = "Images/dante.png";

    this.flyDante = new Audio();
    this.flyDante.src = "audio/fly.wav";

    this.dieDante = new Audio();
    this.dieDante.src = "audio/die.wav";

    this.danteWidth = 35;
    this.danteHeight = 25;
    this.danteJump = 1;

    this.danteX = 0;
    this.dantePositionX = this.canvas.element.width / 2 - this.danteWidth / 1.5;

    this.danteY;
    this.dantePositionY = 239;

    this.targetDantePositionY = this.canvas.height; // Set the initial target position to be the bottom of the screen
    this.lerpRate = 0.3;
    this.velocityY = 0;
    this.lift = -8; // The force of the jump (negative because it goes up)
    this.maxDownwardsSpeed = 5;
    this.maxUpwardsSpeed = -10;

    this.control();
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  update() {
    // Apply gravity
    this.velocityY += this.config.gravity;
    this.dantePositionY += this.velocityY;

    // Limit speed
    if (this.velocityY > this.maxDownwardsSpeed) {
      this.velocityY = this.maxDownwardsSpeed;
    } else if (this.velocityY < this.maxUpwardsSpeed) {
      this.velocityY = this.maxUpwardsSpeed;
    }

    // Prevent dante from going off the top of the screen
    if (this.dantePositionY < 0) {
      this.dantePositionY = 0;
      this.velocityY = 0;
    }
  }

  draw() {
    this.config.index += 0.3;
    this.danteY =
      Math.floor((this.config.index % 9) / 3) * (this.danteWidth - 9);

    let scaledDanteWidth = this.danteWidth * this.canvas.scaleFactor;
    let scaledDanteHeight = this.danteHeight * this.canvas.scaleFactor;
    let scaledPositionX = this.dantePositionX;
    let scaledPositionY = this.dantePositionY * this.canvas.scaleFactor;

    this.canvas.context.drawImage(
      this.imageDante,
      this.danteX,
      this.danteY,
      this.danteWidth,
      this.danteHeight,
      scaledPositionX,
      scaledPositionY,
      scaledDanteWidth,
      scaledDanteHeight
    );
  }

  jump() {
    this.velocityY = this.lift;
    this.flyDante.play();
  }

  control() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      this.canvas.element.addEventListener("touchstart", () => {
        this.jump();
      });
    } else {
      this.canvas.element.addEventListener("click", () => {
        this.jump();
      });

      document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
          this.jump();
        }
      });
    }
  }
}
