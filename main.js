// Selecting all required elements
const startBtn = document.querySelector(".start_btn button");
const infoBox = document.querySelector(".info_box");
const exitBtn = infoBox.querySelector(".buttons .quit");
const continueBtn = infoBox.querySelector(".buttons .restart");
const quizBox = document.querySelector(".quiz_box");
const resultBox = document.querySelector(".result_box");
const optionList = document.querySelector(".option_list");
const timeLine = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const nextBtn = document.querySelector("footer .next_btn");
const bottomCounter = document.querySelector("footer .total_que");

// Creating new div tags for icons
let successIcon = '<div class="icon success"><i class="fas fa-check"></i></div>';
let failIcon = '<div class="icon fail"><i class="fas fa-times"></i></div>';

// Set variables
let questionIndex = 0;
let questionNumber = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;
let timeValue = 20;

// If startQuiz button is clicked
startBtn.addEventListener("click", () => {
  infoBox.classList.add("activeInfo");
});

// If exitQuiz button is clicked
exitBtn.addEventListener("click", () => {
  infoBox.classList.remove("activeInfo");
});

// If continueQuiz button is clicked
continueBtn.addEventListener("click", () => {
  infoBox.classList.remove("activeInfo");
  quizBox.classList.add("activeQuiz");
  showQuestions(questionIndex);
  startTimer(timeValue, questionIndex);
  startTimerLine(widthValue);
});

// Show questions function
function showQuestions(index) {
  const questionText = document.querySelector(".que_text");
  axios
    .get("./question.json")
    .then((response) => {
      const questions = response.data;
      questionText.textContent = questions[index].question;
      optionList.innerHTML = questions[index].options
        .map(
          (option) => `
        <div class="option"> <span> ${option.replace(/</g, "&lt;")}</span></div>
        `
        )
        .join("");

      // Set onclick attribute to all available options
      const options = optionList.querySelectorAll(".option");
      options.forEach((option) => {
        option.addEventListener("click", function () {
          optionSelected(this, questions[index].answer);
        });
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
}

// When any option is clicked
function optionSelected(userAnswer, correctAnswer) {
  clearInterval(counter); // Clear counter
  clearInterval(counterLine); // Clear counterLine

  const optionElements = Array.from(optionList.querySelectorAll(".option"));
  const optionsNumber = optionElements.length;

  if (userAnswer.textContent.trim() === correctAnswer.trim()) {
    playCorrectSound(); // Play the correct sound effect
    userScore += 1; // Upgrade score value by 1
    userAnswer.classList.add("correct"); // Add green color to correct selected option
    userAnswer.insertAdjacentHTML("beforeend", successIcon); // Add success icon to correct selected option
  } else {
    playIncorrectSound(); // Play the inCorrect sound effect
    userAnswer.classList.add("incorrect"); // Add red color to incorrect selected option
    userAnswer.insertAdjacentHTML("beforeend", failIcon); // Add fail icon to incorrect selected option

    for (let i = 0; i < optionsNumber; i++) {
      const optionText = optionElements[i].textContent.trim();
      if (optionText === correctAnswer.trim()) {
        optionElements[i].setAttribute("class", "option correct"); // Add green color to matched option
        optionElements[i].insertAdjacentHTML("beforeend", successIcon); // Add success icon to matched option
      }
    }
  }

  // Once the user selects an option, disable all options
  optionElements.forEach((option) => {
    option.classList.add("disabled");
  });

  // Show the next question if the user selected any option
  nextBtn.classList.add("show");
}

// Start timer function
function startTimer(time, index) {
  counter = setInterval(timer, 1000);
  function timer() {
    const optionElements = Array.from(optionList.querySelectorAll(".option"));
    timeCount.textContent = time;
    time--;

    if (time < 9) {
      timeCount.textContent = "0" + timeCount.textContent;
    }

    if (time < 0) {
      clearInterval(counter);
      timeText.textContent = "Time Off";

      axios
        .get("./question.json")
        .then((response) => {
          const questions = response.data;
          console.log(questions[index].answer);
          let correctAnswer = questions[index].answer.trim();
          for (let i = 0; i < questions[index].options.length; i++) {
            if (questions[index].options[i].trim() === correctAnswer) {
              console.log("Correct Answer");
              optionElements[i].classList.add("correct"); // Add the "correct" class
              optionElements[i].insertAdjacentHTML("beforeend", successIcon);
            }
          }

          optionElements.forEach((option) => {
            option.classList.add("disabled");
          });

          nextBtn.classList.add("show");
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }
}

// Start timer line function
function startTimerLine(time) {
  counterLine = setInterval(timer, 38); // Total time in milliseconds / Total pixels
  function timer() {
    time += 1; // Upgrade time value by 1
    timeLine.style.width = time + "px"; // Increase the width of time_line by time value
    if (time > 549) { // 550 is the width of time_line
      // If time value is greater than 549
      clearInterval(counterLine); // Clear counterLine
    }
  }
}

// If Next Question button is clicked
nextBtn.addEventListener("click", () => {
  axios.get("./question.json").then((response) => {
    const questions = response.data;
    if (questionIndex < questions.length - 1) {
      questionIndex++;
      questionNumber++;
      clearInterval(counter);
      clearInterval(counterLine);
      showQuestions(questionIndex);
      startTimer(timeValue, questionIndex);
      startTimerLine(widthValue);
      questionCount(questionNumber, questions.length);
      timeText.textContent = "Time Left";
      nextBtn.classList.remove("show");
    } else {
      clearInterval(counter); // Clear counter
      clearInterval(counterLine); // Clear counterLine
      showResult(); // Call showResult function
    }
  });
});

// Function to display question count
function questionCount(questionNumber, questionsLength) {
  let totalQuestionCount = `<span><p>${questionNumber}</p> of <p>${questionsLength}</p> Questions</span>`;
  bottomCounter.innerHTML = totalQuestionCount;
}

const restartQuiz = resultBox.querySelector(".buttons .restart");
const quitQuiz = resultBox.querySelector(".buttons .quit");

// Show result when the quiz is over
function showResult() {
  infoBox.classList.remove("activeInfo"); // Hide info box
  quizBox.classList.remove("activeQuiz"); // Hide quiz box
  resultBox.classList.add("activeResult"); // Show result box
  const scoreText = resultBox.querySelector(".score_text");
  axios.get("./question.json").then((response) => {
    const questionsLength = response.data.length;

    if (userScore > 3) {
      // Creating a new span tag and displaying the user's score and total question number
      let scoreTag = `<span>and congrats! , You got <p>${userScore}</p> out of <p>${questionsLength}</p></span>`;
      scoreText.innerHTML = scoreTag; // Adding new span tag inside score_Text
    } else if (userScore > 1) {
      let scoreTag = `<span>and nice , You got <p>${userScore}</p> out of <p>${questionsLength}</p></span>`;
      scoreText.innerHTML = scoreTag;
    } else {
      let scoreTag = `<span>and sorry , You got only <p>${userScore}</p> out of <p>${questionsLength}</p></span>`;
      scoreText.innerHTML = scoreTag;
    }
  }).catch((error) => {
    console.log(error.message);
  });
}

// Function to handle the "Restart Quiz" button click
restartQuiz.addEventListener("click", () => {
  axios.get("./question.json").then((response) => {
    const questions = response.data;
    quizBox.classList.add("activeQuiz");
    resultBox.classList.remove("activeResult");
    infoBox.classList.remove("activeInfo");
    questionIndex = 0;
    questionNumber = 1;
    userScore = 0;
    widthValue = 0;
    timeValue = 20;
    nextBtn.classList.remove("show");
    showQuestions(questionIndex);
    questionCount(questionNumber, questions.length);
    clearInterval(counter);
    clearInterval(counterLine);
    startTimer(timeValue, 0);
    startTimerLine(widthValue);
    timeText.textContent = "Time Left";
    nextBtn.classList.remove("show");
  }).catch((error) => {
    console.log(error.message);
  });
});

// Function to handle the "Quit Quiz" button click
quitQuiz.addEventListener("click", () => {
  location.reload();
});

function playCorrectSound() {
    const correctSound = document.getElementById("correctSound");
    correctSound.play();
    correctSound.volume = 0.2
  }
  
  // Function to play the incorrect sound effect
  function playIncorrectSound() {
    const incorrectSound = document.getElementById("incorrectSound");
    incorrectSound.play();
    incorrectSound.volume = 0.2
  }
