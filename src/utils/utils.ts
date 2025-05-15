import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

dayjs.extend(utc);
dayjs.extend(timezone);

export const tz = 'Asia/Dhaka';

export const startAndEndOfDate = (
  date?: string | number | Date | dayjs.Dayjs,
) => {
  const dayjsDhaka = dayjs(date).tz(tz);

  const startOfToday = dayjsDhaka.startOf('day');
  const endOfToday = startOfToday.endOf('day');

  const startOfLastday = startOfToday.subtract(1, 'day');
  const endOfLastday = startOfLastday.endOf('day');

  const startOfMonth = startOfToday.startOf('month');
  const endOfMonth = endOfToday.endOf('month');

  const startOfPreviousMonth = startOfToday
    .subtract(1, 'month')
    .startOf('month');
  const endOfPreviousMonth = endOfToday.subtract(1, 'month').endOf('month');

  return {
    startOfToday: startOfToday.toDate(),
    endOfToday: endOfToday.toDate(),
    startOfLastday: startOfLastday.toDate(),
    endOfLastday: endOfLastday.toDate(),
    startOfMonth: startOfMonth.toDate(),
    endOfMonth: endOfMonth.toDate(),
    startOfPreviousMonth: startOfPreviousMonth.toDate(),
    endOfPreviousMonth: endOfPreviousMonth.toDate(),
  };
};

export const startAndEndBetweenSixDays = (
  date?: string | number | Date | dayjs.Dayjs,
) => {
  const dayjsDhaka = dayjs(date).tz(tz);

  const firstDate = dayjsDhaka.subtract(6, 'day').startOf('day').toDate();

  const lastDate = dayjsDhaka.subtract(1, 'day').endOf('day').toDate();

  return {
    firstDate,
    lastDate,
  };
};

function encodeCol(col: number): string {
  const letr = {
    '0': 'A',
    '1': 'B',
    '2': 'C',
    '3': 'D',
    '4': 'E',
    '5': 'F',
    '6': 'G',
    '7': 'H',
    '8': 'I',
    '9': 'J',
    '10': 'K',
    '11': 'L',
    '12': 'M',
    '13': 'N',
    '14': 'O',
    '15': 'P',
    '16': 'Q',
    '17': 'R',
    '18': 'S',
    '19': 'T',
    '20': 'U',
    '21': 'V',
    '22': 'W',
    '23': 'X',
    '24': 'Y',
    '25': 'Z',
  };

  const div = ((col / 26) | 0) - 1;
  const mod = col % 26;

  if (div >= 26) return `${encodeCol(div)}${letr[mod]}`;
  else return `${letr[div] || ''}${letr[mod] || ''}`;
}

export function wsMergedCells(rows: string[][]) {
  rows = rows.map((row) => row.concat(''));

  const merges: string[] = [];

  rows.forEach((row, rowIdx) => {
    let startRow: number;
    let startCol: number;

    row.forEach((col, colIdx) => {
      let prevRowPrevColVal: string;
      let isCurrColPrevRowsHasVal: boolean;

      if (rowIdx && colIdx) {
        let prevRowIdx = rowIdx - 1;
        let prevColIdx = colIdx - 1;

        prevRowPrevColVal = rows[prevRowIdx][prevColIdx];

        isCurrColPrevRowsHasVal = Array.from({
          length: rows.length - rowIdx,
        }).some((_, rowIdx) => rows[rowIdx][colIdx]);
      }

      const isRowLastCol = row.length - 1 === colIdx;

      if (
        col ||
        (prevRowPrevColVal && !col && isCurrColPrevRowsHasVal) ||
        (prevRowPrevColVal === '' && !col && isCurrColPrevRowsHasVal) ||
        isRowLastCol
      ) {
        if (startRow != null && startCol != null) {
          let endRow = rowIdx;

          let endCol = colIdx - 1;

          let idx = -1;
          let length = rows.length - (rowIdx + 1);

          while (++idx < length) {
            const nextRowIdx = rowIdx + idx + 1;

            if (!rows[nextRowIdx][endCol] && !rows[nextRowIdx][startCol])
              endRow++;
            else {
              break;
            }
          }

          merges.push(
            `${encodeCol(startCol)}${startRow + 1}:${encodeCol(endCol)}${endRow + 1}`,
          );
          startRow = null;
          startCol = null;
        }

        if (
          !(
            (prevRowPrevColVal && !col && isCurrColPrevRowsHasVal) ||
            (prevRowPrevColVal === '' && !col && isCurrColPrevRowsHasVal)
          )
        ) {
          startRow = rowIdx;
          startCol = colIdx;
        }
      }
    });
  });

  return merges;
}

export function modifyUserLevel(userType: string) {
  if (userType === UserType.CC) return 'BA';
  else if (userType === UserType.MTCM) return 'MTM';
  else if (userType === UserType.MS) return 'CM SUP';
  else return userType;
}

/*export function modifyPass(data, threshold) {
  data.planogram?.forEach((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    if (threshold.pass[thresholdIdx].shelfTalker) {
      const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
      if (
        item.compliance >= threshold.pass[thresholdIdx].threshold &&
        shelfTalkerObj?.detectedQty === threshold.pass[thresholdIdx].shelfTalker
      )
        item.passed = true;
      else item.passed = false;
    } else {
      if (item.compliance >= threshold.pass[thresholdIdx].threshold)
        item.passed = true;
      else item.passed = false;
    }
  });
  return data;
}*/
export function modifyPass(data, threshold) {
  data.planogram?.forEach((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
    if (
      slabThresholdData &&
      item.compliance >= slabThresholdData.threshold &&
      item.variantWiseCompliance >= slabThresholdData.variantThreshold &&
      shelfTalkerObj?.detectedQty === slabThresholdData.shelfTalker &&
      //item.exclusivity === slabThresholdData.exclusivity &&
      item.planogramAdherence === slabThresholdData.planogramAdherence &&
      item.hotspot === slabThresholdData.hotspot
    ) {
      item.passed = true;
    } else item.passed = false;
  });

  return data;
}

export function compliancePassCheckForAnySlab(data, threshold) {
  let anyOverallCompPassed = data.planogram?.some((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return slabThresholdData && item.compliance >= slabThresholdData.threshold;
  });

  let anyVariantCompPassed = data.planogram?.some((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData &&
      item.variantWiseCompliance >= slabThresholdData.variantThreshold
    );
  });
  return { anyOverallCompPassed, anyVariantCompPassed };
}

export function compliancePassCheckForAllSlab(data, threshold) {
  let allOverallCompPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return slabThresholdData && item.compliance >= slabThresholdData.threshold;
  });

  let allVariantCompPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData &&
      item.variantWiseCompliance >= slabThresholdData.variantThreshold
    );
  });
  return { allOverallCompPassed, allVariantCompPassed };
}

export function shelfTalkerPassCheckForAllSlab(data, threshold) {
  let allShelfTalkerPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
    return (
      slabThresholdData &&
      shelfTalkerObj?.detectedQty === slabThresholdData.shelfTalker
    );
  });

  return { allShelfTalkerPassed };
}

export function exclusivityPassCheckForAllSlab(data, threshold) {
  let allExclusivityPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData && item.exclusivity === slabThresholdData.exclusivity
    );
  });

  return { allExclusivityPassed };
}

export function planogramAdherencePassCheckForAllSlab(data, threshold) {
  let allPlanogramAdherencePassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData &&
      item.planogramAdherence === slabThresholdData.planogramAdherence
    );
  });

  return { allPlanogramAdherencePassed };
}

export function modifyPassAfterAudit(data, threshold) {
  data.planogram?.forEach((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    if (threshold.pass[thresholdIdx].shelfTalker) {
      const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
      if (
        (item.passed === true ||
          item.compliance >= threshold.pass[thresholdIdx].threshold) &&
        shelfTalkerObj?.detectedQty === threshold.pass[thresholdIdx].shelfTalker
      )
        item.passed = true;
      else item.passed = false;
    } else {
      if (
        item.passed === true ||
        item.compliance >= threshold.pass[thresholdIdx].threshold
      )
        item.passed = true;
      else item.passed = false;
    }
  });
  return data;
}
export function modifyPassAfterAuditV2(data, threshold) {
  data.planogram?.forEach((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let cond =
      (item.overallCompliancePassedInAudit === true ||
        item.compliance >= threshold.pass[thresholdIdx].threshold) &&
      (item.variantwiseCompliancePassedInAudit === true ||
        item.variantWiseCompliance >=
          threshold.pass[thresholdIdx].variantThreshold) &&
      /*(item.exclusivity === 'Yes' ||
        item.exclusivity === threshold.pass[thresholdIdx].exclusivity) &&*/
      (item.planogramAdherence === 'Yes' ||
        item.planogramAdherence ===
          threshold.pass[thresholdIdx].planogramAdherence) &&
      (item.hotspot === 'Yes' ||
        item.hotspot === threshold.pass[thresholdIdx].hotspot);
    if (threshold.pass[thresholdIdx].shelfTalker) {
      const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
      if (
        cond &&
        shelfTalkerObj?.detectedQty === threshold.pass[thresholdIdx].shelfTalker
      )
        item.passed = true;
      else item.passed = false;
    } else {
      if (cond) item.passed = true;
      else item.passed = false;
    }
  });

  const { allPlanogramAdherencePassed } = planogramAdherencePassCheckForAllSlab(
    data,
    threshold,
  );
  data.allPlanogramAdherencePassed = allPlanogramAdherencePassed ? true : false;

  const { allExclusivityPassed } = exclusivityPassCheckForAllSlab(
    data,
    threshold,
  );
  data.allExclusivityPassed = allExclusivityPassed ? true : false;

  const { allShelfTalkerPassed } = shelfTalkerPassCheckForAllSlab(
    data,
    threshold,
  );
  data.allShelfTalkerPassed = allShelfTalkerPassed ? true : false;

  let allOverallCompPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData &&
      (item.overallCompliancePassedInAudit === true ||
        item.compliance >= slabThresholdData.threshold)
    );
  });

  let allVariantCompPassed = data.planogram?.every((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    return (
      slabThresholdData &&
      (item.variantwiseCompliancePassedInAudit === true ||
        item.variantWiseCompliance >= slabThresholdData.variantThreshold)
    );
  });
  data.complianceMetAllSlabs = allOverallCompPassed ? true : false;
  data.variantComplianceMetAllSlabs = allVariantCompPassed ? true : false;

  return data;
}

export function weekOfMonth(date?: string | number | Date | dayjs.Dayjs) {
  const givenDate = dayjs(date).tz(tz);
  const dayOfMonth = givenDate.date();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  return weekNumber;
}

export function applicableChallenge(p, thd, challenge, currPG, type) {
  if (type === 'ST') {
    //if (thd.pass[thresholdIdx].shelfTalker) {
    const shelfTalkerObj = p.sku?.find((i) => i.name === 'Shelf Talker');
    if (shelfTalkerObj?.detectedQty !== 'Yes') {
      //let idx = challenge.findIndex((i) => i.shelfTalker === true);
      let idx = challenge.findIndex((i) => i.kind === 'Shelf Talker');
      challenge[idx].applicable = [...challenge[idx].applicable, p.name];
    }
    //}
  } else if (type === 'Exclusivity') {
    let idx = challenge.findIndex((i) => i.kind === 'Exclusivity');
    let thresholdIdx = thd?.pass?.findIndex((i) => i.for === p.slab);
    if (thresholdIdx < 0)
      throw new NotFoundException('threshold index not found');
    if (p.exclusivity !== thd.pass[thresholdIdx].exclusivity)
      challenge[idx].applicable = [...challenge[idx].applicable, p.name];
  } else if (type === 'Planogram Adherence') {
    let idx = challenge.findIndex((i) => i.kind === 'Planogram Adherence');
    let thresholdIdx = thd?.pass?.findIndex((i) => i.for === p.slab);
    if (thresholdIdx < 0)
      throw new NotFoundException('threshold index not found');
    if (p.planogramAdherence !== thd.pass[thresholdIdx].planogramAdherence)
      challenge[idx].applicable = [...challenge[idx].applicable, p.name];
  } else if (type === 'VC') {
    let thresholdIdx = thd?.pass?.findIndex((i) => i.for === p.slab);
    if (thresholdIdx < 0)
      throw new NotFoundException('threshold index not found');
    if (
      currPG.variantWiseCompliance < thd.pass[thresholdIdx].variantThreshold &&
      currPG.passed === false &&
      p.count < thd.pass[thresholdIdx].visit
    ) {
      let idx = challenge.findIndex(
        (i) => i.kind === 'Variant wise Compliance',
      );
      challenge[idx].applicable = [...challenge[idx].applicable, p.name];
    }
  } else {
    let thresholdIdx = thd?.pass?.findIndex((i) => i.for === p.slab);
    if (thresholdIdx < 0)
      throw new NotFoundException('threshold index not found');
    if (
      currPG.compliance < thd.pass[thresholdIdx].threshold &&
      currPG.passed === false &&
      p.count < thd.pass[thresholdIdx].visit
    ) {
      //let idx = challenge.findIndex((i) => i.shelfTalker === false);
      let idx = challenge.findIndex((i) => i.kind === 'Overall Compliance');
      challenge[idx].applicable = [...challenge[idx].applicable, p.name];
    }
  }
}

export function setRetakeEligible(data, threshold) {
  data.planogram?.forEach((item) => {
    let thresholdIdx = threshold?.pass?.findIndex((i) => i.for === item.slab);
    if (thresholdIdx < 0)
      throw new ForbiddenException(
        `Threshold not found for slab: ${item.slab}`,
      );
    let slabThresholdData = threshold.pass[thresholdIdx];
    const shelfTalkerObj = item.sku?.find((i) => i.name === 'Shelf Talker');
    if (
      slabThresholdData &&
      (item.compliance < slabThresholdData.threshold ||
        item.variantWiseCompliance < slabThresholdData.variantThreshold ||
        (shelfTalkerObj && shelfTalkerObj.detectedQty === 'No') ||
        item.exclusivity === 'No' ||
        item.planogramAdherence === 'No')
    ) {
      item.retakeEligible = true;
    } else item.retakeEligible = false;
  });

  return data;
}

export function setPGLastUpdatedAt(data, retakeDisplays) {
  data.planogram?.forEach((item) => {
    if (!retakeDisplays?.length) {
      item.lastUpdatedAt = new Date();
    } else {
      let display = retakeDisplays?.find((i) => i === item.name);
      if (display) {
        item.lastUpdatedAt = new Date();
      }
    }
  });

  return data;
}
