<h1>Contact</h1>
<form action="mailto:foo@example.com">
  <span>
    <label for="subject">Subject</label>
    <input type="text" name="subject" />
  </span>
  <span>
    <label for="body">Body </label>
    <textarea name="body" id="" cols="30" rows="10"></textarea>
  </span>
  <button type="submit">Submit</button>
</form>

<style>
  form {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1em;

    input,
    textarea,
    button,
    select {
      font: inherit;
    }

    span,
    button {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
    }
  }
</style>
