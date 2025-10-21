### NOTES
## HTML
The html files include the basic default headings and sections like <!DOCTYPE hyml>, which let the broswser know that this is an html file; <html lang="en">, which sets the language to English; and metadata like <meta charset="UTF-8" /> and <    <meta name="viewport" content="width=device-width, initial-scale=1.0" />, which help specify the encoding of the HTML file and makes the webpage viewable on various aspect ratios and sizes.

 <title>Login</title> is seen at the top of the body section. It is very visible and clarifies the type of page currently being displayed.

 <form> <labevl> some lable </labevl> <input> some input <input> </form> is helpful when trying to get user input. the label tells the user what to input, while the input tells the page what to look for.

 I've also included the Git repository on every page, since I wasn't sure if it's only needed on the first page, despite my first page being a simple login page.
 
Here is the note content formatted for a GitHub Markdown file.

-----

# CS260 Exam Notes

## HTML

### Document Structure

  * **Declare HTML:** `<!DOCTYPE html>`
  * **Link External CSS:** `<link rel="stylesheet" href="style.css">`
      * The `<link>` element connects external resources, most commonly a stylesheet.
  * **Include JavaScript:** `<script src="app.js"></script>`
      * Place at the bottom of `<body>` to ensure HTML loads first.

### Common Tags

  * `<h1>`: First-level heading (most important)
  * `<h2>`: Second-level heading
  * `<h3>`: Third-level heading
  * `<p>`: Paragraph
  * `<ul>`: Unordered List (bullets)
  * `<ol>`: Ordered List (numbers)
  * `<li>`: List Item (used inside `<ul>` or `<ol>`)
  * `<div>`: **Block-level** generic container. Used to group elements for layout and styling (e.g., a card, a grid area). Takes up its own line.
  * `<span>`: **Inline-level** generic container. Used to style a small piece of text *within* a line (e.g., a single word). Does not break the flow.
  * `<a>`: Anchor tag (hyperlink).
  * `<img>`: Image tag.

### HTML Examples

  * **Image with Hyperlink:**
    ```html
    <a href="https://example.com">
      <img src="path/to/image.png" alt="Descriptive text">
    </a>
    ```

-----

## CSS

### Selectors

  * `#title`: **ID Selector**. Selects the *single* element with `id="title"`. IDs must be unique.
  * `.grid`: **Class Selector**. Selects *all* elements with `class="grid"`. Classes are reusable.
  * `div`: **Type Selector**. Selects *all* `<div>` elements.
  * **Example (Set all `div` backgrounds to red):**
    ```css
    div {
      background-color: red;
    }
    ```
  * **Example (Set "trouble" to green):**
      * **HTML:** `<p>This is double <span class="warning">trouble</span>.</p>`
      * **CSS:** `.warning { color: green; }`
      * (Or use an ID: `#trouble { color: green; }`)

### Box Model

  * **Order (Inside to Out):**
    1.  **Content**
    2.  **Padding**
    3.  **Border**
    4.  **Margin**
  * **`padding` vs. `margin`:**
      * **`padding`**: Space *inside* the border (between content and border).
      * **`margin`**: Space *outside* the border (between this element and its neighbors).
  * **`padding` Shorthand:**
      * `padding: 10px;` (All 4 sides)
      * `padding: 10px 20px;` (10px Top/Bottom, 20px Left/Right)
      * `padding: 10px 20px 30px 40px;` (Top, Right, Bottom, Left - clockwise)

### Layout (Flexbox)

  * `display: flex;` (Applies to the parent container)
  * By default, items (like images) will align in a **row**.
  * `flex-direction: column;` (Stacks items vertically)
  * `justify-content: center;` (Aligns items along the main axis)
  * `align-items: center;` (Aligns items along the cross axis)

-----

## JavaScript (Core)

### Control Flow Syntax

  * **If/Else:**
    ```javascript
    if (condition) {
      // code
    } else if (otherCondition) {
      // code
    } else {
      // code
    }
    ```
  * **For Loop:**
    ```javascript
    // This will log 0, 1, 2, 3, 4
    for (let i = 0; i < 5; i++) {
      console.log(i);
    }
    ```
  * **While Loop:**
    ```javascript
    while (condition) {
      // code
    }
    ```
  * **Switch:**
    ```javascript
    switch (value) {
      case 'a':
        // code
        break;
      case 'b':
        // code
        break;
      default:
        // code
    }
    ```

### Functions

  * **Arrow Function:** A concise syntax for writing functions.
    ```javascript
    // Long form with explicit return
    const add = (a, b) => {
      return a + b;
    };

    // Short form with implicit return
    const double = num => num * 2;
    ```

### Objects

  * **Object Syntax:**
    ```javascript
    const person = {
      firstName: "Jason",
      age: 22,
      isStudent: true
    };
    ```
  * **Adding Properties:** **Yes**, it is possible.
    ```javascript
    person.lastName = "Gao"; // Adds a new property
    person.age = 23;         // Updates an existing property
    ```

### Arrays

  * **`.map()`:**
      * Creates a **new array** by calling a function on *every* element in the original array.
      * Does *not* modify the original array.
      * **Output:** `[2, 4, 6]`
    <!-- end list -->
    ```javascript
    const numbers = [1, 2, 3];
    const doubled = numbers.map(num => num * 2);
    // doubled is [2, 4, 6]
    // numbers is still [1, 2, 3]
    ```

### Asynchronous JS (Promises)

  * A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation.
  * It will be in one of three states: `pending`, `fulfilled`, or `rejected`.
  * `.then(callback)` runs when the promise is *fulfilled* (succeeds).
  * `.catch(callback)` runs when the promise is *rejected* (fails).
  * **Output:** The `console.log` in `.then()` will run *after* "End" because the promise is asynchronous.
    ```javascript
    console.log("Start");
    const myPromise = new Promise((resolve, reject) => {
      resolve("Success!");
    });

    myPromise
      .then(result => console.log(result)) // "Success!"
      .catch(error => console.log(error));

    console.log("End");
    // Output order: "Start", "End", "Success!"
    ```

-----

## JavaScript (DOM)

### What is the DOM?

  * **DOM** = Document Object Model.
  * It's a **tree-like representation** of the HTML document loaded in the browser.
  * JavaScript can **read and manipulate** the DOM (add, delete, and change elements).
  * Changes to the DOM **visually update** the webpage.

### Selecting Elements

  * `getElementById("byu")`: Selects the single element with `id="byu"`.
  * `querySelector("#byu")`: Selects the first element matching the CSS selector `#byu`.
      * `querySelector(".grid")` (selects by class)
      * `querySelector("p")` (selects by tag)

### Manipulating Elements

  * **Example (Change text color of `id="byu"` to green):**
    ```javascript
    const el = document.getElementById("byu");
    el.style.color = "green";
    ```
  * **Example (Change text "animal" to "crow"):**
      * **HTML:** `<p>The <span id="animal-name">animal</span> is a bird.</p>`
      * **JavaScript:**
    <!-- end list -->
    ```javascript
    const el = document.getElementById("animal-name");
    el.textContent = "crow";
    ```

### Event Listeners

  * `addEventListener()` attaches an event handler (like a "click") to an element.
  * **Example:**
    ```javascript
    // Select the element
    const myButton = document.getElementById("submitBtn");

    // Add a click listener
    myButton.addEventListener("click", () => {
      console.log("Button was clicked!");
    });
    ```
      * This code finds the element `submitBtn` and "listens" for a click. When clicked, it runs the arrow function and logs a message.

-----

## JSON

  * **JSON** = JavaScript Object Notation.
  * A **lightweight, text-based** data-interchange format.
  * Easy for humans to read and for machines to parse.
  * Looks like a JS object, but **keys must be strings in double-quotes**.
    ```json
    {
      "name": "Ziye Gao",
      "isStudent": true,
      "courses": ["CS260", "MMBIO 121"]
    }
    ```
  * `JSON.parse(string)`: Converts a JSON string into a JavaScript object.
  * `JSON.stringify(object)`: Converts a JavaScript object into a JSON string.

-----

## Networking & Web

### Ports

  * **Port 80:** **HTTP** (Hypertext Transfer Protocol) - Unencrypted web traffic.
  * **Port 443:** **HTTPS** (HTTP Secure) - Encrypted web traffic.
  * **Port 22:** **SSH** (Secure Shell) - Secure remote login.

### HTTPS & DNS

  * **HTTPS:** **Yes**, a web certificate (SSL/TLS) is necessary to use HTTPS. It verifies the server's identity and encrypts the connection.
  * **DNS `A` Record:** Points a domain name to an **IPv4 address** (e.g., `172.217.14.228`).
      * It **cannot** point to another `A` record; that's what a `CNAME` (Canonical Name) record is for.
  * **Domain Names:** (Example: `banana.fruit.bozo.click`)
      * **Top-Level Domain (TLD):** `.click`
      * **Root/Second-Level Domain:** `bozo.click`
      * **Subdomain:** `fruit.bozo.click`
      * **Subdomain:** `banana.fruit.bozo.click` (Subdomains are read right-to-left, "banana" is a subdomain of "fruit").

-----

## Command Line (CLI)

  * `pwd`: **Print Working Directory** (shows your current location).
  * `ls`: **List** files and directories.
  * `ls -la`: **List** in **long** format (`-l`) showing permissions, owner, size, and date. Includes **all** hidden files (`-a`).
  * `cd [directory]`: **Change Directory**. (`cd ..` goes up one level).
  * `mkdir [name]`: **Make Directory**.
  * `mv [source] [dest]`: **Move** a file or directory (also used to **rename**).
  * `rm [file]`: **Remove** a file. (`rm -r [dir]` to remove a directory recursively).
  * `chmod [perm] [file]`: **Change Mode** (permissions) of a file (e.g., `chmod 755 script.sh`).
  * `vim` / `nano`: Text editors.
  * `man [cmd]`: Show the **manual** (help page) for a command.
  * `ssh [user]@[host]`: **Secure Shell**. Creates a remote shell session.
  * `ps`: **Process Status** (lists your currently running processes).
  * `wget [url]`: Downloads a file from a URL.
  * `sudo [cmd]`: **Superuser Do**. Runs a command with administrator privileges.
