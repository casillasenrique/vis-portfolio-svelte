console.log('Hi!');

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

console.log(document);
const setColorScheme = (colorScheme) => {
  console.log('color scheme changed to', colorScheme);
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.setItem('colorScheme', colorScheme);
};

const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  let url = 'mailto:example@example.com?';
  for (let [name, value] of data) {
    url = url + `${name}=${encodeURIComponent(value)}&`;
    console.log(name, value);
  }

  location.href = url;
});

const storedColorScheme = localStorage.getItem('colorScheme');
if (storedColorScheme) {
  setColorScheme(storedColorScheme);
  const select = document.querySelector('select');
  select.value = storedColorScheme;
}
