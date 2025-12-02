# PlanIt!
**PlanIt!** is a smart calendar website that allows the user to quickly add tasks and events to their plans without having to manually check or adjust available timeslots. 

## Specification Deliverable
### Elevator Pitch
In the modern age, online calendars are an important part of many people's lives. However, many people often spend a large part of their lives managing their favorite online calendars, checking and adjusting each timeslot to make time for new tasks and events. I believe that being organized should be simple to achieve, so I created PlanIt!, a smart calendar solution that can take in your preferences and do the necessary plannings automatically for you, so that you can actually spend time being productive instead of working toward being productive. 

### Design
![MOCK DESIGN PLANIT](<https://github.com/user-attachments/assets/42d7c38c-18aa-45e5-aa5c-74232c42eae1>)


### Key features
- Secure login over HTTPS
- Ability to add, edit, and delete events and tasks manually
- Planning algorithm that adds user requested tasks and events to the calendar automatically based on user-defined preferences and existing tasks and events
- Ability to upload existing calendar files to the account for import
- Ability to invite other users to collaborate on the calendar
- Real time calendar updates during collaborative sessions
- Integration with third party calendars
### Technologies
I am going to use the required technologies in the following ways:
+ **HTML** - Correctly structure 3 HTML pages, including the login page, the main calendar view, and the user settings.
+ **CSS** - Style the application for a clean, responsive, and easy-to-read design that utilizes sufficient white spaces and color choices while also looking good on different screen sizes.
+ **React** - Represent various parts of the application to provide the interface needed for user-interactions like adding tasks or changing events.
+  **Service** - Backend service with endpoints for logins and third-party APIs.
+  **DB/Login** - A database will be used to store all application data. User will need to login with the correct credentials to access their calendars.
+  **WebSocket** - Will be used to enable real-time colloberation features.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name**
- [My server link](https://simon.planittoday.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - Four different pages. One for each view. `index.html` (Login), `calendar.html`, `about.html`, and `preferences.html`.
- [x] **Simon HTML** - I deployed the HTML for Simon to [https://simon.planittoday.click](https://simon.planittoday.click)
- [x] **Proper HTML element usage** - I spent a lot of time learning about elements. I used header, footer, main, nav, img, a, fieldset, input, button, form, and many more.
- [x] **Links** - Links between views.
- [x] **Text** - About page has text.
- [x] **Images** - Logo is added to every page.
- [x] **3rd party API placeholder** - Login page has an option to sign in with Google. There is also an option in the preferences page to sync with Google Calendar.
- [x] **Login placeholder** - Placeholder for auth on the login page.
- [x] **WebSocket placeholder** - The calendar page has an option to collabrate with other users.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Simon CSS** - I deployed the CSS for Simon to [https://simon.planittoday.click](https://simon.planittoday.click)
- [x] **Colors** - I set the colors for the background as well as the text.
- [x] **Fonts** - I chose Merriweather for the fonts of the text. The color and font of the texts are styled using **Tailwind** color extensions.
- [x] **Header, footer, and main content body** - I used a common CSS file named 'main.cpp' to style these. I also used a high-priority common CSS file named 'app.css' to overide certain aspects of 'main.cpp' to achieve global aesthetics. The calendar page has its own 'calendar.css'. **Tailwind Flexbox** is used for the one line logo/title arrangment.
- [x] **Navigation elements** - I removed the **Tailwind Flexbox** from HTML and adjusted the classes in 'main.css' to create a simple list of buttons.
- [x] **Responsive to window resizing** Mostly done using **Tailwind** classes like **Flexbox**.
- [x] **Application elements** - I heavily utilized **Tailwind Flexbox** for the alignment of complex coponents.
- [x] **Application images** - Adjusted using **Tailwind** utilities and CSS overrides.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box [x] and added a description for things I completed. 

- [x] **Bundled using Vite** - Easy to install and use Vite.
- [x] **Components** - Brought the code over from HTML and CSS.
- [x] **Tailwind Implementation** - Due to recent updates to Tailwind, React can no longer be directly used to implement it. Craco was used as a workaround as I want to use the newest version of Tailwind.
- [x] **Routing** - Added the component and page routing.
- [x] **Redos** - Redid many styling elements that were somehow lost when converting from CSS to React.

## 🚀 React part 2: Reactivity

- [x] **React Context API** - Implemented React Context API to manage shared application state (user name, events, unavailable times).
- [x] **ESLint** - Refactored context implementation into a standard 3-file structure to comply with ESLint
- [x] **Functionality** - Added functionality to event adding and preference setting; added mocked functionality for other functions. 

## 🚀 Service

**Note for Graders:** To test the Google Calendar (third-party API) integration, please go to the "Preferences" page and click "Sync with Google." You will see a "Google hasn't verified this app" warning. This is expected. Please click "Advanced" and then "Go to planittoday.click (unsafe)" to proceed with the test. I have put all available Gmails for TAs and Professors that I could find as test users.

For this deliverable I did the following. I checked the box [x] and added a description for things I completed.

- [x] **Node.js/Express HTTP service** - Created a backend service in planit/service/index.js using Node.js and Express to provide API endpoints.
- [x] **Frontend served by Express** - The service is configured to serve the static frontend files (the React dist build) using express.static('public'). The deployService.sh script was updated to place the React build in this public directory.
- [x] **Frontend calls third party service** - Implemented Google Calendar as a third-party API. The frontend now has a "Sync with Google" flow, and the backend handles the OAuth 2.0 flow and event syncing.
- [x] **Backend provides service endpoints** - Added backend endpoints to manage all application data.
- [x] **Frontend calls service endpoints** - Refactored the entire React application to be driven by the backend API.
- [x] **Supports registration, login, logout, and restricted endpoint** - Implemented a full authentication system using cookies.

## 🚀 Database

For this deliverable I did the following. I checked the box [x] and added a description for things I completed.

- [x] **MongoDB Atlas** - Set up a MongoDB Atlas cluster to host all application data in a planit-db database.
- [x] **Database Module** - Created a database.js module in the service to handle all database connections and CRUD operations.
- [x] **Persistent Users** - Migrated user registration and login logic from in-memory arrays to the users collection in MongoDB. This includes storing emails and hashed passwords.
- [x] **Persistent App Data** - Migrated all application-specific data (calendar events and unavailable times) from in-memory objects to MongoDB collections (events, unavailableTimes), linked to users by their email.
- [x] **Persistent Google Tokens** - Updated the Google OAuth flow to store the user's googleRefreshToken in their users document, making the Google Calendar integration persistent across server restarts.

## 🚀 WebSocket

For this deliverable I did the following. I checked the box [x] and added a description for things I completed.

- [x] **Installed WebSocket** - Installed WebSocket with npm and updated the configuration files to match project's needs.
- [x] **Updated Backend Logic** - Updated essential backend implementations to reflect the addition of WebSocket.
- [x] **Updated Frontend** - Added collaboration functionality by changing the button on the calendar page to allow real-time teamwork through WebSocket.
- [x] **Fixed Google API** - Updated Client Secret file to make Google API functional again.
