function createGame({playFieldWrap, gameTime}) {
    const main = document.querySelector(playFieldWrap);

    const timerStartEvent = new CustomEvent('timerStart');
    const winPopupEvent = new CustomEvent('winPopup');
    const losePopupEvent = new CustomEvent('losePopup');
    const emojisWithDoubles = playElems(['🐹', '🐰', '🐭', '🐻', '🐱', '🐶']);

    let isGameRunning = false;
    let flippedCard = null;


    createField(emojisWithDoubles);
    createTimer();

    const cards = Array.from(document.querySelectorAll('.card'));

    main.addEventListener('timerStart', () => runTimer(gameTime));
    main.addEventListener('winPopup', () => endgamePop('popup__win', 'Win'));
    main.addEventListener('losePopup', () => endgamePop('popup__lose', 'Lose'));

    main.addEventListener('click', cardFlip);
    main.addEventListener('keypress', keyboardFlip);

    function playElems(arr) {
        const elems = Array.from(new Set(arr));
        const elemsWithDoubles = elems.concat(elems);

        elemsWithDoubles.sort(() => Math.random() - 0.5);
        return elemsWithDoubles;
    }


    function cardFlip(event) {
        const target = event.target;
        const card = target.classList.contains('card') ? target : target.closest('.card');

        if (!card || card.classList.contains('card--flipped')) return;


        // First flip
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

        function similarityCheck(firstCard, secondCard) {
            return firstCard.innerText.trim() === secondCard.innerText.trim();
        }
    }

    function keyboardFlip(event) {
        if (event.key === 'Enter' || event.key === ' ') cardFlip(e);
    }

    function createField(elems) {
        const playField = document.createElement('div');

        playField.classList.add('playfield');
        main.append(playField);
        elems.forEach((elem) => {
            playField.append(createCard(elem));
        });

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
        const textLetters = text.split('');
        const overlay = document.createElement('div');
        const popupBlock = document.createElement('div');
        const popupText = document.createElement('div');
        const popupButton = document.createElement('button');

        main.removeEventListener('click', cardFlip);
        main.removeEventListener('keypress', keyboardFlip);
        cards.forEach(card => card.tabIndex = -1);
        isGameRunning = false;

        overlay.classList.add('overlay');
        popupBlock.classList.add('popup', extraClass);
        popupText.classList.add('popup__text');
        popupButton.classList.add('popup__button', 'button');

        textLetters.forEach(letter => {
            const popupLetter = document.createElement('span');

            popupLetter.classList.add('popup__letter');
            popupLetter.textContent = letter;
            popupText.append(popupLetter);
        });

        main.append(overlay);
        overlay.append(popupBlock);
        popupBlock.append(popupText);
        popupBlock.append(popupButton);

        popupButton.textContent = 'Play again';
        popupButton.addEventListener('click', repeatGame);

        function repeatGame() {
            const mainClone = main.cloneNode(false);
            const flippedCards = cards.filter(card => card.classList.contains('card--flipped'));

            overlay.remove();

            flippedCards[0].addEventListener('transitionend', updateField);

            flippedCards.forEach(card => {
                card.classList.remove('card--flipped');
            });

            function updateField() {
                main.parentElement.replaceChild(mainClone, main);
                createGame({playFieldWrap: playFieldWrap, gameTime: gameTime});
            }
        }
    }

}