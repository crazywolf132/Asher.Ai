import GoogleHome from "google-home-push";

export function core(core) {
    core.Asher.hear("introduce yourself", (payload, chat) => {
        chat.say("Hi, I am asher.").then(() => {
            chat.say("I am here to help you in whatever way you need!")
        })
    })

    core.Asher.hear(['commands', 'what are your commands'], (payload, chat) => {
        chat.say('Well... here is a few of the commands off the top of my head.').then(() => {
            chat.say("'introduce yourself'")
            chat.say("'what is * (+/-*) *'")
            chat.say("'what is the time?'")
            chat.say("'flip a coin'")
            chat.say("'tell me a joke'")
            chat.say("'set a timer for * (minutes/seconds/hours)'")
        })
    })

    core.Asher.hear('who is your (father|creator|maker)', (payload, chat) => {
        let res = ['Crazywolf is', 'The one and only Brayden Moon', 'I think you know...']
        let pos = Math.floor(Math.random() * res.length)
        
        chat.say(res[pos]).then(() => {
            if (pos == res.length - 1) {
                chat.say('God is. The same as you.')
            }
        })
    })

    core.Asher.hear('(enable|disable) dark mode .?', (payload, chat, found) => {
        if (found.found.includes('disable')) {
            chat.say('{darkmode: false}')
        } else {
            chat.say('{darkmode: true}')
        }
    });

    core.Asher.hear('(cast|broadcast) *? to *?', (payload, chat, found) => {
        let res = found.found.replace("to ", ":");
        res = res.replace('broadcast', '')
        res = res.replace('cast', '')
        res = res.split(":")

        const myHome = new GoogleHome(`${res[1]}`);

        myHome.speak(res[0]);

        chat.say("done");
    });

    core.Asher.hear('play *? on *?', (payload, chat, found) => {
        let res = found.found.replace('on ', '-$-$-')
        res = res.replace('play', '')
        res = res.split('-$-$-');

        const myHome = new GoogleHome(`${res[1]}`);
        myHome.push(res[0]);

        chat.say('Sure thing')
    })
}