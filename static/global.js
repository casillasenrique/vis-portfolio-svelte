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

const pages = [
  { url: '.', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'resume', title: 'Resume' },
  { url: 'contact', title: 'Contact' },
  { url: 'https://github.com/casillasenrique', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);


for (let p of pages) {
  let url = p.url;
  let title = p.title;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  } else {
    a.target = url.startsWith('http') ? '_blank' : '';
  }
  nav.append(a);
  console.log(a.pathname, location.pathname);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="dark">Dark</option>
			<option value="light">Light</option>
		</select>
	</label>`,
);

const select = document.querySelector('select');

select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
});

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
