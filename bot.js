const colors = require("chalk");
const changeConsole = require("./changeConsole");
process.on("unhandledRejection", rejection => {
  console.log(colors.red("[ERR/REJCTUNH]"), rejection);
});
const setShards = { id: null };
changeConsole(false, setShards);
console.log("Initializing...");
const {
  botMessage, checkMutes, IMessagerEvalData, loadCmds, messagerDoEval, processMessage, rejct,
} = require("./util/funcs");
const { bot, data, decodeT, Discord, fs, logger, messager, /* sql, */ Time, toml } = require("./util/deps");
require("./misc/events");
setShards.id = bot.shard.id;
const cmds = require("./commands/cmdIndex");
const { Collection, Message } = Discord;
process.on("message", mdata => {
  processMessage(mdata);
});
bot.on("message", m => {
  botMessage(m);
});
loadCmds();
messager.on("doEval", edata => {
  messagerDoEval(thing => eval(thing))(edata);
});
// sql.sync().catch(rejct);
bot.login(decodeT(data.bot.token_beta)).catch(rejct);
setInterval(checkMutes, Time.seconds(10));