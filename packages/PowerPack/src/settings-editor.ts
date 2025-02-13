import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {getSettings, saveSettings} from "./utils";

// //output: widget kpi
// //tags: packageSettingsEditor
// export function powerPackSettingsEditor(): DG.Widget {
//   return new PowerPackSettingsEditor();
// }

export class PowerPackSettingsEditor extends DG.Widget {
  constructor() {
    super(ui.div());

    let disabledWidgets = ui.panel([
      ui.h2('Disabled widgets'),
      ui.wait(async function() {
        let settings = await getSettings();

        async function enable(widgetName: string): Promise<void> {
          settings[widgetName].ignored = false;
          await saveSettings();
        }

        let items = Object.keys(settings)
          .map((widgetName) => ui.span([
            ui.icons.close(() => enable(widgetName)),
            widgetName
          ]))

        return ui.divV(items);
      })
    ]);

    this.root.appendChild(disabledWidgets);
  }
}
