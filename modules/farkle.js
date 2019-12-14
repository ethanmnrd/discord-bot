"use strict";

const Discord = require("discord.js");
const { BotCore, console, BotModule, BotSender, BotUtil } = require("node_modules/@grabz-dev/discord-bot-core/main.js");
const { CanvasRenderService } = require("node_modules/chartjs-node-canvas/dist/index.js");

/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/BotCore").Access} BotCore.Access */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/MongoWrapper")} MongoWrapper */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/MongoWrapper").Session} MongoWrapper.Session */
/** @typedef {import("mysql").FieldInfo} MySQL.FieldInfo */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/SQLWrapper")} SQLWrapper */
/** @typedef {import("node_modules/tingodb/lib/ObjectId")} ObjectID */

/**
 * @typedef {object} Db.farkle_main
 * @property {number=} id
 * @property {Discord.Snowflake} leaderboard_channel_id
 * @property {Discord.Snowflake} leaderboard_message_id
 */

/**
 * @typedef {object} Db.farkle_servers
 * @property {number=} id
 * @property {Discord.Snowflake} guild_id
 * @property {Discord.Snowflake} user_id
 * @property {Discord.Snowflake} user_id_host
 */

/**
 * @typedef {object} Db.farkle_viewers
 * @property {number=} id
 * @property {Discord.Snowflake} user_id_target
 * @property {Discord.Snowflake} user_id
 * @property {Discord.Snowflake} channel_dm_id
 */

/**
 * @typedef {object} Db.farkle_current_players
 * @property {number=} id
 * @property {number} id_current_games
 * @property {boolean} ready_status
 * @property {number} money_wager
 * @property {number} turn_order
 * @property {Discord.Snowflake} user_id
 * @property {Discord.Snowflake} channel_dm_id
 * @property {number} total_points_banked
 * @property {number} total_points_lost
 * @property {number} total_points_skipped
 * @property {number} total_rolls
 * @property {number} total_folds
 * @property {number} total_finishes
 * @property {number} total_skips
 * @property {number} highest_points_banked
 * @property {number} highest_points_lost
 * @property {number} highest_points_skipped
 * @property {number} highest_rolls_in_turn
 * @property {number} highest_rolls_in_turn_without_fold
 */

/**
 * @typedef {object} Db.farkle_current_games
 * @property {number=} id
 * @property {Discord.Snowflake} guild_id
 * @property {boolean} has_started
 * @property {number} match_start_time
 * @property {number} money_pot
 * @property {number} points_goal
 * @property {Discord.Snowflake} current_player_user_id
 * @property {string} current_player_rolls
 * @property {number} current_player_points
 * @property {number} current_player_rolls_count
 */

/**
 * @typedef {object} Db.farkle_history_players
 * @property {number} id
 * @property {number} id_history_games
 * @property {Discord.Snowflake} user_id
 * @property {number} money_wager
 * @property {number} money_free
 * @property {number} turn_order
 * @property {boolean} has_conceded
 * @property {number} total_points_banked
 * @property {number} total_points_lost
 * @property {number} total_points_skipped
 * @property {number} total_rolls
 * @property {number} total_folds
 * @property {number} total_finishes
 * @property {number} total_skips
 * @property {number} highest_points_banked
 * @property {number} highest_points_lost
 * @property {number} highest_points_skipped
 * @property {number} highest_rolls_in_turn
 * @property {number} highest_rolls_in_turn_without_fold
 */

/**
 * @typedef {object} Db.farkle_history_games
 * @property {number} id
 * @property {Discord.Snowflake} guild_id
 * @property {number} match_start_time
 * @property {number} match_end_time
 * @property {number} money_pot
 * @property {number} points_goal
 * @property {Discord.Snowflake} user_id_winner
 */

/**
 * @typedef {object} Db.farkle_users
 * @property {number=} id
 * @property {Discord.Snowflake} user_id
 * @property {string} skin
 */

const F = Object.freeze({
    matches: Object.freeze([
        { m: [1, 2, 3, 4, 5, 6],    p: 1500 },
        { m: [2, 3, 4, 5, 6],       p: 750  },
        { m: [1, 2, 3, 4, 5],       p: 500  },
        { m: [1, 1, 1, 1, 1, 1],    p: 8000 },
        { m: [1, 1, 1, 1, 1],       p: 4000 },
        { m: [1, 1, 1, 1],          p: 2000 },
        { m: [1, 1, 1],             p: 1000 },
        { m: [5, 5, 5, 5, 5, 5],    p: 4000 },
        { m: [5, 5, 5, 5, 5],       p: 2000 },
        { m: [5, 5, 5, 5],          p: 1000 },
        { m: [5, 5, 5],             p: 500 },
        { m: [6, 6, 6, 6, 6, 6],    p: 4800 },
        { m: [6, 6, 6, 6, 6],       p: 2400 },
        { m: [6, 6, 6, 6],          p: 1200 },
        { m: [6, 6, 6],             p: 600 },
        { m: [4, 4, 4, 4, 4, 4],    p: 3200 },
        { m: [4, 4, 4, 4, 4],       p: 1600 },
        { m: [4, 4, 4, 4],          p: 800  },
        { m: [4, 4, 4],             p: 400  },
        { m: [3, 3, 3, 3, 3, 3],    p: 2400 },
        { m: [3, 3, 3, 3, 3],       p: 1200 },
        { m: [3, 3, 3, 3],          p: 600  },
        { m: [3, 3, 3],             p: 300  },
        { m: [2, 2, 2, 2, 2, 2],    p: 1600 },
        { m: [2, 2, 2, 2, 2],       p: 800 },
        { m: [2, 2, 2, 2],          p: 400 },
        { m: [2, 2, 2],             p: 200 },
        { m: [1],                   p: 100 },
        { m: [5],                   p: 50  },
    ]),
    colors: Object.freeze([
        0,         
        11460749,
        7911119,
        13016423,
        12084573,
        6512567,
        6075827,
        12693569,
        11881878,
        9718194,
        1151377
    ]),
    skins: Object.freeze({
        braille: {
            1: "⡀",
            2: "⣀",
            3: "⣄",
            4: "⣤",
            5: "⣦",
            6: "⣶"
        },
        keycaps: {
            1: "1️⃣",
            2: "2️⃣",
            3: "3️⃣",
            4: "4️⃣",
            5: "5️⃣",
            6: "6️⃣"
        },
        dice: {
            1: "⚀",
            2: "⚁",
            3: "⚂",
            4: "⚃",
            5: "⚄",
            6: "⚅"
        },
        digits: {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6"
        },
        chinese: {
            1: "一",
            2: "二",
            3: "三",
            4: "四",
            5: "五",
            6: "六"
        }
    }),
    currency: "\💎", //₿ ƒ
    startingCurrency: 1
});



class Farkle extends BotModule {
    /**
     * @constructor
     * @param {BotCore.Access} bot
     * @param {MongoWrapper} db 
     * @param {SQLWrapper} sql
     */
    constructor(bot, db, sql) {
        super(bot, db, sql);
    }
    
    /** @param {Discord.Guild} guild - Current guild. */
    init(guild) {
        super.init(guild);

        this.sql.session(guild, async query => {
            await query(`CREATE TABLE IF NOT EXISTS farkle_main (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, leaderboard_channel_id TINYTEXT NOT NULL, leaderboard_message_id TINYTEXT NOT NULL)`);
        }).catch(console.error);

        this.sql.session(null, async query => {
            await query(`CREATE TABLE IF NOT EXISTS farkle_current_players (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, id_current_games BIGINT UNSIGNED NOT NULL, ready_status BOOLEAN NOT NULL, money_wager DECIMAL(13, 2) UNSIGNED NOT NULL, turn_order SMALLINT NOT NULL, user_id TINYTEXT NOT NULL, channel_dm_id TINYTEXT NOT NULL, total_points_banked SMALLINT UNSIGNED NOT NULL, total_points_lost SMALLINT UNSIGNED NOT NULL, total_points_skipped SMALLINT UNSIGNED NOT NULL, total_rolls INT UNSIGNED NOT NULL, total_folds INT UNSIGNED NOT NULL, total_finishes INT UNSIGNED NOT NULL, total_skips INT UNSIGNED NOT NULL, highest_points_banked SMALLINT UNSIGNED NOT NULL, highest_points_lost SMALLINT UNSIGNED NOT NULL, highest_points_skipped SMALLINT UNSIGNED NOT NULL, highest_rolls_in_turn INT UNSIGNED NOT NULL, highest_rolls_in_turn_without_fold INT UNSIGNED NOT NULL);`);
            await query(`CREATE TABLE IF NOT EXISTS farkle_current_games (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, guild_id TINYTEXT NOT NULL, has_started BOOLEAN NOT NULL, match_start_time BIGINT NOT NULL, money_pot DECIMAL(13, 2) UNSIGNED NOT NULL, points_goal SMALLINT UNSIGNED NOT NULL, current_player_user_id TINYTEXT NOT NULL, current_player_rolls TINYTEXT NOT NULL, current_player_points SMALLINT UNSIGNED NOT NULL, current_player_rolls_count INT UNSIGNED NOT NULL);`);
        
            await query(`CREATE TABLE IF NOT EXISTS farkle_history_players (id BIGINT UNSIGNED PRIMARY KEY, id_history_games BIGINT UNSIGNED NOT NULL, user_id TINYTEXT NOT NULL, money_wager DECIMAL(13, 2) UNSIGNED NOT NULL, money_free DECIMAL(13, 2) UNSIGNED NOT NULL, turn_order SMALLINT NOT NULL, has_conceded BOOLEAN NOT NULL, total_points_banked SMALLINT UNSIGNED NOT NULL, total_points_lost SMALLINT UNSIGNED NOT NULL, total_points_skipped SMALLINT UNSIGNED NOT NULL, total_rolls INT UNSIGNED NOT NULL, total_folds INT UNSIGNED NOT NULL, total_finishes INT UNSIGNED NOT NULL, total_skips INT UNSIGNED NOT NULL, highest_points_banked SMALLINT UNSIGNED NOT NULL, highest_points_lost SMALLINT UNSIGNED NOT NULL, highest_points_skipped SMALLINT UNSIGNED NOT NULL, highest_rolls_in_turn INT UNSIGNED NOT NULL, highest_rolls_in_turn_without_fold INT UNSIGNED NOT NULL);`);
            await query(`CREATE TABLE IF NOT EXISTS farkle_history_games (id BIGINT UNSIGNED PRIMARY KEY, guild_id TINYTEXT NOT NULL, match_start_time BIGINT NOT NULL, match_end_time BIGINT NOT NULL, money_pot DECIMAL(13, 2) UNSIGNED NOT NULL, points_goal SMALLINT UNSIGNED NOT NULL, user_id_winner TINYTEXT NOT NULL);`);
        
            await query(`CREATE TABLE IF NOT EXISTS farkle_servers (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, guild_id TINYTEXT NOT NULL, user_id TINYTEXT NOT NULL, user_id_host TINYTEXT NOT NULL)`)
            await query(`CREATE TABLE IF NOT EXISTS farkle_users (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id TINYTEXT NOT NULL, skin TINYTEXT NOT NULL)`);
            await query(`CREATE TABLE IF NOT EXISTS farkle_viewers (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id_target TINYTEXT NOT NULL, user_id TINYTEXT NOT NULL, channel_dm_id TINYTEXT NOT NULL)`);
            
            this.update.bind(this)(guild.client);

            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players cp JOIN farkle_current_games cg ON cp.id_current_games = cg.id WHERE cg.guild_id = ${guild.id}`)).results;

            /** @type {Db.farkle_viewers[]} */
            var docVs = (await query(`SELECT v.id, v.user_id_target, v.user_id, v.channel_dm_id FROM farkle_viewers v JOIN farkle_current_players cp ON v.user_id_target = cp.user_id JOIN farkle_current_games cg ON cp.id_current_games = cg.id WHERE cg.guild_id = ${guild.id}`)).results;

            /** @type {(Db.farkle_current_players|Db.farkle_viewers)[]} */
            var docCPVs = [];
            docCPVs = docCPVs.concat(docCPs, docVs);

            for(let attendee of docCPVs) {
                let member = guild.members.get(attendee.user_id);
                if(!member) return; //TODO
                await member.createDM();
            }
        }).catch(console.error);
    }

    /**
     * @this Farkle
     * @param {Discord.Client} client 
     */
    async update(client) {
        await this.sql.session(null, async query => {
            for(const guild of client.guilds.values()) {
                this.sql.session(guild, async gquery => {
                    const str = await getLeaderboardString.bind(this)(guild, query);
                    /** @type {Db.farkle_main|undefined} */
                    const docM = (await gquery(`SELECT * FROM farkle_main`)).results[0];
                    if(!docM) return;
                    if(docM.leaderboard_channel_id == null || docM.leaderboard_message_id == null) return;

                    let channel = guild.channels.get(docM.leaderboard_channel_id);
                    if(!channel || !/**@type {Discord.TextChannel} */(channel).fetchMessage) return;

                    let message = await /**@type {Discord.TextChannel} */(channel).fetchMessage(docM.leaderboard_message_id);
                    if(!message) return;

                    await message.edit(str);
                }).catch(console.error);
            }
        }).catch(console.error);
    }



    /** @param {Discord.Message} message - The message that was sent. */
    onMessage(message) {
        var sender = this.bot.sender;

        var prep = this.cache.get("0", `prep${message.member.id}`);
        if(!prep) return;
        if(message.member.id !== prep.host.id) return;
        
        let arg = message.content;
        if(arg.indexOf("cancel") > -1) {
            sender.send(message, "Match cancelled.", { timeout: BotSender.timeout.short }).catch(console.error);
            
            for(let i = 0; i < prep.members.length; i++) {
                this.cache.set("0", `prep${prep.members[i].id}`, undefined);
            }
            
            return;
        }

        arg = arg.replace("$", "");
        arg = arg.replace(F.currency, "");

        let args = arg.split(" ");
        args = args.filter(v => v.length > 0);

        if(args.length > 2) {
            sender.send(message, `Expected 1 or 2 arguments, got ${args.length}.`, { timeout: BotSender.timeout.short }).catch(console.error);
            return;
        }

        let points = Number(args[0]);
        if(!Number.isFinite(points)) {
            sender.send(message, "The specified wager is invalid.", { timeout: BotSender.timeout.short }).catch(console.error);
            return;
        }
        if(points > prep.maxWager) {
            sender.send(message, "At least one player can't afford this wager.", { timeout: BotSender.timeout.short }).catch(console.error);
            return;
        }
        if(points < 0) {
            sender.send(message, "Wager can't be negative. You can play for nothing, however.", { timeout: BotSender.timeout.short }).catch(console.error);
            return;
        }
        points = dollarify(Math.floor, points);

        let goal = 4000;
        if(args.length > 1) {
            goal = Number(args[1]);

            if(!Number.isFinite(goal)) {
                sender.send(message, "The specified point goal is invalid.", { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }

            goal = Math.floor(goal);
            if(goal < 1000 || goal > 10000) {
                sender.send(message, "Point goal must be between 1000 and 10000.", { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
        }


        this.sql.session(null, async query => {
            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${message.member.id}`)).results;
            if(docCPs.length > 0) return;

            /** @type {Db.farkle_current_games} */
            const game = {
                guild_id: prep.guild.id,
                has_started: false,
                match_start_time: 0,
                money_pot: dollarify(Math.round, points * prep.members.length),
                points_goal: goal,
                current_player_user_id: "",
                current_player_points: 0,
                current_player_rolls: "[]",
                current_player_rolls_count: 0
            }

            var doc = (await query(BotUtil.SQL.getInsert(game, "farkle_current_games") + "; SELECT LAST_INSERT_ID();")).results[1][0];
            game.id = Object.values(doc)[0];

            for(let i = 0; i < prep.members.length; i++) {
                /** @type {Db.farkle_current_players[]} */
                var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${prep.members[i].id}`)).results;
                if(docCPs.length > 0) continue;

                var embed = getEmbedBlank();
                if(i === 0)
                    embed.description = `Waiting for everyone to be ready.`;
                else
                    embed.description = `${prep.members[0]} invited you to play Farkle!`;

                embed.description += `\n  • Wager: ${F.currency}${points.toFixed(2)}\n  • Point goal: ${goal}`;
                embed.description += `\n  • Players: ${prep.members.join(", ")}\n`;
                embed.description += `\nYou have ${F.currency}${(await Q.getPlayerCashTotal(prep.members[i].id, query)).toFixed(2)}.\n`;
                embed.description += `\nType \`ready\` or \`r\` if you want to play.\nType \`reject\` to cancel the match.`;

                await sender.send(prep.channels[i], "", { embed: embed });

                /** @type {Db.farkle_current_players} */
                const player = {
                    id_current_games: /** @type {number} */(game.id),
                    money_wager: points,
                    ready_status: false,
                    turn_order: 0,
                    user_id: prep.members[i].id,
                    channel_dm_id: prep.channels[i].id,
                    total_points_banked: 0,
                    total_points_lost: 0,
                    total_points_skipped: 0,
                    total_rolls: 0,
                    total_folds: 0,
                    total_finishes: 0,
                    total_skips: 0,
                    highest_points_banked: 0,
                    highest_points_lost: 0,
                    highest_points_skipped: 0,
                    highest_rolls_in_turn: 0,
                    highest_rolls_in_turn_without_fold: 0,
                }
                
                await query(BotUtil.SQL.getInsert(player, "farkle_current_players"));
            }

            for(let i = 0; i < prep.members.length; i++) {
                this.cache.set("0", `prep${prep.members[i].id}`, undefined);
            }
        }).catch(console.error); 
    }

    /** @param {Discord.Message} message - The message that was sent. */
    onMessageDM(message) {
        const user = message.author;
        const msg = message.content.toLowerCase();
        const sender = this.bot.sender;


        let antilag = this.cache.get("0", `antilag${user.id}`);
        if(antilag && Date.now() - antilag < 500) {
            return;
        }
        this.cache.set("0", `antilag${user.id}`, Date.now());


        /** @type {""|"ready"|"reject"|"keep"|"finish"|"help"|"hurry"|"concede"} */
        let type = "";
        type = msg === "r" ? "ready" : type;
        type = msg.indexOf("k") > -1 ? "keep" : type;
        type = msg.indexOf("f") > -1 ? "finish" : type;
        type = msg.indexOf("ready") > -1 ? "ready" : type;
        type = msg.indexOf("reject") > -1 ? "reject" : type;
        type = msg.indexOf("keep") > -1 ? "keep" : type;
        type = msg.indexOf("finish") > -1 ? "finish" : type;
        type = msg.indexOf("help") > -1 ? "help" : type;
        type = msg.indexOf("hurry") > -1 ? "hurry" : type;
        type = msg.indexOf("concede") > -1 ? "concede" : type;
        if(type === "") return;

        /** @type { { type: "ready"|"reject"|"keep"|"finish"|"help"|"hurry"|"concede", updateCurrentMatch: boolean, gameEnded: boolean } } */
        const state = {
            type: type,
            updateCurrentMatch: false,
            gameEnded: false,
        }

        this.sql.session(null, async query => {
            /** @type {Db.farkle_current_players} */
            var docCP = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${user.id}`)).results[0];
            if(!docCP) return;

            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE id_current_games = ${docCP.id_current_games}`)).results;
            var docCP = docCPs.find(v => v.user_id === user.id);
            if(!docCP) return;

            /** @type {Db.farkle_current_games} */
            var docCG = (await query(`SELECT * FROM farkle_current_games WHERE id = ${docCP.id_current_games}`)).results[0];
            if(!docCG) return;

            /** @type {Db.farkle_viewers[]} */
            var docVs = (await query(`SELECT v.id, v.user_id_target, v.user_id, v.channel_dm_id FROM farkle_viewers v JOIN farkle_current_players cp ON v.user_id_target = cp.user_id WHERE cp.id_current_games = ${docCG.id}`)).results;

            /** @type {(Db.farkle_current_players|Db.farkle_viewers)[]} */
            var docCPVs = [];
            docCPVs = docCPVs.concat(docCPs, docVs);

            if(type === "help") {
                var embed = getEmbedBlank();
                if(docCG.current_player_user_id.length === 0)
                    return;

                if(docCP.user_id === docCG.current_player_user_id)
                    embed.description = `Type \`keep 1 5 5\` to choose dice to keep and reroll.\nType \`finish 3 3 3\` to choose dice to keep and end your turn.\nReplace numbers with your dice - using spaces is not necessary.`;
                else
                    embed.description = "Type \`hurry\` to put the current player on a 90 second timer until their next action, or they will lose their turn.";

                embed.description += "\nType \`concede\` to drop out of the match. You will lose your wager and you **will not gain extra points from playing**.";

                sender.send(message, { embed: embed }).catch(console.error);
                return;
            }

            
            if(type === "hurry") {
                if(this.cache.get("0", `hurry${docCG.id}`) != null)
                    return;
                if(docCG.current_player_user_id.length === 0)
                    return;
                if(docCP.user_id === docCG.current_player_user_id)
                    return;
                
                for(let attendee of docCPVs) {
                    let embed = getEmbedBlank();
                    embed.description = `<@${docCP.user_id}> wants to hurry. <@${docCG.current_player_user_id}> has 90 seconds to make a move.`;
                    await sender.send(attendee.channel_dm_id, { embed: embed });
                }

                var timeout = message.client.setTimeout(() => {
                    this.sql.session(null, async query => {
                        let playerCurrent = docCPs.find(v=>v.user_id===docCG.current_player_user_id);
                        if(!playerCurrent) {
                            this.cache.set("0", `hurry${docCG.id}`, undefined);
                            return;
                        }
                        playerCurrent.total_skips++;
                        playerCurrent.total_points_skipped += docCG.current_player_points;
                        if(docCG.current_player_points > playerCurrent.highest_points_skipped)
                            playerCurrent.highest_points_skipped = docCG.current_player_points;
                        
                        let player = docCG.current_player_user_id;
                        await turn.bind(this)(docCG, docCPs, query, "hurry");
                        await roll.bind(this)({ type: "hurry", keep: [], points: docCG.current_player_points, player: player }, docCG, docCPs, docCPVs, query);

                        /** @type { { type: "ready"|"reject"|"keep"|"finish"|"help"|"hurry"|"concede", updateCurrentMatch: boolean, gameEnded: boolean } } */
                        let state = {
                            type: "hurry",
                            updateCurrentMatch: true,
                            gameEnded: false
                        }
                        await commit.bind(this)(state, docCG, docCP, docCPs, query, message.client);
                        this.cache.set("0", `hurry${docCG.id}`, undefined);
                    }).catch(console.error);
                }, 1000*90);

                this.cache.set("0", `hurry${docCG.id}`, {
                    timeout: timeout
                });
                return;
            }
            //Override for AI
            //Author Lok Man Chu
            if (docCG.current_player_user_id === this.bot.id) {
                let state = {
                    rolls : docCG.current_player_rolls,
                    round : docCG.current_player_points,
                    bank : docCP.total_points_banked,
                    goal: docCG.points_goal
                };
                let action = get_action(state);
                let fake_message = {
                    author : this.bot,
                    content : action[0] + action[1].join(""),
                    sender : this.bot.sender
                };
                return this.onMessageDM(fake_message)
            }

            if(type === "ready") {
                if(docCG.current_player_user_id.length > 0)
                    return;

                if(!docCP.ready_status) {
                    for(let attendee of docCPVs) {
                        let embed = getEmbedBlank();
                        embed.description = `${user} is ready to play!`;
                        await sender.send(attendee.channel_dm_id, { embed: embed });
                    }

                    docCP.ready_status = true;
                    await query(`UPDATE farkle_current_players SET ready_status = ${docCP.ready_status} WHERE user_id = ${docCP.user_id}`);
                }

                let ready = !docCPs.some(v=>!v.ready_status);
                if(!ready) return;

                let embed = getEmbedBlank();
                embed.description = `The wagers are in, and the game begins!\n\n`;
                for(let player of docCPs) {
                    let pts = await Q.getPlayerCashTotal(player.user_id, query);
                    embed.description += `<@${player.user_id}>: \`${F.currency}${pts.toFixed(2)}\` -> \`${F.currency}${dollarify(Math.round, pts - player.money_wager).toFixed(2)}\`\n`;
                }
                for(let attendee of docCPVs) {
                    await sender.send(attendee.channel_dm_id, "", { embed: embed });
                }

                await BotUtil.Promise.sleep(2500);

                await decide.bind(this)(docCG, docCP, docCPs, docCPVs);
                await roll.bind(this)({ type: null, keep: [], points: 0, player: "" }, docCG, docCPs, docCPVs, query);
                state.updateCurrentMatch = true;
            }
            else if(type === "concede") {
                if(docCG.current_player_user_id.length === 0)
                    return;
                
                for(let attendee of docCPVs) {
                    let embed = getEmbedBlank();
                    embed.description = `<@${docCP.user_id}> has conceded the match and lost ${F.currency}${docCP.money_wager.toFixed(2)}.`;
                    await sender.send(attendee.channel_dm_id, { embed: embed });
                }

                if(docCPs.length === 2) {
                    if(docCP.user_id === docCG.current_player_user_id) {
                        await turn.bind(this)(docCG, docCPs, query, "concede");
                    }
                    await end.bind(this)(docCG, docVs, docCPs, query, "concede");
                    state.gameEnded = true;
                }
                else {
                    if(docCP.user_id === docCG.current_player_user_id) {
                        let player = docCG.current_player_user_id;
                        await turn.bind(this)(docCG, docCPs, query, "concede");
                        await roll.bind(this)({ type: "concede", keep: [], points: 0, player: player }, docCG, docCPs, docCPVs, query);
                        state.updateCurrentMatch = true;
                    }
                    
                    let to = docCP.turn_order;
                    while(true) {
                        to++;
                        /** @type {Db.farkle_current_players|undefined} */
                        let player = docCPs.find(v => v.turn_order === to);
                        if(!player) break;
                        player.turn_order--;
                    }
                }
            }
            else if(type === "reject") {
                if(docCG.current_player_user_id.length > 0)
                    return;

                for(let attendee of docCPVs) {
                    let embed = getEmbedBlank();
                    embed.description = `<@${user.id}> does not want to play. Match cancelled.`;
                    await sender.send(attendee.channel_dm_id, { embed: embed });
                }
            }
            else if(type === "keep" || type === "finish") {
                if(docCG.current_player_user_id.length === 0)
                    return;
                
                if(docCG.current_player_user_id !== docCP.user_id) {
                    await sender.send(docCP.channel_dm_id, `It's not your turn yet! Waiting on <@${docCG.current_player_user_id}>.`, { timeout: BotSender.timeout.short });
                    return;
                }

                let hurry = this.cache.get("0", `hurry${docCG.id}`);
                if(hurry) {
                    message.client.clearTimeout(hurry.timeout);
                    this.cache.set("0", `hurry${docCG.id}`, undefined);
                }

                var temp = msg.replace(/[^0-9]/g, "").split("");
                /** @type {number[]} */
                let keep = [];
                for(let i = 0; i < temp.length; i++) {
                    let number = Math.floor(Number(temp[i]));
                    if(!Number.isNaN(number) && number >= 1 && number <= 6)
                        keep.push(number);
                }

                if(!getValidKeep(JSON.parse(docCG.current_player_rolls), keep)) {
                    sender.send(docCP.channel_dm_id, "Selected dice must match the rolls!", { timeout: BotSender.timeout.short });
                    return;
                }

                let rolls = JSON.parse(docCG.current_player_rolls);
                let points = processFarkleKeep(rolls, [...keep]);
                docCG.current_player_rolls = JSON.stringify(rolls);

                if(points === 0) {
                    sender.send(docCP.channel_dm_id, "This keep is invalid.", { timeout: BotSender.timeout.short });
                    return;
                }

                docCG.current_player_points += points;

                if(type === "keep") {
                    let player = docCG.current_player_user_id;
                    await roll.bind(this)({ type: "keep", keep: keep, points: points, player: player }, docCG, docCPs, docCPVs, query);
                    state.updateCurrentMatch = true;
                }
                else if(type === "finish") {
                    docCP.total_points_banked += docCG.current_player_points;
                    if(docCG.current_player_points > docCP.highest_points_banked)
                        docCP.highest_points_banked = docCG.current_player_points;
                    docCP.total_finishes++;

                    if(docCG.current_player_rolls_count > docCP.highest_rolls_in_turn_without_fold)
                        docCP.highest_rolls_in_turn_without_fold = docCG.current_player_rolls_count;

                    if(docCP.total_points_banked >= docCG.points_goal) {
                        await end.bind(this)(docCG, docVs, docCPs, query, "no_concede");
                        state.gameEnded = true;
                        state.updateCurrentMatch = true;
                    }
                    else {
                        let player = docCG.current_player_user_id;
                        let points = docCG.current_player_points;
                        let bank = docCP.total_points_banked;
                        await turn.bind(this)(docCG, docCPs, query, "finish");
                        await roll.bind(this)({ type: "finish", keep: keep, points: points, bank: bank, player: player }, docCG, docCPs, docCPVs, query);
                        state.updateCurrentMatch = true;
                    }
                }
            }

            await commit.bind(this)(state, docCG, docCP, docCPs, query, message.client);
        }).catch(console.error);
    }

    /**
     * Module Function: Invite player(s) to play Farkle!
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @param {"string"|null} ext.role - Role restriction for invited users.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    farkle(message, args, arg, ext) {
        const sender = this.bot.sender;

        let prep = this.cache.get("0", `prep${message.member.id}`);
        if(prep) return;

        /** @type {Discord.GuildMember[]} */
        var members = [message.member];
        for(let arg of args) {
            let snowflake = BotUtil.getSnowflakeFromDiscordPing(arg);
            if(!snowflake) continue;
            let member = message.guild.members.get(snowflake);
            if(!member) continue;
            members.push(member);

            let prep = this.cache.get("0", `prep${member.id}`);
            if(prep) return;
        }
        members = [ ...new Set(members) ];
        if(members.length <= 1) {
            return "No valid members found. Mention the users or type their user ID's.";
        }
        if(ext.role) {
            for(let member of members) {
                if(!member.roles.has(this.bot.getRoleId(message.guild.id, ext.role)||""))
                    return "One of the invited users is not an Active User.";
            }
        }
        for(let i = 0; i < members.length; i++) {
            this.cache.set("0", `prep${members[i].id}`, undefined);
        }
        this.sql.session(null, async query => {
            for(let member of members) {
                var docS = (await query(`SELECT * FROM farkle_servers WHERE user_id = ${member.id}`)).results[0];
                if(docS) {
                    await sender.send(message.channel, "One or more invited players are already in a Farkle lobby looking for a game.", { timeout: BotSender.timeout.short });
                    return;
                }
            }

            /** @type {Discord.DMChannel[]} */
            const channels = [];
            for(let i = 0; i < members.length; i++) {
                channels[i] = await members[i].createDM();
            }

            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${message.member.id}`)).results;
            if(docCPs.length > 0) {
                await sender.send(message.channel, "You're already in a Farkle match!", { timeout: BotSender.timeout.short });
                return;
            }
 
            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${members.map(v=>v.id).join(" OR user_id = ")}`)).results;
            if(docCPs.length > 0) {
                let messageErr = await sender.send(message.channel, "...", { timeout: BotSender.timeout.medium });
                await messageErr.edit(`${docCPs.map(v=>`<@${v.user_id}>`).join(", ")} are already in another Farkle match!`);
                return;
            }

            let maxWager = Infinity;
            let now = new Date();
            for(let i = 0; i < members.length; i++) {
                let points = await Q.getPlayerCashTotal(members[i].id, query);
                maxWager = Math.min(maxWager, points);
            }

            for(let i = 0; i < members.length; i++) {
                this.cache.set("0", `prep${members[i].id}`, {
                    maxWager: maxWager,
                    date: now,
                    members: members,
                    host: message.member,
                    channels: channels,
                    guild: message.guild
                });
            }

            let embed = getEmbedBlank();
            embed.description = `Type a wager, optionally followed by goal points between 1000 and 10000 (default 4000).\nBased on the least wealthy player, the maximum wager is \`${F.currency}${maxWager.toFixed(2)}\`.\nExample: \`10 2000\` - Wager ${F.currency}10, Point goal 2000.\n\nType \`cancel\` to cancel the match.`;

            await sender.send(message, {embed: embed});
        }).catch(console.error);
    }

    /**
     * Module Function: Host a server so others can join, as an alternative to direct invites.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    host(message, args, arg, ext) {
        const sender = this.bot.sender;

        this.sql.session(null, async query => {
            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${message.member.id}`)).results;
            if(docCPs.length > 0) {
                await sender.send(message.channel, "You're already in a Farkle match!", { timeout: BotSender.timeout.short });
                return;
            }

            /** @type {Db.farkle_servers} */
            let server = {
                guild_id: message.guild.id,
                user_id: message.member.id,
                user_id_host: message.member.id
            }

            let embed = getEmbedBlank();
            embed.description = `<@${server.user_id}> is looking for people to play Farkle!\n\nType -> !farkle join <@${server.user_id}> <- to join.`;

            /** @type {Db.farkle_servers|undefined} */
            var docS = (await query(`SELECT * FROM farkle_servers WHERE user_id = ${message.member.id}`)).results[0];
            if(docS) {
                if(docS.user_id === docS.user_id_host) {
                    sender.send(message, { embed: embed, timeout: BotSender.timeout.long }).catch(console.error);
                    return;
                }
                else {
                    await sender.send(message, "You are already in another lobby! Leave it first.", { timeout: BotSender.timeout.short });
                    return;
                }
            }

            
            await sender.send(message, { embed: embed, timeout: BotSender.timeout.long });

            await query(BotUtil.SQL.getInsert(server, "farkle_servers"));
        }).catch(console.error);

        this.db.session(null, "farkle", async session => {
        }).catch(console.error);
    }

    /**
     * Module Function: Leave the server.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    leave(message, args, arg, ext) {
        const sender = this.bot.sender;
        this.sql.session(null, async query => {
            /** @type {Db.farkle_servers | undefined} */
            var docS = (await query(`SELECT * FROM farkle_servers WHERE user_id = ${message.member.id}`)).results[0];
            if(!docS) {
                await sender.send(message, "You're not in a lobby.", { timeout: BotSender.timeout.short });
                return;
            }
            
            if(docS.user_id_host !== docS.user_id) {
                await query(`DELETE FROM farkle_servers WHERE user_id = ${message.member.id}`);

                /** @type {Db.farkle_servers[]} */
                let docSs = (await query(`SELECT * FROM farkle_servers WHERE user_id_host = ${docS.user_id_host}`)).results;

                let embed = getEmbedBlank();
                embed.description = `<@${docS.user_id}> left.\nThere's ${docSs.length} player(s) waiting: ${docSs.map(v => `<@${v.user_id}> `)}\n\n${docSs.length > 1 ? `<@${docS.user_id_host}> needs to type \`!farkle start\` to begin the game, or wait for more players.` : ""}`;
                await sender.send(message, docSs.length > 1 ? `<@${docS.user_id_host}>` : "", { embed: embed, timeout: BotSender.timeout.long });
            }
            else {
                await query(`DELETE FROM farkle_servers WHERE user_id_host = ${message.member.id}`);

                let embed = getEmbedBlank();
                embed.description = `${message.member} disbanded the lobby.`;
                await sender.send(message, { embed: embed, timeout: BotSender.timeout.long });
            }
        }).catch(console.error);
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {Discord.GuildMember} hostMember
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @param {BotSender} sender
     */
    async _join(message, hostMember, query, sender) {
        /** @type {Db.farkle_current_players[]} */
        var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${message.member.id}`)).results;
        if(docCPs.length > 0) {
            await sender.send(message.channel, "You're already in a Farkle match!", { timeout: BotSender.timeout.short });
            return;
        }
        /** @type {Db.farkle_servers[]} */
        var docSs = (await query(`SELECT * FROM farkle_servers WHERE user_id_host = ${hostMember.id} AND guild_id = ${message.guild.id}`)).results;
        if(docSs.length === 0) {
            await sender.send(message, "This user isn't hosting a lobby!", { timeout: BotSender.timeout.short });
            return;
        }
        /** @type {Db.farkle_servers[]} */
        var docSs = (await query(`SELECT * FROM farkle_servers WHERE user_id_host = ${hostMember.id} AND guild_id = ${message.guild.id} AND user_id = ${message.member.id}`)).results;
        if(docSs.length > 0) {
            await sender.send(message, "You're already in this lobby.", { timeout: BotSender.timeout.short });
            return;
        }
        /** @type {Db.farkle_servers[]} */
        var docSs = (await query(`SELECT * FROM farkle_servers WHERE user_id = ${message.member.id}`)).results;
        if(docSs.length > 0) {
            await sender.send(message, "You are already in another lobby! Leave it first.", { timeout: BotSender.timeout.short });
            return;
        }

        /** @type {Db.farkle_servers} */
        let server = {
            guild_id: message.guild.id,
            user_id: message.member.id,
            user_id_host: hostMember.id
        }

        await query(BotUtil.SQL.getInsert(server, "farkle_servers"));

        /** @type {Db.farkle_servers[]} */
        var docSs = (await query(`SELECT * FROM farkle_servers WHERE user_id_host = ${hostMember.id}`)).results;

        let embed = getEmbedBlank();
        embed.description = `${message.member} has joined!\nThere's ${docSs.length} player(s) waiting: ${docSs.map(v => `<@${v.user_id}> `)}\n\n${hostMember} needs to type \`!farkle start\` to begin the game, or wait for more players.`;
        await sender.send(message, `${hostMember}`, { embed: embed, timeout: BotSender.timeout.long });
    }

    /**
     * Module Function: Join a server.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    join(message, args, arg, ext) {
        const sender = this.bot.sender;

        let prep = this.cache.get("0", `prep${message.member.id}`);
        if(prep) return;

        if(arg.length === 0) {
            this.sql.session(null, async query => {
                /** @type {Db.farkle_servers[]} */
                let docSs = (await query(`SELECT * FROM farkle_servers WHERE guild_id = ${message.guild.id} AND user_id = user_id_host`)).results;
                if(docSs.length === 0) {
                    await sender.send(message.channel, "There are no lobbies to join.", { timeout: BotSender.timeout.short });
                    return;
                }

                for(let i = docSs.length - 1; i >= 0; i--) {
                    let docS = docSs[i];

                    let hostMember = message.guild.members.get(docS.user_id_host);
                    if(hostMember == null) {
                        await sender.send(message.channel, "The user who created this lobby is no longer a member of this server. The lobby has been deleted.", { timeout: BotSender.timeout.short });
                        await query(`DELETE FROM farkle_servers WHERE user_id_host = ${docS.user_id_host}`);
                        return;
                    }
                    
                    await this._join(message, hostMember, query, sender);
                    return;
                }

                await sender.send(message.channel, "There are no lobbies to join (2).", { timeout: BotSender.timeout.short });
                return;
            }).catch(console.error);
            return;
        }

        let hostSnowflake = BotUtil.getSnowflakeFromDiscordPing(arg);
        if(!hostSnowflake)
            return "Invalid user ping";
        let _hostMember = message.guild.members.get(hostSnowflake);
        if(!_hostMember)
            return "Mentioned user is not a member of this server.";
        let hostMember = _hostMember;

        this.sql.session(null, async query => {

        }).catch(console.error);

        this.sql.session(null, async query => {
            await this._join(message, hostMember, query, sender);
            return;
        }).catch(console.error);
    }

    /**
     * Module Function: Start the game with all players in the server.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @param {"string"|null} ext.role - Role restriction for invited users.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    start(message, args, arg, ext) {
        const sender = this.bot.sender;
        this.sql.session(null, async query => {
            /** @type {Db.farkle_servers[]} */
            var docSs = (await query(`SELECT * FROM farkle_servers WHERE guild_id = ${message.guild.id} AND user_id_host = ${message.member.id} AND user_id = user_id_host`)).results;
            if(docSs.length === 0) {
                await sender.send(message, "You're not a host of a lobby.", { timeout: BotSender.timeout.short });
                return;
            }

            /** @type {Db.farkle_servers[]} */
            var docSs = (await query(`SELECT * FROM farkle_servers WHERE guild_id = ${message.guild.id} AND user_id_host = ${message.member.id}`)).results;
            if(docSs.length <= 1) {
                await sender.send(message, "Nobody has joined your lobby yet.", { timeout: BotSender.timeout.short });
                return;
            }

            await query(`DELETE FROM farkle_servers WHERE user_id_host = ${message.member.id}`);

            let args = docSs.map(v => v.user_id);
            let arg = args.join(" ");

            setTimeout(() => this.farkle(message, args, arg, ext), 0);
        }).catch(console.error);
    }

    /**
     * Module Function: Change the look of the dice.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    skin(message, args, arg, ext) {
        var sender = this.bot.sender;

        if(arg.length === 0) {
            sender.send(message, `Available skins: \`${Object.keys(F.skins).join("`, `")}\`.\nType \`!farkle skin <type>\` to use.`).catch(console.error);
            return;
        }

        if(!Object.keys(F.skins).includes(arg)) {
            sender.send(message, `Not a valid skin name.\nAvailable skins: \`${Object.keys(F.skins).join("`, `")}\`.\nType !farkle skin <type> to use.`).catch(console.error);
            return;
        }

        this.sql.session(null, async query => {
            /** @type {Db.farkle_users} */
            let user = {
                user_id: message.member.id,
                skin: arg,
            }

            //await query(`IF EXISTS ( SELECT * FROM farkle_users WHERE user_id = ${message.member.id} ) UPDATE farkle_users SET skin = "${arg}" WHERE user_id = ${message.member.id} ELSE ${BotUtil.SQL.getInsert(user, "farkle_users")}`);
            /** @type {Db.farkle_users|undefined} */
            let docU = (await query(`SELECT * FROM farkle_users WHERE user_id = ${message.member.id}`)).results[0];
            if(docU)
                await query(`UPDATE farkle_users SET skin = "${arg}" WHERE user_id = ${message.member.id}`);
            else
                await query(BotUtil.SQL.getInsert(user, "farkle_users"));
            sender.send(message, `Skin changed: ${Object.values(F.skins[arg]).join("")}`).catch(console.error);

        }).catch(console.error);
    }

    /**
     * Module Function: Display current games played by members of this server.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    games(message, args, arg, ext) {
        const sender = this.bot.sender;

        this.sql.session(null, async query => {
            const embed = getEmbedBlank();

            var str = "";

            /** @type {Db.farkle_current_games[]} */
            let docCGs = (await query(`SELECT * FROM farkle_current_games`)).results;
            if(docCGs.length === 0) {
                sender.send(message, "There are no games being played right now.", { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }

            var i = 1;
            for(let docCG of docCGs) {
                str += `Game #${i} • Pot: ${F.currency}${docCG.money_pot.toFixed(2)} • Goal: ${docCG.points_goal}\n`;

                /** @type {Db.farkle_current_players[]} */
                let docCPs = (await query(`SELECT * FROM farkle_current_players WHERE id_current_games = ${docCG.id} ORDER BY total_points_banked DESC`)).results;

                for(let docCP of docCPs) {
                    str += `  • <@${docCP.user_id}>: ${docCP.total_points_banked} pts`;
                    str += "\n";
                }
                str += "\n";
                i++;
            }
            embed.description = str;
            sender.send(message, { embed: embed, timeout: BotSender.timeout.medium }).catch(console.error);
            return;
        }).catch(console.error);
    }

    /**
     * Module Function: Display profile.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    profile(message, args, arg, ext) {
        const sender = this.bot.sender;
        const member = message.member;

        this.sql.session(null, async query => {
            let embed = getEmbedBlank();
            embed.title = "Farkle";
            embed.author = {
                name: message.author.username + "#" + message.author.discriminator,
                icon_url: message.author.displayAvatarURL
            }
            embed.description = `Last Seen: ${BotUtil.getFormattedDate(await Q.getPlayerLastSeen(message.member.id, query), true)}`;

            embed.fields = [];
            embed.fields.push({
                inline: true,
                name: `Cash`,
                value: `**${F.currency}${(await Q.getPlayerCashTotal(message.member.id, query)).toFixed(2)} (Total)**\n${F.currency}${(await Q.getPlayerCashWonStats(message.member.id, query)).toFixed(2)} (Won)\n${F.currency}${(await Q.getPlayerCashLostStats(message.member.id, query)).toFixed(2)} (Lost)\n${F.currency}${(await Q.getPlayerCashGained(message.member.id, query)).toFixed(2)} (Gained)`
            });

            const players = await Q.getPlayerHighestPlayerCountGamePlayed(message.member.id, query);
            const wl = {
                regular: {
                    wins: 0,
                    losses: 0,
                },
                weighted: {
                    wins: 0,
                    losses: 0
                }
            }

            for(let i = 2; i <= players; i++) {
                const wins = await Q.getPlayerWinsInXPlayerMatches(message.member.id, query, i);
                const losses = await Q.getPlayerGamesInXPPlayerMatches(message.member.id, query, i) - wins;

                wl.regular.wins += wins;
                wl.regular.losses += losses;

                wl.weighted.wins += wins * i / 2;
                wl.weighted.losses += losses / i * 2;
            }

            embed.fields.push({
                inline: true,
                name: "Wins • Losses",
                value: `${wl.regular.wins} • ${wl.regular.losses} (Total)\n${dollarify(Math.round, wl.weighted.wins)} • ${dollarify(Math.round, wl.weighted.losses)} (Weighted)`
            });

            embed.fields.push({
                inline: true,
                name: "⠀",
                value: `⠀`
            });


            const fieldTotal = {
                inline: true,
                name: "Totals",
                value: ""
            };

            var doc = (await query(`select sum(total_points_banked) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Points banked: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_points_lost) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Points lost: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_points_skipped) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Points skipped: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_rolls) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Rolls: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_folds) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Folds: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_finishes) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Finishes: ${doc ? doc.total : 0}\n`;

            var doc = (await query(`select sum(total_skips) as 'total' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldTotal.value += `Skips: ${doc ? doc.total : 0}\n`;

            embed.fields.push(fieldTotal);


            const fieldBest = {
                inline: true,
                name: "Single turn highest",
                value: ""
            };

            var doc = (await query(`select max(highest_points_banked) as 'highest' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldBest.value += `Points banked: ${doc ? doc.highest : 0}\n`;

            var doc = (await query(`select max(highest_points_lost) as 'highest' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldBest.value += `Points lost: ${doc ? doc.highest : 0}\n`;

            var doc = (await query(`select max(highest_points_skipped) as 'highest' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldBest.value += `Points skipped: ${doc ? doc.highest : 0}\n`;

            var doc = (await query(`select max(highest_rolls_in_turn) as 'highest' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldBest.value += `Rolls: ${doc ? doc.highest : 0}\n`;

            var doc = (await query(`select max(highest_rolls_in_turn_without_fold) as 'highest' from farkle_history_players where user_id = ${message.member.id} group by user_id`)).results[0];
            fieldBest.value += `Rolls w/o fold: ${doc ? doc.highest : 0}\n`;

            embed.fields.push(fieldBest);

            embed.fields.push({
                inline: true,
                name: "⠀",
                value: `⠀`
            });
            
            sender.send(message, { embed: embed, timeout: BotSender.timeout.medium }).catch(console.error);
            return;
        }).catch(console.error);
    }

    /**
     * Module Function: Spectate a game.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    spectate(message, args, arg, ext) {
        let hostSnowflake = BotUtil.getSnowflakeFromDiscordPing(arg);
        if(!hostSnowflake)
            return "Invalid user ping";
        let _hostMember = message.guild.members.get(hostSnowflake);
        if(!_hostMember)
            return "Mentioned user is not a member of this server.";
        let hostMember = _hostMember;


        const sender = this.bot.sender;
        this.sql.session(null, async query => {
            /** @type {Db.farkle_current_players[]} */
            var docCPs = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${message.member.id}`)).results;
            if(docCPs.length > 0) {
                await sender.send(message.channel, "You're already in a Farkle match!", { timeout: BotSender.timeout.short });
                return;
            }
            /** @type {Db.farkle_current_players|undefined} */
            var docCP = (await query(`SELECT * FROM farkle_current_players WHERE user_id = ${hostMember.id}`)).results[0];
            if(docCP == null) {
                await sender.send(message.channel, "This user is not in a game.", { timeout: BotSender.timeout.short });
                return;
            }

            let dm = await message.member.createDM();

            /** @type {Db.farkle_viewers} */
            let viewer = {
                user_id_target: docCP.user_id,
                user_id: message.member.id,
                channel_dm_id: dm.id
            }

            /** @type {Db.farkle_viewers|undefined} */
            let docV = (await query(`SELECT * FROM farkle_viewers WHERE user_id = ${message.member.id}`)).results[0];
            if(docV) {
                await query(`DELETE FROM farkle_viewers WHERE user_id = ${message.member.id}`);

                if(docV.user_id_target === viewer.user_id_target) {
                    await sender.send(message.channel, "You're no longer spectating this game.", { timeout: BotSender.timeout.short });
                    return;
                }
            }

            await query(BotUtil.SQL.getInsert(viewer, "farkle_viewers"));

            await sender.send(message.channel, "Now spectating...", { timeout: BotSender.timeout.short });
        }).catch(console.error);
    }

    /**
     * Module Function: Display current games played by members of this server.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    leaderboard(message, args, arg, ext) {
        const sender = this.bot.sender;

        this.sql.session(message.guild, async query => {
            const messageL = await sender.send(message, "...");

            /** @type {Db.farkle_main} */
            const main = {
                leaderboard_channel_id: messageL.channel.id,
                leaderboard_message_id: messageL.id
            }


            let docM = (await query(`SELECT * FROM farkle_main WHERE id = 1`)).results[0];
            if(docM)
                await query(`UPDATE farkle_main SET leaderboard_channel_id = "${main.leaderboard_channel_id}", leaderboard_message_id = "${main.leaderboard_message_id}" WHERE id = 1`);
            else
                await query(BotUtil.SQL.getInsert(main, "farkle_main"));

            this.update.bind(this)(message.client);
        }).catch(console.error);
    }

    /**
     * Module Function: Get Farkle rules.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    rules(message, args, arg, ext) {
        var embed = getEmbedBlank();
        
        this.sql.session(null, async query => {
            /** @type {Db.farkle_users|null} */
            let docU = (await query(`SELECT * FROM farkle_users WHERE user_id = ${message.member.id}`)).results[0];
            let skin = F.skins[docU ? docU.skin : "braille"];

            var str = `The goal of Farkle is to be the first player to reach a number of points (4000 by default). Each player throws six dice at the start of their turn. Points can be gained by matching combos:
  
  Single die:
    ${skin[5]} - 50 points
    ${skin[1]} - 100 points 

  Three of a kind - 100 points times the number on the dice. ${skin[1]} counts as 10:
    ${skin[3]}${skin[3]}${skin[3]} - 300 points
    ${skin[1]}${skin[1]}${skin[1]} - 1000 points

  Four of a kind or more doubles the amount of points:
    ${skin[3]}${skin[3]}${skin[3]}${skin[3]}  - 600 points
    ${skin[3]}${skin[3]}${skin[3]}${skin[3]}${skin[3]}  - 1200 points
    ${skin[3]}${skin[3]}${skin[3]}${skin[3]}${skin[3]}${skin[3]}  - 2400 points
    
  Five or six in a row:
    ${skin[1]}${skin[2]}${skin[3]}${skin[4]}${skin[5]}${skin[6]} - 1500 points
    ${skin[2]}${skin[3]}${skin[4]}${skin[5]}${skin[6]} - 750 points
    ${skin[1]}${skin[2]}${skin[3]}${skin[4]}${skin[5]} - 500 points

You start your turn by throwing all six dice. You can then choose dice matching the combos above to set aside by using \`keep\` or \`finish\` commands. Multiple combos can be matched at once, and combos involving more dice take precedence over smaller combos.

When you \`keep <dice>\`, you will gain points from the combos you matched, the chosen dice are removed and the remaining dice on the board are rerolled. If all dice on the board are kept, all six dice are rerolled for free. If there are no combos that can be matched with remaining dice, you fold, losing all points earned this round.

When you \`finish <dice>\`. you will gain points from the combos you matched, and your turn ends. All points earned this round are banked and can no longer be lost. It is generally advisable to \`finish\` when the chance that the remaining dice would provide a combo with \`keep\` is low.`;

            embed.description = str;
            this.bot.sender.send(message, { embed: embed, timeout: BotSender.timeout.long }).catch(console.error);
        }).catch(console.error);
    }

    /**
     * Module Function: Get a chart.
     * @param {Discord.Message} message - Message of the user executing the command.
     * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
     * @param {string} arg - The full string written by the user after the command.
     * @param {object} ext - Custom parameters provided to function call.
     * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
     */
    chart(message, args, arg, ext) {
        const sender = this.bot.sender;

        let instr = `Available charts:\nName: \`wins\`, \`profit\`\nFilter: \`time\`, \`games\`\nYou can do !f chart <name> <filter> to see a chart.`;
        if(arg.length === 0) {
            sender.send(message, instr).catch(console.error);
            return;
        }      

        const config = {};
        config.type = "line";
        config.data = {};
        config.data.labels = [];
        config.data.datasets = [];

        switch(args[0]) {
            case "win":
            case "wins":
            case "loss":
            case "losses":
                args[0] = "wins";
                config.data.datasets[0] = {};
                config.data.datasets[1] = {};

                config.data.datasets[0].label = "Wins";
                config.data.datasets[1].label = "Losses";

                config.data.datasets[0].pointBackgroundColor =  'rgba(71,172,255,1)';
                config.data.datasets[0].backgroundColor =       'rgba(71,172,255,0.1)';
                config.data.datasets[0].borderColor =           'rgba(71,172,255,0.7)';
                config.data.datasets[1].pointBackgroundColor =  'rgba(255,78,68,1)';
                config.data.datasets[1].backgroundColor =       'rgba(255,78,68,0.1)';
                config.data.datasets[1].borderColor =           'rgba(255,78,68,0.7)';
                break;
            case "profit":
            case "profits":
                config.data.datasets[0] = {};
                config.data.datasets[1] = {};
                config.data.datasets[2] = {};

                config.data.datasets[0].label = "Profit";
                config.data.datasets[1].label = "Won";
                config.data.datasets[2].label = "Lost";
                
                config.data.datasets[0].pointBackgroundColor =  'rgba(71,172,255,1)';
                config.data.datasets[0].backgroundColor =       'rgba(71,172,255,0.1)';
                config.data.datasets[0].borderColor =           'rgba(71,172,255,0.7)';
                config.data.datasets[1].pointBackgroundColor =  'rgba(158,255,73,1)';
                config.data.datasets[1].backgroundColor =       'rgba(158,255,73,0.1)';
                config.data.datasets[1].borderColor =           'rgba(158,255,73,0.7)';
                config.data.datasets[2].pointBackgroundColor =  'rgba(255,78,68,1)';
                config.data.datasets[2].backgroundColor =       'rgba(255,78,68,0.1)';
                config.data.datasets[2].borderColor =           'rgba(255,78,68,0.7)';
                break;
            default:
                sender.send(message, `Not a valid chart name.\n${instr}`).catch(console.error);
                return;
        }

        let now = new Date();
        now.setUTCHours(0, 0, 0, 0);

        const width = 400; //px
        const height = 400; //px

        for(let i = 0; i < config.data.datasets.length; i++) {
            config.data.datasets[i].data = [];
            config.data.datasets[i].pointBorderColor = 'black';
            config.data.datasets[i].pointBorderWidth = '1px';
        }

        const canvasRenderService = new CanvasRenderService(width, height, (ChartJS) => { 
            ChartJS.defaults.global.defaultFontColor = '#ADADAD';
            ChartJS.defaults.global.defaultFontSize = 15;
            ChartJS.defaults.global.defaultFontStyle = "bold";
        });


        this.sql.session(null, async query => {
            if(args[1] === "games") {
                /** @type {(Db.farkle_history_games&Db.farkle_history_players)[]} */
                let docs = (await query(`SELECT * FROM farkle_history_players hp JOIN farkle_history_games hg ON hp.id_history_games = hg.id WHERE hp.user_id = ${message.member.id}`)).results;

                for(let i = 0, j = 0; i < docs.length; i+=10, j++) {
                    config.data.labels[j] = `10`;

                    if(args[0] === "wins") {
                        config.data.datasets[0].data[j] = 0;
                        config.data.datasets[1].data[j] = 0;

                        for(let k = 0; k < 10; k++) {
                            if(docs[k+i] == null) break;

                            /** @type {Db.farkle_history_players[]} */
                            let docHPs = (await query(`SELECT * FROM farkle_history_players WHERE id_history_games = ${docs[k+i].id}`)).results;

                            //weighted
                            if(docs[k+i].user_id_winner === message.member.id)
                                config.data.datasets[0].data[j] += 1 * docHPs.length / 2;
                            else
                                config.data.datasets[1].data[j] += 1 / docHPs.length * 2;
                        }
                    }
                    else {
                        config.data.datasets[0].data[j] = 0;
                        config.data.datasets[1].data[j] = 0;
                        config.data.datasets[2].data[j] = 0;

                        for(let k = 0; k < 10; k++) {
                            if(docs[k+i] == null) break;

                            if(docs[k+i].user_id_winner === message.member.id) {
                                config.data.datasets[1].data[j] += docs[k+i].money_pot - docs[k+i].money_wager;
                                config.data.datasets[0].data[j] += docs[k+i].money_pot - docs[k+i].money_wager;
                            }
                            else
                                config.data.datasets[2].data[j] += docs[k+i].money_wager;
    
                            config.data.datasets[0].data[j] += docs[k+i].money_free;
                        }
                    }
                }
            }
            else {
                for(let i = 13, j = 0; i >= 0; i--, j++) {
                    let date1 = new Date(now.getTime() - (i * (1000*60*60*24)));
                    let date2 = new Date(date1.getTime() + (1000*60*60*24));

                    /** @type {(Db.farkle_history_games&Db.farkle_history_players)[]} */
                    let docs = (await query(`SELECT * FROM farkle_history_players hp JOIN farkle_history_games hg ON hp.id_history_games = hg.id WHERE hp.user_id = ${message.member.id} AND hg.match_end_time >= ${date1.getTime()} AND hg.match_end_time < ${date2.getTime()}`)).results;

                    config.data.labels[j] = `${("0" + (date1.getUTCMonth()+1)).slice(-2)}-${("0" + (date1.getUTCDate())).slice(-2)}`;

                    if(args[0] === "wins") {
                        config.data.datasets[0].data[j] = 0;
                        config.data.datasets[1].data[j] = 0;
                        
                        for(let doc of docs) {
                            /** @type {Db.farkle_history_players[]} */
                            let docHPs = (await query(`SELECT * FROM farkle_history_players WHERE id_history_games = ${doc.id}`)).results;

                            //weighted
                            if(doc.user_id_winner === message.member.id)
                                config.data.datasets[0].data[j] += 1 * docHPs.length / 2;
                            else
                                config.data.datasets[1].data[j] += 1 / docHPs.length * 2;
                        }
                    }
                    else {
                        config.data.datasets[0].data[j] = 0;
                        config.data.datasets[1].data[j] = 0;
                        config.data.datasets[2].data[j] = 0;
                        
                        for(let doc of docs) {
                            if(doc.user_id_winner === message.member.id) {
                                config.data.datasets[1].data[j] += doc.money_pot - doc.money_wager;
                                config.data.datasets[0].data[j] += doc.money_pot - doc.money_wager;
                            }
                            else
                                config.data.datasets[2].data[j] += doc.money_wager;

                            config.data.datasets[0].data[j] += doc.money_free;
                        }
                    }
                }
            }

            (async () => {
                const image = await canvasRenderService.renderToBuffer(config);
                sender.send(message, { files: [image], timeout: BotSender.timeout.medium })
            })();
        }).catch(console.error);
    }
}
module.exports = Farkle;

/**
 * 
 * @param {number} goal 
 */
function goalToCash(goal) {
    return dollarify(Math.floor, goal / 1000);
}

/**
 * @param {(number) => number} method
 * @param {number} number 
 * @returns {number}
 */
function dollarify(method, number) {
    return method(number * 100) / 100;
}

/**
 * @returns {Discord.RichEmbed}
 */
function getEmbedBlank() {
    return new Discord.RichEmbed({
        title: `:game_die: Farkle`,
        timestamp: new Date(),
        description: ""
    });
}

/**
 * @param {Db.farkle_current_games} docCG
 * @param {Db.farkle_current_players[]} docCPs
 * @returns {Discord.RichEmbed}
 */
function getEmbedUser(docCG, docCPs) {
    var docCP = docCPs.find(v => v.user_id === docCG.current_player_user_id);

    return new Discord.RichEmbed({
        title: `:game_die: Farkle`,
        color: docCP ? F.colors[docCP.turn_order] : 0,
        timestamp: new Date(),
        footer: {
            text: `Goal: ${docCG.points_goal} • Bank: ${docCP ? docCP.total_points_banked : -1} • Round: ${docCG.current_player_points} • ${F.currency}${docCG.money_pot.toFixed(2)}`
        },
        description: ""
    });
}

/**
 * 
 * @param {number[]} rolls 
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function getRollsGrid(rolls, width, height) {
    /** @type {Array<number[]>} */
    var arr = [];
    for(let y = 0; y < height; y++) {
        arr[y] = [];
    }

    for(let i = 0; i < rolls.length; i++) {
        let roll = rolls[i];

        let x, y;
        loop:
        while(true) {
            x = BotUtil.getRandomInt(0, width);
            y = BotUtil.getRandomInt(0, height);

            if(arr[y][x] != null) continue loop;
            if(arr[y - 1] && arr[y - 1][x] != null) continue loop;
            if(arr[y + 1] && arr[y + 1][x] != null) continue loop;
            if(arr[y][x - 1] != null) continue loop;
            if(arr[y][x + 1] != null) continue loop;

            arr[y][x] = roll;
            break;
        }
    }

    var str = "";
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            if(arr[y][x] == null)
                str += `   `;
            else
                str += `%${arr[y][x]}%`;
        }
        str += "\n";
    }

    return "```" + str + "```";
}

/**
 * @this Farkle
 * @param {Discord.Guild} guild 
 * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
 * @returns {Promise<string>} 
 */
async function getLeaderboardString(guild, query) {
    let arr = [];
    var total = {
        cash: 0,
        wins: 0,
    }

    /** @type {Db.farkle_history_players[]} */
    let docHPs = (await query(`SELECT MIN(hp.user_id) AS user_id FROM farkle_history_players hp JOIN farkle_history_games hg ON hp.id_history_games = hg.id WHERE hg.guild_id = ${guild.id} GROUP BY hp.user_id`)).results;
    for(let docHP of docHPs) {
        let member = guild.members.get(docHP.user_id);
        if(!member)
            continue;
        
        let cash = await Q.getPlayerCashTotal(member.id, query);
        total.cash += cash;

        let wins = 0;
        const players = await Q.getPlayerHighestPlayerCountGamePlayed(member.id, query);
        for(let i = 2; i <= players; i++) {
            const w = await Q.getPlayerWinsInXPlayerMatches(member.id, query, i);

            wins += w * i / 2;
        }
        total.wins += wins;
        
        arr.push({
            member: member,
            cash: cash,
            wins: wins,
        });
    }

    arr.sort((a, b) => b.cash - a.cash /*|| (b.user.gw+b.user.gl) - (a.user.gw+a.user.gl)*/);

    let userLength = 11;
    let cashLength = 10;

    let str = "```";
    str += BotUtil.String.fixedWidth(`No`, 2, " ");
    str += BotUtil.String.fixedWidth(`Cash`, cashLength, " ");
    str += BotUtil.String.fixedWidth(`Wins`, 6, " ");
    str += BotUtil.String.fixedWidth(` Player`, userLength, " ", true);
    str += "\n";

    for(let i = 0; i < Math.min(arr.length, 10); i++) {
        /** @type {string} */
        let name = arr[i].member.nickname || arr[i].member.user.username;
        if(name.length > userLength) {
            name = name.substring(0, userLength - 2) + "…";
        }

        str += BotUtil.String.fixedWidth(`${i+1}`, 2, " ");
        str += BotUtil.String.fixedWidth(`${F.currency}${arr[i].cash.toFixed(2)}`, cashLength, " ");
        str += BotUtil.String.fixedWidth(`${arr[i].wins.toFixed(1)}`, 6, " ");
        str += BotUtil.String.fixedWidth(` ${name}`, userLength, " ", true);
        str += "\n";
    }
    str += "\n";
    str += BotUtil.String.fixedWidth(`  `, 2, " ");
    str += BotUtil.String.fixedWidth(F.currency+total.cash.toFixed(2), cashLength, " ");
    str += BotUtil.String.fixedWidth(`${total.wins.toFixed(1)}`, 6, " ");
    str += BotUtil.String.fixedWidth(` Total`, userLength, " ", true);

    str += "```";
    return str;
}













//*****************************
//************LOGIC************
//*****************************

/**
 * Does not modify arrays. `true` if current rolls are a fold, otherwise `false`.
 * @param {number[]} rolls 
 * @returns {boolean}
 */
function getFold(rolls) {
    for(let match of F.matches) {
        if(getValidKeep(rolls, match.m))
            return false;
    }
    return true;
}

/**
 * Does not modify arrays. `true` if `keep` is valid with `rolls`, otherwise `false`.
 * @param {number[]} rolls 
 * @param {number[]} keep
 * @returns {boolean} 
 */
function getValidKeep(rolls, keep) {
    let rollsT = [...rolls];
    let keepT = [...keep];

    for(let i = 0; i < rollsT.length; i++) {
        for(let j = 0; j < keepT.length; j++) {
            if(rollsT[i] === keepT[j]) {
                rollsT.splice(i, 1);
                keepT.splice(j, 1);
                i--;
                j--;
            }
        }
    }

    if(keepT.length > 0)
        return false;
    return true;
}

/**
 * Modifies arrays. Returns points current player will get. 0 if `keep` is invalid.
 * @param {number[]} rolls 
 * @param {number[]} keep 
 * @returns {number}
 */
function processFarkleKeep(rolls, keep) {
    var points = 0;

    loop:
    while(true) {
        for(let match of F.matches) {
            let matchT = [...match.m];
            let keepT = [...keep];

            for(let i = 0; i < matchT.length; i++) {
                for(let j = 0; j < keepT.length; j++) {
                    if(matchT[i] === keepT[j]) {
                        matchT.splice(i, 1);
                        keepT.splice(j, 1);
                        i--;
                        j--;
                    }
                }
            }

            if(matchT.length === 0) {
                match.m.forEach(n => {
                    rolls.splice(rolls.indexOf(n), 1);
                    keep.splice(keep.indexOf(n), 1);
                });
                keep = keepT;
                points += match.p;
                continue loop;
            }

            if(keep.length === 0) return points;
        }
        if(keep.length > 0) return 0;

        return points;
    }
}







//*****************************
//****FARKLE LOOP HELPERS******
//*****************************
/**
 * @this Farkle
 * @param { { type: "ready"|"reject"|"keep"|"finish"|"help"|"hurry"|"concede", updateCurrentMatch: boolean, gameEnded: boolean } } state
 * @param {Db.farkle_current_games} docCG 
 * @param {Db.farkle_current_players} docCP 
 * @param {Db.farkle_current_players[]} docCPs 
 * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
 * @param {Discord.Client} client
 */
async function commit(state, docCG, docCP, docCPs, query, client) {
    if(state.type === "reject") {
        for(let player of docCPs) {
            await query(`DELETE FROM farkle_viewers WHERE user_id_target = ${player.user_id}`);
        }
        await query(`DELETE FROM farkle_current_players WHERE id_current_games = ${docCG.id}`);
        await query(`DELETE FROM farkle_current_games WHERE id = ${docCG.id}`);

        return;
    }

    if(state.type === "ready") {
        for(let player of docCPs) {
            await query(`DELETE FROM farkle_viewers WHERE user_id = ${player.user_id}`);
            await query(`UPDATE farkle_current_games SET has_started = true, match_start_time = ${Date.now()} WHERE id = ${docCG.id}`);
            for(let player of docCPs) {
                await query (`UPDATE farkle_current_players SET turn_order = ${player.turn_order} WHERE user_id = ${player.user_id} AND id_current_games = ${player.id_current_games}`);
            }

            this.update.bind(this)(client);
        }
    }

    if(state.type === "concede") {
        await query(`DELETE FROM farkle_viewers WHERE user_id_target = ${docCP.user_id}`);
        await query(`DELETE FROM farkle_current_players WHERE user_id = ${docCP.user_id} AND id_current_games = ${docCP.id_current_games}`);
        docCPs = (await query(`SELECT * FROM farkle_current_players WHERE id_current_games = ${docCP.id_current_games}`)).results;

        for(let player of docCPs) {
            await query (`UPDATE farkle_current_players SET turn_order = ${player.turn_order} WHERE user_id = ${player.user_id} AND id_current_games = ${player.id_current_games}`);
        }

        /** @type {Db.farkle_history_players} */
        let playerH = {
            id: /** @type {number} */(docCP.id),
            id_history_games: /** @type {number} */(docCG.id),
            user_id: docCP.user_id,
            money_wager: docCP.money_wager,
            money_free: 0,
            turn_order: docCP.turn_order,
            has_conceded: true,
            total_points_banked: docCP.total_points_banked,
            total_points_lost: docCP.total_points_lost,
            total_points_skipped: docCP.total_points_skipped,
            total_rolls: docCP.total_rolls,
            total_folds: docCP.total_folds,
            total_finishes: docCP.total_finishes,
            total_skips: docCP.total_skips,
            highest_points_banked: docCP.highest_points_banked,
            highest_points_lost: docCP.highest_points_lost,
            highest_points_skipped: docCP.highest_points_skipped,
            highest_rolls_in_turn: docCP.highest_rolls_in_turn,
            highest_rolls_in_turn_without_fold: docCP.highest_rolls_in_turn_without_fold
        }
        await query(BotUtil.SQL.getInsert(playerH, "farkle_history_players"));
    }

    if(state.updateCurrentMatch) {
        await query(`UPDATE farkle_current_games SET current_player_user_id = ${docCG.current_player_user_id}, current_player_rolls = "${docCG.current_player_rolls}", current_player_points = ${docCG.current_player_points}, current_player_rolls_count = ${docCG.current_player_rolls_count} WHERE id = ${docCG.id}`);

        for(let player of docCPs) {
            await query (`UPDATE farkle_current_players SET total_points_banked = ${player.total_points_banked}, total_points_lost = ${player.total_points_lost}, total_points_skipped = ${player.total_points_skipped}, total_rolls = ${player.total_rolls}, total_folds = ${player.total_folds}, total_finishes = ${player.total_finishes}, total_skips = ${player.total_skips}, highest_points_banked = ${player.highest_points_banked}, highest_points_lost = ${player.highest_points_lost}, highest_points_skipped = ${player.highest_points_skipped}, highest_rolls_in_turn = ${player.highest_rolls_in_turn}, highest_rolls_in_turn_without_fold = ${player.highest_rolls_in_turn_without_fold} WHERE user_id = ${player.user_id} AND id_current_games = ${player.id_current_games}`);
        }
    }

    if(state.gameEnded) {
        for(let player of docCPs) {
            await query(`DELETE FROM farkle_viewers WHERE user_id_target = ${player.user_id}`);
        }
        await query(`DELETE FROM farkle_current_players WHERE id_current_games = ${docCG.id}`);
        await query(`DELETE FROM farkle_current_games WHERE id = ${docCG.id}`);

        /** @type {Db.farkle_history_games} */
        let gameH = {
            id: /** @type {number} */(docCG.id),
            guild_id: docCG.guild_id,
            match_start_time: docCG.match_start_time,
            match_end_time: Date.now(),
            money_pot: docCG.money_pot,
            points_goal: docCG.points_goal,
            user_id_winner: docCG.current_player_user_id
        }
        await query(BotUtil.SQL.getInsert(gameH, "farkle_history_games"));

        for(let player of docCPs) {
            /** @type {Db.farkle_history_players} */
            let playerH = {
                id: /** @type {number} */(player.id),
                id_history_games: /** @type {number} */(gameH.id),
                user_id: player.user_id,
                money_wager: player.money_wager,
                money_free: state.type === "concede" ? 0 : goalToCash(gameH.points_goal),
                turn_order: player.turn_order,
                has_conceded: false,
                total_points_banked: player.total_points_banked,
                total_points_lost: player.total_points_lost,
                total_points_skipped: player.total_points_skipped,
                total_rolls: player.total_rolls,
                total_folds: player.total_folds,
                total_finishes: player.total_finishes,
                total_skips: player.total_skips,
                highest_points_banked: player.highest_points_banked,
                highest_points_lost: player.highest_points_lost,
                highest_points_skipped: player.highest_points_skipped,
                highest_rolls_in_turn: player.highest_rolls_in_turn,
                highest_rolls_in_turn_without_fold: player.highest_rolls_in_turn_without_fold
            }
            await query(BotUtil.SQL.getInsert(playerH, "farkle_history_players"));
        }

        this.update.bind(this)(client);
    }
}

/**
 * @this Farkle
 * @param {Db.farkle_current_games} docCG 
 * @param {Db.farkle_current_players} docCP
 * @param {Db.farkle_current_players[]} docCPs
 * @param {(Db.farkle_viewers|Db.farkle_current_players)[]} docCPVs
 */
async function decide(docCG, docCP, docCPs, docCPVs) {
    const sender = this.bot.sender;
    var docCPsRemaining = docCPs.slice();
    var docCPsTemp = docCPsRemaining.slice();
    var embed = getEmbedBlank();
    var turn = 1;

    while(true) {
        let str = "";

        /** @type {{rolls: number[], players: Db.farkle_current_players[], highest: number}} */
        let obj = _decide(docCPsTemp);

        for(let i = 0; i < docCPsTemp.length; i++) {
            let player = docCPsTemp[i];
            str += `\`${obj.rolls[i]}\`: <@${player.user_id}>\n`
        }
        str += "\n";

        if(obj.players.length > 1) {
            docCPsTemp = docCPsTemp.filter(v => {
                for(let i = 0; i < obj.players.length; i++) {
                    if(v === obj.players[i])
                        return true;
                }
            });
        }
        else {
            str += `<@${obj.players[0].user_id}> is in place ${turn}.`;
            docCPsRemaining = docCPsRemaining.filter(v => {
                if(v !== obj.players[0])
                    return true;
            });
            docCPsTemp = docCPsRemaining.slice();

            obj.players[0].turn_order = turn;

            if(turn === 1) {
                docCG.current_player_user_id = obj.players[0].user_id;
            }
            turn++;

            if(docCPsRemaining.length === 1) {
                str += `\n<@${docCPsRemaining[0].user_id}> is in place ${turn}.`;

                docCPsRemaining[0].turn_order = turn;
            }
        }

        embed.description = str;
        for(let attendee of docCPVs) {
            await sender.send(attendee.channel_dm_id, { embed: embed });
        }

        await BotUtil.Promise.sleep(2500);

        if(docCPsRemaining.length === 1) return;
    }
}
/**
 * 
 * @param {Db.farkle_current_players[]} docCPs
 * @returns {{rolls: number[], players: Db.farkle_current_players[], highest: number}} 
 */
function _decide(docCPs) {
    /** @type {number[]} */
    let rolls = [];

    for(let player of docCPs) {
        rolls.push(BotUtil.getRandomInt(1, 7));
    }

    let highest = 0;
    /** @type {Db.farkle_current_players[]} */ let players = [];

    for(let i = 0; i < rolls.length; i++) {
        let roll = rolls[i];
        if(roll === highest) {
            players.push(docCPs[i]);
        }
        else if(roll > highest) {
            players = [];
            highest = roll;
            players.push(docCPs[i]);
        }
    }

    return {
        rolls: rolls,
        players: players,
        highest: highest
    }
}

/**
 * Modifies `doc` object. Rolls dice until a player can `keep`.
 * @this {Farkle}
 * @param {{ type: "keep"|"finish"|"fold"|"hurry"|"concede"|null, keep: number[], points: number, bank?: number, player: Discord.Snowflake }} action
 * @param {Db.farkle_current_games} docCG
 * @param {Db.farkle_current_players[]} docCPs
 * @param {(Db.farkle_viewers|Db.farkle_current_players)[]} docCPVs
 * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
 */
async function roll(action, docCG, docCPs, docCPVs, query) {
    const sender = this.bot.sender;

    while(true) {
        let count = JSON.parse(docCG.current_player_rolls).length;
        if(count === 0) count = 6;

        const rolls = [];
        for(let i = 0; i < count; i++) {
            rolls[i] = BotUtil.getRandomInt(1, 7);
        }
        docCG.current_player_rolls = JSON.stringify(rolls);

        let playerCurrent = docCPs.find(v=>v.user_id === docCG.current_player_user_id);
        if(!playerCurrent) throw new Error("Farkle.roll: Player is null");
        playerCurrent.total_rolls++;
        docCG.current_player_rolls_count++;
        if(docCG.current_player_rolls_count > playerCurrent.highest_rolls_in_turn)
            playerCurrent.highest_rolls_in_turn = docCG.current_player_rolls_count;

        const fold = getFold(rolls);
        let grid = getRollsGrid(rolls, 5, 5);
        for(let attendee of docCPVs) {
            let embed = getEmbedUser(docCG, docCPs);
            embed.fields = [];

            if(action.type) {
                let name = `<@${action.player}>`;
                if(attendee.user_id === action.player) name = "You";

                switch(action.type) {
                case "keep":
                    embed.description = `> ${name} kept ${action.keep.join(", ")} for ${action.points} points.`;
                    break;
                case "finish":
                    embed.description = `> ${name} finished ${attendee.user_id===action.player?"your":"their"} turn with ${action.points} points, having last kept ${action.keep.join(", ")}.\n> ${attendee.user_id===action.player?"Your":"Their"} bank is now ${action.bank}.`;
                    break;
                case "hurry":
                    embed.description = `> ${name} ${attendee.user_id===action.player?"were":"was"} hurried and lost ${action.points} points, as well as the current turn.`;
                    break;
                case "concede":
                    embed.description = `> ${name} ${attendee.user_id===action.player?"have":"has"} conceded the match.`
                    break;
                case "fold":
                    embed.description = `> ${name} folded.`
                    break;
                }
                embed.description += "\n\n";
            }

            /** @type {Db.farkle_users|undefined} */
            let docU = (await query(`SELECT * FROM farkle_users WHERE user_id = ${attendee.user_id}`)).results[0];

            let g = grid;
            let s = (docU ? docU.skin : "braille");
            g = g.replace(/%1%/g, ` ${F.skins[s][1]} `);
            g = g.replace(/%2%/g, ` ${F.skins[s][2]} `);
            g = g.replace(/%3%/g, ` ${F.skins[s][3]} `);
            g = g.replace(/%4%/g, ` ${F.skins[s][4]} `);
            g = g.replace(/%5%/g, ` ${F.skins[s][5]} `);
            g = g.replace(/%6%/g, ` ${F.skins[s][6]} `);

            if(attendee.user_id === docCG.current_player_user_id)
                embed.description += `**Your rolls:**\n`;
            else
                embed.description += `**<@${docCG.current_player_user_id}>'s rolls:**\n`;

            embed.description += g;

            if(fold) {
                embed.description += `\n**Fold!**`;
            }
            else {
                if(docCPs.includes(/** @type {Db.farkle_current_players} */(attendee))) {
                    if(attendee.user_id === docCG.current_player_user_id)
                        embed.description += `\n\`help\` • \`keep\` • \`finish\` • \`concede\``;
                    else
                        embed.description += `\n\`help\` • \`hurry\` • \`concede\``;
                }
            }

            await sender.send(attendee.channel_dm_id, "", { embed: embed });
        }
        
        if(fold) {
            action.type = "fold";
            action.player = docCG.current_player_user_id;
            playerCurrent.total_folds++;
            playerCurrent.total_points_lost += docCG.current_player_points;
            if(docCG.current_player_points > playerCurrent.highest_points_lost)
                playerCurrent.highest_points_lost = docCG.current_player_points;
            await turn.bind(this)(docCG, docCPs, query, "fold");
        }
        else {
            break;
        }
    }
}

/**
 * Modifies `docG` object. Moves to next turn.
 * @this {Farkle}
 * @param {Db.farkle_current_games} docCG 
 * @param {Db.farkle_current_players[]} docCPs
 * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
 * @param {"finish"|"fold"|"concede"|"hurry"} type
 */
async function turn(docCG, docCPs, query, type) {
    const sender = this.bot.sender;

    docCG.current_player_rolls = "[]";
    docCG.current_player_points = 0;
    docCG.current_player_rolls_count = 0;

    var player = docCPs.find(v => v.user_id === docCG.current_player_user_id);
    if(!player) return;
    let playerCurrent = player;

    var player = docCPs.find(v => v.turn_order === playerCurrent.turn_order + 1);
    if(!player) {
        player = docCPs.find(v => v.turn_order === 1);
        if(!player) return;
    }
    let playerNext = player;

    docCG.current_player_user_id = playerNext.user_id;


    let embed = getEmbedBlank();
    let str = "";
    var arr = [];
    for(let player of docCPs) {
        arr.push(player);
    }
    arr.sort((a, b) => b.total_points_banked - a.total_points_banked);
    for(let player of arr) {
        str += `${player.total_points_banked} pts - <@${player.user_id}>\n`;
    }
    embed.description = str;
    
    await sender.send(playerNext.channel_dm_id, { embed: embed });
}

/**
 * @this Farkle
 * @param {Db.farkle_current_games} docCG 
 * @param {Db.farkle_viewers[]} docVs
 * @param {Db.farkle_current_players[]} docCPs
 * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
 * @param {"concede"|"no_concede"} type - Whether the second-to-last player conceded the match or not. Purely visual statement.
 */
async function end(docCG, docVs, docCPs, query, type) {
    var sender = this.bot.sender;
    for(let player of docCPs) {
        let str = "";
        if(player.user_id === docCG.current_player_user_id)
            str = `You won ${F.currency}${docCG.money_pot.toFixed(2)}!`;
        else
            str = `<@${docCG.current_player_user_id}> wins! You lost ${F.currency}${player.money_wager.toFixed(2)}.`;

        if(type !== "concede")
            str += `\nYou earned ${F.currency}${goalToCash(docCG.points_goal).toFixed(2)} for completing a game with a goal of ${docCG.points_goal}!`;

        let embed = getEmbedUser(docCG, docCPs);
        embed.description = str;
        await sender.send(player.channel_dm_id, { embed: embed });
    }

    for(let viewer of docVs) {
        let str = `<@${docCG.current_player_user_id}> wins ${F.currency}${docCG.money_pot.toFixed(2)}!\n`;
        for(let player of docCPs) {
            if(player.user_id === docCG.current_player_user_id) continue;
            str += `<@${player.user_id}> loses ${F.currency}${player.money_wager.toFixed(2)}.\n`
        }

        if(type !== "concede")
            str += `\nEveryone earns ${F.currency}${goalToCash(docCG.points_goal).toFixed(2)} for completing a game with a goal of ${docCG.points_goal}!`;

        let embed = getEmbedUser(docCG, docCPs);
        embed.description = str;
        await sender.send(viewer.channel_dm_id, { embed: embed });
    }
}

const Q = Object.freeze({
    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerLastSeen: async (id, query) => {
        var q = (await query(`select max(hg.match_end_time)
        from farkle_history_games hg
        join farkle_history_players hp on hg.id = hp.id_history_games
        where hp.user_id = ${id}
        group by hp.user_id`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashWonStats: async (id, query) => {
        var q = (await query(`select sum(hg.money_pot - hp.money_wager) as 'result'
        from farkle_history_games hg
        join farkle_history_players hp on hg.id = hp.id_history_games 
        where hg.user_id_winner = ${id} and hp.user_id = ${id}
        group by hg.user_id_winner`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },
    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashLostStats: async (id, query) => {
        var q = (await query(`SELECT SUM(hp.money_wager) FROM farkle_history_players hp JOIN farkle_history_games hg ON hp.id_history_games = hg.id WHERE hp.user_id = ${id} and hg.user_id_winner != ${id} GROUP BY hp.user_id`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashWon: async (id, query) => {
        var q = (await query(`select sum(money_pot) from farkle_history_games where user_id_winner = ${id} group by user_id_winner`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },
    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashLost: async (id, query) => {
        var q = (await query(`SELECT SUM(hp.money_wager) FROM farkle_history_players hp JOIN farkle_history_games hg ON hp.id_history_games = hg.id WHERE hp.user_id = ${id} GROUP BY hp.user_id`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },
    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashGained: async (id, query) => {
        var q = (await query(`select sum(hp.money_free) from farkle_history_players hp join farkle_history_games hg on hp.id_history_games = hg.id where hp.user_id = ${id} and hp.has_conceded = false group by hp.user_id`)).results[0];
        if(q) return Object.values(q)[0];
        return 0;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerCashTotal: async (id, query) => {
        let money = F.startingCurrency;

        money = dollarify(Math.round, money + await Q.getPlayerCashWon(id, query));
        money = dollarify(Math.round, money - await Q.getPlayerCashLost(id, query));
        money = dollarify(Math.round, money + await Q.getPlayerCashGained(id, query));

        return money;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @returns {Promise<number>}
     */
    getPlayerHighestPlayerCountGamePlayed: async (id, query) => {
        var q = (await query(`select max(sub1.players) as 'players' from(
            select count(hp.id_history_games) as 'players', 'a' as 'a' from farkle_history_players hp
            where hp.id_history_games in (
            select hp2.id_history_games from farkle_history_players hp2
            where hp2.user_id = ${id}
            ) group by hp.id_history_games
            ) sub1 group by sub1.a`)).results[0];
        
        return q ? q.players : 0;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @param {number} players
     * @returns {Promise<number>}
     */
    getPlayerWinsInXPlayerMatches: async (id, query, players) => {
        var q = (await query(`select count(hg.user_id_winner) as 'wins' from (
            select hp.id_history_games from farkle_history_players hp
            group by hp.id_history_games
            having count(hp.id_history_games) = ${players}) 
            subquery join farkle_history_games hg on subquery.id_history_games = hg.id
            where hg.user_id_winner = ${id}
            group by hg.user_id_winner`)).results[0];

        return q ? q.wins : 0;
    },

    /**
     * @param {Discord.Snowflake} id 
     * @param {(s: string) => Promise<{results: any, fields: MySQL.FieldInfo[] | undefined}>} query
     * @param {number} players
     * @returns {Promise<number>}
     */
    getPlayerGamesInXPPlayerMatches: async (id, query, players) => {
        var q = (await query(`select count(sub1.id_history_games) as 'games' from (
            select hp.id_history_games as 'id_history_games', 'a' as 'a' from farkle_history_players hp
            where hp.user_id = ${id}) sub1
            where sub1.id_history_games in (
            select hp2.id_history_games from farkle_history_players hp2
            group by hp2.id_history_games
            having count(hp2.id_history_games) = ${players})
            group by sub1.a`)).results[0];
        
        return q ? q.games : 0;
    },
});

/**
 * Farkle AI Code
 * Author: Lok Man Chu
 */

let state = {
    rolls : [],
    round : 0,
    bank : 0,
    goal: 0
};

let expectedVal = [1376,8,13,76,363,665,1376];
let foldChance = [.03,.67,.44,.28,.16,.08,.03];


/**
 * Returns best action based on best expected value.
 *      Return array contains 2 values
 *      index 0 - "k" or "f", keep or finish action
 *      index 1 - dice array to keep or finish
 * @param {object} state - object containing current rolls and game state
 * @returns {array} action
 */
function get_action(state) {
    let value = max_value(state.rolls);
    let high = get_keeps(state.rolls).high;
    if (high + state.round + state.bank >= state.goal) // Win
        return ["f", high];
    if (value > state.round) {
        return ["k", value.keep];
    }
    else {
        return ["f", high];
    }
}

/**
 * Returns best expected value and keep based on rolls.
 *      Return Object contains 2 values
 *      keep - array of dice rolls to keep
 *      val - expected value of the keep plus the potential points of the next roll
 * @param {number[]} diceRolls - Array of dice roll values
 * @returns {object} dice keep
 */
function max_value(rolls) {
    let keeps = get_keeps(rolls);
    let highVal = keep_value(keeps.high);
    let midVal = keep_value(keeps.mid);
    let lowVal = keep_value(keeps.low);

    highVal += keeps.high !== 0 ? expectedVal[(6-keeps.high.length)] : 0;
    midVal += keeps.mid !== 0 ? expectedVal[(6-keeps.mid.length)] : 0;
    lowVal += keeps.low !== 0 ? expectedVal[(6-keeps.low.length)] : 0;

    highVal *= 1-foldChance[(6-keeps.high.length)];
    midVal *= 1-foldChance[(6-keeps.mid.length)];
    lowVal *= 1-foldChance[(6-keeps.low.length)];
    let bestVal = Math.max(highVal,midVal,lowVal);
    let action;
    switch (bestVal) {
        case highVal:
            action = keeps.high;
            break;
        case  midVal:
            action = keeps.mid;
            break;
        case lowVal:
            action = keeps.low;
            break;
    }
    return {
        keep : action,
        val : bestVal
    };
}


/**
 * Returns three possible keeps for given dice rolls as an object.
 *      object contains 3 array values: low, mid, and high.
 *      low - [1] or [5] if 1 or 5 is in diceRolls, 1 has precedent over 5. 0 otherwise.
 *      mid - highest scoring non-single keep. does not include extra 1's and 5's. 0 otherwise.
 *      high - highest scoring non-single keep including extra 1's and 5's. 0 otherwise.
 * @param {number[]} diceRolls - Array of dice roll values
 * @returns {object} possible keeps
 */
function get_keeps(diceRolls) {
    let mid = 0;
    let low = 0;

    let rolls = diceRolls.sort();
    let num_each = number_of_each_die(diceRolls);
    let no_dupe = new Set(rolls);

    // Set Low
    if (num_each[0] > 0 )
        low = [0];
    else if (num_each[4])
        low = [5];

    //Set Medium
    if (no_dupe.size === 6) {
        mid = [1, 2, 3, 4, 5, 6];
    }
    else if (no_dupe.size === 5) {
        if (num_each[0] > 0 && !num_each[5] > 0)
            mid = [1, 2, 3, 4, 5];
        else if (!num_each[0] > 0 && num_each[5] > 0)
            mid = [2, 3, 4, 5, 6];
    }
    else if (rolls.size === 6 && keep_value(rolls) !== 0) {
        mid = rolls;
    }
    else {
        for (let current of no_dupe) {
            if (num_each[current-1] >= 3) {
                mid = new Array(num_each[current-1]).fill(current);
                break;
            }
        }
    }

    //Set High
    let high = mid;
    if (high !== 0){
        for (let i = 0; i < num_each[0]; i++)
            high.push(1);
        for (let i = 0; i < num_each[4]; i++)
            high.push(5);
    }

    return {
        high : high,
        mid : mid,
        low: low
    };
}

/**
 * Returns the keep value of given keep. 0 if `keep` is invalid.
 * @param {number[]} diceRolls - Array of dice roll values to be kept
 * @returns {number}
 */
function keep_value(diceRolls) {
    if (diceRolls === 0) return 0;
    let rolls = diceRolls.sort();
    let num_each = number_of_each_die(diceRolls);
    let no_dupe = new Set(rolls);

    //Straight values
    if (no_dupe.size === 6) {
        return 1500; // 123456
    }
    else if (no_dupe.size === 5) {
        if (num_each[0] > 0 && !num_each[5] > 0) {
            if (num_each[0] === 2) return 600; // 112345
            else if (num_each[4] === 2) return 550; // 123455
            else return 500; // 12345
        }
        else if (!num_each[0] > 0 && num_each[5] > 0) {
            if (num_each[4] === 2) return 800; // 234556
            else return 750; // 23456
        }
    }

    // Triples and 1,5 values
    let total = 0;
    for (let current of no_dupe) {
        if (num_each[current-1] >= 3)
            total += (current === 1 ? 10 : current) * 100 * 2 ** (num_each[current - 1] - 3);
        else if (current === 1)
            total += 100 * num_each[current - 1];
        else if (current === 5)
            total += 50 * num_each[current - 1];
        else
            return 0;
    }
    return total;
}

/**
 * Count number of times a dice roll appears in an array
 * @param {number[]} diceRolls - Array of dice roll values
 * @returns {number[]} number of times each value appears in array.
 */
function number_of_each_die(diceRolls) {
    let result = [0,0,0,0,0,0];
    for (let i of diceRolls) {
        result[i-1]++;
    }
    return result;
}



