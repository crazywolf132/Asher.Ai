<p align="center" style="margin-top: -25px;">
  <img src="https://raw.githubusercontent.com/crazywolf132/AsherAPI/master/img/bg.png">
</p>
<h2 align="center">
    <a href="https://circleci.com/gh/crazywolf132/AsherAPI"><img src="https://circleci.com/gh/manekinekko/google-actions-server.svg?style=svg"/></a>
    <a href="https://codeclimate.com/github/crazywolf132/AsherAPI/maintainability"><img src="https://api.codeclimate.com/v1/badges/e66235017865b51adbf2/maintainability" /></a>
</h2>
<br />
<br />
<br />
<br />

### What the heck is this?
This is the Node.js API for the Asher personal assistant. Asher is a personal assistant with the aim of matching all the commands that products such as the Google Home can offer, and much more.

Asher is modular allowing for the community to add their part to his ever increasing module base.

### How do i connect?
There are 2 ways to connect to Asher.
1. Via REST API requests. Simply post a `get` request to `http://165.227.116.53/api/talk`, with the argument `command` and ur message.
2. Via sockets. Port `4416` is open at `http://165.227.116.53/`, send a `message` through the socket with the raw text.

Asher allows for any language that can either use sockets or send get requests to interact with him. We just need the raw text input, and we will do the rest.

### Special thanks to...
- [Brayden Moon](https://github.com/crazywolf132)
- [Jamie](https://github.com/jsProj)
- [Kaidan](https://github.com/imnotbad/)
- [ThatsNoMoon](http://github.com/ThatsNoMoon)
