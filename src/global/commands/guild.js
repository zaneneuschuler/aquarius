import debug from 'debug';
import dedent from 'dedent-js';
import pluralize from 'pluralize';
import { Permissions } from 'discord.js';
import { guildEmbed } from '../../lib/helpers/embeds';

const log = debug('Guild');

export const info = {
  name: 'guild',
  description: 'Displays basic information about your server.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius guild```',
};

function formatGuild(guild, idx) {
  const members = `${guild.memberCount} ${pluralize(
    'Member',
    guild.memberCount
  )}`;
  return `${idx + 1}. ${guild.name} -- *(${members})*\n`;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^(?:server|guild)$/i, async message => {
    log(`Info for ${message.guild.name}`);

    const check = aquarius.permissions.check(
      message.guild,
      ...info.permissions
    );

    if (!check.valid) {
      log('Invalid permissions');
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    const { guild } = message;
    const admin = aquarius.permissions.isGuildAdmin(guild, guild.me);

    const embed = await guildEmbed(guild, {
      title: 'Aquarius',
      content: dedent`**Admin:** ${admin ? 'Yes' : 'No'}`,
    });

    message.channel.send(embed);

    analytics.trackUsage('stats', message);
  });

  aquarius.onCommand(/(server|guild) list/i, async message => {
    if (aquarius.permissions.isBotOwner(message.author)) {
      log('List Requested');
      const guilds = aquarius.guilds.array();

      message.channel.send(dedent`
      **I'm in ${guilds.length} ${pluralize('Server', guilds.length)}**

      ${guilds.reduce((str, guild, idx) => str + formatGuild(guild, idx), '')}
    `);

      analytics.trackUsage('list', message);
    }
  });

  aquarius.onCommand(
    /(?:server|guild) info (?<name>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotOwner(message.author)) {
        log(`Specific request for ${groups.name}`);

        const check = aquarius.permissions.check(
          message.guild,
          ...info.permissions
        );

        if (!check.valid) {
          log('Invalid permissions');
          message.channel.send(
            aquarius.permissions.getRequestMessage(check.missing)
          );
          return;
        }

        const guild = aquarius.guilds.find(
          server => server.name === groups.name
        );

        if (guild) {
          const embed = await guildEmbed(guild);
          message.channel.send(embed);
        } else {
          message.channel.send("Sorry, I couldn't find that guild!");
        }

        analytics.trackUsage('lookup', message);
      }
    }
  );
};
