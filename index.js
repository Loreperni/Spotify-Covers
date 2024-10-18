const express = require("express");
const request = require("request");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
require("dotenv").config();

const app = express();
const redirect_uri = "http://localhost:8888/callback";
let ACCESS_TOKEN = "";
let TOTAL_ALBUMS = 0;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => res.render("home"));

app.get("/login", (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      process.env.CLIENT_ID
    }&scope=user-library-read&redirect_uri=${encodeURIComponent(redirect_uri)}`
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, (error, response) => {
    if (error || response.statusCode !== 200)
      return res.status(500).send("Errore durante l'autenticazione");
    ACCESS_TOKEN = response.body.access_token;
    res.redirect("/albums");
  });
});

app.get("/albums", async (req, res) => {
  try {
    const albums = await getAlbums();
    res.render("albums", {
      albums,
      sortBy: req.query.sortBy || "default",
      sortOrder: req.query.sortOrder || "asc",
    });
  } catch {
    res.status(500).send("Errore nel recupero degli album");
  }
});

app.get("/create-collage", async (req, res) => {
  res.render("loading");
  try {
    await createCollage(
      req.query.sortBy || "default",
      req.query.sortOrder || "asc"
    );
  } catch (error) {
    console.error("Errore nella creazione del collage:", error);
  }
});

app.get("/collage-status", (req, res) => {
  if (fs.existsSync("collage.png"))
    res.json({ status: "complete", totalAlbums: TOTAL_ALBUMS });
  else res.json({ status: "in-progress" });
});

app.get("/collage", (req, res) => {
  if (fs.existsSync("collage.png")) res.sendFile(__dirname + "/collage.png");
  else res.status(404).send("Collage non ancora pronto");
});

async function getAlbums() {
  const fetch = (await import("node-fetch")).default;
  let albums = [];
  let url = "https://api.spotify.com/v1/me/albums?limit=50";
  let nextUrl = null;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = async (url, options, retries = 3, backoff = 300) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await delay(backoff);
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      } else {
        throw error;
      }
    }
  };

  do {
    try {
      const data = await fetchWithRetry(nextUrl || url, {
        headers: {
          Authorization: "Bearer " + ACCESS_TOKEN,
        },
      });

      albums = albums.concat(
        data.items.map((item) => ({
          name: item.album.name,
          image: item.album.images[0].url,
          artist: item.album.artists[0].name,
        }))
      );
      nextUrl = data.next;
    } catch (error) {
      console.error("Errore nel recupero degli album:", error);
      break;
    }
  } while (nextUrl);

  TOTAL_ALBUMS = albums.length;
  console.log("Total albums retrieved:", TOTAL_ALBUMS);
  return albums;
}

function sortAlbums(albums, sortBy, sortOrder) {
  return [...albums].sort((a, b) => {
    let compareA, compareB;
    if (sortBy === "name") {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else if (sortBy === "artist") {
      compareA = a.artist.toLowerCase();
      compareB = b.artist.toLowerCase();
    } else {
      // For default sorting, use the original order
      return sortOrder === "asc" ? 0 : -1;
    }
    return sortOrder === "asc"
      ? compareA.localeCompare(compareB)
      : compareB.localeCompare(compareA);
  });
}

async function createCollage(sortBy, sortOrder) {
  try {
    const albums = await getAlbums();
    const sortedAlbums = sortAlbums(albums, sortBy, sortOrder);
    const canvas = createCanvas(1500, 1500);
    const ctx = canvas.getContext("2d");
    const imageSize = 100;
    let x = 0;
    let y = 0;

    for (const album of sortedAlbums) {
      try {
        const image = await loadImage(album.image);
        ctx.drawImage(image, x, y, imageSize, imageSize);
        x += imageSize;
        if (x >= canvas.width) {
          x = 0;
          y += imageSize;
        }
      } catch (error) {
        console.error(
          `Errore nel caricamento dell'immagine per l'album ${album.name}:`,
          error
        );
      }
    }

    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream("collage.png");
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        console.log("Immagine collage creata!");
        resolve();
      });
      out.on("error", reject);
    });
  } catch (error) {
    console.error("Errore nella creazione del collage:", error);
    throw error;
  }
}

app.listen(8888, () => console.log("Server running on http://localhost:8888/"));