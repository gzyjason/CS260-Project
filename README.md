# PlanIt!
**PlanIt!** is a smart calendar website that allows the user to quickly add tasks and events to their plans without having to manually check or adjust available timeslots. 

## Specification Deliverable
### Elevator Pitch
In the modern age, online calendars are an important part of many people's lives. However, many people often spend a large part of their lives managing their favorite online calendars, checking and adjusting each timeslot to make time for new tasks and events. I believe that being organized should be simple to achieve, so I created PlanIt!, a smart calendar solution that can take in your preferences and do the necessary plannings automatically for you, so that you can actually spend time being productive instead of working toward being productive. 

### Design
![MOCK DESIGN PLANIT](https://github.com/user-attachments/assets/3e43c9f6-2483-4251-aaa4-a75d28519d1a)

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
