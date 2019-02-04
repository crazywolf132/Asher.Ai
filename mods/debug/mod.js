export function core(core) {
  core.Asher.hear("debug me", (payload, chat) => {
    chat
      .say("```" + JSON.stringify(core.Asher.actions) + "```");
  });
}