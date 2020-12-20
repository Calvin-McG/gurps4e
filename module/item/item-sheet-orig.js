/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class gurpsItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["gurps4e", "sheet", "item"],
      width: 450,
      height: 450,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "notes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/gurps4e/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 300;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
      super.activateListeners(html);

      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return;

      // Roll handlers, click handlers, etc. would go here.
      // User clicked addRow
      html.find('.addRow').click(this._onAddRow.bind(this));
      html.find('.addRangedRow').click(this._onAddRangedRow.bind(this));

      //User clicked delete thingy on the row
      html.find('.attack-delete').click(this._onDeleteRow.bind(this));
      html.find('.ranged-delete').click(this._onDeleteRangedRow.bind(this));
    }

    _onAddRow(event) {
        let keys = Object.keys(this.item.data.data.melee);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "name": "" };
        this.item.update({ ["data.melee." + newKey]: newRow });
    }
    _onAddRangedRow(event) {
        let keys = Object.keys(this.item.data.data.ranged);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "name": "" };
        this.item.update({ ["data.ranged." + newKey]: newRow });
    }

    _onDeleteRow(event) {
        let id = event.currentTarget.id.substring(6);
        this.item.update({ ["data.melee.-=" + id] : null});
    }

    _onDeleteRangedRow(event) {
        let id = event.currentTarget.id.substring(6);
        this.item.update({ ["data.ranged.-=" + id] : null});
    }
}
