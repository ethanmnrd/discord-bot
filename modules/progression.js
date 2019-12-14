"use strict";

const Discord = require("discord.js");
const { BotCore, console, BotModule, BotSender, BotUtil } = require("node_modules/@grabz-dev/discord-bot-core/main.js");

/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/BotCore").Access} BotCore.Access */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/MongoWrapper")} MongoWrapper */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/MongoWrapper").Session} MongoWrapper.Session */
/** @typedef {import("mysql").FieldInfo} MySQL.FieldInfo */
/** @typedef {import("node_modules/@grabz-dev/discord-bot-core/core/SQLWrapper")} SQLWrapper */
/** @typedef {import("node_modules/tingodb/lib/ObjectId")} ObjectID */

/**
 * @typedef {object} Db.progression_roles
 * @property {number=} id
 * @property {Discord.Snowflake} role_id
 * @property {number} hze
 */

var _p = new WeakMap();

class Progression extends BotModule {
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
            await query(`CREATE TABLE IF NOT EXISTS progression_roles(
                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        role_id TINYTEXT NOT NULL,
                        hze INT NOT NULL);`);
        }).catch(console.error);
    }

    /**
    * Module Function: Associate a progression role with the min zone required to acquire it.
    * @param {Discord.Message} message - Message of the user executing the command.
    * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
    * @param {string} arg - The full string written by the user after the command.
    * @param {object} ext - Custom parameters provided to function call.
    * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
    */
    add(message, args, arg, ext) {
        let sender = this.bot.sender;

        /** @type {any} */
        let arg1 = args[0];
        let arg2 = args[1];

        if(arg1 == null)
            return "No arguments provided.";
        arg1 = BotUtil.getSnowflakeFromDiscordPing(arg1);
        if(arg1 == null)
            return "Invalid role mention/ID.";
        let role = message.guild.roles.get(arg1);
        if(role == null)
            return "Invalid role mention/ID, or this role doesn't exist on this server.";

        if(arg2 == null)
            return "No Highest Zone Reached argument provided.";
        let hze = +arg2;
        if(!Number.isFinite(hze))
            return "Invalid Highest Zone Reached number.";
        hze = Math.floor(hze);
        if(hze < 1 || hze > 1000)
            return "Highest Zone Reached can't be lower than 1 or higher than 1000.";

        this.sql.session(message.guild, async query => {
            if(!role) return;

            /** @type {Db.progression_roles} */
            var doc = (await query(`SELECT * FROM progression_roles WHERE hze = ${hze}`)).results[0];

            if(!doc) {
                /** @type {Db.progression_roles} */
                let pr = {
                    role_id: role.id,
                    hze: hze
                }

                await query(BotUtil.SQL.getInsert(pr, "progression_roles"));
                sender.send(message, `Role association added at HZE ${hze}.`, { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
            else {
                await query(`UPDATE progression_roles SET role_id = "${role.id}" WHERE hze = ${hze}`);
                sender.send(message, `Role association updated at HZE ${hze}.`, { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
        }).catch(console.error);
    }

    /**
    * Module Function: Remove a progression role association.
    * @param {Discord.Message} message - Message of the user executing the command.
    * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
    * @param {string} arg - The full string written by the user after the command.
    * @param {object} ext - Custom parameters provided to function call.
    * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
    */
    remove(message, args, arg, ext) {
        let sender = this.bot.sender;

        let arg1 = arg;

        if(arg1 == null)
            return "No Highest Zone Reached argument provided.";
        let hze = +arg1;
        if(!Number.isFinite(hze))
            return "Invalid Highest Zone Reached number.";
        hze = Math.floor(hze);
        if(hze < 1 || hze > 1000)
            return "Highest Zone Reached can't be lower than 1 or higher than 1000.";

        this.sql.session(message.guild, async query => {
            /** @type {Db.progression_roles} */
            var doc = (await query(`SELECT * FROM progression_roles WHERE hze = ${hze}`)).results[0];

            if(!doc) {
                sender.send(message, `Nothing to delete at HZE ${hze}.`, { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
            else {
                await query(`DELETE FROM progression_roles WHERE hze = ${hze}`);
                sender.send(message, `Deleted role association at HZE ${hze}.`, { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
        }).catch(console.error);
    }

    /**
    * Module Function: List role associations.
    * @param {Discord.Message} message - Message of the user executing the command.
    * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
    * @param {string} arg - The full string written by the user after the command.
    * @param {object} ext - Custom parameters provided to function call.
    * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
    */
    list(message, args, arg, ext) {
        let sender = this.bot.sender;

        this.sql.session(message.guild, async query => {
            /** @type {Db.progression_roles[]} */
            var docs = (await query(`SELECT * FROM progression_roles`)).results;

            let str = "";
            for(let doc of docs) {
                str += doc.hze + ": " + doc.role_id + "\n";
            }
            sender.send(message, str, { timeout: BotSender.timeout.long }).catch(console.error);
        }).catch(console.error);
    }

    /**
    * Module Function: Given a HZE, assign all progression roles up to this hze to this user.
    * @param {Discord.Message} message - Message of the user executing the command.
    * @param {string[]} args - List of arguments provided by the user delimited by whitespace.
    * @param {string} arg - The full string written by the user after the command.
    * @param {object} ext - Custom parameters provided to function call.
    * @returns {string | void} Nothing if finished correctly, string if an error is thrown.
    */
    hze(message, args, arg, ext) {
        let sender = this.bot.sender;

        let timeout = +this.cache.get(message.guild.id, `timeout${message.member.id}`);
        if(Number.isFinite(timeout)) {
            if(timeout + (1000 * 4) > Date.now()) {
                sender.send(message, "You can't do this that often. Try again in a few seconds.", { timeout: BotSender.timeout.short }).catch(console.error);
                return;
            }
        }
        this.cache.set(message.guild.id, `timeout${message.member.id}`, Date.now());

        let arg1 = arg;
        if(arg1 == null)
            return "No Highest Zone Reached argument provided.";
        let hze = +arg1;
        if(!Number.isFinite(hze))
            return "Invalid Highest Zone Reached number.";
        hze = Math.floor(hze);
        if(hze < 0 || hze > 1000)
            return "Highest Zone Reached can't be lower than 0 or higher than 1000.";

        this.sql.session(message.guild, async query => {
            /** @type {Db.progression_roles[]} */
            var docs = (await query(`SELECT * FROM progression_roles`)).results;

            for(let doc of docs) {
                if(message.member.roles.has(doc.role_id)) {
                    await message.member.removeRole(doc.role_id);
                    await BotUtil.Promise.sleep(500);
                }
            }

            /** @type {Db.progression_roles[]} */
            var docs = (await query(`SELECT * FROM progression_roles WHERE hze <= ${hze}`)).results;
            if(docs.length === 0) {
                sender.send(message, "You no longer have any progression roles, beep boop.", { reply: message, timeout: BotSender.timeout.long }).catch(console.error);
                return;
            }
            docs.sort((a, b) => b.hze - a.hze);

            await message.member.addRole(docs[0].role_id);
            sender.send(message, "You now have some sweet new roles! <:zone_gift:394549342750507008>", { reply: message, timeout: BotSender.timeout.long }).catch(console.error);
        }).catch(console.error);
    }
}
module.exports = Progression;