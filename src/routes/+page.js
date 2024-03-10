/** @type {import('./$types').PageLoad} */ export async function load({
  fetch,
  params,
}) {
  const res = await fetch('https://api.github.com/users/casillasenrique');
  const githubData = await res.json();

  // setHeaders({
	// 	age: response.headers.get('age'),
	// 	'cache-control': response.headers.get('cache-control')
	// });
  return { maxAge: 3600, githubData };
}
