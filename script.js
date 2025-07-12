class ChodleGame {
    constructor() {
        this.currentRound = 1;
        this.totalRounds = 5;
        this.score = 0;
        this.streak = 0;
        this.gameQuestions = [];
        this.currentQuestion = null;
        this.gameEnded = false;
        this.attemptsRemaining = 4;
        this.quartersRevealed = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeElements() {
        this.gameImage = document.getElementById('game-image');
        this.loading = document.getElementById('loading');
        this.imageOverlay = document.getElementById('image-overlay');
        this.quarters = [
            document.getElementById('quarter-1'),
            document.getElementById('quarter-2'),
            document.getElementById('quarter-3'),
            document.getElementById('quarter-4')
        ];
        this.choicesContainer = document.getElementById('choices-container');
        this.choiceButtons = document.querySelectorAll('.choice-btn');
        this.currentRoundElement = document.getElementById('current-round');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.attemptsElement = document.getElementById('attempts-count');
        this.progressFill = document.getElementById('progress-fill');
        this.feedback = document.getElementById('feedback');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
    }

    setupEventListeners() {
        this.choiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChoice(e));
        });
        
        this.nextBtn.addEventListener('click', () => this.nextRound());
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }

    // Game questions with images and multiple choice options
    generateGameQuestions() {
        const allQuestions = [
            {
                image: "images/luxon.png",
                correct: "Chode",
                choices: ["Chode", "Burger", "Sorted", "Pizza"]
            },
            {
                image: "images/seymour.png",
                correct: "Chode",
                choices: ["Sandwich", "Hot Dog", "School Lunch","Chode" ]
            },
            {
                image: "images/willis.png",
                correct: "Chode",
                choices: ["Budget","Chode","TV Show","Movie"]
            },
            {
                image: "images/vanVelden.png",
                correct: "Chode",
                choices: ["Chode","Workplace","Tree","Time"]
            },
            {
                image: "images/collins.png",
                correct: "Chode",
                choices: ["Crusher","Chode","Whack","20 bucks"]
            },
            {
                image: "images/jones.png",
                correct: "Chode",
                choices: ["Coal","Train","Chode","NZ"]
            }
        ];

        // Shuffle and select 5 questions for the game
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        this.gameQuestions = shuffled.slice(0, this.totalRounds);
        
        // Shuffle the choices for each question
        this.gameQuestions.forEach(question => {
            question.choices = question.choices.sort(() => 0.5 - Math.random());
        });
    }

    initializeGame() {
        this.generateGameQuestions();
        this.loadCurrentQuestion();
        this.updateStats();
    }

    loadCurrentQuestion() {
        if (this.currentRound > this.totalRounds) {
            this.endGame();
            return;
        }

        this.currentQuestion = this.gameQuestions[this.currentRound - 1];
        this.attemptsRemaining = 4;
        this.quartersRevealed = 0;
        
        this.showLoading();
        this.resetChoices();
        this.resetImageReveal();
        this.clearFeedback();
        this.hideControls();
        this.updateProgress();

        // Load image
        this.gameImage.onload = () => {
            this.hideLoading();
            this.revealNextQuarter(); // Reveal first quarter immediately
        };
        
        this.gameImage.onerror = () => {
            this.hideLoading();
            this.showFeedback("Error loading image. Please try again.", "incorrect");
        };

        this.gameImage.src = this.currentQuestion.image;

        // Set up choices
        this.choiceButtons.forEach((btn, index) => {
            btn.textContent = this.currentQuestion.choices[index];
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect', 'disabled');
        });
    }

    resetImageReveal() {
        this.quarters.forEach(quarter => {
            quarter.classList.remove('revealed');
        });
        this.quartersRevealed = 0;
    }

    revealNextQuarter() {
        if (this.quartersRevealed < 4) {
            // Reveal quarters in a specific order for better gameplay
            const revealOrder = [0, 3, 1, 2]; // Top-left, bottom-right, top-right, bottom-left
            const quarterIndex = revealOrder[this.quartersRevealed];
            
            this.quarters[quarterIndex].classList.add('revealed');
            this.quartersRevealed++;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progressPercentage = (this.quartersRevealed / 4) * 100;
        this.progressFill.style.width = `${progressPercentage}%`;
        this.attemptsElement.textContent = this.attemptsRemaining;
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.gameImage.style.opacity = '0.3';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.gameImage.style.opacity = '1';
    }

    resetChoices() {
        this.choiceButtons.forEach(btn => {
            btn.classList.remove('correct', 'incorrect', 'disabled');
            btn.disabled = false;
        });
    }

    clearFeedback() {
        this.feedback.textContent = '';
        this.feedback.classList.remove('correct', 'incorrect');
    }

    hideControls() {
        this.nextBtn.style.display = 'none';
        this.restartBtn.style.display = 'none';
    }

    handleChoice(event) {
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const isCorrect = selectedAnswer === this.currentQuestion.correct;

        // Calculate points based on how many quarters were revealed
        let pointsAwarded = 0;
        if (isCorrect) {
            // More points for guessing with fewer reveals
            pointsAwarded = Math.max(1, 5 - this.quartersRevealed) * 5;
        }

        // Disable all buttons
        this.choiceButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });

        // Update score and streak
        if (isCorrect) {
            this.score += pointsAwarded;
            this.streak++;
            this.showFeedback(`Correct! +${pointsAwarded} points`, "correct");
            
            // Show correct answer and reveal remaining quarters
            this.choiceButtons.forEach(btn => {
                if (btn.textContent === this.currentQuestion.correct) {
                    btn.classList.add('correct');
                }
            });
            this.revealAllQuarters();
            this.showNextButton();
        } else {
            this.attemptsRemaining--;
            
            // Only show incorrect styling on the selected button
            selectedButton.classList.add('incorrect');
            
            if (this.attemptsRemaining > 0) {
                this.streak = 0;
                this.showFeedback(`Incorrect! Try again with more of the image revealed.`, "incorrect");
                this.revealNextQuarter();
                this.updateProgress();
                // Re-enable buttons for next attempt
                setTimeout(() => {
                    this.choiceButtons.forEach(btn => {
                        btn.disabled = false;
                        btn.classList.remove('disabled', 'incorrect');
                    });
                }, 1500);
                return;
            } else {
                // Final attempt - show correct answer
                this.streak = 0;
                this.showFeedback(`No more attempts! The answer was "${this.currentQuestion.correct}"`, "incorrect");
                this.choiceButtons.forEach(btn => {
                    if (btn.textContent === this.currentQuestion.correct) {
                        btn.classList.add('correct');
                    }
                });
                this.revealAllQuarters();
                this.showNextButton();
            }
        }

        this.updateStats();
    }

    revealAllQuarters() {
        this.quarters.forEach(quarter => {
            quarter.classList.add('revealed');
        });
        this.quartersRevealed = 4;
        this.updateProgress();
    }

    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.classList.add(type);
    }

    showNextButton() {
        if (this.currentRound < this.totalRounds) {
            this.nextBtn.style.display = 'inline-block';
        } else {
            // Last round - show final score
            setTimeout(() => {
                this.endGame();
            }, 2000);
        }
    }

    nextRound() {
        this.currentRound++;
        this.loadCurrentQuestion();
        this.updateStats();
    }

    updateStats() {
        this.currentRoundElement.textContent = this.currentRound;
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
    }

    endGame() {
        this.gameEnded = true;
        const maxPossibleScore = this.totalRounds * 20; // Max 20 points per round
        const percentage = Math.round((this.score / maxPossibleScore) * 100);
        let message = `Game Complete! Final Score: ${this.score}/${maxPossibleScore} (${percentage}%)`;
        
        if (percentage >= 80) {
            message += " 🏆 Excellent!";
        } else if (percentage >= 60) {
            message += " 👍 Good job!";
        } else {
            message += " 💪 Keep practicing!";
        }
        
        this.showFeedback(message, percentage >= 60 ? "correct" : "incorrect");
        this.restartBtn.style.display = 'inline-block';
    }

    restartGame() {
        this.currentRound = 1;
        this.score = 0;
        this.streak = 0;
        this.gameEnded = false;
        this.attemptsRemaining = 4;
        this.quartersRevealed = 0;
        this.initializeGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChodleGame();
});