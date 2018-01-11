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

## What the heck is this?
This is the Node.js API for the Asher personal assistant. Asher is a personal assistant with the aim of matching all the commands that products such as the Google Home can offer, and much more.

Asher is modular allowing for the community to add their part to his ever increasing module base.

## How do I connect?
There are 2 ways to connect to Asher.
1. Via REST API requests. Simply post a `get` request to `http://165.227.116.53/api/talk`, with the argument `command` and ur message.
2. Via sockets. Port `4416` is open at `http://165.227.116.53/`, send a `message` through the socket with the raw text.

Asher allows for any language that can either use sockets or send get requests to interact with him. We just need the raw text input, and we will do the rest.

## Lets build a mod!
Mods are constructed of 3 parts.
- The Actual mod file `mod.js`
- The words file `words.txt`, which contains examples of triggers
- The type file `type.txt`. This is used to tell the system what kind of mod this is.

To start off, we need to create a folder in the `mods` directory for our new Mod.
We are going to make a mod called `funny`.
We then need to create all 3 of those files inside that folder.

We are going to start work on the `words.txt` file. We now need to decide different examples of triggering the mod. Seeing as our mod is going to be a joke mod. Here is what our words file is going to look like.
```
tell .? a joke
do you have any jokes?
(i|we) would love to hear some jokes!
```
For more special characters to use inside of your words file. Feel free to head over to the wiki where we explain the different characters used in the words files.

We now need to set the `type.txt` file. As we can see from our words file, our does not fit one of these categories...
```
- Who
- What
- When
- Where
- Why
- How
```
So, we need to set it as `other`. Thats it, our system will be able to do the rest.

We just now need to work on the actual `mod.js` file!
Every mod is composed of:
```JS
module.exports = (async (subject, message, socket) => {
    return //Your message to go back to the user.
});
```
We are going to take that template, and we are going to add our elements to it:
```JS
module.exports = (async (subject, message, socket) => {
    jokes = [
      'I wrote a song about a tortilla. Well actually, it’s more of a wrap.',
      '“Um.” —First horse that got ridden',
      'Some people just have a way with words, and other people … oh … not have way.'
    ]
    return (jokes[Math.floor(Math.random() * jokes.length - 1)]);
});
```

Thats it. Asher now knows our `Funny` module, Once he restarts... we will be able to say one of our trigger words from `words.txt` and he will run this mod.

## Special thanks to...
- [Brayden Moon](https://github.com/crazywolf132)
- [Jamie](https://github.com/jsProj)
- [Kaidan](https://github.com/imnotbad/)
- [ThatsNoMoon](http://github.com/ThatsNoMoon)
