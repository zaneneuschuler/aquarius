import aquarius from '../..';
// import { ONE_WEEK, getDateAgo } from '../helpers/times';

// TODO: Document
export function getTotalUserCount() {
  return aquarius.guilds
    .array()
    .reduce((val, guild) => val + guild.memberCount, 0);
}

// TODO: Document
// export async function getWeeklyUserCount(weeksAgo) {
//   const startTarget = getDateAgo(ONE_WEEK * weeksAgo);
//   const endTarget = getDateAgo(ONE_WEEK * (weeksAgo - 1));

//   const records = await aquarius.database.guildSnapshots.find({
//     date: {
//       $gte: startTarget,
//       $lte: endTarget,
//     },
//   });

//   return records.reduce((members, document) => members + document.members, 0);
// }
