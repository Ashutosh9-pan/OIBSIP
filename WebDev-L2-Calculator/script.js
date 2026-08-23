const display = document.getElementById("display");
const previousOperation = document.getElementById("previousOperation");
const themeToggle = document.getElementById("themeToggle");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const decimalButton = document.querySelector('[data-action="decimal"]');
const clearButton = document.querySelector('[data-action="clear"]');
const backspaceButton = document.querySelector('[data-action="backspace"]');
const calculateButton = document.querySelector('[data-action="calculate"]');
const percentButton = document.querySelector('[data-action="percent"]');
const signButton = document.querySelector('[data-action="sign"]');

let currentInput = "0";
let previousInput = "";
let selectedOperator = null;
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentInput;

    if (previousInput && selectedOperator) {
        previousOperation.textContent =
            `${previousInput} ${getOperatorSymbol(selectedOperator)}`;
    } else {
        previousOperation.textContent = "";
    }
}

function getOperatorSymbol(operator) {
    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[operator] || operator;
}

function inputNumber(number) {
    if (currentInput === "Error" || shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else if (currentInput === "0") {
        currentInput = number;
    } else {
        currentInput += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (currentInput === "Error" || shouldResetDisplay) {
        currentInput = "0.";
        shouldResetDisplay = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    updateDisplay();
}

function chooseOperator(operator) {
    if (currentInput === "Error") {
        return;
    }

    if (selectedOperator && previousInput && !shouldResetDisplay) {
        calculate();
    }

    previousInput = currentInput;
    selectedOperator = operator;
    shouldResetDisplay = true;

    updateDisplay();
}

function calculate() {
    if (
        !selectedOperator ||
        previousInput === "" ||
        currentInput === "Error"
    ) {
        return;
    }

    const previousNumber = parseFloat(previousInput);
    const currentNumber = parseFloat(currentInput);

    if (Number.isNaN(previousNumber) || Number.isNaN(currentNumber)) {
        return;
    }

    let result;

    switch (selectedOperator) {
        case "+":
            result = previousNumber + currentNumber;
            break;

        case "-":
            result = previousNumber - currentNumber;
            break;

        case "*":
            result = previousNumber * currentNumber;
            break;

        case "/":
            if (currentNumber === 0) {
                showError("Cannot divide by zero");
                return;
            }

            result = previousNumber / currentNumber;
            break;

        default:
            return;
    }

    const expression =
        `${previousInput} ${getOperatorSymbol(selectedOperator)} ${currentInput}`;

    result = roundResult(result);

    currentInput = result.toString();
    previousOperation.textContent = `${expression} =`;

    previousInput = "";
    selectedOperator = null;
    shouldResetDisplay = true;

    display.textContent = currentInput;
}

function roundResult(number) {
    return Math.round((number + Number.EPSILON) * 100000000) / 100000000;
}

function clearCalculator() {
    currentInput = "0";
    previousInput = "";
    selectedOperator = null;
    shouldResetDisplay = false;

    updateDisplay();
}

function backspace() {
    if (currentInput === "Error") {
        clearCalculator();
        return;
    }

    if (shouldResetDisplay) {
        return;
    }

    if (currentInput.length === 1) {
        currentInput = "0";
    } else {
        currentInput = currentInput.slice(0, -1);

        if (currentInput === "-") {
            currentInput = "0";
        }
    }

    updateDisplay();
}

function calculatePercent() {
    if (currentInput === "Error") {
        return;
    }

    const number = parseFloat(currentInput);

    if (!Number.isNaN(number)) {
        currentInput = roundResult(number / 100).toString();
        updateDisplay();
    }
}

function toggleSign() {
    if (currentInput === "Error" || currentInput === "0") {
        return;
    }

    if (currentInput.startsWith("-")) {
        currentInput = currentInput.slice(1);
    } else {
        currentInput = `-${currentInput}`;
    }

    updateDisplay();
}

function showError(message) {
    currentInput = "Error";
    previousInput = "";
    selectedOperator = null;
    shouldResetDisplay = true;

    display.textContent = "Error";
    previousOperation.textContent = message;
}

numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        inputNumber(button.dataset.number);
    });
});

operatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        chooseOperator(button.dataset.operator);
    });
});

decimalButton.addEventListener("click", inputDecimal);
clearButton.addEventListener("click", clearCalculator);
backspaceButton.addEventListener("click", backspace);
calculateButton.addEventListener("click", calculate);
percentButton.addEventListener("click", calculatePercent);
signButton.addEventListener("click", toggleSign);

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (key >= "0" && key <= "9") {
        inputNumber(key);
    }

    if (key === ".") {
        inputDecimal();
    }

    if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    }

    if (key === "Backspace") {
        backspace();
    }

    if (key === "Escape") {
        clearCalculator();
    }

    if (key === "%") {
        calculatePercent();
    }
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLightTheme =
        document.body.classList.contains("light-theme");

    themeToggle.textContent = isLightTheme ? "☾" : "☀";

    localStorage.setItem(
        "calculator-theme",
        isLightTheme ? "light" : "dark"
    );
});

function loadSavedTheme() {
    const savedTheme = localStorage.getItem("calculator-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggle.textContent = "☾";
    }
}

loadSavedTheme();
updateDisplay();