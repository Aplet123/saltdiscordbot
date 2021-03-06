// this whole file is typescript stuff
/* const {
  DMChannel, GroupDMChannel, Guild, GuildMember, Message, PermissionResolvable, TextChannel, User,
} = require("discord.js");
const Searcher = require("../classes/Searcher");
const {
  ExtendedActionLogOptions, ExtendedMsgOptions, ExtendedSend, IAmbigResult, IDoEvalResult, IPromptOptions, SaltRole,
} = require("../commandHandler");

// export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

interface IBaseContext<ChannelType> {
  args?: string;
  arrArgs?: string[];
  author: User;
  authorTag: string;
  botmember?: GuildMember;
  channel: ChannelType;
  content: string;
  dummy: {[prop: string]: any};
  guild?: Guild;
  guildId: string;
  input: string;
  instruction?: string;
  member?: GuildMember;
  message: Message;
  msg: Message;
  perms?: {[perm: string]: boolean};
  setPerms?: {[perm: string]: boolean};
  prefix: string;
  searcher?: Searcher<GuildMember>;
  self: BaseContext<ChannelType>;
}

interface IFuncs {
  actionLog: (options: ExtendedActionLogOptions) => Promise<Message>;
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  doEval: (content: string, subC?: {[prop: string]: any}) => Promise<IDoEvalResult>;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  prompt: (options: IPromptOptions) => Promise<string>;
  promptAmbig: <T>(members: T[], pluralName?: string) => Promise<IAmbigResult<T>>;
  reply: ExtendedSend;
  send: ExtendedSend;
}

interface IContext {
  channel: DjsChannel;
}

interface ITContext {
  channel: TextChannel;
}

export type BaseContext<ChannelType> = IBaseContext<ChannelType> & IFuncs;
export type Context = BaseContext<DjsChannel>;
export type TContext = BaseContext<TextChannel>;

export type cmdFunc = (msg: Message, context: Context) => any;
export type TcmdFunc = (msg: Message, context: TContext) => any; */
