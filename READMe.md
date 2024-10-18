# Spotify Album Collage Creator

A web application that allows users to create a collage using the covers of their favorite Spotify albums. Users can log in with their Spotify account, fetch their albums, and arrange them based on their preferences.

## Features

- User authentication via Spotify OAuth.
- Fetch and display a user's Spotify albums.
- Sort albums by name or artist.
- Create and download a collage of album covers.

## Technologies Used

- **Node.js**: Backend server.
- **Express**: Web framework for Node.js.
- **EJS**: Templating engine for rendering HTML.
- **Canvas**: For creating the collage of album covers.
- **Spotify Web API**: To fetch user album data.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/) (Node package manager)

## Getting Started

### 1. Clone the Repository

Clone this repository to your local machine using:

```bash
git clone https://github.com/Loreperni/spotify-covers
cd spotify-covers
2. Install Dependencies
Navigate to the project directory and install the required packages:

npm install
3. Set Up Environment Variables
Create a .env file in the root of the project directory and add your Spotify API credentials:

CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
You need to create an application on the Spotify Developer Dashboard to get your credentials.

4. Run the Application
To start the server, run:

node index.js
The application will be available at http://localhost:8888/.

5. Access the Application
Open your browser and go to http://localhost:8888/. Click on the "Log in with Spotify" button to authenticate and begin using the application.

Usage
Log in to your Spotify account.
Once authenticated, the application fetches your saved albums.
Sort the albums by name or artist using the dropdown menu.
Click the "Create Collage" button to generate and download a collage of your album covers.
Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue if you encounter any bugs or have suggestions for improvements.

