<h1>Resume</h1>
<div class="resume">
  <header>
    <p>###-###-####</p>
    <h2>Enrique Casillas</h2>
    <p>example@example.com</p>
  </header>
  <hr />
  <div class="content">
    <section>
      <h3>Education</h3>
      <span>
        <h4>School Name</h4>
        <h5>MM/DD/YYYY</h5>
      </span>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia
        necessitatibus provident deserunt, vero nostrum culpa reprehenderit
        nobis id ipsa placeat distinctio ab similique doloremque dolorem sed
        commodi excepturi veritatis laboriosam!
      </p>
    </section>
    <section>
      <h3>Work Experience</h3>
      <span>
        <h4>Work Name</h4>
        <h5>MM/DD/YYYY</h5>
      </span>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia
        necessitatibus provident deserunt, vero nostrum culpa reprehenderit
        nobis id ipsa placeat distinctio ab similique doloremque dolorem sed
        commodi excepturi veritatis laboriosam!
      </p>
    </section>
  </div>
</div>

<style>
  .resume {
    header {
      display: flex;
      justify-content: space-between;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 2rem;

      span {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      p,
      h4,
      h5 {
        margin: 0;
      }
    }
  }
</style>
