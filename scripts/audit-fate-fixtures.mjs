import { calculateBazi } from "../client/src/lib/bazi.ts";
import { deriveFateAnalysis } from "../client/src/lib/fateAnalysis.ts";

const fixtures = [
  { id: "fixture-b", input: { datetime: "1988-06-15T10:30", longitude: 121.4737, latitude: 31.2304, gender: "female" } },
  { id: "fixture-c", input: { datetime: "2001-11-04T08:20", longitude: 114.0579, latitude: 22.5431, gender: "male" } },
];

const output = fixtures.map(({ id, input }) => {
  const result = calculateBazi(input);
  const reading = deriveFateAnalysis(result, input, "zh-CN", 2026);
  return {
    id,
    pillars: result.pillars.map((pillar) => pillar.ganzhi).join(" "),
    dayMaster: `${reading.dayMaster}${reading.dayMasterElement}`,
    monthCommand: `${reading.monthCommand.branch}月/${reading.monthCommand.tenGod}`,
    strength: reading.strength.label,
    favored: reading.useGod.favored.join("、"),
    avoid: reading.useGod.avoid.join("、"),
    interactions: reading.structure.interactions,
    daYun: `${reading.currentLuck.ganzhi}/${reading.currentLuck.tenGod}`,
    flowYear: `${reading.currentLuck.flowYear}/${reading.currentLuck.flowYearTenGod}`,
    finance: reading.finance.judgment,
    career: reading.career.judgment,
    relationship: reading.relationship.judgment,
  };
});

console.log(JSON.stringify(output, null, 2));
