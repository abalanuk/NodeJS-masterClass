1. The API listens on a PORT and accepts incoming HTTP requests POST, GET, PUT, DELETE and HEAD
2. The API allows a client to connect, then create a new user, then edit and delete that user.
3. The API allows user to "sign in" which gives them a token that they can use for subsequent authenticated requests.
4. The API allows user to "sign out" which invalidates their token.
5. The API allows a signed-in user to use their token to create a new "check" by given URL if the system up or down.
6. The API allows a signed-in user to edit or delete any of their "check".
7. In the background, workers perform all the "checks" at the appropriate times and send the alert to the users when checks changes its state from "up" to "down" and vice versa.
