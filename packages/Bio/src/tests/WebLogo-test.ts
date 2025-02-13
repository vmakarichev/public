import {after, before, category, test, expect, expectObject} from '@datagrok-libraries/utils/src/test';

import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {Nucleotides, NucleotidesPalettes} from '@datagrok-libraries/bio/src/nucleotides';
import {Aminoacids, AminoacidsPalettes} from '@datagrok-libraries/bio/src/aminoacids';
import {WebLogo} from '@datagrok-libraries/bio/src/viewers/web-logo';
import {SeqPalette} from '@datagrok-libraries/bio/src/seq-palettes';
import {UnknownSeqPalette} from '@datagrok-libraries/bio/src/unknown';

category('WebLogo', () => {
  const csvDfN1: string = `seq
ACGTCT
CAGTGT
TTCAAC
`;

  /** 2 - is an error monomer
   * This sequence set should be classified as nucleotides sequences.
   * Small error, not similar to amino acids.
   */
  const csvDfN1e: string = `seq
ACGTAT
CAGTTG
TTCG2C
`;

  /** Pure amino acids sequence */
  const csvDfAA1: string = `seq
FWPHEYV
YNRQWYV
MKPSEYV
`;

  /** A - alanine, G - glycine, T -= threonine, C - cysteine, W - tryptophan
   * This sequence set should be detected as amino acids more than nucleotides.
   */
  const csvDfAA2: string = `seq
AGTCAT
AGTCGC
AGTCATW
`;

  /** This sequence set should be recognized as unknown. */
  const csvDfX: string = `seq
XZJ{}2
5Z4733
3Z6></
675687
`;

  // anonymous functions specified in test() registering must return Promise<any>
  test('testGetStats', async () => { await _testGetStats(csvDfN1); });
  test('testGetAlphabetSimilarity', async () => { await _testGetAlphabetSimilarity(); });

  test('testPickupPaletteN1', async () => { await _testPickupPaletteN1(csvDfN1); });
  test('testPickupPaletteN1e', async () => { await _testPickupPaletteN1e(csvDfN1e); });
  test('testPickupPaletteAA1', async () => { await _testPickupPaletteAA1(csvDfAA1); });
  test('testPickupPaletteX', async () => { await _testPickupPaletteX(csvDfX); });
});

category('WebLogo.monomerToText', () => {
  test('longMonomerSingle', async () => {
    await expect(WebLogo.monomerToText('S'), 'S');
  });
  test('longMonomerShort', async () => {
    await expect(WebLogo.monomerToText('Short'), 'Short');
  });
  test('longMonomerLong56', async () => {
    await expect(WebLogo.monomerToText('Long56'), 'Long5…');
  });
  test('longMonomerComplexFirstPartShort', async () => {
    await expect(WebLogo.monomerToText('Long-long'), 'Long…');
  });
  test('longMonomerComplexFirstPartLong56', async () => {
    await expect(WebLogo.monomerToText('Long56-long'), 'Long5…');
  });
});


export async function _testGetStats(csvDfN1: string) {
  const dfN1: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1);
  const seqCol: DG.Column = dfN1.col('seq')!;
  const stats = WebLogo.getStats(seqCol, 5, WebLogo.splitterAsFasta);

  expectObject(stats.freq, {
    'A': 4,
    'C': 5,
    'G': 3,
    'T': 6
  });
  expect(stats.sameLength, true);
}

export async function _testGetAlphabetSimilarity() {
  const freq: { [m: string]: number } = {
    'A': 2041,
    'C': 3015,
    'G': 3015,
    'T': 2048,
    '-': 1000
  };
  const alphabet: Set<string> = new Set(Object.keys(Nucleotides.Names));
  const res = WebLogo.getAlphabetSimilarity(freq, alphabet);

  expect(res > 0.6, true);
}

export async function _testPickupPaletteN1(csvDfN1: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1);
  const col: DG.Column = df.col('seq')!;
  const cp = WebLogo.pickUpPalette(col);

  expect(cp instanceof NucleotidesPalettes, true);
}

export async function _testPickupPaletteN1e(csvDfN1e: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1e);
  const col: DG.Column = df.col('seq')!;
  const cp = WebLogo.pickUpPalette(col);

  expect(cp instanceof NucleotidesPalettes, true);
}

export async function _testPickupPaletteAA1(csvDfAA1: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfAA1);
  const col: DG.Column = df.col('seq')!;
  const cp = WebLogo.pickUpPalette(col);

  expect(cp instanceof AminoacidsPalettes, true);
}

export async function _testPickupPaletteX(csvDfX: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfX);
  const col: DG.Column = df.col('seq')!;
  const cp = WebLogo.pickUpPalette(col);

  expect(cp instanceof UnknownSeqPalette, true);
}

export async function _testPickupPaletteAA2(dfAA2: DG.DataFrame) {
  const seqCol: DG.Column = dfAA2.col('seq')!;
  const cp = WebLogo.pickUpPalette(seqCol);

  expect(cp instanceof AminoacidsPalettes, true);
}

