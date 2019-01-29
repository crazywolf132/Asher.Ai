<p align="center" style="margin-top: -25px;">
  <img src="https://raw.githubusercontent.com/crazywolf132/AsherAPI/master/img/bg.png">
</p>
<h2 align="center">
    <a href="https://circleci.com/gh/crazywolf132/AsherAPI"><img src="https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg"/></a>
    <a href="#"><img src="https://forthebadge.com/images/badges/built-with-love.svg" /></a>
    <a class="badge-align" href="https://www.codacy.com/app/crazywolf132/AsherAPI?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=crazywolf132/AsherAPI&amp;utm_campaign=Badge_Grade"><img src="https://forthebadge.com/images/badges/for-you.svg"/></a>
    <a href=""./LICENSE">
    <img src="https://forthebadge.com/images/badges/certified-cousin-terio.svg"/>
    </a>
</h2>
<br />
<br />
<br />
<br />

## What the heck is this?
This is the Node.js API for the Asher personal assistant. Asher is a personal assistant with the aim of matching all the commands that products such as the Google Home can offer, and much more.

Asher is modular allowing for the community to add their part to his ever increasing module base.

## How do I connect?

`- Currently taken down the IP addresses as we are transfering to another server...`

There are 4 ways to connect to Asher.
1. Via REST API requests. Simply post a `post` request to `http://***.***.***.**/api/talk`, with the argument `command` and your message.
2. Via sockets. Port `4416` is open at `http://***.***.***.**/`, send a `message` through the socket with the raw text.
3. Via the WebApp. Open the ip of the machine in your browser, and use the messaging app. Eg. `http://0.0.0.0/`
4. Connect to one of the apps that you have made, or downloaded a listener and responder for.

Asher allows for any language that can either use sockets or send get requests to interact with him. We just need the raw text input, and we will do the rest.

## Lets build a mod!
Mods are constructed of a single file.
- `mod.js` This is automatically imported and run by the system. This mod file can have many sub-modules inside. All will be run.

To start off, we need to create a folder in the `mods` directory for our new Mod.
We are going to make a mod called `funny`.
We need to create the main `mod.js` file.

For more special characters to use inside of your words file. Feel free to head over to the wiki where we explain the different characters used in the words files.

Every mod is composed of:
<a href="https://raw.githubusercontent.com/crazywolf132/AsherAPI/master/mods/basicMods/mod.js">
<img src="https://raw.githubusercontent.com/crazywolf132/AsherAPI/master/img/mod_skeleton.png">
</a>

We are going to take that template, and we are going to add our elements to it:
<a href='https://github.com/crazywolf132/AsherAPI/blob/master/mods/funny/mod.js'>
<img src="https://raw.githubusercontent.com/crazywolf132/AsherAPI/master/img/our_mod.png">
</a>

Thats it. Asher now knows our `Funny` module, Once he restarts... we will be able to say one of our trigger words from the `words` array and he will run this mod.

## What is an overloader?
An overloader is kind of like a mod. Just... it will get run when Asher has no clue what to do.
The overloader that is used by default is his conversational Brain. He will assume what you have inputed
is part of a conversation, and will respond to it in whatever way he feels suits best.

## What is a Listener?
Listeners are similar to modules, but their only purpose is to connect to a service i.e. Discord, and wait for an incomming message before passing it on to the rest of the system to then process. There are 2 Listeners added to Asher by default. FB and Discord. You can easily setup both of these by following the Wiki Tutorial.
To enable a Listener (none are enabled by default), add the following just above the `this.Asher.loadOverloadModule('brain');` line in server.js

<img src="https://raw.githubusercontent.com/crazywolf132/AsherApi/master/img/handlers.png" />

By default, the socket listener will always start and be on... This is so the Chat App can work, but also any other 3rd party apps.

> Only one Listener can be used at a time. (Excluding the socket listener)

> Generally we surgest using the same Listener and Responder pair. Eg, Both discord or Both FB etc.

## What is a Responder?
Responders are almost the same as Listeners... just in reverse. When a responder is loaded... any responses will be sent through to that responder. So, inside the responder `.js` file. There will need to be a method to send the resulting response back to the person the first message came from. Much in the way that the Listener needs to have a way of providing the user the message came from.

To enable a responder, follow the same instructions as a Listener. Afterall, its all in the same function.

> Only one Responder can be used at a time.

> Generally we surgest using the same Listener and Responder pair. Eg, Both discord or Both FB etc.

## How do i create a Responder or Listener?
There is no real easy way to say how to make a Responder or Listener. It truely depends on the platform you are making one for, and the chosen API you are using for that.

One handy feature Asher has, to help you on this journy is this. `this.core.handlers.atts`. This is an object where you can store information that might be handy for the Responder. Eg, take a look at the discord listener, and see how it stores information for the discord responder. The reason this is done, is because of the discord API that is used, and simply how much data is returned from each message.

Although we cant really teach you how to make a responder here is a basic Responder template though.
> This is the template you must use... otherwise you wont recieve any information from Asher to the Responder.

<img src="https://raw.githubusercontent.com/crazywolf132/AsherApi/master/img/responder_template.png" />

Here is one for a listener too.

<img src="https://raw.githubusercontent.com/crazywolf132/AsherApi/master/img/listener_template.png" />


## Explenation of Asher's current brain.
At this point in time, asher remembers things much like a 4 year old.
The 4 year old remembers eating the last cookie, but when questioned about it, he doesnt remember a thing... though the memory is truely still there.

## Special thanks to...
- [Brayden Moon](https://github.com/crazywolf132)
- [Jamie](https://github.com/jsProj)
- [Kaidan](https://github.com/imnotbad/)
- [ThatsNoMoon](http://github.com/ThatsNoMoon)
- [Jean-Philippe Sirois](https://github.com/veksen)
