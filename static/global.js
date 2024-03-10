console.log('Hi!');

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

