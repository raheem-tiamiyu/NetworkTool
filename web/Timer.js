class Timer {
  constructor() {
    this.start = Date.now();
    this.stop = false;
  }
  displayTimer() {
    // update timer every second
    setInterval(() => {
      if (!this.stop) {
        const timeElapsed = Date.now() - this.start;
        const sec = Math.floor(timeElapsed / 1000);
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        document.getElementById(
          "time"
        ).innerHTML = `${minutes} minute(s):${seconds} seconds`;
      }
    }, 1000);
  }

  startTimer() {
    this.start = Date.now();
    this.stop = false;
  }
  stopTimer() {
    this.stop = true;
  }
}
