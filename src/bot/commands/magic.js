import debug from 'debug';
import fetch from 'node-fetch';
import { Permissions } from 'discord.js';

const log = debug('Magic');

export const info = {
  name: 'magic',
  description: 'Posts images for linked Magic: the Gathering cards.',
  permissions: [Permissions.FLAGS.ATTACH_FILES],
  usage:
    "```The only good planeswalker is [[Jace Beleren]] and that's final```",
};

const API = 'https://api.scryfall.com';

async function getCard(name) {
  // TODO: Switch to URL params
  const response = await fetch(`${API}/cards/search?q=${name}`);
  return response.json();
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onDynamicTrigger(
    info,
    message => aquarius.triggers.bracketTrigger(message),
    async (message, cardList) => {
      log(`Retrieving entries for: ${cardList.join(', ')}`);

      aquarius.loading.start(message.channel);
      try {
        const responses = await Promise.all(
          cardList.map(card => getCard(card))
        );
        const images = responses.reduce((list, json) => {
          if (json && !json.status) {
            const [entry] = json.data;
            list.push(entry.image_uris.png);
          }

          return list;
        }, []);

        if (images.length > 0) {
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

          message.channel.send({
            files: images.map(image => {
              const link = new URL(image);
              return `${link.origin}${link.pathname}`;
            }),
          });

          analytics.trackUsage('card link', message);
        }
      } catch (error) {
        log(error);
      }

      aquarius.loading.stop(message.channel);
    }
  );
};
