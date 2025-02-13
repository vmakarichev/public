import {after, before, category, delay, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {checkHTMLElement} from '../ui/utils';
import {isColumnPresent, isViewerPresent, isDialogPresent, returnDialog, setDialogInputValue} from './gui-utils';

category('Dialog: Split Column', () => {
  let v: DG.TableView;
  const demog = grok.data.demo.demog(1000);

  before(async () => {
    v = grok.shell.addTableView(await demog);
  });

  test('dialogs.splitColumn', async () => {
    grok.shell.topMenu.find('Data').find('Split Column...').click(); await delay(1000);

    let studyColumn = demog.columns.byName('study');
    setDialogInputValue('Split Column', 'Column', studyColumn);
    setDialogInputValue('Split Column', 'Split By', ' ');
    setDialogInputValue('Split Column', 'Prefix', 'TestCol');

    const okButton = document.getElementsByClassName('ui-btn ui-btn-ok')[0] as HTMLElement;
      okButton!.click(); await delay(2000);

    isColumnPresent(demog.columns, 'TestCol1');
    isColumnPresent(demog.columns, 'TestCol2');       
  });

  after(async () => {
    v.close();
    grok.shell.closeAll();
  });
});
