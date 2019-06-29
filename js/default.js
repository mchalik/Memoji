const main = document.querySelector('.main');
const cards = Array.from(document.querySelectorAll('.card'));

cards.sort(() => Math.random() - 0.5);

cards.forEach(item => {
    main.append(item);
});

let flippedCard = null;

document.addEventListener('click', cardFlip);

function cardFlip(event) {

    let target = event.target;
    let card = target.classList.contains('card') ? target : target.closest('.card');

    if (!card) return;
    if (card.classList.contains('card--flipped')) return;

    cards.forEach(card => {
        if (!card.classList.contains('card--missed')) return;

        card.classList.remove('card--flipped');
        card.classList.remove('card--missed');
    });

    card.classList.toggle('card--flipped');

    if (!flippedCard) {
        flippedCard = card;
        return;
    }

    if (similarityCheck(card, flippedCard)) {
        card.classList.add('card--matched');
        flippedCard.classList.add('card--matched');
    } else {
        card.classList.add('card--missed');
        flippedCard.classList.add('card--missed');

    }
    flippedCard = null;
}

function similarityCheck(firstCard, secondCard) {
    return firstCard.innerText.trim() === secondCard.innerText.trim();

}