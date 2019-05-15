console.log("test");

var results = [
  { stationName: "Abcoude", stationId: "8400047" },
  { stationName: "Arnhem Centraal", stationId: "8400071" },
  { stationName: "Aachen Hbf", stationId: "8015345" },
  { stationName: "Arnhem Velperpoort", stationId: "8400072" },
  { stationName: "Arnhem Presikhaaf", stationId: "8400075" },
  { stationName: "Arnhem Zuid", stationId: "8400227" },
  { stationName: "Aime-la-Plagne", stationId: "8774176" },
  { stationName: "Aix-en-Provence TGV", stationId: "8731901" },
  { stationName: "Arkel", stationId: "8400068" },
  { stationName: "Akkrum", stationId: "8400049" },
  { stationName: "Albertville", stationId: "8774164" },
  { stationName: "Almere Centrum", stationId: "8400080" },
  { stationName: "Almere Buiten", stationId: "8400081" },
  { stationName: "Almere Muziekwijk", stationId: "8400082" },
  { stationName: "Almere Oostvaarders", stationId: "8400226" },
  { stationName: "Almere Parkwijk", stationId: "8400104" },
  { stationName: "Amersfoort", stationId: "8400055" },
  { stationName: "Amersfoort Schothorst", stationId: "8400054" },
  { stationName: "Almelo", stationId: "8400051" },
  { stationName: "Alkmaar", stationId: "8400050" },
  { stationName: "Almelo de Riet", stationId: "8400520" },
  { stationName: "Alkmaar Noord", stationId: "8400052" },
  { stationName: "Anna Paulowna", stationId: "8400065" },
  { stationName: "Antwerpen-Noorderdokken", stationId: "8821089" },
  { stationName: "Apeldoorn", stationId: "8400066" },
  { stationName: "Apeldoorn De Maten", stationId: "8400233" },
  { stationName: "Apeldoorn Osseveld", stationId: "8400229" },
  { stationName: "Appingedam", stationId: "8400067" },
  { stationName: "Alphen a/d Rijn", stationId: "8400053" },
  { stationName: "Arnemuiden", stationId: "8400069" },
  { stationName: "Amsterdam Amstel", stationId: "8400057" },
  { stationName: "Amsterdam Bijlmer ArenA", stationId: "8400074" },
  { stationName: "Amsterdam Centraal", stationId: "8400058" },
  { stationName: "Amsterdam Lelylaan", stationId: "8400079" },
  { stationName: "Amsterdam Muiderpoort", stationId: "8400060" },
  { stationName: "Amsterdam Zuid", stationId: "8400061" },
  { stationName: "Amsterdam Holendrecht", stationId: "8400231" },
  { stationName: "Assen", stationId: "8400073" },
  { stationName: "Amsterdam Sloterdijk", stationId: "8400059" },
  { stationName: "Amsterdam Science Park", stationId: "8400235" },
  { stationName: "Aalten", stationId: "8400045" }
];

require("dotenv").config();

const express = require("express");
var session = require("express-session");
const app = express();
var bodyParser = require("body-parser");
var mongo = require("mongodb");
var request = require("request");
const dotenv = require("dotenv");

var http = require("http").Server(app);
const port = process.env.PORT || 3000;

let ejs = require("ejs");
let io = require("socket.io")(http);

app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
  })
);

var db = null;
var url = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT;

mongo.MongoClient.connect(
  url,
  function(error, client) {
    if (error) {
      throw error;
    } else {
      console.log("gelukt?");
    }
    db = client.db(process.env.DB_NAME);
  }
);
//end

app.get("/", (req, res) => res.render("../views/pages/index.ejs"));

app.post("/login", (req, res) => {
  console.log("PARAMS", req.params);
  console.log("inloggen");
  var email = req.body.email;
  var password = req.body.password;

  db.collection("profiles").findOne(
    {
      email: email
    },
    done
  );
  function done(err, user) {
    console.log("ingelogde gebruiker", user);
    if (!req.session.user) {
      console.log("nog geen session: dus maak aan");
      req.session.user = { user };
      console.log(req.session.user);
    } else {
      console.log("er is wel een session");
      console.log(req.session.user);
    }

    res.render("../views/pages/profile.ejs", {
      user: req.session.user.user,
      data: results,
      friends: req.session.user.user.vrienden
        ? req.session.user.user.vrienden
        : [{ name: "Je hebt nog geen vrienden :(" }],
      invite: req.session.user.user.invite
        ? req.session.user.user.invite
        : [{ name: "Je hebt geen uitnodigingen..." }]
    });
    //
    // var options = {
    //   url:
    //     "https://gateway.apiportal.ns.nl/public-reisinformatie/api/v2/stations",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Ocp-Apim-Subscription-Key": "a25da04c7ab94cf1bf6a3663aa4fb712"
    //   }
    // };
    //
    // function callback(error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     var data = JSON.parse(body);
    //     var data = data.payload;
    //
    //     var results = data.map(station => {
    //       return {
    //         stationName: station.namen.lang,
    //         stationId: station.UICCode
    //       };
    //     });
    //     console.log(results);
    //
    //     res.render("../views/pages/profile.ejs", {
    //       user: req.session.user,
    //       data: results
    //     });
    //   }
    // }
    // request(options, callback);
  }
});

app.post("/vrienduitnodigen/:email", (req, res) => {
  // var email = req.body.email;

  console.log("vriend uitnodigen");

  db.collection("profiles").findOne(
    {
      email: req.params.email
    },
    done
  );

  function done(err, user) {
    //console.log(req.session.user._id);

    db.collection("profiles").updateOne(
      user,
      {
        $set: {
          inviteby: {
            _id: req.session.user.user._id,
            email: req.session.user.user.email,
            name: req.session.user.user.name
          }
        }
      },
      oninsert
    );

    function oninsert(error, user) {
      if (error) {
        console.log(error);
      } else {
        //  console.log(user);
        res.redirect(200, "/");
      }
    }
  }
});
// io.on("connection", socket => {
//   var msgCount = [];
//   socket.on("chat message", msg => {
//     var msg = msg.split(" ").map(word => {
//       msgCount++;
//       return emoji.get(word) || word;
//     });
//     console.log(msgCount);
//
//     var msg = msg
//       .toString()
//       .replace(/,/g, " ")
//       .replace(/:/g, "");
//
//     io.emit("chat message", msg, msgCount);
//   });
// });

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
