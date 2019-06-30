function createGame({playFieldWrap, gameTime}) {
    const main = document.querySelector(playFieldWrap);
    const emojisWithDoubles = playElems(['🐹', '🐰', '🐭', '🐻', '🐱', '🐶']);
    const cards = Array.from(document.querySelectorAll('.card'));

    const timerStartEvent = new CustomEvent('timerStart');
    const winPopupEvent = new CustomEvent('winPopup');
    const losePopupEvent = new CustomEvent('losePopup');

    let isGameRunning = false;
    let flippedCard = null;

    createField(emojisWithDoubles);
    createTimer();

    main.addEventListener('timerStart', () => runTimer(gameTime));
    main.addEventListener('winPopup', () => endgamePop('popup__win', 'You win'));
    main.addEventListener('losePopup', () => endgamePop('popup__lose', 'You lose'));

    main.addEventListener('click', cardFlip);
    main.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') cardFlip(e);
    });

    function cardFlip(event) {
        const target = event.target;
        const card = target.classList.contains('card') ? target : target.closest('.card');

        if (!card) return;

        if (card.classList.contains('card--flipped')) return;

        if (!isGameRunning) {
            isGameRunning = true;
            main.dispatchEvent(timerStartEvent);
        }

        // Clear missed cards
        cards.forEach(card => {
            if (!card.classList.contains('card--missed')) return;

            card.classList.remove('card--flipped');
            card.classList.remove('card--missed');
            card.tabIndex = 0;
        });

        card.classList.add('card--flipped');
        card.tabIndex = -1;

        if (!flippedCard) {
            flippedCard = card;
            return;
        }

        if (similarityCheck(card, flippedCard)) {
            card.classList.add('card--matched');
            flippedCard.classList.add('card--matched');

            if (cards.every(card => card.classList.contains('card--matched'))) main.dispatchEvent(winPopupEvent);

        } else {
            card.classList.add('card--missed');
            flippedCard.classList.add('card--missed');
        }

        flippedCard = null;
    }

    function similarityCheck(firstCard, secondCard) {
        return firstCard.innerText.trim() === secondCard.innerText.trim();
    }
    
    function playElems(arr) {
        const elems = Array.from(new Set(arr));
        const elemsWithDoubles = elems.concat(elems);

        elemsWithDoubles.sort(() => Math.random() - 0.5);
        return elemsWithDoubles;
    }
    
    function createCard(cardText) {
        const card = document.createElement('div');
        const cardFace = document.createElement('div');
        const cardBack = document.createElement('div');

        card.classList.add('main__card', 'card');
        card.tabIndex = 0;

        cardFace.classList.add('card__face');
        cardFace.append(cardText);
        card.append(cardFace);

        cardBack.classList.add('card__back');
        card.append(cardBack);

        return card;
    }

    function createField(elems) {
        const playField = document.createElement('div');

        playField.classList.add('playfield');
        main.append(playField);
        elems.forEach((elem) => {
            playField.append(createCard(elem));
        });
    }

    function createTimer() {
        const timer = document.createElement('div');

        timer.classList.add('main__timer', 'timer');
        timer.textContent ='00:00';
        main.append(timer);
    }

    function runTimer(duration) {
        const start = Date.now();
        const timerElement = main.querySelector('.timer');

        let diff = 0;
        let minutes = 0;
        let seconds = 0;

        function timer() {
            // | 0 is replace for ParseInt
            diff = duration - (((Date.now() - start) / 1000 ) | 0);

            //Win sequence
            if (!isGameRunning) {
                clearInterval(timerInterval);
                return;
            }

            minutes = (diff / 60) | 0;
            seconds = (diff % 60) | 0;

            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            timerElement.textContent = `${minutes}:${seconds}`;

            //Lose initiate
            if (diff <= 0) {
                clearInterval(timerInterval);
                main.dispatchEvent(losePopupEvent);
            }
        }

        timer();
        const timerInterval = setInterval(timer, 1000);
    }

    function endgamePop(extraClass, text) {
        const overlay = document.createElement('div');
        const popupBlock = document.createElement('div');
        const popupText = document.createElement('div');
        const popupButton = document.createElement('button');

        isGameRunning = false;
        cards.forEach(card => card.tabIndex = -1);

        overlay.classList.add('overlay');

        popupBlock.classList.add('popup', extraClass);

        popupText.classList.add('popup__text');
        popupText.textContent = text;
        popupBlock.append(popupText);

        popupButton.classList.add('popup__button', 'button', 'js-replay');
        popupButton.textContent = 'Play again';
        popupBlock.append(popupButton);
        popupButton.addEventListener('click', repeatGame);

        main.append(overlay);
        overlay.append(popupBlock);

    }

    function repeatGame() {
        const mainClone = main.cloneNode(false);

        main.parentElement.replaceChild(mainClone, main);
        createGame({playFieldWrap: playFieldWrap, gameTime: gameTime});

    }
}