const slides = [...document.querySelectorAll('.hero-photos > img')];
const counter = document.querySelector('.photo-controls output');
let current = 0;

document.querySelectorAll('[data-step]').forEach((button) => {
  button.addEventListener('click', () => {
    slides[current].hidden = true;
    current = (current + Number(button.dataset.step) + slides.length) % slides.length;
    slides[current].hidden = false;
    counter.value = `${current + 1} / ${slides.length}`;
  });
});

const dialog = document.querySelector('#photo');
const photo = dialog.querySelector('img');
document.querySelectorAll('[data-photo]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.showModal) return;
    event.preventDefault();
    photo.src = link.href;
    photo.alt = link.querySelector('img').alt;
    dialog.showModal();
  });
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
