function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function htmlToElements(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.childNodes;
}

function Player(name, symbol) {
  let totalWin = 0;
  let totalLose = 0;
  let totalDraw = 0;

  const getSymbol = () => symbol;
  const getName = () => name;
  const setName = (newValue) => {
    name = newValue;
  };
  const getTotalWin = () => totalWin;
  const getTotalLose = () => totalLose;
  const getTotalDraw = () => totalDraw;
  const incrementWin = () => totalWin++;
  const incrementLost = () => totalLose++;
  const incrementDraw = () => totalDraw++;

  return {
    getName,
    setName,
    getSymbol,
    getTotalWin,
    getTotalLose,
    getTotalDraw,
    incrementWin,
    incrementLost,
    incrementDraw,
  };
}

function Cell(rowIndex, columnIndex) {
  let value = "";

  const getRowIndex = () => rowIndex;
  const getColumnIndex = () => columnIndex;
  const getValue = () => value;
  const setValue = (newValue) => {
    value = newValue;
  };

  const toElement = () => {
    const cellHTML = `<button class="Cell flex justify-center items-center aspect-square border text-6xl hover:bg-gray-600"></button>`;
    const divCell = htmlToElement(cellHTML);
    divCell.textContent = value;
    divCell.dataset.row = rowIndex;
    divCell.dataset.column = columnIndex;

    return divCell;
  };

  return {
    getRowIndex,
    getColumnIndex,
    getValue,
    setValue,
    toElement,
  };
}

function GameBoard(playerOne, playerTwo) {
  const board = [];
  const totalColumn = 3;
  const totalRow = 3;
  let activePlayer = playerOne;
  let status = "RUNNING";
  let winner;

  /**
   * Win Condition:
   * 1. certain row has same symbol (index 0-2)
   * 2. certain column has same symbol (index 3-5)
   * 3. certain diagonal has same symbol (index 6-7)
   */
  const winConditionIndex = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const initBoard = () => {
    for (let rowIndex = 0; rowIndex < totalRow; rowIndex++) {
      const row = [];
      for (let columnIndex = 0; columnIndex < totalColumn; columnIndex++) {
        row.push(Cell(rowIndex, columnIndex));
      }
      board.push(row);
    }
  };

  initBoard();

  const resetBoard = () => {
    board.splice(0, board.length);
  };

  const getBoard = () => board;
  const getPlayerOne = () => playerOne;
  const getPlayerTwo = () => playerTwo;
  const getActivePlayer = () => activePlayer;
  const getWinner = () => winner;
  const getLoser = () => (playerOne === winner ? playerTwo : playerOne);
  const getStatus = () => status;

  const changePlayerOneName = (newName) => {
    playerOne.setName(newName);
  };

  const changePlayerTwoName = (newName) => {
    playerTwo.setName(newName);
  };

  const toggleActivePlayer = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  const hasWinner = () => {
    let result = false;
    const boardFlat = board.flat().map((cell) => cell.getValue());

    winConditionIndex.forEach((indexes) => {
      const [a, b, c] = indexes;
      result ||=
        boardFlat[a] &&
        boardFlat[a] === boardFlat[b] &&
        boardFlat[a] === boardFlat[c];
    });

    return result;
  };

  const isDraw = () => {
    const boardFlat = board.flat().map((cell) => cell.getValue());
    return boardFlat.every((cellValue) => cellValue !== "");
  };

  const setGameStatus = () => {
    if (hasWinner()) {
      status = "ENDED";
      winner = activePlayer;

      getWinner().incrementWin();
      getLoser().incrementLost();
    } else if (isDraw()) {
      status = "DRAW";

      playerOne.incrementDraw();
      playerTwo.incrementDraw();
    } else {
      toggleActivePlayer();
    }
  };

  const markCell = (rowIndex, columnIndex) => {
    const cell = board[rowIndex][columnIndex];

    if (cell.getValue() !== "") return;

    cell.setValue(activePlayer.getSymbol());
    setGameStatus();
  };

  const toElement = () => {
    const boardHtml = `<div id="board" class="GameBoard grid grid-cols-[repeat(3,minmax(100px,150px))] justify-center content-center"></div>`;
    const boardElement = htmlToElement(boardHtml);

    board.forEach((row) => {
      row.forEach((cell) => {
        boardElement?.appendChild(cell.toElement());
      });
    });

    return boardElement;
  };

  const resetState = () => {
    resetBoard();
    initBoard();
    activePlayer = playerOne;
    status = "RUNNING";
  };

  return {
    getBoard,
    getPlayerOne,
    getPlayerTwo,
    getActivePlayer,
    changePlayerOneName,
    changePlayerTwoName,
    markCell,
    toElement,
    resetState,
    getStatus,
    getWinner,
    getLoser,
  };
}

function GameView(controller, model) {
  const boardContainer = document.getElementById("board-container");
  const controlButtonContainer = document.getElementById("control-btn");
  const gameInfo = document.getElementById("game-info");
  const changeNameDialog = document.getElementById("change-name-dialog");
  const changeNameForm = document.getElementById("change-name-form");
  const selectPlayer = document.getElementById("select-player");
  const playerOneHeading = document.getElementById("player-one");
  const playerTwoHeading = document.getElementById("player-two");
  const playerOneInfo = document.getElementById("player-one-info");
  const playerTwoInfo = document.getElementById("player-two-info");

  const initDisplay = () => {
    boardContainer?.replaceChild(
      model.toElement(),
      boardContainer.firstElementChild,
    );
  };

  const addCellsListener = () => {
    if (model.getStatus() !== "RUNNING") return;

    const cells = document.querySelectorAll(".Cell");

    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const rowIndex = e.currentTarget.dataset.row;
        const columnIndex = e.currentTarget.dataset.column;

        if (!("markCell" in controller)) return;

        controller.markCell(rowIndex, columnIndex);
      });
    });
  };

  const addRestartButton = () => {
    const resetButtonHtml = `
    <button id="restart-btn"
      class="h-14 min-w-[200px] flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-75">
      Restart
    </button>
    `;
    const resetButton = htmlToElement(resetButtonHtml);
    resetButton?.addEventListener("click", () => {
      controller.restart();
    });

    controlButtonContainer?.appendChild(resetButton);
  };

  const addExitButton = () => {
    const exitButtonHtml = `
    <button id="exit-btn"
      class="h-14 min-w-[200px] flex-1 rounded-xl border border-red-500  hover:brightness-75">
      Exit
    </button>
    `;
    const exitButton = htmlToElement(exitButtonHtml);
    exitButton?.addEventListener("click", () => {
      controller.exit();
    });

    controlButtonContainer?.appendChild(exitButton);
  };

  const changeControlButtons = () => {
    controlButtonContainer.innerHTML = "";
    addRestartButton();
    addExitButton();
  };

  const changeGameInfo = (content) => {
    gameInfo.textContent = content;
  };

  const updatePlayerInfo = () => {
    const playerOne = model.getPlayerOne();
    const playerTwo = model.getPlayerTwo();

    const playerOneInfoList = document.getElementById("player-one-info-list");
    const playerTwoInfoList = document.getElementById("player-two-info-list");

    playerOneInfoList.innerHTML = `
      <li class="mb-2">Win: ${playerOne.getTotalWin()}</li>
      <li class="mb-2">Lose: ${playerOne.getTotalLose()}</li>
      <li class="mb-2">Draw: ${playerOne.getTotalDraw()}</li>
      <li class="mb-2">Symbol: ${playerOne.getSymbol()}</li>
    `;

    playerTwoInfoList.innerHTML = `
      <li class="mb-2">Win: ${playerTwo.getTotalWin()}</li>
      <li class="mb-2">Lose: ${playerTwo.getTotalLose()}</li>
      <li class="mb-2">Draw: ${playerTwo.getTotalDraw()}</li>
      <li class="mb-2">Symbol: ${playerTwo.getSymbol()}</li>
    `;
  };

  const updateActivePlayerInfo = () => {
    const activePlayer = model.getActivePlayer();
    const activePlayerName = activePlayer.getName();
    const message = `${activePlayerName}${
      activePlayerName.endsWith("s") ? "'" : "'s"
    } Turn`;
    changeGameInfo(message);
  };

  const updatePlayerName = () => {
    const playerOneName = model.getPlayerOne().getName();
    const playerTwoName = model.getPlayerTwo().getName();

    playerOneHeading.textContent = playerOneName;
    playerTwoHeading.textContent = playerTwoName;
  };

  const updateDialogOptions = () => {
    const playerOneName = model.getPlayerOne().getName();
    const playerTwoName = model.getPlayerTwo().getName();

    const optionHtml = `
      <option value="1">${playerOneName}</option>
      <option value="2">${playerTwoName}</option>
    `;
    const optionElement = htmlToElements(optionHtml);

    selectPlayer.innerHTML = "";
    optionElement.forEach((option) => {
      selectPlayer?.appendChild(option);
    });
  };

  const setChangeNameForm = () => {
    changeNameForm?.addEventListener("submit", (e) => {
      const formMethod = e.submitter?.getAttribute("formmethod");
      if (formMethod === "dialog") return;

      e.preventDefault();
      const formData = new FormData(changeNameForm);
      const playerNo = formData.get("player");
      const newName = formData.get("name");

      controller.changePlayerName(playerNo, newName);
      updatePlayerName();

      changeNameForm.reset();
      changeNameDialog.close();
    });
  };

  const setDialog = () => {
    updateDialogOptions();
    setChangeNameForm();
  };

  const addStartButton = () => {
    const startButtonHtml = `
    <button id="start-btn"
      class="h-14 min-w-[200px] flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 hover:brightness-75">
      Start
    </button>
    `;

    const startButton = htmlToElement(startButtonHtml);

    startButton?.addEventListener("click", () => {
      updateActivePlayerInfo();
      addCellsListener();
      changeControlButtons();
    });

    controlButtonContainer?.appendChild(startButton);
  };

  const addChangeNameButton = () => {
    const changeNameButtonHtml = `
    <button id="change-name-btn"
      class="h-14 min-w-[200px] flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-75">
      Change Name
    </button>
    `;

    const changeNameButton = htmlToElement(changeNameButtonHtml);

    changeNameButton?.addEventListener("click", () => {
      updateDialogOptions();
      changeNameDialog.showModal();
    });

    controlButtonContainer?.appendChild(changeNameButton);
  };

  const initControlButton = () => {
    controlButtonContainer.innerHTML = "";
    addStartButton();
    addChangeNameButton();
  };

  const updateWinnerInfo = () => {
    const winner = model.getWinner();
    const winnerName = winner.getName();
    const message = `${winnerName} Win!`;
    changeGameInfo(message);
  };

  const updateDrawInfo = () => {
    changeGameInfo("Draw!");
  };

  const updateGameInfo = () => {
    switch (model.getStatus()) {
      case "ENDED":
        updateWinnerInfo();
        updatePlayerInfo();
        break;
      case "DRAW":
        updateDrawInfo();
        updatePlayerInfo();
        break;
      default:
        updateActivePlayerInfo();
        break;
    }
  };

  const refreshDisplay = () => {
    initDisplay();
    updateGameInfo();
    addCellsListener();
  };

  const initGameInfo = () => {
    changeGameInfo("Click Start to Play!");
    gameInfo?.classList.remove("animate-pulse");
  };

  const addPlayerOneInfo = () => {
    const playerOne = model.getPlayerOne();

    const infoHtml = `
    <ul id="player-one-info-list">
      <li class="mb-2">Win: ${playerOne.getTotalWin()}</li>
      <li class="mb-2">Lose: ${playerOne.getTotalLose()}</li>
      <li class="mb-2">Draw: ${playerOne.getTotalDraw()}</li>
      <li class="mb-2">Symbol: ${playerOne.getSymbol()}</li>
    </ul>
    `;

    const info = htmlToElement(infoHtml);
    playerOneInfo?.appendChild(info);
  };

  const addPlayerTwoInfo = () => {
    const playerTwo = model.getPlayerTwo();

    const infoHtml = `
    <ul id="player-two-info-list">
      <li class="mb-2">Win: ${playerTwo.getTotalWin()}</li>
      <li class="mb-2">Lose: ${playerTwo.getTotalLose()}</li>
      <li class="mb-2">Draw: ${playerTwo.getTotalDraw()}</li>
      <li class="mb-2">Symbol: ${playerTwo.getSymbol()}</li>
    </ul>
    `;

    const info = htmlToElement(infoHtml);
    playerTwoInfo?.appendChild(info);
  };

  const removeInfoPulse = () => {
    const elements = document.querySelectorAll(".animate-pulse");
    elements.forEach((element) => {
      element.classList.remove("animate-pulse");
    });
  };

  const initPlayerInfo = () => {
    addPlayerOneInfo();
    addPlayerTwoInfo();
    removeInfoPulse();
  };

  const init = () => {
    initDisplay();
    initControlButton();
    initGameInfo();
  };

  return {
    refreshDisplay,
    setDialog,
    updatePlayerName,
    initPlayerInfo,
    init,
  };
}

function GameController() {
  const controller = {};
  const gameBoard = GameBoard(Player("Player 1", "X"), Player("Player 2", "O"));
  const gameView = GameView(controller, gameBoard);

  const init = () => {
    gameView.init();
    gameView.setDialog();
    gameView.updatePlayerName();
    gameView.initPlayerInfo();
  };

  init();

  const markCell = (rowIndex, columnIndex) => {
    gameBoard.markCell(rowIndex, columnIndex);
    gameView.refreshDisplay();
  };

  const changePlayerName = (playerNo, newName) => {
    switch (playerNo) {
      case "1":
        gameBoard.changePlayerOneName(newName);
        break;
      case "2":
        gameBoard.changePlayerTwoName(newName);
        break;
      default:
        break;
    }
  };

  const restart = () => {
    gameBoard.resetState();
    gameView.refreshDisplay();
  };

  const exit = () => {
    gameBoard.resetState();
    gameView.init();
  };

  return Object.assign(controller, {
    markCell,
    changePlayerName,
    restart,
    exit,
  });
}

setTimeout(GameController, 1200);
