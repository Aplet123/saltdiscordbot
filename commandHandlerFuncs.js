const {
  Collection, DMChannel, GroupDMChannel, Guild, GuildMember, Message, MessageOptions, StringResolvable,
  TextChannel, User,
} = require("discord.js");
const actionLog = require("./classes/actionlogger");
const messager = require("./classes/messager");
const Searcher = require("./classes/searcher");
const deps = require("./util/deps");
const { bot, Constants, db, logger, util } = require("./util/deps");
const funcs = require("./util/funcs");
const { capitalize, cloneObject, rejct } = require("./util/funcs");

// const { bot, Constants, logger } = deps;
// const { cloneObject, rejct } = funcs;

/* export type ExtendedActionLogOptions = ILogOption & {
  guild?: any,
};

export type ExtendedSend = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable, options?: ExtendedMsgOptions): Promise<Message>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedSendArr = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable[], options?: ExtendedMsgOptions): Promise<Message[]>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedMsgOptions = MessageOptions & ICustomSendType;

export interface IAmbigResult<T> {
  cancelled: boolean;
  member?: T;
}

interface ICustomSendType {
  autoCatch?: boolean;
}

export interface IDoEvalResult {
  success: boolean;
  result: any;
}

export interface IPromptOptions {
  question: string;
  invalidMsg: string;
  filter: ((msg: Message) => any);
  timeout?: number;
  cancel?: boolean;
  options?: ExtendedMsgOptions;
}

export type SaltRole = "moderator"
  | "mod"
  | "administrator"
  | "admin";

export type TextBasedChannel = DMChannel | TextChannel | GroupDMChannel; */

module.exports = function returnFuncs(msg) {
  const input = msg.content;
  const channel = msg.channel;
  const message = msg;
  const guildId = msg.guild ? msg.guild.id : null;
  const guild = msg.guild || null;

  const sendingFunc = func => { // factory for sending functions
    return (content, options) => {
      if (typeof content === "object" && !options && !(content instanceof Array)) {
        options = content;
        content = "";
      } else if (!options) {
        options = {};
      }
      const result = func(content, options);
      if (options.autoCatch == null || options.autoCatch) {
        result.catch(rejct);
      }
      return result;
    };
  };
  const reply = sendingFunc(msg.reply.bind(msg));
  const send = sendingFunc(channel.send.bind(channel));
  const checkRole = (role, member) => {
    if (["mod", "admin"].includes(role)) {
      role = role === "mod" ? "moderator" : "administrator";
    }
    if (!guildId) {
      return false;
    }
    const result = db.table("mods").get(guild.id);
    if (!result || !result[role]) {
      return false;
    }
    if (Array.isArray(result[role])) {
      for (const roleID of result[role]) {
        if (member.roles.has(roleID)) return true;
      }
    } else {
      return member.roles.has(result[role]);
    }
  };
  const promptAmbig = async (members, pluralName = "members") => {
    let satisfied = false;
    let cancelled = false;
    let currentOptions = [];

    const getTag = gm => gm.user ? gm.user.tag : (gm.tag || gm.toString());

    members.forEach(gm => currentOptions.push(gm));
    const filter = msg2 => {
      const options = currentOptions;
      if (msg2.author.id !== msg.author.id) {
        return false;
      }
      if (msg2.content === "cancel" || msg2.content === "`cancel`") {
        cancelled = true;
        return true;
      }
      const tagOptions = options.map(gm => getTag(gm));
      if (tagOptions.includes(msg2.content)) {
        satisfied = true;
        currentOptions = [options[tagOptions.indexOf(msg2.content)]];
        return true;
      }
      const collOptions = new Collection();
      options.forEach(gm => {
        collOptions.set(gm.id || gm.toString(), gm);
      });
      const searcher2 = new Searcher({ members: collOptions });
      const resultingMembers = searcher2.searchMember(msg2.content);
      if (resultingMembers.length < 1) {
        return true;
      }
      if (resultingMembers.length > 1) {
        currentOptions = resultingMembers;
        return true;
      }
      satisfied = true;
      currentOptions = resultingMembers;
      return true;
    };
    reply(`Multiple ${pluralName} have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
\`${currentOptions.map(gm => getTag(gm)).join("`, `")}\``);
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const result = await channel.awaitMessages(
          filter, {
            time: Constants.times.AMBIGUITY_EXPIRE, max: 1,
            errors: ["time"],
          },
        );
        if (satisfied) {
          return {
            member: currentOptions[0],
            cancelled: false,
          };
        }
        if (cancelled) {
          send("Command cancelled.");
          return {
            member: null,
            cancelled: true,
          };
        }
        if (i < 5) {
          reply(`Multiple ${pluralName} have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
**Members Matched**:
\`${currentOptions.map(gm => getTag(gm)).join("`,`")}\``);
        }
      } catch (err) {
        logger.error(`At PromptAmbig: ${err}`);
        send("Command cancelled.");
        return {
          member: null,
          cancelled: true,
        };
      }
    }
    send("Automatically cancelled command.");
    return {
      member: null,
      cancelled: true,
    };
  };
  const hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;

  const userError = data => reply(
    `Sorry, but it seems there was an error while executing this command. \
If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);

  const prompt = async (
    {
      question, invalidMsg, filter,
      timeout = Constants.times.AMBIGUITY_EXPIRE, cancel = true,
      options = {} },
  ) => {
    let cancelled = false;
    let satisfied = null;
    const filterToUse = msg2 => {
      if (msg2.content === "cancel" && cancel) {
        return (cancelled = true);
      }
      const result = filter(msg2);
      if (result !== false && result != null) {
        satisfied = msg2;
        return true;
      }
      return false;
    };
    const sentmsg = await send(question, options || {});
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const msgs = await msg.channel.awaitMessages(filterToUse, { time: timeout, max: 1, errors: ["time"] });
        if (!satisfied) {
          if (i < 5) {
            send(invalidMsg);
          }
          continue;
        }
        if (cancelled) {
          break;
        }
        if (satisfied) {
          return satisfied.content;
        }
      } catch (err) {
        break;
      }
    }
    send("Command cancelled.");
    return "";
  };

  const actionLog2 = options => {
    if (!msg.guild) {
      return;
    }
    const newOptions = Object.assign({ guild: msg.guild }, options);
    return actionLog.log(newOptions);
  };

  let obj = {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, prompt, actionLog: actionLog2,
  };

  // let obj: typeof oldObj & { doEval: (content: string, subC?: {[prop: string]: any}) => Promise<any> };

  const doEval = (content, subC = {}) => {
    const objectToUse = Object.assign({}, obj, {
      bot, msg, message: msg,
      channel, guildId, deps,
      funcs, context: subC || {},
      guild, db,
    });
    const data = {
      content,
      id: Date.now(),
      vars: objectToUse,
    };
    return messager.awaitForThenEmit("doEval", data, data.id + "eval");
  };
  obj = Object.assign(obj, { doEval });

  return obj;
};
