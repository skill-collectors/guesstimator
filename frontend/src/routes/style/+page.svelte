<h2 class="heading h-main">Main Heading</h2>
<h3 class="heading h-sub">Subheading</h3>
<h4 class="heading">Minor heading</h4>
<p>
  Visit a <a class="link" href="example.com">Link</a>
</p>
<form>
  <fieldset class="flex flex-col">
    <legend class="font-bold mb-2">Input types</legend>
    <div class="mb-2">
      <label for="text">Text:</label>
      <input name="text" type="text" class="text-input" value="text input" />
    </div>
    <div class="mb-2">
      <label for="number">Numeric:</label>
      <input
        name="number"
        type="numeric"
        class="text-input"
        min="0"
        max="10"
        step="1"
        value="1"
      />
    </div>
    <div class="mb-2">
      <label for="slider">Slider:</label>
      <input name="slider" type="range" />
    </div>
    <div class="mb-2">
      <label for="checkbox">Checkbox:</label>
      <input name="checkbox" type="checkbox" checked />
      <input name="checkbox2" type="checkbox" />
    </div>
  </fieldset>
  <div class="mb-2">
    <label for="select">Select:</label>
    <select name="select">
      <option>One</option>
      <option>Two</option>
    </select>
  </div>
  <div class="mb-2">
    <ul>
      <li>
        <input type="radio" id="one" value="1" name="radio" />
        <label for="one">One</label>
      </li>
      <li>
        <input type="radio" id="two" value="2" name="radio" />
        <label for="two">Two</label>
      </li>
    </ul>
  </div>
  <section class="mb-2">
    <h4 class="heading">Buttons:</h4>
    <button class="btn primary">Primary</button>
    <button class="btn secondary">Secondary</button>
    <button class="btn success">Success</button>
    <button class="btn danger">Danger</button>
  </section>
</form>
